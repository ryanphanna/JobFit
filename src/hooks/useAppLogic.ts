import { useState, useEffect } from 'react';
import type { AppState, SavedJob, ResumeProfile, CustomSkill, TargetJob, Transcript } from '../types';
import { Storage } from '../services/storageService';
import { parseResumeFile, analyzeJobFit } from '../services/geminiService';
import { ScraperService } from '../services/scraperService';
import { checkAnalysisLimit, incrementAnalysisCount, getUsageStats, type UsageLimitResult, type UsageStats } from '../services/usageLimits';
import { useLocalStorage } from './useLocalStorage';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../services/supabase';
import { TIME_PERIODS, STORAGE_KEYS } from '../constants';

export const useAppLogic = () => {
    // Auth & Context
    const { user, isAdmin } = useUser();
    const { showSuccess, showError, showInfo } = useToast();

    // Persist current view & transcript
    const [currentView, setCurrentView] = useLocalStorage<AppState['currentView']>(STORAGE_KEYS.CURRENT_VIEW, 'home');
    const [transcript] = useLocalStorage<Transcript | null>('NAVIGATOR_TRANSCRIPT_CACHE', null);

    // Global State
    const [state, setState] = useState<AppState>({
        resumes: [],
        jobs: [],
        roleModels: [],
        targetJobs: [],
        skills: [],
        currentView: currentView || 'home',
        activeJobId: null,
        apiStatus: 'checking',
    });

    // Resume Import State
    const [isParsingResume, setIsParsingResume] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importTrigger, setImportTrigger] = useState(0);

    // Nudge State
    const [nudgeJob, setNudgeJob] = useState<SavedJob | null>(null);

    // Usage tracking
    const [usageStats, setUsageStats] = useState<UsageStats>({
        tier: 'free',
        totalAnalyses: 0,
        todayAnalyses: 0,
        limit: 3
    });
    const [showUpgradeModal, setShowUpgradeModal] = useState<UsageLimitResult | null>(null);

    // UI State
    const [showSettings, setShowSettings] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [interviewSkill, setInterviewSkill] = useState<string | null>(null);
    const [showWelcome, setShowWelcome] = useState(() => {
        return !localStorage.getItem(STORAGE_KEYS.WELCOME_SEEN);
    });

    // Background Tasks
    const [activeAnalysisIds, setActiveAnalysisIds] = useState<Set<string>>(new Set());

    // --- Effects ---

    // 1. Load Data on Mount
    useEffect(() => {
        const loadData = async () => {
            const storedResumes = await Storage.getResumes();
            const storedJobs = await Storage.getJobs();
            const storedSkills = await Storage.getSkills();
            const storedRoleModels = await Storage.getRoleModels();
            const storedTargetJobs = await Storage.getTargetJobs();

            const sanitizedJobs = (storedJobs || []).map(job => {
                if (job.status === 'analyzing') {
                    if (job.analysis && job.analysis.compatibilityScore) {
                        return { ...job, status: 'saved' as const };
                    }
                    return { ...job, status: 'error' as const };
                }
                return job;
            });

            setState(prev => ({
                ...prev,
                resumes: storedResumes,
                jobs: sanitizedJobs,
                skills: storedSkills,
                roleModels: storedRoleModels,
                targetJobs: storedTargetJobs,
                currentView: currentView || 'home',
                activeJobId: null,
                apiStatus: 'ok',
            }));
        };
        loadData();
    }, []);

    // 2. Load Usage Stats
    useEffect(() => {
        if (user) {
            getUsageStats(user.id).then(setUsageStats).catch(console.error);
        } else {
            setUsageStats({ tier: 'free', totalAnalyses: 0, todayAnalyses: 0, limit: 3 });
        }
    }, [user]);

    // 3. Nudge Logic
    useEffect(() => {
        if (sessionStorage.getItem('nudgeSeen')) return;

        const findNudge = () => {
            const now = Date.now();
            const candidates = state.jobs.filter(job => {
                const isOldEnough = (now - new Date(job.dateAdded).getTime()) > TIME_PERIODS.NUDGE_THRESHOLD_MS;
                const isHighQuality = (job.fitScore || 0) >= 80;
                const isPending = !job.status || ['saved', 'applied', 'analyzing'].includes(job.status);
                return isOldEnough && isHighQuality && isPending;
            });

            if (candidates.length > 0) {
                const randomJob = candidates[Math.floor(Math.random() * candidates.length)];
                setNudgeJob(randomJob);
                sessionStorage.setItem('nudgeSeen', 'true');
            }
        };

        const timer = setTimeout(findNudge, TIME_PERIODS.NUDGE_DELAY_MS);
        return () => clearTimeout(timer);
    }, [state.jobs]);

    // --- Actions ---

    const setView = (view: AppState['currentView']) => {
        setCurrentView(view);
        setState(prev => ({ ...prev, currentView: view }));
    };

    const setActiveJobId = (id: string | null) => {
        setState(prev => ({ ...prev, activeJobId: id }));
    };

    const handleUpdateJob = (updatedJob: SavedJob) => {
        Storage.updateJob(updatedJob).catch(err => {
            console.error("FAILED TO PERSIST JOB:", err);
            showError("Critical: Failed to save changes.");
        });
        setState(prev => ({
            ...prev,
            jobs: prev.jobs.map(j => j.id === updatedJob.id ? updatedJob : j)
        }));
    };

    const handleJobCreated = async (newJob: SavedJob) => {
        if (user && !isAdmin) {
            const limitCheck = await checkAnalysisLimit(user.id);
            if (!limitCheck.allowed) {
                setShowUpgradeModal(limitCheck);
                return;
            }
        }

        await Storage.addJob(newJob);
        setState(prev => ({
            ...prev,
            jobs: [newJob, ...prev.jobs].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i),
            activeJobId: newJob.id
        }));

        if (user && !isAdmin) {
            await incrementAnalysisCount(user.id);
            setUsageStats(await getUsageStats(user.id));
        }

        (async () => {
            try {
                const analysis = await analyzeJobFit(newJob.description || '', state.resumes, state.skills);
                const completedJob = {
                    ...newJob,
                    status: 'saved' as const,
                    analysis,
                    position: analysis.distilledJob?.roleTitle || newJob.position,
                    company: analysis.distilledJob?.companyName || newJob.company
                };
                await Storage.saveJob(completedJob);
                handleUpdateJob(completedJob);
            } catch (err) {
                console.error("Background Analysis Failed:", err);
                const failedJob = { ...newJob, status: 'error' as const };
                await Storage.saveJob(failedJob);
                handleUpdateJob(failedJob);
            }
        })();
    };

    const handleTargetJobCreated = (newTarget: TargetJob) => {
        setState(prev => ({
            ...prev,
            targetJobs: [newTarget, ...prev.targetJobs],
            currentView: 'coach-gap-analysis'
        }));
        setCurrentView('coach-gap-analysis');
    };

    const handleDeleteJob = (id: string) => {
        Storage.deleteJob(id);
        setState(prev => ({
            ...prev,
            jobs: prev.jobs.filter(j => j.id !== id),
            activeJobId: null,
            currentView: 'history'
        }));
        setCurrentView('history');
    };

    const handleImportResume = async (file: File) => {
        setIsParsingResume(true);
        setImportError(null);
        try {
            const base64Str = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            const base64Data = base64Str.split(',')[1];
            const blocks = await parseResumeFile(base64Data, file.type);
            const newProfile: ResumeProfile = {
                id: crypto.randomUUID(),
                name: file.name.replace(/\.[^/.]+$/, "") || "Uploaded Resume",
                blocks: blocks
            };
            const profiles = await Storage.addResume(newProfile);
            setState(prev => ({ ...prev, resumes: profiles }));
            setImportTrigger(t => t + 1);
        } catch (err) {
            console.error(err);
            setImportError((err as Error).message);
        } finally {
            setIsParsingResume(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            showSuccess("Successfully signed out");
        } catch (err) {
            console.error("Sign out error:", err);
            showError("Failed to sign out");
        }
    };

    const handleNudgeResponse = (status: 'interview' | 'rejected' | 'ghosted') => {
        if (!nudgeJob) return;
        handleUpdateJob({ ...nudgeJob, status: status });
        setNudgeJob(null);
    };

    const handleDraftApplication = async (url: string) => {
        const jobId = crypto.randomUUID();
        const newJob: SavedJob = {
            id: jobId,
            company: 'Analyzing...',
            position: 'Drafting Application...',
            description: '',
            url,
            resumeId: state.resumes[0]?.id || 'master',
            dateAdded: Date.now(),
            status: 'analyzing',
        };

        await Storage.addJob(newJob);
        setState(prev => ({
            ...prev,
            jobs: [newJob, ...prev.jobs],
            activeJobId: jobId
        }));
        showInfo("Drafting your tailored application...");

        try {
            let text = newJob.description;
            if (!text) {
                text = await ScraperService.scrapeJobContent(url);
            }
            const jobWithText = { ...newJob, description: text };
            await Storage.saveJob(jobWithText);

            const analysis = await analyzeJobFit(text, state.resumes, state.skills);
            const completedJob = {
                ...jobWithText,
                status: 'saved' as const,
                analysis: analysis,
                position: analysis.distilledJob?.roleTitle || 'Untitled'
            };
            await Storage.saveJob(completedJob);
            handleUpdateJob(completedJob);
        } catch (err) {
            console.error("Draft Application Failed", err);
            const failedJob = { ...newJob, status: 'error' as const };
            await Storage.saveJob(failedJob);
            handleUpdateJob(failedJob);
        }
    };

    const handleWelcomeContinue = () => {
        localStorage.setItem(STORAGE_KEYS.WELCOME_SEEN, 'true');
        setShowWelcome(false);
    };

    const handleInterviewComplete = async (proficiency: CustomSkill['proficiency'], evidence: string) => {
        if (!interviewSkill) return;
        const updatedSkill = await Storage.saveSkill({
            name: interviewSkill,
            proficiency,
            evidence
        });
        setState(prev => ({
            ...prev,
            skills: prev.skills.map(s => s.name === interviewSkill ? updatedSkill : s).concat(
                prev.skills.some(s => s.name === interviewSkill) ? [] : [updatedSkill]
            )
        }));
        setInterviewSkill(null);
    };

    // Public API
    return {
        state,
        setState,
        transcript,
        usage: {
            stats: usageStats,
            showUpgradeModal,
            setShowUpgradeModal
        },
        ui: {
            isParsingResume,
            importError,
            importTrigger,
            nudgeJob,
            setNudgeJob,
            activeAnalysisIds,
            setActiveAnalysisIds,
            currentView,
            showSettings,
            setShowSettings,
            showAuth,
            setShowAuth,
            showWelcome,
            interviewSkill,
            setInterviewSkill
        },
        actions: {
            setView,
            setActiveJobId,
            handleJobCreated,
            handleUpdateJob,
            handleTargetJobCreated,
            handleDeleteJob,
            handleImportResume,
            handleSignOut,
            handleNudgeResponse,
            handleDraftApplication,
            handleWelcomeContinue,
            handleInterviewComplete
        },
        toast: {
            showInfo,
            showSuccess,
            showError
        }
    };
};
