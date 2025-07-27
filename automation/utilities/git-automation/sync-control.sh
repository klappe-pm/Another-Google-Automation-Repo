#!/bin/bash
# Control script for workspace automation sync

case "$1" in
    start)
        echo "🚀 Starting Workspace Automation Sync..."
        echo "   This will run in the foreground."
        echo "   Open a new terminal to continue working."
        echo ""
        ./auto-sync-full.sh
        ;;
    
    start-background)
        echo "🚀 Starting Workspace Automation Sync in background..."
        nohup ./auto-sync-full.sh > auto-sync-background.log 2>&1 &
        echo $! > .sync-pid
        echo "✅ Started with PID: $(cat .sync-pid)"
        echo "📝 Logs: tail -f auto-sync-background.log"
        ;;
    
    stop)
        if [ -f .sync-pid ]; then
            PID=$(cat .sync-pid)
            if kill $PID 2>/dev/null; then
                echo "✅ Stopped sync process (PID: $PID)"
                rm .sync-pid
            else
                echo "⚠️  Process not running"
                rm .sync-pid
            fi
        else
            echo "❌ No sync process found"
        fi
        ;;
    
    status)
        if [ -f .sync-pid ]; then
            PID=$(cat .sync-pid)
            if ps -p $PID > /dev/null 2>&1; then
                echo "✅ Sync is running (PID: $PID)"
                echo "📊 Recent activity:"
                tail -5 auto-sync.log 2>/dev/null || echo "No logs yet"
            else
                echo "❌ Sync is not running (stale PID file)"
                rm .sync-pid
            fi
        else
            echo "❌ Sync is not running"
        fi
        ;;
    
    logs)
        echo "📝 Recent sync logs:"
        tail -f auto-sync.log
        ;;
    
    test)
        echo "🧪 Testing sync with a dummy change..."
        echo "// Test comment added at $(date)" >> apps/utility/src/utility-api-key-checker.gs
        echo "✅ Test change made to utility-api-key-checker.gs"
        echo "⏳ Watch the sync process handle this change..."
        ;;
    
    *)
        echo "Workspace Automation Sync Control"
        echo "================================="
        echo ""
        echo "Usage: $0 {start|start-background|stop|status|logs|test}"
        echo ""
        echo "Commands:"
        echo "  start             - Start sync in foreground (Ctrl+C to stop)"
        echo "  start-background  - Start sync in background"
        echo "  stop              - Stop background sync"
        echo "  status            - Check if sync is running"
        echo "  logs              - View sync logs (tail -f)"
        echo "  test              - Make a test change to trigger sync"
        echo ""
        echo "Example workflow:"
        echo "  1. $0 start-background"
        echo "  2. Edit any .gs file in apps/"
        echo "  3. Wait 10 seconds for auto-sync"
        echo "  4. Check Google Apps Script console"
        exit 1
        ;;
esac