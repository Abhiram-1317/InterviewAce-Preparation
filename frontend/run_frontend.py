#!/usr/bin/env python3
"""HTTP server for InterviewAce React 18 + TailwindCSS frontend on port 3000."""

import http.server
import socketserver
import os
import sys

PORT = 3000
FRONTEND_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(FRONTEND_DIR, "dist")
SERVE_DIR = DIST_DIR if os.path.exists(DIST_DIR) else FRONTEND_DIR


class SPAHandler(http.server.SimpleHTTPRequestHandler):
    """SPA HTTP Request Handler with React Router v6 fallback."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SERVE_DIR, **kwargs)

    def do_GET(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) and "." not in os.path.basename(self.path):
            self.path = "/index.html"
        return super().do_GET()


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
            print("=" * 60)
            print("[+] InterviewAce React 18 + TailwindCSS Frontend")
            print(f"[*] Server live at: http://localhost:{PORT}")
            print(f"[*] Serving from: {SERVE_DIR}")
            print("[*] Backend API:  http://localhost:8000")
            print("=" * 60)
            print("Press Ctrl+C to stop.\n")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down frontend server.")
        sys.exit(0)
