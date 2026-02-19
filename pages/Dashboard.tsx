import React, { useRef, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { Activity, FileText, AlertTriangle, Users, Copy, Play, Pause, Box, Loader2, Terminal, X, Bell, ShieldCheck, ExternalLink, FileDown, Globe, CheckCircle, ShieldAlert, Lock, Eye, Zap, Radio } from 'lucide-react';
import { useNotification } from '../components/NotificationSystem';
import { useGlobalStore } from '../components/GlobalStore';
import { PDFService } from '../services/pdfGenerator';

const INITIAL_STATUS_DATA = [
  { name: 'Authentic', value: 850 },
  { name: 'Fake/Tampered', value: 120 },
  { name: 'Revoked', value: 30 },
];

const COLORS = ['#0ea5e9', '#ef4444', '#f59e0b'];

export const Dashboard = () => {
  const { addNotification } = useNotification();
  const { 
    isLive, setIsLive, 
    simulationSpeed, setSimulationSpeed,
    recentDocs, activityData, stats, mempool, blockHeight, logs,
    latestAlert, recentAlerts, dismissAlert, liveVerifications,
    userRole
  } = useGlobalStore();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const isVerifier = userRole === 'VERIFIER';
  const isAdmin = userRole === 'ADMIN';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addNotification('info', 'Copied to clipboard');
  };

  // Scroll logs to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleExportReport = (type: 'DAILY' | 'MONTHLY' | 'ANNUAL') => {
    try {
      PDFService.generateSystemReport(type, stats, logs);
      addNotification('success', `${type.charAt(0) + type.slice(1).toLowerCase()} Report Downloaded`);
    } catch (error) {
      console.error(error);
      addNotification('error', 'Failed to generate report');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Live Alert Banner */}
        {latestAlert && (
            <div className={`mb-6 p-4 rounded-lg shadow-lg flex items-start justify-between animate-slideDown ${
                latestAlert.type === 'error' ? 'bg-red-500 text-white' :
                latestAlert.type === 'warning' ? 'bg-amber-500 text-white' :
                latestAlert.type === 'success' ? 'bg-green-500 text-white' :
                'bg-brand-600 text-white'
            }`}>
                <div className="flex items-start">
                    <div className="p-2 bg-white/20 rounded-full mr-4">
                        <Bell className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{latestAlert.title}</h3>
                        <p className="text-white/90">{latestAlert.message}</p>
                        <p className="text-xs text-white/70 mt-1">{latestAlert.timestamp}</p>
                    </div>
                </div>
                <button 
                    onClick={dismissAlert}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        )}

        <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                    isAdmin ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                    isVerifier ? 'bg-green-100 text-green-700 border-green-200' :
                    'bg-blue-100 text-blue-700 border-blue-200'
                }`}>
                    {userRole} VIEW
                </span>
            </div>
            <p className="text-slate-500 text-sm">
                {isVerifier ? 'Registry read-only access and verification telemetry' : 'Real-time network overview and document telemetry'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Export Toolbar */}
            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">Export:</span>
                <button onClick={() => handleExportReport('DAILY')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors flex items-center">
                    <FileDown className="w-3.5 h-3.5 mr-1.5" /> Daily
                </button>
                <div className="w-px h-4 bg-slate-200"></div>
                <button onClick={() => handleExportReport('MONTHLY')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors flex items-center">
                    <FileDown className="w-3.5 h-3.5 mr-1.5" /> Monthly
                </button>
                <div className="w-px h-4 bg-slate-200"></div>
                <button onClick={() => handleExportReport('ANNUAL')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors flex items-center">
                    <FileDown className="w-3.5 h-3.5 mr-1.5" /> Annual
                </button>
            </div>

            {/* Live Control */}
            <div className="flex items-center space-x-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm ml-auto">
                <div className="flex items-center space-x-2 px-2">
                <span className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
                <span className="text-sm font-medium text-slate-700">{isLive ? 'LIVE DATA FEED' : 'PAUSED'}</span>
                </div>
                <div className="h-6 w-px bg-slate-200"></div>
                <button 
                onClick={() => setIsLive(!isLive)}
                className={`p-2 rounded-md transition-colors ${isLive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                title={isLive ? "Pause Simulation" : "Start Live Simulation"}
                >
                {isLive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                
                {isLive && (
                <div className="flex items-center space-x-1 bg-slate-100 rounded-md p-1">
                    <button onClick={() => setSimulationSpeed('SLOW')} className={`px-2 py-1 text-xs font-bold rounded ${simulationSpeed === 'SLOW' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}>1x</button>
                    <button onClick={() => setSimulationSpeed('NORMAL')} className={`px-2 py-1 text-xs font-bold rounded ${simulationSpeed === 'NORMAL' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}>5x</button>
                    <button onClick={() => setSimulationSpeed('FAST')} className={`px-2 py-1 text-xs font-bold rounded ${simulationSpeed === 'FAST' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}>10x</button>
                </div>
                )}
            </div>
          </div>
        </div>
        
        {/* Stat Cards */}
        <div className={`grid grid-cols-1 ${isVerifier ? 'md:grid-cols-2' : 'md:grid-cols-4'} gap-6 mb-8`}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Documents</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-brand-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Verifications (24h)</p>
                <p className="text-2xl font-bold text-slate-900">{stats.verify24h.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          {/* Hide Sensitive Stats for Verifiers */}
          {!isVerifier && (
              <>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">Fraud Attempts</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.fraud.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">Active Issuers</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.issuers}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                        <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    </div>
                </div>
              </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Charts & Mempool */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Live Mempool Visualizer - ADMIN ONLY */}
            {isAdmin ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                        <Box className="w-5 h-5 mr-2 text-brand-600" />
                        Live Mempool
                        </h3>
                        <p className="text-xs text-slate-500">Real-time pending transactions awaiting current block</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400">Current Block Height</p>
                        <p className="text-xl font-mono font-bold text-slate-700">#{blockHeight}</p>
                    </div>
                </div>

                <div className="relative h-24 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex items-center px-4">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500/20"></div>
                    {/* Empty State */}
                    {mempool.length === 0 && <span className="text-xs text-slate-400 w-full text-center">Waiting for transactions...</span>}
                    
                    {/* Transaction Particles */}
                    <div className="flex flex-wrap gap-2 w-full">
                    {mempool.map((tx) => (
                        <div 
                            key={tx.id} 
                            className={`h-8 px-3 rounded text-xs font-mono text-white flex items-center shadow-sm animate-scaleIn ${tx.color}`}
                            title={`Tx: ${tx.hash}`}
                        >
                            {tx.hash}
                        </div>
                    ))}
                    </div>
                    
                    {/* Progress Bar (Block Capacity) */}
                    <div className="absolute bottom-0 left-0 h-1 bg-brand-200 w-full">
                        <div 
                        className="h-full bg-brand-600 transition-all duration-300" 
                        style={{ width: `${(mempool.length / 9) * 100}%` }}
                        ></div>
                    </div>
                </div>
                </div>
            ) : (
                /* Hidden for Verifiers, Locked for Issuers */
                !isVerifier && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 border-dashed flex items-center justify-center text-slate-400 text-sm">
                        <Lock className="w-4 h-4 mr-2" /> Live Mempool Access Restricted (Admin Only)
                    </div>
                )
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Weekly Activity</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    
                    {/* Hide Issuance Data for Verifiers (Creation Details) */}
                    {!isVerifier && (
                        <Bar dataKey="issue" name="Documents Issued" fill="#0ea5e9" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                    )}
                    
                    <Bar dataKey="verify" name="Verifications" fill="#64748b" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900">
                    {isAdmin ? 'Recent Document Registrations' : 
                     isVerifier ? 'Public Registry (Anonymized)' : 
                     'My Organization Documents'}
                </h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Last 10 entries</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-900 font-medium">
                    <tr>
                      <th className="px-6 py-3">Document</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">IPFS CID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors animate-fadeIn">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{doc.title}</div>
                          {/* Hide Issuer Name for Verifiers (Creation Detail) */}
                          <div className="text-xs text-slate-500">
                             {isVerifier ? 'Issuer Hidden' : doc.issuer} • {doc.date}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-300 w-fit ${
                                doc.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                                doc.status === 'REVOKED' ? 'bg-red-100 text-red-800' : 
                                doc.status === 'SUSPICIOUS' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                                {doc.status === 'PENDING' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                {doc.status === 'PENDING' ? 'Confirming...' : 
                                doc.status === 'ACTIVE' ? 'Completed' :
                                doc.status}
                            </span>
                            {/* Visual Progress Bar for Pending Docs */}
                            {doc.status === 'PENDING' && (
                                <div className="mt-1.5 w-24 h-1 bg-blue-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full animate-[shimmer_1.5s_infinite] w-2/3"></div>
                                </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                             <div className="flex items-center bg-slate-100 rounded-md px-2 py-1 border border-slate-200">
                                 <span className="font-mono text-xs text-slate-600 mr-2" title={doc.ipfsCid}>
                                   {doc.ipfsCid.substring(0, 10)}...
                                 </span>
                                 <button onClick={() => copyToClipboard(doc.ipfsCid)} className="text-slate-400 hover:text-brand-600 p-0.5 transition-colors" title="Copy CID">
                                    <Copy className="w-3 h-3" />
                                 </button>
                                 <div className="w-px h-3 bg-slate-300 mx-1"></div>
                                 <a 
                                    href={`https://ipfs.io/ipfs/${doc.ipfsCid}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-slate-400 hover:text-brand-600 p-0.5 transition-colors" 
                                    title="View on IPFS Gateway"
                                 >
                                    <ExternalLink className="w-3 h-3" />
                                 </a>
                             </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Real-time Logs & Trust Distribution */}
          <div className="space-y-8">
            
            {/* Live Alerts Feed */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <Radio className="w-5 h-5 mr-2 text-red-500" />
                    Live Alerts
                  </h3>
                  {isLive && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
                </div>
                <div className="space-y-3">
                   {recentAlerts.length === 0 ? (
                       <div className="text-center py-6 text-slate-400 text-sm">No critical alerts detected.</div>
                   ) : (
                       recentAlerts.map((alert) => (
                           <div key={alert.id} className={`p-3 rounded-lg border text-xs animate-slideIn ${
                               alert.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' :
                               alert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                               alert.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' :
                               'bg-blue-50 border-blue-100 text-blue-800'
                           }`}>
                               <div className="flex justify-between items-center mb-1">
                                   <span className="font-bold">{alert.title}</span>
                                   <span className="opacity-70 text-[10px]">{alert.timestamp}</span>
                               </div>
                               <div className="opacity-90">{alert.message}</div>
                           </div>
                       ))
                   )}
                </div>
            </div>

             {/* Live Verification Stream */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-brand-600" />
                    Live Verifications
                  </h3>
                  {isLive && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>}
                </div>
                <div className="space-y-4">
                   {liveVerifications.length === 0 ? (
                       <div className="text-center py-6 text-slate-400 text-sm">Listening for verification events...</div>
                   ) : (
                       liveVerifications.map((ver) => (
                           <div key={ver.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 animate-slideIn">
                               <div>
                                  <div className="text-xs font-bold text-slate-700">{ver.docId}</div>
                                  <div className="text-[10px] text-slate-500">{ver.location} • {ver.timestamp}</div>
                               </div>
                               <div>
                                  {ver.status === 'VERIFIED' ? (
                                      <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                                          <CheckCircle className="w-3 h-3 mr-1" /> Valid
                                      </span>
                                  ) : (
                                      <span className="flex items-center text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                                          <ShieldAlert className="w-3 h-3 mr-1" /> Failed
                                      </span>
                                  )}
                               </div>
                           </div>
                       ))
                   )}
                </div>
             </div>

             {/* System Logs - ADMIN ONLY */}
             {isAdmin ? (
                <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 flex flex-col h-[400px] animate-fadeIn">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                    <h3 className="text-sm font-mono font-bold text-green-400 flex items-center">
                        <Terminal className="w-4 h-4 mr-2" /> 
                        SYSTEM LOGS
                    </h3>
                    {isLive && <span className="animate-pulse w-2 h-2 rounded-full bg-green-500"></span>}
                    </div>
                    <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 font-mono text-xs custom-scrollbar">
                    {logs.length === 0 ? (
                        <div className="text-slate-600 italic text-center mt-10">Waiting for network activity...</div>
                    ) : (
                        logs.map((log, i) => (
                        <div key={i} className="flex items-start space-x-2 animate-slideIn">
                            <span className="text-slate-500 shrink-0">[{log.time}]</span>
                            <span className={`${
                            log.type === 'error' ? 'text-red-400' : 
                            log.type === 'success' ? 'text-green-400' : 
                            'text-blue-300'
                            }`}>
                            {log.msg}
                            </span>
                        </div>
                        ))
                    )}
                    </div>
                </div>
             ) : (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400 text-sm h-[150px]">
                    {isVerifier ? <Eye className="w-6 h-6 mb-2" /> : <Lock className="w-6 h-6 mb-2" />}
                    <p>{isVerifier ? 'Verification Logs Only' : 'System Logs Restricted'}</p>
                    <p className="text-xs opacity-70">(Admin Clearance Required)</p>
                </div>
             )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Trust Distribution</h3>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={INITIAL_STATUS_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {INITIAL_STATUS_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-4 mt-4 text-xs">
                {INITIAL_STATUS_DATA.map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-slate-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};