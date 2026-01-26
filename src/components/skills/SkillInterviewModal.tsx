import React, { useState, useEffect, useRef } from 'react';
import type { CustomSkill } from '../../types';
import { inferProficiencyFromResponse } from '../../services/geminiService';
import {
    Brain, X, Send, Bot, User,
    ShieldCheck, CheckCircle2,
} from 'lucide-react';

interface SkillInterviewModalProps {
    skillName: string;
    onComplete: (proficiency: CustomSkill['proficiency'], evidence: string) => void;
    onClose: () => void;
}

interface Message {
    role: 'ai' | 'user';
    content: string;
}

export const SkillInterviewModal: React.FC<SkillInterviewModalProps> = ({ skillName, onComplete, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: `Checking your **${skillName}** proficiency. Tell me about a project where you used this skill or how long you've been working with it.` }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [assessedLevel, setAssessedLevel] = useState<CustomSkill['proficiency'] | null>(null);
    const [evidenceSummary, setEvidenceSummary] = useState('');

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setIsThinking(true);

        try {
            // Real AI Assessment
            const result = await inferProficiencyFromResponse(skillName, userMsg);

            setMessages(prev => [...prev, {
                role: 'ai',
                content: `Based on what you shared, I'd categorize your ${skillName} level as **${result.proficiency.toUpperCase()}**.
\n\n"${result.evidence}"\n\nDoes that sound right, or do you want to add more context?`
            }]);

            setAssessedLevel(result.proficiency);
            setEvidenceSummary(result.evidence);

        } catch (err) {
            console.error("Interview Failed", err);
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I lost my train of thought. Can you try again?" }]);
        } finally {
            setIsThinking(false);
        }
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

                {/* Chat Body */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
                >
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-indigo-600 border border-slate-100 dark:border-slate-700'}`}>
                                {m.role === 'ai' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
                            </div>
                            <div className={`max-w-[80%] p-6 rounded-3xl text-sm font-medium leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-100 dark:border-slate-700'}`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isThinking && (
                        <div className="flex gap-4 animate-in fade-in duration-300">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-800 text-indigo-600 border border-slate-100 dark:border-slate-700 shadow-sm">
                                <Bot className="w-6 h-6 animate-pulse" />
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl rounded-tl-none flex items-center gap-3">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    {assessedLevel ? (
                        <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                                    <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Detected Proficiency</div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{assessedLevel}</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className={`w-4 h-1.5 rounded-full ${i <= (assessedLevel === 'expert' ? 3 : assessedLevel === 'comfortable' ? 2 : 1) ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {(['learning', 'comfortable', 'expert'] as const).map(l => (
                                        <button
                                            key={l}
                                            onClick={() => setAssessedLevel(l)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${assessedLevel === l ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}
                                        >
                                            {l[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => { setAssessedLevel(null); setMessages(prev => [...prev, { role: 'ai', content: "Okay, tell me more about your specific experience." }]) }}
                                    className="flex-1 py-4 text-slate-500 font-bold hover:bg-white rounded-[1.5rem] transition-all border border-transparent hover:border-slate-200"
                                >
                                    Add More Context
                                </button>
                                <button
                                    onClick={() => assessedLevel && onComplete(assessedLevel, evidenceSummary)}
                                    className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-[1.5rem] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Confirm & Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Share your experience..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-5 px-8 rounded-[2rem] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isThinking}
                                className="p-5 bg-indigo-600 text-white rounded-[1.5rem] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                            >
                                <Send className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
