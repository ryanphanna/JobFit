import React, { useState } from 'react';
import { PageLayout } from '../../components/common/PageLayout';
import { GraduationCap, BookOpen, Calculator, Award } from 'lucide-react';
import { TranscriptUpload } from './TranscriptUpload';
import { GPACalculator } from './GPACalculator';
import { MAEligibility } from './MAEligibility';
import { SkillExtractor } from './SkillExtractor';
import { CourseVerificationModal } from '../../components/edu/CourseVerificationModal';
import type { Transcript } from '../../types';

interface GradFitPlaceholderProps {
    onAddSkills?: (skills: Array<{ name: string; category?: 'hard' | 'soft'; proficiency: 'learning' | 'comfortable' | 'expert' }>) => Promise<void>;
}

export const GradFitPlaceholder: React.FC<GradFitPlaceholderProps> = ({ onAddSkills }) => {
    const [transcript, setTranscript] = useState<Transcript | null>(null);
    const [tempTranscript, setTempTranscript] = useState<Transcript | null>(null);
    const [showVerification, setShowVerification] = useState(false);

    const handleUploadComplete = (parsed: Transcript) => {
        setTempTranscript(parsed);
        setShowVerification(true);
    };

    const handleVerificationSave = (verified: Transcript) => {
        setTranscript(verified);
        setTempTranscript(null);
    };

    return (
        <PageLayout
            title="Navigator Edu"
            description="High-fidelity academic reconnaissance and pathfinding."
            icon={<GraduationCap />}
            themeColor="indigo"
        >
            {!transcript ? (
                <div className="max-w-4xl mx-auto space-y-16 py-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Academic Reconnaissance</h2>
                        <p className="text-slate-500 font-medium max-w-xl mx-auto text-lg">
                            Upload your transcript to unlock precision GPA analysis, course mastery tracking, and grad school eligibility checks.
                        </p>
                    </div>

                    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-2 rounded-[2.5rem] border border-white/50 dark:border-slate-800 shadow-2xl">
                        <TranscriptUpload onUploadComplete={handleUploadComplete} />
                    </div>

                    {tempTranscript && (
                        <CourseVerificationModal
                            isOpen={showVerification}
                            onClose={() => setShowVerification(false)}
                            transcript={tempTranscript}
                            onSave={handleVerificationSave}
                        />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white dark:border-slate-700 shadow-sm group hover:scale-[1.02] transition-all">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white mb-2">GPA Calculator</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">Precision-engineered cGPA, sGPA, and L2 calculations.</p>
                        </div>
                        <div className="p-8 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white dark:border-slate-700 shadow-sm group hover:scale-[1.02] transition-all">
                            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white mb-2">Course Mapping</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">Map your academic history to prerequisite requirements.</p>
                        </div>
                        <div className="p-8 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white dark:border-slate-700 shadow-sm group hover:scale-[1.02] transition-all">
                            <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                <Award className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white mb-2">Skill Extraction</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">Mutate academic theory into professional market assets.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-12 max-w-6xl mx-auto">
                    {/* Header Summary */}
                    <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Academic Profile</div>
                                <h2 className="text-4xl font-black tracking-tighter mb-2">
                                    {transcript.studentName || 'Unidentified Student'}
                                </h2>
                                <p className="text-slate-400 font-bold flex items-center gap-2">
                                    <span className="text-white">{transcript.university}</span>
                                    <span className="opacity-30">•</span>
                                    <span>{transcript.program}</span>
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-12 bg-white/5 p-6 rounded-3xl backdrop-blur-xl border border-white/10">
                                <div className="text-center">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Standard GPA</div>
                                    <div className="text-3xl font-black text-indigo-400 font-mono">{transcript.cgpa || '0.00'}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Credits</div>
                                    <div className="text-3xl font-black text-indigo-400 font-mono">{transcript.semesters.reduce((acc, s) => acc + s.courses.length * 0.5, 0)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Modules */}
                    <div className="space-y-8">
                        <GPACalculator transcript={transcript} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <MAEligibility transcript={transcript} />
                            {onAddSkills && <SkillExtractor transcript={transcript} onAddSkills={onAddSkills} />}
                        </div>
                    </div>

                    {/* Course Registry */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                Course Registry
                            </h3>
                            <button
                                onClick={() => setTranscript(null)}
                                className="px-6 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 font-black text-xs uppercase tracking-widest transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            >
                                Reset Analysis
                            </button>
                        </div>

                        <div className="grid gap-6">
                            {transcript.semesters.map((sem, i) => (
                                <div key={i} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-8 rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-sm relative overflow-hidden group/sem">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-6xl italic select-none">
                                        {sem.year}
                                    </div>
                                    <div className="flex justify-between items-end mb-6 relative">
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 dark:text-white group-hover/sem:text-indigo-600 transition-colors">{sem.term}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Semester Batch</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-black">
                                                {sem.courses.length} MODULES
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-3 relative">
                                        {sem.courses.map((c, j) => (
                                            <div key={j} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl group/course hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-16 font-mono text-xs font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 py-1 px-2 rounded text-center">
                                                        {c.code}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-md">{c.title}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.credits || 0.5} CR</span>
                                                    <div className="w-10 h-10 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-sm shadow-xl shadow-slate-900/10">
                                                        {c.grade}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </PageLayout>
    );
};
