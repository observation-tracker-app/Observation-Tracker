# Observation Counter - Quick Start Guide

## 🎯 Overview

A complete Next.js application for tracking observations with:
- User authentication with unique 6-digit IDs
- Create & revise observations
- Multi-recipient email notifications
- Personal contact notebook
- Photo attachments
- Status tracking & filtering

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
cd observation-counter
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Update .env with your Gmail credentials
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-16-digit-app-password

# 4. Create uploads directory
mkdir -p public/uploads

# 5. Initialize database
npx prisma generate
npx prisma db push

# 6. Start development server
npm run dev
```

## 📧 Gmail SMTP Setup

1. **Go to Google Account**: https://myaccount.google.com/
2. **Security** → Enable **2-Step Verification**
3. **App Passwords** → Generate password for "Mail"
4. **Copy** the 16-digit password
5. **Update** `.env` file:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   EMAIL_FROM=your-email@gmail.com
   ```

## 🎨 Features

### Authentication
- ✅ Sign up with name, email, password
- ✅ Login to access dashboard
- ✅ Automatic 6-digit user ID generation
- ✅ Secure password hashing

### Create Observations
- ✅ Add multiple recipients (uppercase IDs)
- ✅ Location & observation text
- ✅ Photo/file attachments
- ✅ Email notifications to all parties
- ✅ Unique observation IDs

### Revise Observations
- ✅ Update existing observations
- ✅ Validate sender ID & observation ID
- ✅ Full revision history
- ✅ Email notifications

### View Observations
- ✅ Filter by revised/unrevised
- ✅ Sort by date
- ✅ Click to view full details
- ✅ Copy all information

### Settings
- ✅ View user ID
- ✅ Update name
- ✅ Profile photo
- ✅ Personal notebook for contacts
- ✅ Copy user IDs easily

## 📁 Project Structure

```
observation-counter/
├── app/
│   ├── [userId]/              # User dashboard & features
│   │   ├── page.tsx           # Dashboard
│   │   ├── new-observation/   # Create observation
│   │   ├── revise-observation/# Revise observation
│   │   ├── observations/      # View all observations
│   │   └── settings/          # User settings
│   ├── api/                   # API routes
│   │   ├── auth/              # Authentication
│   │   ├── observations/      # Observation CRUD
│   │   └── users/             # User management
│   ├── login/                 # Login page
│   ├── signup/                # Signup page
│   └── page.tsx               # Home page
├── lib/
│   ├── prisma.ts              # Database client
│   ├── auth.ts                # Authentication utilities
│   └── utils.ts               # Email & ID generation
├── prisma/
│   └── schema.prisma          # Database schema
└── public/
    └── uploads/               # File uploads
```

## 🗄️ Database Schema

### Users
- Unique 6-digit alphanumeric ID (uppercase)
- Name, email, password
- Profile photo
- Personal notebook contacts

### Observations
- Unique observation ID
- Sender, recipients
- Location, observation text
- Photo attachment
- Status (unrevised/revised)

### Revisions
- Linked to observation
- Reviser information
- Revised location & observation
- Revision timestamp

## 🔑 Key Features Explained

### User ID System
- **Format**: 6 characters, A-Z and 0-9
- **Example**: `ABC123`
- **Automatic**: Generated on signup
- **Unique**: Collision detection
- **Uppercase**: Always converted

### Email Notifications
- **New Observation**: Sent to sender + all recipients
- **Revision**: Sent to original sender + reviser
- **Invalid IDs**: Error notification to sender
- **Attachments**: Photos included in emails

### Observation Status
- **Unrevised**: Default state
- **Revised**: After successful revision
- **History**: All revisions tracked

## 🎯 User Workflow

1. **Sign Up** → Get unique user ID
2. **Login** → Access dashboard
3. **Create Observation**:
   - Add recipients (uppercase IDs)
   - Enter location & observation
   - Attach photo (optional)
   - Submit → Emails sent
4. **Revise Observation**:
   - Enter sender ID & observation ID
   - Update location & observation
   - Submit → Status changes to "revised"
5. **View Observations**:
   - Filter by status
   - Sort by date
   - Click for full details
6. **Manage Settings**:
   - Update profile
   - Add contacts to notebook

## 🚨 Important Notes

### Security
- ✅ Passwords hashed with bcrypt
- ✅ HTTP-only cookies
- ✅ Environment variables for secrets
- ✅ Server-side validation

### Email Validation
- ✅ All recipient IDs validated before sending
- ✅ Error emails for invalid IDs
- ✅ No emails sent if validation fails

### User ID Rules
- ✅ Always uppercase
- ✅ 6 characters exactly
- ✅ Letters and numbers only
- ✅ Auto-generated, no user input

### File Uploads
- ✅ Stored in `public/uploads/`
- ✅ Unique filenames (timestamp-based)
- ✅ Attached to emails
- ✅ Referenced in database

## 📝 Common Tasks

### Add New User
```bash
# Sign up through UI
# Automatic ID generation
# Email confirmation
```

### Create Observation
```bash
# Login → Dashboard → New Observation
# Add recipients (ABC123, DEF456)
# Fill location & observation
# Upload photo (optional)
# Submit
```

### Revise Observation
```bash
# Login → Dashboard → Revise Observation
# Enter sender ID: ABC123
# Enter observation ID: XYZ789
# Update location & observation
# Submit
```

### View History
```bash
# Login → Dashboard → Observations
# Filter by status
# Click row for details
# View all revisions
```

## 🐛 Troubleshooting

### Emails Not Sending
- Check Gmail App Password (16 digits)
- Verify 2-Step Verification enabled
- Check EMAIL_USER matches EMAIL_FROM
- Test with `npx nodemailer` CLI

### Database Issues
- Run `npx prisma generate`
- Run `npx prisma db push`
- Delete `prisma/dev.db` and reinitialize

### User ID Collisions
- Automatic retry on collision
- Very rare (36^6 = 2 billion combinations)

### File Upload Errors
- Create `public/uploads/` directory
- Check write permissions
- Verify file size limits

## 🎨 Customization

### Styling
- Uses Tailwind CSS
- Gradient themes (blue-indigo-purple)
- Rounded corners (rounded-2xl)
- Shadow effects (shadow-lg)

### Email Templates
- Modify functions in `lib/utils.ts`
- HTML email support
- Attachment handling

### Database
- Currently SQLite (local)
- Switch to PostgreSQL for production
- Update DATABASE_URL in .env

## 📚 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Prisma + SQLite
- **Auth**: Cookies + bcrypt
- **Email**: Nodemailer + Gmail SMTP
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## 🔗 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Nodemailer](https://nodemailer.com/)

## 📞 Support

For issues:
1. Check this guide
2. Verify environment variables
3. Check database connection
4. Test email configuration
5. Review console logs

---

**Made with ❤️ using Next.js**
