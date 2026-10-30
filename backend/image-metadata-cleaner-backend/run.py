#!/usr/bin/env python3
"""
Entry point for running the Image Metadata Inspector API

Usage:
    python run.py              # Run with default settings
    python run.py --reload     # Run in debug mode with auto-reload
    python run.py --port 8080  # Run on custom port
"""
import os
import sys
import argparse

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    parser = argparse.ArgumentParser(description="Image Metadata Inspector API")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind to (default: 8000)")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload (debug mode)")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")

    args = parser.parse_args()

    # Set environment variables
    if args.debug or args.reload:
        os.environ["DEBUG"] = "true"

    os.environ["HOST"] = args.host
    os.environ["PORT"] = str(args.port)

    import uvicorn

    print(f"\n{'='*50}")
    print("🚀 Image Metadata Inspector API")
    print(f"{'='*50}")
    print(f"   URL: http://{args.host}:{args.port}")
    print(f"   Docs: http://{args.host}:{args.port}/docs")
    print(f"   Debug: {args.debug or args.reload}")
    print(f"{'='*50}\n")

    uvicorn.run(
        "app.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level="info" if (args.debug or args.reload) else "warning",
    )

if __name__ == "__main__":
    main()
