import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import {
    Activity, Clock, CheckCircle, AlertCircle, Search,
    ArrowLeft, Terminal, Bot, Zap, RefreshCw, ChevronDown, ChevronUp, Eye, EyeOff
} from 'lucide-react';

interface LogEntry {
    id: string;
    event_type: string;
    model_name: string;
    prompt_text: string;
    response_text?: string;
    latency_ms?: number;
    status: 'success' | 'error';
    error_message?: string;
    metadata?: any;
    created_at: string;
    user_id?: string;
}

export const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [showRaw, setShowRaw] = useState<string | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (!error && data) {
            setLogs(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.error_message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.prompt_text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        avgLatency: logs.length > 0 ? Math.round(logs.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / logs.length) : 0,
        successRate: logs.length > 0 ? Math.round((logs.filter(l => l.status === 'success').length / logs.length) * 100) : 0,
        total: logs.length
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <Activity className="w-8 h-8 text-indigo-600" />
                            Admin Console
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Monitor system performance and AI interactions.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all w-64 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Avg Latency</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                        {stats.avgLatency}<span className="text-sm font-medium ml-1 text-slate-400">ms</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold uppercase tracking-wider">Success Rate</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                        {stats.successRate}<span className="text-sm font-medium ml-1 text-slate-400">%</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
                        <Activity className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold uppercase tracking-wider">Recent Logs</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                        {stats.total}
                    </div>
                </div>
            </div>

            {/* Log Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Event</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Latency</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredLogs.map(log => (
                                <React.Fragment key={log.id}>
                                    <tr className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${expandedLog === log.id ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                                {new Date(log.created_at).toLocaleTimeString()}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                {new Date(log.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                                                    {log.event_type === 'analysis' ? <Zap className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">{log.event_type}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{log.model_name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.status === 'success' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                                    <CheckCircle className="w-3 h-3" /> OK
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                                                    <AlertCircle className="w-3 h-3" /> Error
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                            {log.latency_ms}ms
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 text-xs font-bold"
                                            >
                                                Details
                                                {expandedLog === log.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedLog === log.id && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4 duration-300">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Prompt Section */}
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Bot className="w-3.5 h-3.5" /> Prompt (Input)
                                                            </h5>
                                                        </div>
                                                        <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 h-64 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                                            {log.prompt_text}
                                                        </div>
                                                    </div>

                                                    {/* Response Section */}
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Terminal className="w-3.5 h-3.5" /> Response (Output)
                                                            </h5>
                                                            <button
                                                                onClick={() => setShowRaw(showRaw === log.id ? null : log.id)}
                                                                className="text-[10px] font-bold text-indigo-600 flex items-center gap-1"
                                                            >
                                                                {showRaw === log.id ? <><EyeOff className="w-3 h-3" /> Hide Raw</> : <><Eye className="w-3 h-3" /> View Raw</>}
                                                            </button>
                                                        </div>
                                                        <div className="bg-slate-900 dark:bg-black p-4 rounded-2xl border border-slate-800 h-64 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap">
                                                            {log.status === 'error' ? (
                                                                <div className="text-rose-400 font-bold p-2 bg-rose-500/10 rounded-lg">
                                                                    {log.error_message}
                                                                </div>
                                                            ) : showRaw === log.id ? (
                                                                log.response_text
                                                            ) : (
                                                                // If it's JSON, try to format it nicely
                                                                (() => {
                                                                    try {
                                                                        return JSON.stringify(JSON.parse(log.response_text || '{}'), null, 2);
                                                                    } catch {
                                                                        return log.response_text;
                                                                    }
                                                                })()
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Metadata */}
                                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                    <div className="mt-4 p-3 bg-indigo-500/5 rounded-xl flex flex-wrap gap-4 items-center">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metadata:</span>
                                                        {Object.entries(log.metadata).map(([k, v]) => (
                                                            <div key={k} className="flex items-center gap-2 text-[10px]">
                                                                <span className="text-slate-400 font-medium">{k}:</span>
                                                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{String(v)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    {filteredLogs.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <Bot className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-400 text-sm italic">No logs found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
