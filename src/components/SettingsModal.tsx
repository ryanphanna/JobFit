import React, { useState, useEffect } from 'react';
import { X, Key, Check, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { validateApiKey } from '../services/geminiService';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            const storedKey = localStorage.getItem('gemini_api_key');
            if (storedKey) {
                setApiKey(storedKey);
                // Don't validate immediately on open to avoid unnecessary calls, 
                // but maybe we can show it's "saved"
                setStatus('idle');
            }
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!apiKey.trim()) {
            setMessage('Please enter a valid API Key');
            setStatus('error');
            return;
        }

        setStatus('validating');
        setMessage('Verifying key works...');

        const result = await validateApiKey(apiKey.trim());

        if (result.isValid) {
            localStorage.setItem('gemini_api_key', apiKey);

            if (result.error) {
                // Valid but with warning (e.g. Quota)
                setStatus('success'); // Still success
                setMessage(result.error);
            } else {
                setStatus('success');
            }

            setTimeout(() => {
                onClose();
                setStatus('idle');
                setMessage('');
            }, 2500);
        } else {
            setStatus('error');
            setMessage(result.error || 'Invalid API Key. Please check and try again.');
        }
    };

    const handleClear = () => {
        localStorage.removeItem('gemini_api_key');
        setApiKey('');
        setMessage('Key removed');
        setStatus('idle');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-600" />
                        API Configuration
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-slate-600 mb-6">
                        To use this app, you need your own Google Gemini API Key.
                        Your key is stored <strong>locally in your browser</strong> and is never sent to our servers.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Gemini API Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showKey ? 'text' : 'password'}
                                    value={apiKey}
                                    onChange={(e) => {
                                        setApiKey(e.target.value);
                                        setStatus('idle');
                                        setMessage('');
                                    }}
                                    placeholder="AIzaSy..."
                                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm font-mono transition-all outline-none focus:ring-2
                                        ${status === 'error'
                                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50'
                                            : status === 'success'
                                                ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20 bg-emerald-50'
                                                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                                        }`}
                                />
                                <div className="absolute left-3 top-2.5 text-slate-400">
                                    <Key className="w-5 h-5" />
                                </div>
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                >
                                    {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {message && (
                                <div className={`text-xs mt-2 flex items-center gap-1.5 
                                    ${status === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {status === 'error' ? <AlertCircle className="w-3 h-3" /> : status === 'success' ? <Check className="w-3 h-3" /> : null}
                                    {message}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleSave}
                                disabled={status === 'validating' || !apiKey}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all
                                    ${status === 'success'
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none'
                                    }`}
                            >
                                {status === 'validating' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : status === 'success' ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Saved
                                    </>
                                ) : (
                                    'Save API Key'
                                )}
                            </button>
                            {apiKey && (
                                <button
                                    onClick={handleClear}
                                    className="px-4 py-2.5 rounded-lg text-slate-500 hover:bg-slate-100 font-medium text-sm transition-colors border border-slate-200"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-medium inline-flex items-center gap-1"
                            >
                                Get a free API Key from Google AI Studio
                                <div className="w-3 h-3">↗</div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
