#!/bin/bash

# Admin User Registration Script
# Run this to create an admin account

echo "🌊 Creating Admin User for PoseidonJS"
echo "======================================"
echo ""

# Backend URL
BACKEND_URL="http://localhost:5000"

# Admin credentials
FIRST_NAME="Admin"
LAST_NAME="User"
EMAIL="admin@poseidon.com"
PASSWORD="admin123"
ROLE="admin"

echo "📝 Registering admin user..."
echo "Email: $EMAIL"
echo "Password: $PASSWORD"
echo ""

# Register user
RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"$FIRST_NAME\",
    \"lastName\": \"$LAST_NAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"role\": \"$ROLE\"
  }")

# Check if registration was successful
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ Admin user created successfully!"
  echo ""
  echo "🔐 Login Credentials:"
  echo "   Email: $EMAIL"
  echo "   Password: $PASSWORD"
  echo ""
  echo "🌐 Login URL: http://localhost:3001/login"
  echo ""
  echo "📝 Token received (save this):"
  echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 | head -c 50
  echo "..."
else
  echo "❌ Registration failed!"
  echo ""
  echo "📋 Error details:"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
  echo ""
  echo "💡 Make sure:"
  echo "   - Backend is running on http://localhost:5000"
  echo "   - MongoDB is running"
  echo "   - No user with this email already exists"
fi

echo ""
