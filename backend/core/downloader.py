import os
import shutil
import tempfile
import uuid
from git import Repo

def download_repo(repo_url: str) -> str:
    """
    Clones a GitHub repository to a temporary directory.
    Returns the path to the temporary directory.
    """
    tmp_dir = os.path.join(tempfile.gettempdir(), f"codebase_cartographer_{uuid.uuid4().hex}")
    if os.path.exists(tmp_dir):
        shutil.rmtree(tmp_dir)
    
    print(f"Cloning {repo_url} into {tmp_dir}...")
    # --depth 1 for faster cloning of just the latest commit
    Repo.clone_from(repo_url, tmp_dir, depth=1)
    return tmp_dir

def get_source_files(repo_path: str):
    """
    Retrieves a list of all supported source files in the repository.
    Supported: .py, .js, .jsx, .ts, .tsx
    """
    source_files = []
    supported_extensions = ('.py', '.js', '.jsx', '.ts', '.tsx')
    for root, _, files in os.walk(repo_path):
        for file in files:
            if file.endswith(supported_extensions):
                # Exclude virtual envs or common built-in paths if any
                if "venv" not in root and "node_modules" not in root and ".env" not in root and "dist" not in root and "build" not in root:
                    source_files.append(os.path.join(root, file))
    return source_files

def cleanup_repo(repo_path: str):
    """Deletes the cloned repository from the temporary directory."""
    try:
        shutil.rmtree(repo_path)
    except Exception as e:
        print(f"Failed to cleanup {repo_path}: {e}")
