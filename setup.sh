#!/bin/bash

echo "🚀 Setting up Observation Counter..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your Gmail credentials"
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p public/uploads
touch public/uploads/.gitkeep

# Initialize Prisma
echo "🗄️  Initializing database..."
npx prisma generate
npx prisma db push

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your Gmail SMTP credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000"
echo ""
echo "📧 Gmail Setup:"
echo "   1. Go to Google Account Settings > Security"
echo "   2. Enable 2-Step Verification"
echo "   3. Generate App Password for 'Mail'"
echo "   4. Update these in .env:"
echo "      - EMAIL_SERVER_USER=your-email@gmail.com"
echo "      - EMAIL_SERVER_PASSWORD=your-16-digit-app-password"
echo "      - EMAIL_FROM=your-email@gmail.com"
echo ""
echo "🔑 Generate NEXTAUTH_SECRET:"
echo "   Run: ./generate-secret.sh"
