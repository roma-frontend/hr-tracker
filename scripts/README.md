# Organization Setup Scripts

## Quick Setup for ADB-ARRM

### Option 1: Browser Console (Easiest)

1. **Login** to the app as `romangulanyan@gmail.com`
2. Open **Browser Console** (F12 → Console tab)
3. **Copy and paste** the contents of `setup-adb-arrm.js`
4. Press **Enter**

The script will:
- Create the "ADB-ARRM" organization
- Set it to Professional plan (200 employees)
- Configure timezone and country
- Provide instructions for adding admin users

### Option 2: Using Convex Dashboard

1. Go to https://dashboard.convex.dev
2. Select your project: `leave-tracker`
3. Go to **Functions** tab
4. Call `organizations:createOrganization` with:

```json
{
  "superadminUserId": "YOUR_USER_ID",
  "name": "ADB-ARRM",
  "slug": "adb-arrm",
  "plan": "professional",
  "timezone": "Asia/Yerevan",
  "country": "Armenia",
  "industry": "Technology"
}
```

### Option 3: Manual via UI

1. Login as superadmin
2. Go to `/org-requests` (if you have pending requests)
3. Or use the browser console method above

---

## Adding Admin to ADB-ARRM

After creating the organization, you need to assign an admin:

### Method 1: Assign existing user

If the admin already registered:

```javascript
await convex.mutation("organizations:assignOrgAdmin", {
  superadminUserId: "YOUR_SUPERADMIN_ID",
  userId: "ADMIN_USER_ID",
  organizationId: "ADB_ARRM_ORG_ID"
});
```

### Method 2: Create new admin user

1. Have the admin go to `/register`
2. Search for "ADB-ARRM" organization
3. Complete registration
4. You (superadmin) approve the request at `/join-requests`

---

## Adding Employees to ADB-ARRM

Once the admin is set up, they can:

1. **Invite employees** via invite links
2. **Approve join requests** from employees
3. **Manually create** employee accounts

Employees can also:
1. Go to `/register`
2. Search for "ADB-ARRM"
3. Request to join
4. Admin approves

---

## Troubleshooting

### "Superadmin only" error
- Make sure you're logged in as `romangulanyan@gmail.com`
- Check that your user has `role: "superadmin"` in the database

### "Organization already exists" error
- The slug "adb-arrm" is already taken
- Either use the existing org, or choose a different slug

### Can't find userId
1. Login as the user
2. Open console
3. Run: `console.log(JSON.parse(localStorage.getItem("user"))._id)`

---

## Plan Limits

- **Starter**: 50 employees, Free
- **Professional**: 200 employees, $49/mo
- **Enterprise**: Unlimited, Custom pricing

Change plan anytime via `organizations:updateOrganization`
