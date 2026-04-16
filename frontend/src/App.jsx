import React, { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, GitBranch, ShieldAlert } from 'lucide-react';
import GraphViewer from './components/GraphViewer';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    setLoading(true);
    setError(null);
    setGraphData(null);

    try {
      // Send analyze request to the backend
      const response = await axios.post('http://localhost:8000/analyze', { repo_url: repoUrl });
      setGraphData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <GitBranch className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Codebase Cartographer
            </h1>
          </div>
          
          <form onSubmit={handleAnalyze} className="flex flex-1 max-w-xl ml-8">
            <div className="relative w-full shadow-sm rounded-lg overflow-hidden group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textMuted group-focus-within:text-primary transition-colors">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-2 border border-border bg-surface text-text sm:text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all placeholder-textMuted/60"
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !repoUrl}
              className="ml-3 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed btn-hover flex items-center shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start text-red-400 shadow-sm animate-in slide-in-from-top-2">
            <ShieldAlert className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-300">Analysis Failed</h3>
              <p className="mt-1 text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Dashboard Area */}
        <div className="flex-1 rounded-2xl border border-border bg-surface/30 shadow-2xl overflow-hidden backdrop-blur-sm flex flex-col">
          {/* Header of viewing area */}
          <div className="px-4 py-3 border-b border-border bg-surface/50 flex justify-between items-center text-sm">
            <h2 className="font-medium text-text font-mono flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              {graphData ? "Dependency Graph Generated" : "Ready"}
            </h2>
            <div className="flex space-x-4 text-textMuted">
              <span>Nodes: <strong className="text-text">{graphData?.nodes?.length || 0}</strong></span>
              <span>Edges: <strong className="text-text">{graphData?.links?.length || 0}</strong></span>
            </div>
          </div>
          
          {/* Graph Visualization */}
          <div className="flex-1 relative bg-gradient-to-br from-surface to-background object-cover">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/60 backdrop-blur-[2px] z-10 transition-all duration-300">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium text-text bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary animate-pulse">
                  Cloning and mapping repository...
                </p>
                <p className="text-sm text-textMuted mt-2 max-w-sm text-center">
                  This might take a minute depending on the repository size and number of Python files.
                </p>
              </div>
            ) : (
               <GraphViewer data={graphData} />
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
