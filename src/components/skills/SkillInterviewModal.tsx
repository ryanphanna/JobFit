import React, { useState, useEffect } from 'react';
import type { CustomSkill } from '../../types';
import { getSkillVerificationQuestions } from '../../services/skillQuestionsService';
import {
    Brain, X,
    ShieldCheck, CheckCircle2,
} from 'lucide-react';

interface SkillInterviewModalProps {
    skillName: string;
    onComplete: (proficiency: CustomSkill['proficiency'], evidence: string) => void;
    onClose: () => void;
}

export const SkillInterviewModal: React.FC<SkillInterviewModalProps> = ({ skillName, onComplete, onClose }) => {
    const [step, setStep] = useState<'select' | 'confirm'>('select');
    const [selectedLevel, setSelectedLevel] = useState<CustomSkill['proficiency'] | null>(null);
    const [showOptionalInput, setShowOptionalInput] = useState(false);
    const [optionalContext, setOptionalContext] = useState('');
    const [verificationQuestions, setVerificationQuestions] = useState<string[]>([]);
    const [checkedQuestions, setCheckedQuestions] = useState<Set<number>>(new Set());
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    // Load questions when moving to confirm step
    useEffect(() => {
        if (step === 'confirm' && verificationQuestions.length === 0) {
            loadQuestions();
        }
    }, [step]);

    const loadQuestions = async () => {
        setLoadingQuestions(true);
        try {
            const questions = await getSkillVerificationQuestions(skillName);
            setVerificationQuestions(questions);
        } catch (error) {
            console.error('Failed to load verification questions:', error);
            setVerificationQuestions([]); // Continue without questions
        } finally {
            setLoadingQuestions(false);
        }
    };

    const toggleQuestion = (index: number) => {
        const newChecked = new Set(checkedQuestions);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedQuestions(newChecked);
    };

    const handleLevelSelect = (level: CustomSkill['proficiency']) => {
        setSelectedLevel(level);
        setStep('confirm');
    };

    const handleConfirm = () => {
        if (!selectedLevel) return;

        // Build evidence from checked questions and optional context
        const evidenceParts: string[] = [];

        // Add checked questions
        if (checkedQuestions.size > 0) {
            const checkedStatements = Array.from(checkedQuestions)
                .map(idx => verificationQuestions[idx])
                .filter(Boolean);
            evidenceParts.push(...checkedStatements);
        }

        // Add optional context if provided
        if (optionalContext.trim()) {
            evidenceParts.push(optionalContext.trim());
        }

        // Fallback evidence if nothing selected
        let evidence = evidenceParts.length > 0
            ? evidenceParts.join('. ')
            : `${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} level proficiency in ${skillName}`;

        onComplete(selectedLevel, evidence);
    };

    const getProficiencyDescription = (level: CustomSkill['proficiency']) => {
        const descriptions = {
            'learning': 'Still building familiarity, may need guidance',
            'comfortable': 'Can work independently with this skill',
            'expert': 'Deep expertise, can mentor others'
        };
        return descriptions[level];
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[700px] flex flex-col rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">AI Skill Assessment</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{skillName} Verification</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body - Selection or Confirmation */}
                <div className="flex-1 overflow-y-auto p-8">
                    {step === 'select' ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center space-y-3">
                                <div className="inline-flex p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl mb-2">
                                    <ShieldCheck className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                                    How would you rate your <br />
                                    <span className="text-indigo-600 dark:text-indigo-400">{skillName}</span> skills?
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    Quick self-assessment - choose the level that best describes you
                                </p>
                            </div>

                            <div className="grid gap-4 max-w-lg mx-auto">
                                {(['learning', 'comfortable', 'expert'] as const).map((level, idx) => {
                                    const icons = [
                                        { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', count: 1 },
                                        { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', count: 2 },
                                        { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', count: 3 }
                                    ];
                                    const config = icons[idx];

                                    return (
                                        <button
                                            key={level}
                                            onClick={() => handleLevelSelect(level)}
                                            className="group p-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl hover:border-indigo-600 dark:hover:border-indigo-500 transition-all hover:shadow-xl hover:scale-[1.02] text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 ${config.bg} rounded-2xl group-hover:scale-110 transition-transform`}>
                                                    <div className="flex gap-0.5">
                                                        {Array.from({ length: config.count }).map((_, i) => (
                                                            <div key={i} className={`w-1.5 h-5 ${config.text} bg-current rounded-full`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">
                                                        {level}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                        {getProficiencyDescription(level)}
                                                    </div>
                                                </div>
                                                <CheckCircle2 className="w-6 h-6 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-800">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`p-4 rounded-2xl ${selectedLevel === 'learning' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                        selectedLevel === 'comfortable' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                            'bg-emerald-100 dark:bg-emerald-900/30'
                                        }`}>
                                        <ShieldCheck className={`w-10 h-10 ${selectedLevel === 'learning' ? 'text-amber-600 dark:text-amber-400' :
                                            selectedLevel === 'comfortable' ? 'text-blue-600 dark:text-blue-400' :
                                                'text-emerald-600 dark:text-emerald-400'
                                            }`} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
                                            Your Selection
                                        </div>
                                        <div className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                            {selectedLevel}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        {selectedLevel && getProficiencyDescription(selectedLevel)}
                                    </p>

                                    {/* Verification Questions */}
                                    {loadingQuestions ? (
                                        <div className="pt-4">
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                Loading validation questions...
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    ) : verificationQuestions.length > 0 && (
                                        <div className="pt-4 space-y-2">
                                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Quick validation (optional)
                                            </div>
                                            {verificationQuestions.map((question, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => toggleQuestion(idx)}
                                                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${checkedQuestions.has(idx)
                                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${checkedQuestions.has(idx)
                                                                ? 'border-indigo-600 bg-indigo-600'
                                                                : 'border-slate-300 dark:border-slate-600'
                                                            }`}>
                                                            {checkedQuestions.has(idx) && (
                                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                                            )}
                                                        </div>
                                                        <span className={`text-sm font-medium ${checkedQuestions.has(idx)
                                                                ? 'text-indigo-700 dark:text-indigo-300'
                                                                : 'text-slate-700 dark:text-slate-300'
                                                            }`}>
                                                            {question}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {showOptionalInput ? (
                                        <div className="space-y-2 pt-2">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Add context (optional)
                                            </label>
                                            <textarea
                                                value={optionalContext}
                                                onChange={(e) => setOptionalContext(e.target.value)}
                                                placeholder={`e.g., "Used ${skillName} in 3 projects" or "5 years of experience"`}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium resize-none"
                                                rows={3}
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowOptionalInput(true)}
                                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 uppercase tracking-wider transition-colors pt-2"
                                        >
                                            + Add context (optional)
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setStep('select');
                                        setSelectedLevel(null);
                                        setShowOptionalInput(false);
                                        setOptionalContext('');
                                    }}
                                    className="flex-1 py-4 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[1.5rem] transition-all border border-slate-200 dark:border-slate-700"
                                >
                                    ← Go Back
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-[1.5rem] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Confirm & Save
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer removed - no longer needed */}
            </div>
        </div>
    );
};
