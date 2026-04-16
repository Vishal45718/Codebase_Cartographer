from core.parser import parse_source_file
import tempfile
import os

fp = tempfile.mktemp(suffix=".js")
with open(fp, "w") as f:
    f.write('import { create } from "zustand"\nimport axios from "./api"\nclass Test {}\n')

res = parse_source_file(fp, os.path.dirname(fp))
print("JS Result:", res)
os.remove(fp)

fp2 = tempfile.mktemp(suffix=".py")
with open(fp2, "w") as f:
    f.write('import os\nfrom typing import Any\nclass Foo:\n  pass\n')

res2 = parse_source_file(fp2, os.path.dirname(fp2))
print("PY Result:", res2)
os.remove(fp2)

