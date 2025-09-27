# Supabase Setup Guide

This guide will help you set up Supabase authentication for your Computer Science Website.

## Prerequisites

1. A Supabase account (free tier available at https://supabase.com)
2. Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Fill in your project details:
   - Name: `computer-science-website` (or any name you prefer)
   - Database Password: Choose a strong password
   - Region: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be set up (this can take a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL** (something like `https://xyzabc123.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Configure Environment Variables

1. In your project root, create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Make sure `.env` is in your `.gitignore` file to keep your credentials secure

## Step 4: Set Up Authentication Providers (Optional)

### For Google OAuth:
1. In Supabase dashboard, go to Authentication → Providers
2. Click on Google
3. Enable Google provider
4. Add your Google OAuth credentials:
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs: `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

### For GitHub OAuth:
1. In Supabase dashboard, go to Authentication → Providers
2. Click on GitHub
3. Enable GitHub provider
4. Add your GitHub OAuth credentials:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create a new OAuth app
   - Set Authorization callback URL: `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

## Step 5: Configure Authentication Settings

1. In Supabase dashboard, go to Authentication → Settings
2. Configure the following:
   - **Site URL**: `http://localhost:5173` (for development) or your production URL
   - **Redirect URLs**: Add your allowed redirect URLs
   - **JWT expiry**: Set as needed (default is 3600 seconds)
   - **Enable email confirmations**: Choose based on your needs

## Step 6: Set Up Database Tables (Optional)

You can extend user profiles by creating additional tables:

```sql
-- Create a profiles table that extends the auth.users table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  course text,
  experience text,
  learning_goals text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policy so users can only see and edit their own profile
create policy "Users can view own profile" 
  on public.profiles for select 
  using ( auth.uid() = id );

create policy "Users can update own profile" 
  on public.profiles for update 
  using ( auth.uid() = id );

create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check ( auth.uid() = id );
```

## Step 7: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try to register a new account
3. Check your Supabase dashboard under Authentication → Users to see if the user was created
4. Try logging in with the created account
5. Test OAuth providers if configured

## Available Authentication Features

Your app now supports:

✅ **Email/Password Registration**
- User registration with additional profile data
- Password validation
- Email verification (if enabled)

✅ **Email/Password Login**
- Secure authentication
- Error handling
- Remember user session

✅ **OAuth Login** (if configured)
- Google Sign-in
- GitHub Sign-in
- Automatic account creation

✅ **Session Management**
- Automatic session persistence
- Logout functionality
- Auth state management

✅ **Security Features**
- JWT tokens
- Row Level Security ready
- Secure credential handling

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**
   - Check that your environment variables are correctly set
   - Restart your development server after changing `.env`

2. **OAuth redirect errors**
   - Verify redirect URLs in both Supabase and OAuth provider settings
   - Make sure URLs match exactly (including protocol)

3. **CORS errors**
   - Add your domain to the allowed origins in Supabase settings

4. **Email not sending**
   - Check your SMTP settings in Supabase
   - For development, you can disable email confirmation

### Need Help?

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Create an issue in your repository

## Production Deployment

When deploying to production:

1. Update your environment variables with production values
2. Update Site URL and Redirect URLs in Supabase settings
3. Configure proper SMTP for email sending
4. Set up proper error monitoring
5. Consider enabling additional security features

---

Your Supabase authentication is now configured! Users can register, login, and their sessions will be managed automatically.