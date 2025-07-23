# Authentication Debug Guide

## Testing Steps:

### 1. Check Supabase Configuration
- Go to your Supabase dashboard: https://boruptqklkvrmexxgwmc.supabase.co
- Go to **Authentication > Settings**
- Make sure **Enable email confirmations** is **DISABLED** for testing
- Check **Authentication > Users** to see if users are being created

### 2. Test Registration Flow
1. Go to http://localhost:3000/register
2. Fill in the form with:
   - **Name**: Test User
   - **Email**: test@example.com
   - **Phone**: +502 5555 1234
   - **Password**: testpass123
   - **Role**: Client
3. Click "Create Account"
4. Check the browser console (F12) for any errors
5. Check Network tab for API calls

### 3. Test Login Flow
1. Go to http://localhost:3000/login  
2. Use the same credentials:
   - **Email**: test@example.com
   - **Password**: testpass123
3. Click "Sign In"
4. Should redirect to `/dashboard`

### 4. Manual Database Check
Run this SQL in Supabase SQL Editor:
```sql
-- Check if users are created
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Check if profiles are created
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;

-- Check the trigger function exists
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
```

### 5. If Email Confirmation is Required
- Check your email for a confirmation link
- Click the confirmation link
- Then try logging in

### 6. Console Debugging
Add this to your browser console to test Supabase connection:
```javascript
// Test Supabase connection
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

// Check current session
supabase.auth.getSession().then(console.log)
```

### 7. Common Issues & Fixes

#### Issue: "Invalid URL" 
- **Fix**: Check that your `.env.local` file has the correct Supabase credentials

#### Issue: "Email confirmation required"
- **Fix**: Disable email confirmation in Supabase Auth settings

#### Issue: Users created but can't log in
- **Fix**: Check that the profile was created in the profiles table

#### Issue: Profile not found
- **Fix**: The trigger function should create profiles automatically, but the login function now handles missing profiles

### 8. Reset and Test
If you want to start fresh:
```sql
-- Delete test users (BE CAREFUL!)
DELETE FROM auth.users WHERE email LIKE '%test%';
DELETE FROM profiles WHERE email LIKE '%test%';
```

Let me know what you see in step 4 (the database check) and any console errors in steps 2-3!