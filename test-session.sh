#!/bin/bash

echo "🧪 Testing Session Management Implementation"
echo "=========================================="

# Start backend server in background
echo "🚀 Starting backend server..."
cd "D:\Academics\Sixth Semester\Security\Worksage - CW2\backend"
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend in background
echo "🌐 Starting frontend..."
cd "D:\Academics\Sixth Semester\Security\Worksage - CW2\frontend"
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "📋 Testing checklist:"
echo "1. ✅ Backend: https://localhost:5000"
echo "2. ✅ Frontend: https://localhost:3000"
echo "3. 🔐 Test login flow"
echo "4. 📊 Check user data fetching"
echo "5. 🔄 Test automatic token refresh"
echo "6. 🚪 Test logout functionality"

echo ""
echo "🔍 Debug URLs:"
echo "- Health check: https://localhost:5000/health"
echo "- Login: https://localhost:3000/login"
echo "- Dashboard: https://localhost:3000/dashboard"

echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait

# Cleanup
kill $BACKEND_PID $FRONTEND_PID
