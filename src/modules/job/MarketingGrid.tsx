import React, { useState } from 'react';
import { Zap, Sparkles, FileText, Bookmark, PenTool, GraduationCap, TrendingUp } from 'lucide-react';
import { BentoCard, type BentoColorConfig } from '../../components/common/BentoCard';
import { BENTO_CARDS } from '../../constants';

// Icon Map
const ICON_MAP = {
    Sparkles,
    Zap,
    FileText,
    GraduationCap,
    Bookmark,
    PenTool,
    TrendingUp
} as const;

export const MarketingGrid: React.FC = () => {
    const [shuffledCards] = useState<string[]>(() => {
        // Reduced to 5 cards to match ActionGrid count
        const marketingCards = ['JOBFIT', 'KEYWORDS', 'RESUMES', 'COVER_LETTERS', 'HISTORY', 'COUCH'];
        return [...marketingCards].sort(() => Math.random() - 0.5);
    });

    if (shuffledCards.length === 0) return null;

    const renderPreview = (id: string, color: BentoColorConfig) => {
        switch (id) {
            case 'jobfit':
                return (
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="28" cy="28" r="24" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-slate-100 dark:text-slate-800" />
                            <circle cx="28" cy="28" r="24" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="150.8" strokeDashoffset="30.16" className={`${color.text} animate-[dash_1.5s_ease-in-out_forwards]`} />
                        </svg>
                        <span className={`absolute text-[10px] font-black ${color.text}`}>98%</span>
                    </div>
                );
            case 'keywords':
                return (
                    <div className="flex items-center justify-center gap-2 px-4">
                        <span className={`px-2 py-1 rounded ${color.bg.replace('/50', '/80')} ${color.text} text-[10px] font-bold`}>✓ React</span>
                        <span className={`px-2 py-1 rounded ${color.bg.replace('/50', '/40')} ${color.text} text-[10px] font-bold opacity-60`}>+ Node</span>
                    </div>
                );
            case 'resumes':
                return (
                    <div className={`relative w-12 h-12 ${color.iconBg}/20 rounded-lg flex items-center justify-center border ${color.accent}`}>
                        <div className={`w-6 h-0.5 ${color.iconBg} rounded-full`} />
                    </div>
                );
            case 'cover_letters':
                return (
                    <div className="flex flex-col justify-center gap-1.5 px-4 w-full">
                        <div className="w-3/4 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <div className={`w-full h-1.5 ${color.iconBg}/20 rounded-full`} />
                        <div className="w-2/3 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </div>
                );
            case 'history':
                return (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 ${color.iconBg} text-white text-[10px] font-bold rounded shadow-sm`}>
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        Save
                    </div>
                );
            case 'coach':
                return (
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 relative rounded-full mx-4 overflow-hidden">
                        <div className={`absolute inset-y-0 left-0 w-2/3 ${color.iconBg} rounded-full animate-[shimmer_2s_infinite]`} style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
                        <div className={`absolute inset-y-0 left-0 w-2/3 ${color.iconBg} rounded-full opacity-50`} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="mt-16 w-full max-w-7xl mx-auto px-4">
            {/* HUB: The Central Mission Statement (Bursting Core) - NOW OUTSIDE GRID */}
            <div className="flex flex-col items-center justify-center text-center pt-8 pb-24 relative overflow-hidden mb-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50" />

                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <h2 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[0.9]">
                        Get hired.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-600">Delete us.</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        We measure success by how fast you leave. Get your forever job, delete your account, and get on with your life.
                    </p>
                </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`}>
                {shuffledCards.map((key) => {
                    const config = BENTO_CARDS[key as keyof typeof BENTO_CARDS];
                    return (
                        <BentoCard
                            key={config.id}
                            id={config.id}
                            icon={ICON_MAP[config.iconName as keyof typeof ICON_MAP]}
                            title={config.title.marketing}
                            description={config.description.marketing}
                            color={config.colors}
                            actionLabel={config.action.marketing}
                            previewContent={renderPreview(config.id, config.colors)}
                            onAction={() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                setTimeout(() => document.querySelector('input')?.focus(), 500);
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};
