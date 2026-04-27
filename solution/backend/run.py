from __future__ import annotations

from pathlib import Path
import sys

import uvicorn


def main() -> None:
    root = Path(__file__).resolve().parent
    sys.path.insert(0, str(root))
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)


if __name__ == "__main__":
    main()
