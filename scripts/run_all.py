#!/usr/bin/env python3
"""Master startup runner for InterviewAce: launches both FastAPI Backend (8000) and React Frontend (3000)."""

import json
import os
import subprocess
import sys
import time
import urllib.request

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(WORKSPACE_ROOT, "backend")
FRONTEND_DIR = os.path.join(WORKSPACE_ROOT, "frontend")
PYTHON_EXEC = os.path.join(BACKEND_DIR, "venv", "Scripts", "python.exe")

if not os.path.exists(PYTHON_EXEC):
    PYTHON_EXEC = sys.executable


def check_url(url: str, timeout: float = 3.0) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            return response.status in (200, 201)
    except Exception:
        return False


def main():
    print("=" * 70)
    print("[*] INTERVIEWACE: STARTING FULL-STACK APPLICATION")
    print("=" * 70)

    # 1. Start Backend on Port 8000
    print("[1/2] Starting FastAPI Backend on http://localhost:8000...")
    backend_cmd = [PYTHON_EXEC, "run.py"]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=BACKEND_DIR,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    # 2. Start Frontend on Port 3000
    print("[2/2] Starting React 18 + Tailwind Frontend on http://localhost:3000...")
    frontend_cmd = [PYTHON_EXEC, "run_frontend.py"]
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=FRONTEND_DIR,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    # Wait for services to respond
    print("\n[*] Initializing services and waiting for health checks...")
    backend_up = False
    frontend_up = False

    for _ in range(15):
        time.sleep(1)
        if not backend_up and check_url("http://localhost:8000/health"):
            backend_up = True
            print("  [+] FastAPI Backend is ONLINE (http://localhost:8000)")
        if not frontend_up and check_url("http://localhost:3000"):
            frontend_up = True
            print("  [+] React Frontend is ONLINE (http://localhost:3000)")
        if backend_up and frontend_up:
            break

    print("\n" + "=" * 70)
    if backend_up and frontend_up:
        print("[SUCCESS] ALL SYSTEMS OPERATIONAL!")
        print("[*] Frontend URL: http://localhost:3000")
        print("[*] Backend Docs: http://localhost:8000/docs")
        print("[*] Health Check: http://localhost:8000/health")
    else:
        print("[!] Note: One or more services are still initializing...")
    print("=" * 70)
    print("Press Ctrl+C to terminate both servers.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("All processes stopped.")


if __name__ == "__main__":
    main()
