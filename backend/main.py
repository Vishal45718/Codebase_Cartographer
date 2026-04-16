from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import traceback

from core.downloader import download_repo, get_source_files, cleanup_repo
from core.graph_builder import build_dependency_graph, serialize_graph_for_frontend

app = FastAPI(title="Codebase Cartographer API")

# Allow requests from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    repo_url: str

class AnalyzeResponse(BaseModel):
    nodes: list
    links: list

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_repository(request: AnalyzeRequest):
    repo_path = None
    try:
        if not request.repo_url.startswith("https://github.com/"):
            raise HTTPException(status_code=400, detail="Only github.com URLs are currently supported.")
            
        repo_path = download_repo(request.repo_url)
        source_files = get_source_files(repo_path)
        
        if not source_files:
            raise HTTPException(status_code=404, detail="No supported source files (JS/TS/PY) found in repository to analyze.")
            
        G = build_dependency_graph(repo_path, source_files)
        graph_data = serialize_graph_for_frontend(G)
        
        return graph_data
    except HTTPException as he:
        raise he
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if repo_path:
            cleanup_repo(repo_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
