# Eigyo Shitsuji / Katachi-ben Order System - End-to-End Verification Checklist

This document is a manual testing checklist to verify that the end-to-end integration from the public order form to the Admin Dashboard (Supabase) is fully functional in a production environment.

## 1. Prerequisites (Backend Setup)
- [ ] **Environment Variables**: `.env` file exists with valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- [ ] **Database Table**: Supabase database has an `orders` table with columns: `id`, `created_at`, `customer_name`, `customer_email`, `sns_link`, `category`, `usage`, `details`, `deadline`, `status`, `notes`.
- [ ] **Row Level Security (RLS)**: 
  - Anonymous users (`anon` role) have `INSERT` permissions on `orders`.
  - Only authenticated admins have `SELECT` and `UPDATE` permissions.

## 2. Public Order Form Submission (`/order`)
- [ ] **Validation (Empty Fields)**: Submitting the form with empty `name`, `email`, or `category` correctly triggers HTML5 errors and blocks submission.
- [ ] **Validation (Format)**: Submitting an invalid email format (e.g. "not-an-email") blocks submission and/or displays an error alert.
- [ ] **Submission Success**: Filling all fields correctly and submitting results in the Japanese "送信完了" (Success) message.
- [ ] **Form Reset**: After successful submission, the form fields are cleared automatically.
- [ ] **Network Verification**: The browser network tab shows a successful `POST` request to the Supabase `/rest/v1/orders` endpoint with a `201 Created` status code.

## 3. Database Integrity
- [ ] **Data Insertion**: Navigating to the Supabase Studio (Table Editor) confirms a new row has appeared in the `orders` table.
- [ ] **Field Accuracy**: The `sns_link`, `usage`, and `deadline` strings exactly match the user's input. The `status` is exactly `"new"`.

## 4. Admin Dashboard Overview (`/admin`)
- [ ] **Counting Validation**: The "New Orders" count accurately reflects the newly submitted order (+1).
- [ ] **List Rendering**: Navigating to `/admin/orders` shows the new order at the top of the table.

## 5. Admin Order Detail Page (`/admin/orders/:id`)
- [ ] **Reading Data**: Clicking the "Eye" icon correctly opens the detailed view.
- [ ] **Information Visibility**: The customer's Name, Email, Category, Details, SNS Link, Usage, and Deadline are all visible. *(Requires UI fix from step 868)*
- [ ] **Writing Data**: Changing the "Status" to `in_progress` and adding "Internal Notes", then clicking "Save" works.
- [ ] **Verification**: Returning to `/admin` shows "New Orders" count decreased by 1, and "In Progress" increased by 1.
