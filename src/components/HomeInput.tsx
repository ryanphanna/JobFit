import React, { useState } from 'react';
import { ArrowRight, AlertCircle, Link as LinkIcon, FileText, CheckCircle } from 'lucide-react';
import { analyzeJobFit } from '../services/geminiService';
import type { ResumeProfile, SavedJob } from '../types';
import * as Storage from '../services/storageService';

interface HomeInputProps {
    resumes: ResumeProfile[];
    onJobCreated: (job: SavedJob) => void;
    onJobUpdated: (job: SavedJob) => void;
    onImportResume: (file: File) => Promise<void>;
    isParsing: boolean;
    importError: string | null;
}

const HomeInput: React.FC<HomeInputProps> = ({
    resumes,
    onJobCreated,
    onJobUpdated,
    onImportResume,
    isParsing,
    importError
}) => {
    const [url, setUrl] = useState('');
    const [manualText, setManualText] = useState('');
    const [isManualMode, setIsManualMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);

    const fetchJobContent = async (targetUrl: string): Promise<string> => {
        // Use allorigins as a CORS proxy
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Failed to connect to proxy');

        const data = await response.json();
        if (!data.contents) throw new Error('Empty response from URL');

        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');

        // Clean up
        const unwanted = ['script', 'style', 'noscript', 'iframe', 'header', 'footer', 'nav', 'aside'];
        unwanted.forEach(tag => {
            doc.querySelectorAll(tag).forEach(el => el.remove());
        });

        const text = doc.body.textContent || "";
        const cleanText = text.replace(/\s+/g, ' ').trim();

        if (cleanText.length < 50) {
            throw new Error("Extracted text is too short. The site might be blocking scrapers.");
        }

        return cleanText;
    };

    const processJobInBackground = async (input: { type: 'url' | 'text', content: string }) => {
        const jobId = crypto.randomUUID();

        // 1. Create the placeholder job immediately
        const newJob: SavedJob = {
            id: jobId,
            url: input.type === 'url' ? input.content : undefined,
            originalText: input.type === 'text' ? input.content : undefined,
            dateAdded: Date.now(),
            status: 'analyzing',
        };

        // 2. Add to state immediately
        Storage.addJob(newJob);
        onJobCreated(newJob);
        setLastSubmittedId(jobId);

        // 3. Clear inputs immediately so user is unblocked
        setManualText('');
        setUrl('');
        setError(null);
        if (isManualMode && input.type === 'text') {
            setIsManualMode(false);
        }

        // 4. Run scraping and analysis in background
        try {
            let textToAnalyze = input.type === 'text' ? input.content : '';

            // If URL, we need to scrape first
            if (input.type === 'url') {
                try {
                    textToAnalyze = await fetchJobContent(input.content);
                } catch {
                    const failedJob: SavedJob = { ...newJob, status: 'error', analysis: undefined };
                    onJobUpdated(failedJob);
                    return; // Stop processing
                }
            }

            const analysis = await analyzeJobFit(textToAnalyze, resumes);

            const updatedJob: SavedJob = {
                ...newJob,
                originalText: textToAnalyze, // Save the text we successfully got
                status: 'new',
                analysis: analysis
            };

            onJobUpdated(updatedJob);
        } catch {
            const failedJob: SavedJob = {
                ...newJob,
                status: 'error',
                analysis: undefined
            };
            onJobUpdated(failedJob);
        }
    };

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;
        processJobInBackground({ type: 'url', content: url });
    };

    const handleManualKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!manualText.trim()) return;
            processJobInBackground({ type: 'text', content: manualText });
        }
    };

    const switchToManual = () => {
        setError(null);
        setIsManualMode(true);
    };

    // --- Onboarding / Empty State ---
    if (resumes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in zoom-in-95 duration-500">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
                    <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-8 h-8" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to JobFit</h2>
                    <p className="text-slate-500 mb-8">
                        To tailor your applications, we first need to understand your experience. Upload your current resume to get started.
                    </p>

                    <label className={`
                        block w-full border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all
                        ${isParsing
                            ? 'border-indigo-300 bg-indigo-50 cursor-wait'
                            : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                        }
                    `}>
                        <input
                            type="file"
                            accept=".pdf,.txt" // Limitation: Text extraction from PDF is complex in browser, assuming handled by parent or just text/parsing logic
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    onImportResume(e.target.files[0]);
                                }
                            }}
                            disabled={isParsing}
                        />

                        {isParsing ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm font-medium text-indigo-600">Analyzing Resume...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-sm font-semibold text-slate-700">Upload PDF or Text</span>
                                <span className="text-xs text-slate-400">We'll extract your experience blocks locally.</span>
                            </div>
                        )}
                    </label>

                    {importError && (
                        <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-rose-600 text-sm text-left">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>{importError}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
            <div className="w-full max-w-xl px-4">
                <h2 className="text-3xl font-bold text-center text-slate-900 mb-2 tracking-tight">
                    Where do you want to apply?
                </h2>
                <p className="text-center text-slate-500 mb-8 text-sm">
                    Paste a link or text. We'll analyze it in the background.
                </p>

                {!isManualMode ? (
                    <>
                        <form onSubmit={handleUrlSubmit} className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <LinkIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Paste job posting URL and press Enter..."
                                className="w-full pl-12 pr-12 py-5 bg-white border-2 border-slate-200 rounded-2xl shadow-sm text-lg focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition-all placeholder:text-slate-400"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!url.trim()}
                                className="absolute inset-y-2 right-2 p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-0 disabled:translate-x-2 transition-all duration-300"
                            >
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </form>

                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={switchToManual}
                                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-slate-100"
                            >
                                <FileText className="w-4 h-4" />
                                Or paste text manually
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="relative">
                            <textarea
                                className={`w-full h-64 p-4 text-sm bg-white border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50/50 transition-all resize-none ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-50/50' : 'border-slate-200 focus:border-indigo-500'}`}
                                placeholder={error ? "We couldn't scrape that URL. Please paste the full job description here..." : "Paste job description... Press ENTER to submit"}
                                value={manualText}
                                onChange={(e) => setManualText(e.target.value)}
                                onKeyDown={handleManualKeyDown}
                                autoFocus
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-slate-400 pointer-events-none bg-white/80 px-2 py-1 rounded backdrop-blur-sm">
                                Press <strong>Enter</strong> to analyze • <strong>Shift+Enter</strong> for new line
                            </div>
                            {error && (
                                <div className="absolute top-4 right-4 text-red-500 animate-pulse">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => { setIsManualMode(false); setError(null); }}
                                className="text-sm text-slate-500 hover:text-slate-800 font-medium px-2"
                            >
                                Back to URL
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center h-6">
                    {lastSubmittedId && !manualText && !url && (
                        <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-medium animate-in fade-in slide-in-from-bottom-2">
                            <CheckCircle className="w-4 h-4" />
                            Job added to processing queue
                        </div>
                    )}
                    {error && isManualMode && (
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeInput;
