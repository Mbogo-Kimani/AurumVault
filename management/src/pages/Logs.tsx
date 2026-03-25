import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Terminal, 
  RefreshCcw,
  AlertCircle,
  FileText,
  Clock,
  Shield,
  Trash2,
  Download,
  Search
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Log {
  _id: string;
  type: string;
  message: string;
  metadata?: any;
  createdAt: string;
}

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [logType, setLogType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [logType]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const endpoint = logType === 'all' ? '/logs' : `/logs?type=${logType}`;
      const data = await api(endpoint);
      setLogs(data);
    } catch (error: any) {
      console.error('Error fetching logs:', error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to stream system logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getLogTypeStyles = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cron':
        return 'bg-blue-500/10 text-blue-500 border-blue-200/50';
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-200/50';
      case 'success':
        return 'bg-green-500/10 text-green-500 border-green-200/50';
      case 'auth':
        return 'bg-purple-500/10 text-purple-500 border-purple-200/50';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-200/50';
    }
  };

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            System Auditor
          </h1>
          <p className="text-gray-500 font-medium font-mono text-sm tracking-tight capitalize">
            {logType} Events & Activity Pipeline
          </p>
        </div>
        <div className="flex items-center space-x-2">
           <Button 
            variant="outline" 
            className="bg-white border-gray-200 font-bold h-11"
            onClick={fetchLogs}
            disabled={isLoading}
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <select
            value={logType}
            onChange={(e) => setLogType(e.target.value)}
            className="h-11 px-4 border border-gray-200 rounded-md font-bold text-gray-600 bg-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
          >
            <option value="all">Every Event</option>
            <option value="cron">Automated Tasks</option>
            <option value="error">System Failures</option>
            <option value="success">Successful Ops</option>
            <option value="auth">Security Events</option>
          </select>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-gray-950 text-gray-300 overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-gray-800 bg-gray-900/50 px-6 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">
              Live Terminal Feed
            </CardTitle>
          </div>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
             <input
               type="text"
               placeholder="Grep messages..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-gray-800 border-none rounded-full h-8 pl-9 pr-4 text-xs font-mono text-green-400 placeholder:text-gray-600 focus:ring-1 focus:ring-green-500/50 outline-none w-48 transition-all focus:w-64"
             />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs font-mono">
              <thead className="bg-gray-900/80 text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3 font-black">Timestamp</th>
                  <th className="px-6 py-3 font-black">Classification</th>
                  <th className="px-6 py-3 font-black">Event Trace</th>
                  <th className="px-6 py-3 font-black text-right">Node ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {isLoading && logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-gray-600">
                        <Terminal className="w-10 h-10 animate-bounce" />
                        <span className="font-black text-lg tracking-widest">INITIALIZING STREAM...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-gray-600 italic">
                      No matching trace signals captured in the current buffer.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 group-hover:text-gray-300">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-tighter px-2 py-0 border-none ${getLogTypeStyles(log.type)}`}>
                          {log.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 max-w-xl">
                        <div className="flex items-start gap-3">
                          {log.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />}
                          <span className="text-gray-300 leading-normal">{log.message}</span>
                        </div>
                        {log.metadata && (
                          <div className="mt-2 text-[10px] text-gray-500 bg-black/40 p-3 rounded-lg border border-gray-800 group-hover:border-gray-700 transition-colors">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap opacity-30 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-blue-400">
                          {log._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white p-2">
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center">
               <Activity className="w-4 h-4 mr-2 text-yellow-500" /> System Health Overlook
             </CardTitle>
           </CardHeader>
           <CardContent className="grid grid-cols-3 gap-4 pt-4">
             <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Errors (24h)</p>
                <p className="text-2xl font-black text-red-500">{logs.filter(l => l.type === 'error').length}</p>
             </div>
             <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Tasks Completed</p>
                <p className="text-2xl font-black text-green-500">{logs.filter(l => l.type === 'success').length}</p>
             </div>
             <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Entries</p>
                <p className="text-2xl font-black text-gray-900">{logs.length}</p>
             </div>
           </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500">Security & Pruning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <Button variant="outline" className="w-full justify-start text-xs font-bold h-10 border-gray-100 hover:bg-yellow-50 hover:text-yellow-700">
               <Download className="w-3.5 h-3.5 mr-2" /> Download Full Archive (JSON)
            </Button>
            <Button variant="outline" className="w-full justify-start text-xs font-bold h-10 border-gray-100 hover:bg-red-50 hover:text-red-500">
               <Trash2 className="w-3.5 h-3.5 mr-2" /> Purge Activity Buffer
            </Button>
            <p className="text-[10px] text-gray-400 text-center pt-2">
              <Shield className="w-3 h-3 inline mr-1" /> Automated 30-day rotation policy active
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Logs;
