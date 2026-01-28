import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import type { ToastType } from '../../contexts/ToastContext';

interface ToastItemProps {
    id: string;
    message: string;
    type: ToastType;
}

const ToastItem: React.FC<ToastItemProps> = ({ id, message, type }) => {
    const { removeToast } = useToast();

    const getStyle = () => {
        switch (type) {
            case 'success':
                return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
            case 'error':
                return 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200';
            case 'info':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 flex-shrink-0" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 flex-shrink-0" />;
            case 'info':
                return <Info className="w-5 h-5 flex-shrink-0" />;
        }
    };

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in ${getStyle()}`}
        >
            {getIcon()}
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={() => removeToast(id)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const { toasts } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-20 right-6 z-[100] flex flex-col gap-3 max-w-md">
            {toasts.map((toast: { id: string; message: string; type: ToastType }) => (
                <ToastItem key={toast.id} {...toast} />
            ))}
        </div>
    );
};
