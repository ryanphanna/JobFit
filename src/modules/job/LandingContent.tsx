import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, Zap, Target, FileSearch } from 'lucide-react';

export const LandingContent: React.FC = () => {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 pb-32 space-y-32 mt-32">

            {/* 1. The "Aha" Moment: The ATS Comparison */}
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
                    {/* The Old Way */}
                    <div className="group relative bg-rose-50/50 dark:bg-rose-500/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-rose-500/10 dark:border-rose-500/20 shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

                        <div className="flex items-center gap-4 relative z-10 mb-8 pb-4 border-b border-rose-500/10">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                                The Old Way
                            </h3>
                        </div>

                        <div className="space-y-4 opacity-50 blur-[0.5px] relative z-10">
                            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full" />
                            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
                            <div className="h-20 w-full bg-white/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                <span className="text-sm font-medium text-slate-400">Standard_Resume.pdf</span>
                            </div>
                        </div>

                        {/* Rejection Stamp */}
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="bg-white dark:bg-slate-900 shadow-2xl border-2 border-rose-100 dark:border-rose-900/50 px-8 py-5 rounded-2xl transform -rotate-12 flex items-center gap-4 animate-in zoom-in-95 duration-700">
                                <XCircle className="w-10 h-10 text-rose-500" />
                                <div className="text-left">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ATS Score</div>
                                    <div className="text-3xl font-black text-rose-500">12% Match</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* The Navigator Way */}
                    <div className="group relative bg-emerald-50/50 dark:bg-emerald-500/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

                        <div className="flex items-center gap-4 relative z-10 mb-8 pb-4 border-b border-emerald-500/10">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                            <h3 className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                The Navigator Way
                            </h3>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="flex flex-wrap gap-2">
                                {['React', 'TypeScript', 'AWS'].map(skill => (
                                    <span key={skill} className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-sm shadow-emerald-500/20">
                                        ✓ {skill}
                                    </span>
                                ))}
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-white dark:bg-slate-800 rounded-full relative overflow-hidden">
                                    <div className="absolute inset-y-0 left-0 bg-emerald-500 w-3/4 rounded-full shadow-lg shadow-emerald-500/50" />
                                </div>
                                <div className="h-4 w-2/3 bg-white dark:bg-slate-800 rounded-full" />
                            </div>
                        </div>

                        {/* Success Badge */}
                        <div className="absolute bottom-8 right-8 z-20">
                            <div className="bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30 px-8 py-5 rounded-2xl flex items-center gap-4 transform group-hover:scale-105 transition-transform">
                                <CheckCircle2 className="w-8 h-8" />
                                <div className="text-left">
                                    <div className="text-[10px] font-black text-emerald-100 uppercase tracking-tight">Status</div>
                                    <div className="text-3xl font-black">Probable</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. How it Works (Steps) - Unified with Bento Cards */}
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { step: 1, title: 'Copy Job Link', desc: 'Find a job on LinkedIn, Indeed, or anywhere. Just copy the URL.', icon: Target, color: 'bg-slate-100 dark:bg-slate-800' },
                        { step: 2, title: 'AI Analysis', desc: 'We extract keywords, required skills, and hidden criteria in seconds.', icon: Zap, color: 'bg-indigo-50/50 dark:bg-indigo-500/5' },
                        { step: 3, title: 'Get Tailored', desc: 'Get a tailored cover letter and resume advice that beats the bots.', icon: FileSearch, color: 'bg-emerald-50/50 dark:bg-emerald-500/5' }
                    ].map((s, i) => (
                        <div key={i} className={`group relative ${s.color} backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-xl transition-all duration-500 hover:-translate-y-2 text-center`}>
                            <div className="absolute top-4 right-8 text-4xl font-black text-slate-200/50 dark:text-slate-700/50 select-none">{s.step}</div>
                            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                <s.icon className={`w-8 h-8 ${s.step === 2 ? 'text-indigo-500' : s.step === 3 ? 'text-emerald-500' : 'text-slate-400'}`} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{s.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                {s.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Final Call to Action */}
            <div className="max-w-4xl mx-auto text-center bg-slate-900 dark:bg-white rounded-[3rem] p-12 md:p-20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />

                <div className="relative z-10 space-y-8">
                    <h2 className="text-4xl md:text-6xl font-black text-white dark:text-slate-900 tracking-tight">
                        Ready to land the interview?
                    </h2>
                    <p className="text-lg text-slate-400 dark:text-slate-500 max-w-xl mx-auto">
                        Join other smart candidates who stopped guessing and started getting callbacks.
                    </p>
                    <button
                        onClick={() => document.querySelector('input')?.focus()}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-2xl"
                    >
                        Analyze Your First Job
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        No credit card required • Free for first 3 scans
                    </p>
                </div>
            </div>
        </div>
    );
};
