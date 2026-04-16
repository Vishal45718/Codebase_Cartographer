import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { Search, Loader2, GitBranch, ShieldAlert, X, Activity, FileCode, CheckCircle2 } from 'lucide-react';
import GraphViewer from './components/GraphViewer';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    setLoading(true);
    setError(null);
    setGraphData(null);
    setSelectedNodeId(null);
    setSearchQuery('');

    try {
      const response = await axios.post('http://localhost:8000/analyze', { repo_url: repoUrl });
      setGraphData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const selectedNodeData = useMemo(() => {
    if (!graphData || !selectedNodeId) return null;
    return graphData.nodes.find(n => n.id === selectedNodeId);
  }, [graphData, selectedNodeId]);

  return (
    <div className="h-screen w-screen bg-background text-text overflow-hidden font-sans relative">
      
      {/* Absolute Full Screen Graph */}
      <div className="absolute inset-0 z-0">
        <GraphViewer 
            data={graphData} 
            selectedNodeId={selectedNodeId} 
            onNodeSelect={(id) => setSelectedNodeId(id === selectedNodeId ? null : id)} 
            searchQuery={searchQuery}
        />
      </div>

      {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface/60 backdrop-blur-[2px] transition-all duration-300">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary animate-pulse shadow-sm">
              Mapping Repository Architecture...
            </p>
            <p className="text-sm text-textMuted mt-2 max-w-sm text-center">
              Discovering files and tracing dependencies using Tree-sitter AST queries.
            </p>
          </div>
      )}

      {/* Glassmorphic Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-start justify-between pointer-events-auto">
            {/* Branding */}
            <div className="glass px-5 py-3 rounded-2xl flex items-center space-x-3">
                <div className="bg-primary/20 p-2 rounded-lg text-primary">
                    <GitBranch className="w-5 h-5" />
                </div>
                <div>
                   <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary leading-tight">
                    Codebase Cartographer
                   </h1>
                   <div className="flex items-center text-xs text-textMuted font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 shadow-[0_0_6px_rgba(34,197,94,0.6)]"></span>
                      {graphData ? `Network Alive: ${graphData.nodes.length} Nodes` : "Ready"}
                   </div>
                </div>
            </div>
          
            {/* Controls */}
            <div className="flex flex-col space-y-3 w-full max-w-xl">
                <form onSubmit={handleAnalyze} className="glass p-2 rounded-2xl flex shadow-2xl">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-textMuted">
                            <Search className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-4 py-2.5 bg-background/50 border border-transparent rounded-xl text-text text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all placeholder-textMuted"
                            placeholder="Import GitHub Repository URL..."
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !repoUrl}
                        className="ml-2 px-5 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed btn-hover shadow-lg shadow-primary/20 transition-all flex items-center"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Chart"}
                    </button>
                </form>

                {error && (
                    <div className="glass border-red-500/30 bg-red-500/10 rounded-xl p-3 flex items-start text-red-400">
                        <ShieldAlert className="w-4 h-4 mr-2 mt-0.5" />
                        <span className="text-xs">{error}</span>
                        <button type="button" onClick={() => setError(null)} className="ml-auto hover:text-white"><X className="w-4 h-4"/></button>
                    </div>
                )}

                {/* Graph Local Filters */}
                {graphData && (
                   <div className="glass p-2 rounded-xl flex items-center space-x-2 animate-slide-in-right">
                       <Search className="w-4 h-4 ml-2 text-textMuted" />
                       <input 
                           type="text" 
                           placeholder="Filter active nodes..." 
                           className="bg-transparent text-sm w-full focus:outline-none placeholder-textMuted px-2"
                           value={searchInput}
                           onChange={(e) => {
                               setSearchInput(e.target.value);
                               setSearchQuery(e.target.value);
                               // Clear focus if typing search
                               if (e.target.value && selectedNodeId) setSelectedNodeId(null);
                           }}
                       />
                       {searchInput && (
                           <button onClick={() => { setSearchInput(''); setSearchQuery(''); }} className="text-textMuted hover:text-white p-1">
                               <X className="w-4 h-4" />
                           </button>
                       )}
                   </div>
                )}
            </div>
        </div>
      </header>

      {/* Floating Target Sidebar */}
      {selectedNodeData && (
          <aside className="absolute top-24 right-6 bottom-6 w-80 glass rounded-3xl z-40 overflow-hidden flex flex-col animate-slide-in-right">
              {/* Sidebar Header */}
              <div className="p-5 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent flex justify-between items-start">
                 <div className="pr-4 overflow-hidden">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-primary mb-1 block">Module Inspector</span>
                    <h2 className="text-lg font-bold text-white truncate" title={selectedNodeData.label}>{selectedNodeData.label}</h2>
                    <p className="text-xs text-textMuted mt-1 truncate" title={selectedNodeData.id}>{selectedNodeData.id}</p>
                 </div>
                 <button onClick={() => setSelectedNodeId(null)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-textMuted hover:text-white">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Sidebar Content Scroll */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                  
                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background/40 p-3 rounded-2xl border border-white/5 flex flex-col">
                          <span className="text-textMuted text-xs mb-1 flex items-center"><Activity className="w-3 h-3 mr-1"/> Complexity</span>
                          <span className="text-xl font-mono text-white">{selectedNodeData.val}</span>
                      </div>
                      <div className="bg-background/40 p-3 rounded-2xl border border-white/5 flex flex-col">
                          <span className="text-textMuted text-xs mb-1 flex items-center"><FileCode className="w-3 h-3 mr-1"/> LOC</span>
                          <span className="text-xl font-mono text-white">{selectedNodeData.loc}</span>
                      </div>
                      <div className="bg-background/40 p-3 rounded-2xl border border-white/5 flex flex-col">
                          <span className="text-textMuted text-xs mb-1">In Degrees</span>
                          <span className="text-xl font-mono text-white">{selectedNodeData.in_degree}</span>
                      </div>
                      <div className="bg-background/40 p-3 rounded-2xl border border-white/5 flex flex-col">
                          <span className="text-textMuted text-xs mb-1">Out Degrees</span>
                          <span className="text-xl font-mono text-white">{selectedNodeData.out_degree}</span>
                      </div>
                  </div>

                  {/* Components / Functions */}
                  {selectedNodeData.functions && selectedNodeData.functions.length > 0 && (
                      <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-textMuted mb-2 border-b border-white/10 pb-1">Exported Functions</h4>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                              {selectedNodeData.functions.slice(0, 10).map((func, i) => (
                                  <span key={i} className="text-[11px] font-mono px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded-md">
                                      {func}()
                                  </span>
                              ))}
                              {selectedNodeData.functions.length > 10 && <span className="text-xs text-textMuted ml-1">+{selectedNodeData.functions.length - 10} more</span>}
                          </div>
                      </div>
                  )}

                  {/* Imports */}
                  {selectedNodeData.imports && selectedNodeData.imports.length > 0 && (
                      <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-textMuted mb-2 border-b border-white/10 pb-1 flex items-center justify-between">
                              <span>Imports</span>
                              <span className="bg-white/10 px-1.5 rounded text-white">{selectedNodeData.imports.length}</span>
                          </h4>
                          <ul className="space-y-1 mt-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                              {selectedNodeData.imports.map((imp, i) => (
                                  <li key={i} className="text-xs font-mono text-textMuted truncate flex items-center" title={imp}>
                                      <CheckCircle2 className="w-3 h-3 text-secondary mr-2 shrink-0" />
                                      {imp}
                                  </li>
                              ))}
                          </ul>
                      </div>
                  )}
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-white/5 bg-background/30">
                  <button 
                    onClick={() => {
                        // Focus interaction is already handled via setting selectedNodeId 
                        // To expand this, we could add strict zoom functionality here.
                    }}
                    className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors border border-white/10"
                  >
                     Currently Focused
                  </button>
              </div>

          </aside>
      )}

    </div>
  );
}

export default App;
