import os
import networkx as nx
from core.downloader import download_repo, get_source_files, cleanup_repo
from core.graph_builder import build_dependency_graph
repo_path = download_repo("https://github.com/pmndrs/zustand")
files = get_source_files(repo_path)
print(f"Discovered {len(files)} files.")
G = build_dependency_graph(repo_path, files)
print(f"Graph nodes: {G.number_of_nodes()}, edges: {G.number_of_edges()}")
for node, data in G.nodes(data=True):
    if data['imports']:
        print(f"Node: {node}, Imports: {data['imports']}")
        break
cleanup_repo(repo_path)
