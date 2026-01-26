import React from 'react';
import { Key, Zap, Shield, ChevronRight, Info } from 'lucide-react';
import { ApiKeyInput } from './ApiKeyInput';

interface ApiKeySetupProps {
    isOpen: boolean;
    onComplete: () => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ isOpen, onComplete }) => {
    const [mode, setMode] = React.useState<'selection' | 'input'>('selection');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800">
                {mode === 'selection' ? (
                    <div className="p-8 sm:p-10">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                <Zap className="w-3 h-3" />
                                Onboarding
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Choose Your Setup</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Select how you want to power JobFit's AI analysis.</p>
                        </div>

                        <div className="space-y-4">
                            {/* HOSTED OPTION */}
                            <button
                                onClick={onComplete}
                                className="w-full text-left p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group relative overflow-hidden"
                            >
                                <div className="flex items-start gap-5">
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">Hosted (Free)</span>
                                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md uppercase">Starter</span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                            Instant setup using our shared API keys. Perfect for one-off analyses.
                                        </p>
                                        <div className="flex items-center gap-3 mt-3">
                                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1 uppercase tracking-wider">
                                                <Info className="w-3 h-3" />
                                                Daily usage limits
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all">
                                    <ChevronRight className="w-6 h-6 text-indigo-500" />
                                </div>
                            </button>

                            {/* BYOK OPTION */}
                            <button
                                onClick={() => setMode('input')}
                                className="w-full text-left p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-violet-500/5"
                            >
                                <div className="flex items-start gap-5">
                                    <div className="p-4 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-2xl group-hover:bg-violet-100 dark:group-hover:bg-violet-900/40 transition-colors">
                                        <Key className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">Bring Your Own Key</span>
                                            <span className="text-[10px] font-black text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-md uppercase">Professional</span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                            Connect your own Google Gemini API key for maximum power and total privacy.
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-1 uppercase tracking-wider">
                                                <Shield className="w-3 h-3" />
                                                100% Private
                                            </span>
                                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 uppercase tracking-wider">
                                                <Zap className="w-3 h-3" />
                                                No Usage Limits
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all">
                                    <ChevronRight className="w-6 h-6 text-violet-500" />
                                </div>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setMode('selection')}
                                    className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="p-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl">
                                    <Key className="w-5 h-5" />
                                </div>
                                <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">API Configuration</h3>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                    JobFit uses your Gemini API key to run deep analysis. Your key is stored locally on your device and is never sent to our servers.
                                </p>
                            </div>

                            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-5">
                                <p className="text-sm text-indigo-900 dark:text-indigo-300 font-bold mb-2 tracking-tight">Need a key?</p>
                                <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-4 font-medium">Get a free API key from Google AI Studio in about 30 seconds.</p>
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-xs bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 font-black px-4 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                                >
                                    Go to AI Studio
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </a>
                            </div>

                            <ApiKeyInput />

                            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                                Higher rate limits • Privacy Protected • Secure Storage
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
