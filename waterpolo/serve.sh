#!/bin/bash

# Water Polo Website Development Server
# Lightweight web server for live development

PORT=8000
HOST="localhost"
USE_DOCKER=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --docker)
            USE_DOCKER=true
            shift
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --host)
            HOST="$2"
            shift 2
            ;;
        -h|--help)
            echo "🏊‍♂️ Water Polo Website Development Server"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --docker         Run server in Docker container"
            echo "  --port PORT      Set server port (default: 8000)"
            echo "  --host HOST      Set server host (default: localhost)"
            echo "  -h, --help       Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Start local server"
            echo "  $0 --docker           # Start Docker container server"
            echo "  $0 --port 3000        # Start on port 3000"
            echo "  $0 --docker --port 80 # Docker server on port 80"
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "🏊‍♂️ Starting Water Polo Website Development Server..."
echo "📍 Serving from: $(pwd)"

if [ "$USE_DOCKER" = true ]; then
    echo "🐳 Using Docker container..."
    echo "🌐 Local URL: http://${HOST}:${PORT}"
    echo "📱 Network URL: http://$(hostname -I | awk '{print $1}'):${PORT}"
    echo ""
    echo "🚀 Starting Docker container on port ${PORT}..."
    echo "💡 Press Ctrl+C to stop the container"
    echo "🔄 Files will be served with live reload capability"
    echo ""
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker not found! Please install Docker first."
        exit 1
    fi
    
    # Run nginx in Docker container with volume mount
    docker run --rm -it \
        -p ${PORT}:80 \
        -v "$(pwd):/usr/share/nginx/html:ro" \
        --name waterpolo-dev-server \
        nginx:alpine
        
else
    echo "🌐 Local URL: http://${HOST}:${PORT}"
    echo "📱 Network URL: http://$(hostname -I | awk '{print $1}'):${PORT}"
    echo ""
    echo "🚀 Server starting on port ${PORT}..."
    echo "💡 Press Ctrl+C to stop the server"
    echo "🔄 Files will be served with live reload capability"
    echo ""

    # Check if Python 3 is available
    if command -v python3 &> /dev/null; then
        echo "🐍 Using Python 3 HTTP server..."
        python3 -m http.server ${PORT} --bind ${HOST}
    elif command -v python &> /dev/null; then
        echo "🐍 Using Python 2 HTTP server..."
        python -m SimpleHTTPServer ${PORT}
    elif command -v php &> /dev/null; then
        echo "🐘 Using PHP built-in server..."
        php -S ${HOST}:${PORT}
    elif command -v ruby &> /dev/null; then
        echo "💎 Using Ruby WEBrick server..."
        ruby -run -e httpd . -p ${PORT}
    elif command -v node &> /dev/null; then
        echo "🟢 Using Node.js HTTP server..."
        npx http-server -p ${PORT} -a ${HOST} -c-1
    else
        echo "❌ No suitable HTTP server found!"
        echo "Please install one of: python3, python, php, ruby, or node.js"
        echo "Or use --docker option to run in a container"
        exit 1
    fi
fi