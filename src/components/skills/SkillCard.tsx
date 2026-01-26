import React from 'react';
import { Trash2, Brain, ChevronRight } from 'lucide-react';
import type { CustomSkill } from '../../types';

interface SkillCardProps {
    skill: CustomSkill;
    onDelete: (name: string) => void;
    onVerify: (name: string) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, onDelete, onVerify }) => {
    const getProficiencyStyle = (level: string) => {
        switch (level) {
            case 'expert': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
            case 'comfortable': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getProficiencyStyle(skill.proficiency)}`}>
                    {skill.proficiency}
                </div>
                <button
                    onClick={() => onDelete(skill.name)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                {skill.name}
            </h3>

            {skill.evidence ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 line-clamp-3 italic">
                    "{skill.evidence}"
                </p>
            ) : (
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                        No verification evidence yet
                    </p>
                </div>
            )}

            <button
                onClick={() => onVerify(skill.name)}
                className="w-full py-4 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/10"
            >
                <Brain className="w-4 h-4" />
                {skill.evidence ? 'Re-Verify Proficiency' : 'Verify with AI'}
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
};
