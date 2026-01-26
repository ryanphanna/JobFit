import React from 'react';
import { Sparkles, Brain } from 'lucide-react';
import type { CustomSkill, ResumeProfile } from '../../types';

interface SkillsStatsProps {
    skills: CustomSkill[];
    resumes: ResumeProfile[];
    onSuggestSkills: () => void;
    isSuggesting: boolean;
}

export const SkillsStats: React.FC<SkillsStatsProps> = ({ skills, resumes, onSuggestSkills, isSuggesting }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-3xl font-black text-indigo-600">{skills.length}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Skills</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-3xl font-black text-emerald-500">
                    {skills.filter(s => s.proficiency === 'expert').length}
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Expert Level</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-[2rem] shadow-lg shadow-indigo-600/20 text-white flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-indigo-200" />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Skill Discovery</span>
                    </div>
                    <p className="text-sm font-medium leading-snug mb-4">
                        Let AI find missing skills from your resumes.
                    </p>
                </div>
                <button
                    onClick={onSuggestSkills}
                    disabled={isSuggesting || resumes.length === 0}
                    className="bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-black uppercase tracking-widest py-3 px-4 rounded-xl backdrop-blur-md flex items-center justify-center gap-2"
                >
                    {isSuggesting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Brain className="w-3.5 h-3.5" />
                            Find Skills
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
