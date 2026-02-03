import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, FileText, TrendingUp, Upload, ArrowRight, ArrowLeft, Check, Briefcase, Loader2, GraduationCap, Search, Building2, RefreshCw } from 'lucide-react';

type JourneyStage = 'student' | 'job-hunter' | 'employed' | 'career-changer';

interface WelcomeScreenProps {
    isOpen: boolean;
    onContinue: (preferences?: { journeys: JourneyStage[]; intent?: 'jobfit' | 'coach' }) => void;
    onImportResume?: (file: File) => void;
    isParsing?: boolean;
}

const JOURNEY_OPTIONS: { id: JourneyStage; icon: React.ReactNode; title: string; description: string; color: string }[] = [
    { id: 'student', icon: <GraduationCap className="w-6 h-6" />, title: "I'm a student", description: "Exploring career paths and building my first resume", color: 'violet' },
    { id: 'job-hunter', icon: <Search className="w-6 h-6" />, title: "I'm job hunting", description: "Actively applying to roles and need an edge", color: 'indigo' },
    { id: 'employed', icon: <Building2 className="w-6 h-6" />, title: "I'm employed", description: "Looking to grow or find my next opportunity", color: 'emerald' },
    { id: 'career-changer', icon: <RefreshCw className="w-6 h-6" />, title: "I'm changing careers", description: "Transitioning to a new field or industry", color: 'amber' },
];

const TAILORED_CONTENT: Record<JourneyStage, { headline: string; tips: string[] }> = {
    student: {
        headline: "We'll help you build a standout profile",
        tips: ["Turn coursework into skills", "Highlight projects & internships", "Find entry-level opportunities"]
    },
    'job-hunter': {
        headline: "We'll maximize your application success",
        tips: ["Analyze job fit in seconds", "Tailor resumes automatically", "Generate cover letters instantly"]
    },
    employed: {
        headline: "We'll help you level up your career",
        tips: ["Identify skill gaps", "Build a 12-month roadmap", "Prepare for your next role"]
    },
    'career-changer': {
        headline: "We'll map your transferable skills",
        tips: ["Translate experience to new fields", "Find bridge roles", "Build relevant credentials"]
    }
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
    isOpen,
    onContinue,
    onImportResume,
    isParsing = false
}) => {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [selectedJourneys, setSelectedJourneys] = useState<JourneyStage[]>([]);
    const [resumeUploaded, setResumeUploaded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onContinue();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onContinue]);

    const toggleJourney = (journey: JourneyStage) => {
        setSelectedJourneys(prev =>
            prev.includes(journey)
                ? prev.filter(j => j !== journey)
                : [...prev, journey]
        );
    };

    const handleFileUpload = (file: File) => {
        if (file && (file.type === 'application/pdf' || file.type === 'text/plain' || file.name.endsWith('.docx'))) {
            onImportResume?.(file);
            setResumeUploaded(true);
            // Auto-advance after a brief moment so user sees the upload started
            setTimeout(() => setStep(3), 500);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    const primaryJourney = selectedJourneys[0] || 'job-hunter';
    const tailoredContent = TAILORED_CONTENT[primaryJourney];

    const handleContinue = () => {
        if (step === 1 && selectedJourneys.length > 0) {
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            setStep(4);
        } else if (step === 4) {
            const intent = selectedJourneys.includes('employed') || selectedJourneys.includes('student') ? 'coach' : 'jobfit';
            onContinue({ journeys: selectedJourneys, intent });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-300 my-8">
                {/* Progress Indicator */}
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4].map((s) => (
                        <div
                            key={s}
                            className={`h-2 rounded-full transition-all duration-500 ${s === step
                                ? 'w-8 bg-gradient-to-r from-indigo-600 to-violet-600'
                                : s < step
                                    ? 'w-2 bg-indigo-300'
                                    : 'w-2 bg-slate-200'
                                }`}
                        />
                    ))}
                </div>

                {/* Step 1: Journey Selection */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl mb-4 shadow-lg">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-3">
                                Welcome to JobFit
                            </h1>
                            <p className="text-lg text-slate-600">
                                Where are you in your career journey?
                            </p>
                            <p className="text-sm text-slate-400 mt-1">Select all that apply</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                            {JOURNEY_OPTIONS.map((option) => {
                                const isSelected = selectedJourneys.includes(option.id);
                                const colorMap: Record<string, { selected: string; icon: string; iconBase: string }> = {
                                    violet: { selected: 'border-violet-500 shadow-violet-500/10', icon: 'bg-violet-500', iconBase: 'bg-violet-100 text-violet-600' },
                                    indigo: { selected: 'border-indigo-500 shadow-indigo-500/10', icon: 'bg-indigo-500', iconBase: 'bg-indigo-100 text-indigo-600' },
                                    emerald: { selected: 'border-emerald-500 shadow-emerald-500/10', icon: 'bg-emerald-500', iconBase: 'bg-emerald-100 text-emerald-600' },
                                    amber: { selected: 'border-amber-500 shadow-amber-500/10', icon: 'bg-amber-500', iconBase: 'bg-amber-100 text-amber-600' },
                                };
                                const colorClasses = colorMap[option.color] || colorMap.indigo;

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => toggleJourney(option.id)}
                                        className={`group relative bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border-2 transition-all duration-300 text-left flex items-start gap-4 ${isSelected
                                            ? `${colorClasses.selected} shadow-xl`
                                            : 'border-white/50 hover:border-slate-200 hover:shadow-lg'
                                            }`}
                                    >
                                        {isSelected && (
                                            <div className={`absolute top-3 right-3 w-5 h-5 ${colorClasses.icon} rounded-full flex items-center justify-center`}>
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${isSelected
                                            ? `${colorClasses.icon} text-white shadow-lg`
                                            : `${colorClasses.iconBase} group-hover:scale-105`
                                            }`}>
                                            {option.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-0.5">{option.title}</h3>
                                            <p className="text-xs text-slate-500 leading-relaxed">{option.description}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={handleContinue}
                            disabled={selectedJourneys.length === 0}
                            className={`w-full py-4 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 text-lg ${selectedJourneys.length > 0
                                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white hover:shadow-xl'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            Continue
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Step 2: Resume Upload + Tailored Content */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                {tailoredContent.headline}
                            </h1>
                            <p className="text-slate-600">
                                Upload your resume to get started
                            </p>
                        </div>

                        {/* Upload Zone */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-6 mb-6 text-center transition-all duration-300 ${isDragging
                                ? 'border-violet-500 bg-violet-50'
                                : 'border-slate-300 bg-white/60 hover:border-violet-400 hover:bg-violet-50/50'
                                }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.txt,.docx"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                className="hidden"
                            />
                            <Upload className="w-10 h-10 mx-auto mb-3 text-slate-400" />
                            <p className="font-semibold text-slate-700">Drop your resume here</p>
                            <p className="text-xs text-slate-500 mt-1">PDF, DOCX, or TXT</p>
                        </div>

                        {/* Tailored Tips */}
                        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/50">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">What we'll do for you</p>
                            <ul className="space-y-2">
                                {tailoredContent.tips.map((tip, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="px-5 py-3 rounded-xl font-semibold transition-all border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <button
                                onClick={handleContinue}
                                className="flex-1 py-3 rounded-xl font-semibold transition-all bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center gap-2"
                            >
                                Skip for now
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Processing + More Context (user reads while resume processes) */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            {isParsing ? (
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            ) : (
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg">
                                    <Check className="w-8 h-8 text-white" />
                                </div>
                            )}
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                {isParsing ? 'Analyzing your resume...' : 'Resume ready!'}
                            </h1>
                            <p className="text-slate-600">
                                {isParsing ? 'This usually takes just a few seconds' : 'We found your skills and experience'}
                            </p>
                        </div>

                        {/* Info cards while processing */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/50">
                                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-3 text-indigo-600">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1">JobFit Analysis</h3>
                                <p className="text-xs text-slate-600">See how well you match any job posting instantly.</p>
                            </div>
                            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/50">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3 text-emerald-600">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1">Career Coaching</h3>
                                <p className="text-xs text-slate-600">Get a personalized roadmap to your dream role.</p>
                            </div>
                        </div>

                        <button
                            onClick={handleContinue}
                            disabled={isParsing}
                            className={`w-full py-4 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 text-lg ${isParsing
                                ? 'bg-slate-200 text-slate-400 cursor-wait'
                                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white hover:shadow-xl'
                                }`}
                        >
                            {isParsing ? 'Processing...' : 'Continue'}
                            {!isParsing && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </div>
                )}

                {/* Step 4: Ready to Go */}
                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
                        <div className="mb-8">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mb-6 shadow-lg animate-in zoom-in-50 duration-500">
                                <Check className="w-12 h-12 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-3">
                                You're all set!
                            </h1>
                            <p className="text-lg text-slate-600 max-w-md mx-auto">
                                {selectedJourneys.includes('job-hunter')
                                    ? "Let's find your perfect job match."
                                    : selectedJourneys.includes('student')
                                        ? "Let's explore your career options."
                                        : selectedJourneys.includes('career-changer')
                                            ? "Let's map your path to a new career."
                                            : "Let's accelerate your career growth."}
                            </p>
                        </div>

                        {/* Quick recap */}
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {selectedJourneys.map(j => {
                                const opt = JOURNEY_OPTIONS.find(o => o.id === j);
                                return (
                                    <span key={j} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-700">
                                        {opt?.icon && <span className="w-4 h-4">{opt.icon}</span>}
                                        {opt?.title}
                                    </span>
                                );
                            })}
                            {resumeUploaded && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 rounded-full text-sm font-medium text-emerald-700">
                                    <FileText className="w-4 h-4" />
                                    Resume loaded
                                </span>
                            )}
                        </div>

                        <button
                            onClick={handleContinue}
                            className="w-full py-4 rounded-xl font-semibold transition-all shadow-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white hover:shadow-xl flex items-center justify-center gap-2 text-lg"
                        >
                            Get Started
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
