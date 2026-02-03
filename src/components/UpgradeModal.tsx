import React from 'react';
import type { UsageLimitResult } from '../services/usageLimits';
import { X, Sparkles, Zap, TrendingUp, CheckCircle } from 'lucide-react';

interface UpgradeModalProps {
    limitInfo: UsageLimitResult;
    onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ limitInfo, onClose }) => {
    const handleUpgrade = () => {
        // TODO: Implement Stripe checkout
        alert('Stripe integration coming soon! For now, contact support to upgrade.');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-slideUp">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Ready for Unlimited Analyses?
                    </h2>

                    {limitInfo.reason === 'free_limit_reached' && (
                        <p className="text-gray-600 dark:text-gray-300">
                            You've used all <strong>{limitInfo.limit} free job analyses</strong>.
                            <br />
                            Upgrade to Pro for unlimited access.
                        </p>
                    )}

                    {limitInfo.reason === 'daily_limit_reached' && (
                        <p className="text-gray-600 dark:text-gray-300">
                            You've hit your daily limit of <strong>{limitInfo.limit} analyses</strong>.
                            <br />
                            This helps us prevent abuse. Come back tomorrow!
                        </p>
                    )}
                </div>

                {/* Features */}
                {limitInfo.reason === 'free_limit_reached' && (
                    <div className="my-6 space-y-3">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Unlimited Job Analyses</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Apply to as many jobs as you want</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Quality-Gated Cover Letters</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">AI iterates until your cover letter is perfect</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Career Roadmaps</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">12-month plans to reach your target role</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing */}
                {limitInfo.reason === 'free_limit_reached' && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">$12<span className="text-lg font-normal text-gray-600 dark:text-gray-400">/month</span></div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cancel anytime • No commitments</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    {limitInfo.reason === 'free_limit_reached' && (
                        <>
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                            >
                                Maybe Later
                            </button>
                            <button
                                onClick={handleUpgrade}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg shadow-blue-500/25"
                            >
                                Upgrade to Pro
                            </button>
                        </>
                    )}

                    {limitInfo.reason === 'daily_limit_reached' && (
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2.5 rounded-lg bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-medium"
                        >
                            Got It
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
