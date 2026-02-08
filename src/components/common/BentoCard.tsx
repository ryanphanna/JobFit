import React, { useState, useRef } from 'react';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export interface BentoColorConfig {
    bg: string;
    text: string;
    accent: string;
    iconBg: string;
    preview: string;
    glow: string;
}

export interface BentoCardProps {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
    color: BentoColorConfig;
    previewContent?: React.ReactNode;
    actionLabel: string;
    onAction?: () => void;
    className?: string;
}

export const BentoCard: React.FC<BentoCardProps> = ({
    icon: Icon,
    title,
    description,
    color,
    previewContent,
    actionLabel,
    onAction,
    className = "",
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [shimmer, setShimmer] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const rotateX = (e.clientY - centerY) / 20;
        const rotateY = (centerX - e.clientX) / 20;

        setTilt({ x: rotateX, y: rotateY });

        // Shimmer position relative to the card (%)
        const shimmerX = ((e.clientX - rect.left) / rect.width) * 100;
        const shimmerY = ((e.clientY - rect.top) / rect.height) * 100;
        setShimmer({ x: shimmerX, y: shimmerY });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: tilt.x === 0 ? 'transform 0.5s ease-out' : 'none'
            }}
            className={`group relative bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-6 border ${color.accent} shadow-xl hover:shadow-2xl text-left overflow-hidden h-full flex flex-col ${className}`}
        >
            {/* Dynamic Mouse Shimmer */}
            <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-500 z-0"
                style={{
                    background: `radial-gradient(circle at ${shimmer.x}% ${shimmer.y}%, rgba(255,255,255,0.2) 0%, transparent 60%)`
                }}
            />

            {/* Ambient Background Glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${color.glow} rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-700 opacity-50 group-hover:opacity-100 group-hover:scale-110`} />

            <div className="flex items-center gap-4 relative z-10 mb-4">
                <div className={`w-12 h-12 ${color.iconBg} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-[10deg] transition-all duration-500`}>
                    <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {title}
                </h3>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 relative z-10 h-10 line-clamp-2">
                {description}
            </p>

            <div className="relative h-20 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 mb-4 flex items-center justify-center overflow-hidden">
                <div className={`absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t ${color.preview} to-transparent opacity-50`} />
                <div className="relative z-10 scale-90 group-hover:scale-100 transition-transform duration-500">
                    {previewContent}
                </div>
            </div>

            <div
                className={`mt-auto flex items-center justify-end gap-2 ${color.text} font-bold text-xs group-hover:gap-3 transition-all relative z-10 cursor-pointer`}
                onClick={onAction}
            >
                <span className="uppercase tracking-widest">{actionLabel}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    );
};
