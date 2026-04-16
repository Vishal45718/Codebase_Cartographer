import os
from tree_sitter import Language, Parser, QueryCursor
import tree_sitter_python
import tree_sitter_javascript
import tree_sitter_typescript

# Initialize Language Objects
# Check for binding methods (latest tree-sitter packages expose language())
PY_LANGUAGE = Language(tree_sitter_python.language())
JS_LANGUAGE = Language(tree_sitter_javascript.language())
# Typescript grammar package exposes a language_typescript function typically
try:
    TS_LANGUAGE = Language(tree_sitter_typescript.language_typescript())
except AttributeError:
    TS_LANGUAGE = Language(tree_sitter_typescript.language())

# Initialize Parsers
py_parser = Parser(PY_LANGUAGE)
js_parser = Parser(JS_LANGUAGE)
ts_parser = Parser(TS_LANGUAGE)

# Define Queries
PY_QUERY = PY_LANGUAGE.query('''
    (import_statement (dotted_name) @import)
    (import_from_statement module_name: (dotted_name) @import)
    (class_definition name: (identifier) @class)
    (function_definition name: (identifier) @function)
''')

JS_QUERY = JS_LANGUAGE.query('''
    (import_statement source: (string) @import)
    (class_declaration name: (identifier) @class)
    (function_declaration name: (identifier) @function)
    (call_expression function: (identifier) @func_name arguments: (arguments (string) @import) (#eq? @func_name "require"))
''')

TS_QUERY = TS_LANGUAGE.query('''
    (import_statement source: (string) @import)
    (class_declaration name: (type_identifier) @class)
    (function_declaration name: (identifier) @function)
''')

def clean_string_literal(s: str) -> str:
    """Removes quotes from a parsed string literal."""
    return s.strip("\"'")

def parse_source_file(file_path: str, repo_root: str):
    """
    Parses a source file (Py, JS, TS) using tree-sitter.
    Extracts imports, classes, and functions.
    """
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except Exception:
        return {"imports": [], "defined_classes": [], "defined_functions": [], "loc": 0}

    loc = len(content.splitlines())
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".py":
        parser = py_parser
        query = PY_QUERY
    elif ext in [".js", ".jsx"]:
        parser = js_parser
        query = JS_QUERY
    elif ext in [".ts", ".tsx"]:
        parser = ts_parser
        query = TS_QUERY
    else:
        return {"imports": [], "defined_classes": [], "defined_functions": [], "loc": loc}

    source_bytes = content.encode("utf8")
    try:
        tree = parser.parse(source_bytes)
        cursor = QueryCursor(query)
        captures = cursor.captures(tree.root_node)
    except Exception as e:
         print(f"Exception parsing tree: {e}")
         # Fallback on parse failure
         return {"imports": [], "defined_classes": [], "defined_functions": [], "loc": loc}

    imports = []
    classes = []
    functions = []

    for capture_name, nodes in captures.items():
        for node in nodes:
            text = node.text.decode("utf8")
            if capture_name == "import":
                # For js/ts imports, they usually come with quotes
                if ext != ".py":
                    text = clean_string_literal(text)
                imports.append(text)
            elif capture_name == "class":
                classes.append(text)
            elif capture_name == "function":
                functions.append(text)
            
    # Quick deduplication
    imports = list(set(imports))
    classes = list(set(classes))
    functions = list(set(functions))

    return {
        "imports": imports,
        "defined_classes": classes,
        "defined_functions": functions,
        "loc": loc
    }
