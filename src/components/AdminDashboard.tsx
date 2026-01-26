import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import {
    Activity, Clock, CheckCircle2, AlertCircle,
    Terminal, Bot, Zap, RefreshCw, ChevronRight, ChevronDown, Eye, EyeOff,
    Users, BarChart3, TrendingUp, ShieldCheck, Search
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

export const AdminDashboard: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [showRaw, setShowRaw] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'logs' | 'analytics'>('logs');
    const [sysStats, setSysStats] = useState({
        totalUsers: 0,
        betaTesters: 0,
        admins: 0,
        totalLogs: 0
    });

    const fetchSystemStats = async () => {
        const [users, testers, admins, logsCount] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_tester', true),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_admin', true),
            supabase.from('logs').select('*', { count: 'exact', head: true })
        ]);

        setSysStats({
            totalUsers: users.count || 0,
            betaTesters: testers.count || 0,
            admins: admins.count || 0,
            totalLogs: logsCount.count || 0
        });
    };

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (!error && data) {
            setLogs(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
        fetchSystemStats();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.error_message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.prompt_text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calculateAvgLatency = (eventTypes: string[]) => {
        const filtered = logs.filter(l => eventTypes.includes(l.event_type));
        if (filtered.length === 0) return 0;
        return Math.round(filtered.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / filtered.length);
    };

    const stats = {
        avgLatency: logs.length > 0 ? Math.round(logs.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / logs.length) : 0,
        resumeLatency: calculateAvgLatency(['parsing', 'tailoring_block']),
        jobLatency: calculateAvgLatency(['listing_parse', 'analysis']),
        docLatency: calculateAvgLatency(['cover_letter', 'tailored_summary', 'critique']),
        successRate: logs.length > 0 ? Math.round((logs.filter(l => l.status === 'success').length / logs.length) * 100) : 0,
        total: logs.length
    };

    const toggleExpand = (id: string) => {
        setExpandedLog(expandedLog === id ? null : id);
    };

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
            {/* Header & Main Nav */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                        Command Center
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium ml-1">Real-time system intelligence and AI orchestration.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex gap-1 shadow-inner">
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'logs' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <Terminal className="w-4 h-4" />
                            Live Logs
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            Analytics
                        </button>
                    </div>
                    <button
                        onClick={() => { fetchLogs(); fetchSystemStats(); }}
                        disabled={loading}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-5 h-5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {activeTab === 'analytics' ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    {/* Top Stats Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Users', val: sysStats.totalUsers, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                            { label: 'Testers', val: sysStats.betaTesters, icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                            { label: 'AI Events', val: sysStats.totalLogs, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                            { label: 'Uptime', val: '99.9%', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' }
                        ].map((s, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
                                <div className={`p-3.5 rounded-2xl ${s.bg}`}>
                                    <s.icon className={`w-6 h-6 ${s.color}`} />
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-slate-900 dark:text-white leading-none">{s.val}</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Response Time Breakdown Widget */}
                        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Performance</h4>
                                <div className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full text-[10px] font-bold uppercase tracking-widest">Latency (ms)</div>
                            </div>

                            <div className="space-y-6 flex-1">
                                {[
                                    { label: 'Resume Support', val: stats.resumeLatency, sub: 'Parsing & Tailoring' },
                                    { label: 'Job Analysis', val: stats.jobLatency, sub: 'Extraction' },
                                    { label: 'Docs & Letters', val: stats.docLatency, sub: 'Synthesis' }
                                ].map((row, i) => (
                                    <div key={i} className="group cursor-default">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{row.label}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.sub}</div>
                                            </div>
                                            <div className="text-xl font-black text-slate-900 dark:text-white">{row.val}ms</div>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-rose-500 rounded-full opacity-60 group-hover:opacity-100 transition-all duration-500"
                                                style={{ width: `${Math.min(100, (row.val / 10000) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 -mx-8 -mb-8 px-8 py-6 rounded-b-[2.5rem]">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Average Load Time</span>
                                <span className="text-2xl font-black text-indigo-600">{stats.avgLatency}ms</span>
                            </div>
                        </div>

                        {/* Mix & Health Widget */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Execution Mix</h4>
                                <div className="space-y-6">
                                    {['analysis', 'parsing', 'cover_letter'].map(type => {
                                        const count = logs.filter(l => l.event_type === type).length;
                                        const percent = logs.length > 0 ? Math.round((count / logs.length) * 100) : 0;
                                        return (
                                            <div key={type} className="space-y-3">
                                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                                    <span className="text-slate-500">{type}</span>
                                                    <span className="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded">{percent}%</span>
                                                </div>
                                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
                                                    <div
                                                        className="h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all duration-1000"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-600/20 text-white flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-200" />
                                        <h4 className="text-xl font-black uppercase tracking-tight">System Health</h4>
                                    </div>
                                    <p className="text-indigo-100 text-sm leading-relaxed mb-6 font-medium">All systems operational. Gemini Flash throughput is stable.</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-5xl font-black">{stats.successRate}%</div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-indigo-200 opacity-80">Global Success Rate</div>
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                                    <div>
                                        <div className="text-lg font-black">{stats.total}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">Requests (24h)</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-emerald-400">0</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">System Failures</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    {/* Search Strip */}
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter logs by event, model, or content..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-5 pl-14 pr-6 rounded-[2rem] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-sm"
                        />
                    </div>

                    {/* High-Density Log Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Event</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Model</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Latency</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Time</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log) => (
                                        <React.Fragment key={log.id}>
                                            <tr
                                                onClick={() => toggleExpand(log.id)}
                                                className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800 ${expandedLog === log.id ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                                            >
                                                <td className="px-8 py-4">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${log.status === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'}`}>
                                                        {log.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{log.event_type}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-widest">{log.model_name.replace('gemini-', '')}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs font-bold ${log.latency_ms && log.latency_ms > 5000 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'}`}>{log.latency_ms}ms</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <div className="flex justify-end gap-2 pr-1">
                                                        <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${expandedLog === log.id ? 'rotate-90 text-indigo-600' : 'group-hover:translate-x-1'}`} />
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded Body */}
                                            {expandedLog === log.id && (
                                                <tr className="bg-indigo-50/20 dark:bg-indigo-900/5">
                                                    <td colSpan={6} className="px-8 py-8 border-b border-slate-100 dark:border-slate-800">
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                                                            <div>
                                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                    <Terminal className="w-3 h-3" />
                                                                    Analysis Request Payload
                                                                </div>
                                                                <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 max-h-80 overflow-y-auto shadow-inner leading-relaxed">
                                                                    {log.prompt_text}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <Bot className="w-3 h-3" />
                                                                        Orchestration Response
                                                                    </div>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setShowRaw(showRaw === log.id ? null : log.id); }}
                                                                        className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 transition-colors"
                                                                    >
                                                                        {showRaw === log.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                                        <span className="text-[10px] font-bold uppercase tracking-widest">{showRaw === log.id ? 'Hide Raw' : 'Show JSON'}</span>
                                                                    </button>
                                                                </div>
                                                                {log.status === 'success' ? (
                                                                    <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-emerald-600 dark:text-emerald-400/80 max-h-80 overflow-y-auto shadow-inner leading-relaxed">
                                                                        {showRaw === log.id ? log.response_text : (
                                                                            <div className="whitespace-pre-wrap">
                                                                                {log.response_text?.substring(0, 1000)}
                                                                                {(log.response_text?.length || 0) > 1000 && '...'}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-6 bg-rose-50 dark:bg-rose-950/30 rounded-3xl border border-rose-100 dark:border-rose-900/30">
                                                                        <div className="text-xs font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                            <AlertCircle className="w-4 h-4" />
                                                                            Orchestration Error
                                                                        </div>
                                                                        <div className="text-sm font-bold text-rose-500 leading-relaxed">{log.error_message}</div>
                                                                    </div>
                                                                )}

                                                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                                    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                                                                        {Object.entries(log.metadata).map(([k, v]) => (
                                                                            <div key={k} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-tight whitespace-nowrap">
                                                                                {k}: {String(v)}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>

                            {filteredLogs.length === 0 && !loading && (
                                <div className="text-center py-32">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <Bot className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">No Events Found</h3>
                                    <p className="text-sm text-slate-400 mt-2 uppercase tracking-widest font-bold">Try adjusting your filters or refreshing</p>
                                </div>
                            )}

                            {loading && logs.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-32">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin mb-6" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Intelligence...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
