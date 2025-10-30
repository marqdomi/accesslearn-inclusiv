# Test Credentials Guide

## Overview
GameLearn uses a secure employee authentication system. This guide provides test credentials for both admin and regular user access.

## Default Test Accounts

### Admin Account
- **Email**: `admin@gamelearn.test`
- **Temporary Password**: `Admin2024!`
- **Role**: Administrator
- **Department**: IT
- **Status**: Activated

**Features:**
- Full access to Admin Panel
- Create/edit courses and content
- Manage users and groups
- View analytics and reports
- Configure gamification settings

### Regular User Accounts

#### User 1 - Sarah Johnson
- **Email**: `sarah.johnson@gamelearn.test`
- **Temporary Password**: `Welcome123!`
- **Role**: Employee
- **Department**: Sales
- **Status**: Activated

#### User 2 - Mike Chen
- **Email**: `mike.chen@gamelearn.test`
- **Temporary Password**: `Welcome123!`
- **Role**: Employee
- **Department**: Engineering
- **Status**: Activated

#### User 3 - Emma Rodriguez
- **Email**: `emma.rodriguez@gamelearn.test`
- **Temporary Password**: `Welcome123!`
- **Role**: Employee
- **Department**: Marketing
- **Status**: Activated

## First Login Flow

When logging in for the first time with any test account:

1. **Login Screen**: Enter email and temporary password
2. **Password Change**: You'll be prompted to set a new password (enter any password twice)
3. **Onboarding**: Configure accessibility preferences:
   - Choose display name
   - Select avatar emoji
   - Set text size (Normal, Large, X-Large)
   - Enable high contrast mode (if needed)
   - Enable reduce motion (if needed)
   - Disable sound effects (if needed)
4. **Dashboard**: You're now ready to start learning!

## Subsequent Logins

After completing onboarding:
- **Email**: Same as before
- **Password**: Your user ID (automatically set after password change)

**Note**: The authentication system uses a simplified password mechanism for testing. After changing your password, the system uses your user ID as the password.

## Admin Panel Access

1. Login with admin credentials
2. Complete first-time setup (if needed)
3. Click the **Admin** button in the top navigation
4. Access admin features:
   - **Dashboard**: Overview and quick actions
   - **Courses**: Create and manage courses
   - **Users**: Add users, create groups, assign courses
   - **Gamification**: Configure XP values and create badges
   - **Reports**: View learning analytics
   - **Enrollment**: Bulk upload employees via CSV
   - **Corporate Reports**: Advanced reporting
   - **Assignments**: Manage course assignments
   - **Groups**: Organize users into groups

## Creating Additional Test Users

### Via Admin Panel (Manual)
1. Go to Admin Panel → Users
2. Click "Add User"
3. Fill in name, email, and role
4. User will receive system-generated credentials

### Via Bulk Upload (CSV)
1. Go to Admin Panel → Dashboard → "Bulk Employee Upload"
2. Download the CSV template
3. Fill in employee data:
   ```csv
   firstName,lastName,email,department,temporaryPassword
   John,Doe,john.doe@company.com,Sales,TempPass123!
   Jane,Smith,jane.smith@company.com,Engineering,TempPass123!
   ```
4. Upload the CSV file
5. Review validation results
6. Users will be created with pending status

## Password System Notes

The current authentication system:
- Uses temporary passwords for first login
- Prompts for password change on first login
- After password change, uses user ID as the actual password (simplified for testing)
- Supports account status management (pending, activated, disabled)

## Testing Different User States

### Testing First-Time User Flow
Use any of the provided credentials that haven't been used yet.

### Testing Returning User Flow
Use an account you've already completed onboarding for.

### Testing Admin Features
Use the admin account to access the admin panel and create/manage content.

### Testing Accessibility Features
During onboarding or via the ⚙️ icon in the bottom-right corner:
- Enable high contrast mode
- Increase text size
- Enable reduce motion
- Test keyboard navigation (Tab, Enter, Escape, Arrow keys)

## Troubleshooting

### "Invalid email or password"
- Double-check the email and temporary password
- Ensure you're using the correct password (temporary on first login, user ID after password change)

### "This account has been disabled"
- The account status is set to "disabled" in the system
- An admin needs to reactivate it via the Admin Panel

### Can't access Admin Panel
- Ensure you're logged in with an admin account
- Only accounts with `role: 'admin'` can access admin features

## Security Notes

**For Testing Only**: These credentials are for development and testing purposes only. In a production environment:
- Never commit credentials to version control
- Use secure password generation
- Implement proper authentication (OAuth, SSO, etc.)
- Enable password complexity requirements
- Add email verification
- Implement rate limiting and brute force protection

## Quick Reference

| Account Type | Email | Password | Access Level |
|-------------|-------|----------|--------------|
| Admin | admin@gamelearn.test | Admin2024! | Full admin access |
| User 1 | sarah.johnson@gamelearn.test | Welcome123! | Employee access |
| User 2 | mike.chen@gamelearn.test | Welcome123! | Employee access |
| User 3 | emma.rodriguez@gamelearn.test | Welcome123! | Employee access |

**Remember**: These are temporary passwords for first login. After completing password change and onboarding, the system uses the user ID as the password.
