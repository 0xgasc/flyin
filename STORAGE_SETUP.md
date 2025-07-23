# FlyInGuate - Storage Setup Instructions

## 🚨 Payment Proof Upload Error Fix

The payment proof upload is failing because the storage bucket doesn't exist in your Supabase project. Here's how to fix it:

### Option 1: Using Supabase Dashboard (Easier)

1. **Go to your Supabase Dashboard**
   - Visit: https://boruptqklkvrmexxgwmc.supabase.co
   - Navigate to **Storage** in the left sidebar

2. **Create a New Bucket**
   - Click "New bucket"
   - Name: `payment-proofs`
   - Public bucket: ✅ Yes (check this)
   - File size limit: 5MB
   - Allowed MIME types: 
     - image/jpeg
     - image/png
     - image/gif
     - image/webp
     - application/pdf

3. **Set Bucket Policies**
   - Click on the bucket name
   - Go to "Policies" tab
   - Enable RLS (Row Level Security)
   - Add the following policies:
     - **INSERT**: Authenticated users can upload
     - **SELECT**: Authenticated users can view
     - **DELETE**: Users can delete their own files

### Option 2: Using SQL Editor

1. **Go to SQL Editor** in your Supabase Dashboard
2. **Copy and run** the contents of `/supabase/storage-setup.sql`

### Testing the Fix

After setting up the storage bucket:

1. Go to lets
2. Try to top up your balance with a payment proof
3. The upload should now work correctly

### What This Fixes

- ✅ Creates the `payment-proofs` storage bucket
- ✅ Sets proper permissions for users to upload proofs
- ✅ Allows admins to view all payment proofs
- ✅ Enables the wallet top-up feature to work properly

### Error Messages

The app now shows clearer error messages:
- If storage is not configured: "Payment proof storage is not configured. Please contact support."
- If upload fails: "Failed to upload payment proof. Please try again."