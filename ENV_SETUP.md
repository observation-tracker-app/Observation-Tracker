# Environment Variables Setup Guide

## 📝 Required Environment Variables

Create a `.env` file in the root directory with these variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth (Authentication)
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (Gmail SMTP)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-16-digit-app-password"
EMAIL_FROM="your-email@gmail.com"

# File Upload
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔑 How to Set Up Each Variable

### 1. DATABASE_URL
**Already configured** - Uses local SQLite database
```env
DATABASE_URL="file:./dev.db"
```

### 2. NEXTAUTH_SECRET
**Generate a secure random secret:**

**Option A - Automatic (Recommended):**
```bash
./generate-secret.sh
```

**Option B - Manual:**
```bash
openssl rand -base64 32
```

Copy the output and add to `.env`:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
```

### 3. NEXTAUTH_URL
**For local development:**
```env
NEXTAUTH_URL="http://localhost:3000"
```

**For production:**
```env
NEXTAUTH_URL="https://yourdomain.com"
```

### 4. Email Configuration (Gmail)

#### Step-by-Step Gmail Setup:

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/

2. **Enable 2-Step Verification**
   - Go to Security → 2-Step Verification
   - Follow the setup process

3. **Generate App Password**
   - Go to Security → App Passwords
   - Select "Mail" and your device
   - Click "Generate"
   - Copy the 16-digit password (format: `abcd efgh ijkl mnop`)

4. **Update .env file:**
```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="youremail@gmail.com"
EMAIL_SERVER_PASSWORD="abcd efgh ijkl mnop"  # Your 16-digit app password
EMAIL_FROM="youremail@gmail.com"  # Same as EMAIL_SERVER_USER
```

#### ⚠️ Important Notes:
- `EMAIL_SERVER_USER` and `EMAIL_FROM` should be the **same email**
- Use the **16-digit App Password**, NOT your regular Gmail password
- Remove spaces from the app password or keep them (both work)
- App Password format: `abcdefghijklmnop` or `abcd efgh ijkl mnop`

### 5. File Upload Settings

**Already configured with defaults:**
```env
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

**To change max file size:**
- 1 MB = 1048576 bytes
- 5 MB = 5242880 bytes (default)
- 10 MB = 10485760 bytes

### 6. App URL

**For development:**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For production:**
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 🚀 Quick Setup

1. **Copy the example file:**
```bash
cp .env.example .env
```

2. **Generate NEXTAUTH_SECRET:**
```bash
./generate-secret.sh
```

3. **Set up Gmail App Password** (see step 4 above)

4. **Update .env with your values**

5. **Verify your .env file looks like this:**
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="dGhpc2lzYXJhbmRvbXNlY3JldGtleQ=="  # Your generated secret
NEXTAUTH_URL="http://localhost:3000"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="john@gmail.com"  # Your Gmail
EMAIL_SERVER_PASSWORD="abcd efgh ijkl mnop"  # Your app password
EMAIL_FROM="john@gmail.com"  # Same as EMAIL_SERVER_USER
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## ✅ Verify Setup

Test if your environment variables are set correctly:

```bash
# Start the development server
npm run dev

# Try to sign up with a test account
# Check if you receive emails
```

## 🔒 Security Best Practices

1. **Never commit .env to Git**
   - Already in `.gitignore`
   - Only commit `.env.example`

2. **Use strong NEXTAUTH_SECRET**
   - Generate with `./generate-secret.sh`
   - At least 32 characters
   - Random and unique

3. **Protect your App Password**
   - Don't share it
   - Don't commit it to version control
   - Regenerate if compromised

4. **Production Settings**
   - Use environment variables from hosting platform
   - Use PostgreSQL instead of SQLite
   - Enable HTTPS
   - Update NEXTAUTH_URL to your domain

## 🐛 Troubleshooting

### Emails not sending?
- ✅ Check 2-Step Verification is enabled
- ✅ Verify App Password is correct (16 digits)
- ✅ Ensure EMAIL_SERVER_USER and EMAIL_FROM match
- ✅ Check Gmail account allows less secure apps (if needed)

### NEXTAUTH_SECRET errors?
- ✅ Generate new secret: `./generate-secret.sh`
- ✅ Ensure no quotes or special characters break the .env format
- ✅ Restart the development server

### File upload issues?
- ✅ Create `public/uploads` directory
- ✅ Check folder permissions
- ✅ Verify MAX_FILE_SIZE is appropriate

### Database connection errors?
- ✅ Run `npx prisma generate`
- ✅ Run `npx prisma db push`
- ✅ Check DATABASE_URL path is correct

## 📚 Additional Resources

- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Environment Variables](https://www.prisma.io/docs/guides/development-environment/environment-variables)

---

**Need help?** Check the troubleshooting section or review the QUICK_START.md guide.
