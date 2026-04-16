import os
import networkx as nx
from core.parser import parse_source_file

def build_dependency_graph(repo_path: str, source_files: list):
    """
    Builds a directed graph representing module dependencies across languages.
    Nodes are file paths (relative to repo_root).
    Edges represent an import relationship.
    """
    G = nx.DiGraph()

    # Create mapping for fuzzy dependency resolution
    # Maps component/module name heuristic to the exact file path.
    module_to_file = {}
    
    for file_path in source_files:
        rel_path = os.path.relpath(file_path, repo_path)
        # Add node with metadata
        parsed_data = parse_source_file(file_path, repo_path)
        
        # Determine language for coloring/grouping
        ext = os.path.splitext(rel_path)[1].lower()
        if ext == ".py":
            group = "Python"
        elif ext in [".js", ".jsx"]:
            group = "JavaScript"
        elif ext in [".ts", ".tsx"]:
            group = "TypeScript"
        else:
            group = "Other"

        G.add_node(
            rel_path,
            isFile=True,
            loc=parsed_data.get("loc", 0),
            classes=parsed_data.get("defined_classes", []),
            functions=parsed_data.get("defined_functions", []),
            imports=parsed_data.get("imports", []),
            group=group
        )
        
        # Populate module resolution indices
        
        # 1. Exact relative path without extension
        no_ext = os.path.splitext(rel_path)[0]
        module_to_file[no_ext] = rel_path
        
        # 2. Python specific: Replace / with .
        module_name_py = no_ext.replace(os.sep, ".")
        module_to_file[module_name_py] = rel_path
        if rel_path.endswith("__init__.py"):
            parent_module = rel_path.replace(os.sep, ".")[:-12]
            if parent_module:
                module_to_file[parent_module] = rel_path

        # 3. Fuzzy base name matching (for JS/TS relative imports like '../Button')
        base_name = os.path.basename(no_ext)
        # Only add if not already taken to prevent severe collision, though this is heuristic
        if base_name not in module_to_file:
            module_to_file[base_name] = rel_path

    # Build edges based on imports
    for file_path in source_files:
        rel_path = os.path.relpath(file_path, repo_path)
        node_data = G.nodes[rel_path]
        
        for imp in node_data.get("imports", []):
            imp_base = imp.split('/')[-1] # Extract the last part e.g. './components/Button' -> 'Button'
            
            # Step 1: Try exact python dot notation match
            target_file_path = None
            if imp in module_to_file:
                target_file_path = module_to_file[imp]
            else:
                # Try prefix dot match for python (from x.y import z)
                for mod_name, f_path in module_to_file.items():
                    if imp.startswith(mod_name + "."):
                        target_file_path = f_path
                        break
            
            # Step 2: Try JS/TS base name fuzzy match if no target found
            if not target_file_path and imp_base in module_to_file:
                target_file_path = module_to_file[imp_base]

            if target_file_path and rel_path != target_file_path:
                G.add_edge(rel_path, target_file_path, dependency_type="import")

    # Calculate some metrics like in-degree / out-degree for UI representation
    for node in G.nodes:
        in_deg = G.in_degree(node)
        out_deg = G.out_degree(node)
        G.nodes[node]["in_degree"] = in_deg
        G.nodes[node]["out_degree"] = out_deg
        # Simple complexity heuristic: LOC + outward dependencies
        G.nodes[node]["complexity"] = G.nodes[node].get("loc", 0) + (out_deg * 5)
        
    return G

def serialize_graph_for_frontend(G: nx.DiGraph):
    """
    Prepares the graph payload for D3 or react-force-graph
    """
    nodes = []
    edges = []
    
    for node, data in G.nodes(data=True):
        nodes.append({
            "id": node,
            "label": node.split(os.sep)[-1],
            "group": data.get("group", node.split(os.sep)[0] if os.sep in node else "root"),
            "val": data.get("complexity", 10),
            "loc": data.get("loc", 0),
            "in_degree": data.get("in_degree", 0),
            "out_degree": data.get("out_degree", 0)
        })
        
    for u, v, data in G.edges(data=True):
        edges.append({
            "source": u,
            "target": v,
            "type": data.get("dependency_type", "import")
        })
        
    return {"nodes": nodes, "links": edges}
