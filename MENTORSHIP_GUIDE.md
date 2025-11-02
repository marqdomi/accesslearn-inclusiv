# Mentorship Program Guide

## ✅ Status: FULLY IMPLEMENTED

The Mentorship Program is **fully functional** and all UI components are properly integrated. This guide will help you use the feature.

## Overview

The Mentorship Program allows administrators to pair experienced employees (Mentors) with newer employees (Mentees) to foster knowledge transfer and accelerate learning.

## How to Use the Mentorship Program

### For Administrators

#### Step 1: Access Mentorship Management

1. Log in with an **admin account**
2. Click the **Admin Panel** button in the top navigation
3. In the Admin Dashboard, click the **"Mentorship Program"** quick action tile (shows UsersFour icon)
   - OR click on the "Mentorship Program" option if viewing the full admin menu

#### Step 2: Create Mentorship Pairings

On the Mentorship Management screen, you'll see:

**Top Section: Create New Assignment**
- **Select Mentor** dropdown: Choose an experienced employee to act as mentor
  - Shows current mentee count for mentors who already have assignments
- **Select Mentee** dropdown: Choose an employee who needs guidance
  - Employees who already have mentors are disabled
- **Assign Mentor** button: Creates the pairing

**Bottom Section: Active Mentorships**
- View all active mentor-mentee relationships
- Search/filter by mentor or mentee name
- Remove pairings with the X button (requires confirmation)

#### Important Admin Notes:
- ✅ Mentors can have **multiple mentees**
- ✅ Mentees can only have **one mentor** at a time
- ✅ The system prevents duplicate assignments automatically
- ✅ All pairings show the assignment date

---

### For Mentors

Once an admin assigns mentees to you, the **"My Mentees" section** automatically appears on your main dashboard.

#### Mentor Dashboard Features:

Each mentee is shown in an individual card displaying:
- **Avatar and Name**: Visual identification
- **Current Level and XP**: Track their progression
- **Progress Bar**: See how close they are to the next level
- **Current Mission**: The course they're actively working on
- **Recently Unlocked Achievements**: Last 3 achievements earned
- **Send Message Button**: Opens a direct messaging dialog

#### Messaging Your Mentees:
1. Click **"Send Message"** on any mentee card
2. Write your guidance or encouragement
3. Click **"Send"**
4. Messages are delivered instantly to the mentee

#### Earning XP as a Mentor:
- You receive a **10% XP bonus** whenever your mentee completes a course
- Example: Mentee completes a course worth 500 XP → You receive 50 XP bonus
- Bonus is awarded automatically
- A toast notification confirms the bonus award

---

### For Mentees

If an admin assigns a mentor to you, the **"My Mentor" widget** automatically appears on your dashboard (right sidebar).

#### My Mentor Widget Features:

The widget displays:
- **Mentor's Avatar**: Visual identification
- **Mentor's Name**: Full name or display name
- **Level and Rank**: Shows their experience (e.g., "Level 25 - Expert")
- **Total XP**: See how accomplished your mentor is
- **Ask My Mentor Button**: Opens the messaging interface

#### Communicating with Your Mentor:
1. Click **"Ask My Mentor"** button
2. View your full conversation history with timestamps
3. Write your question or message in the text area
4. Click **"Send"**
5. You'll see an unread badge when your mentor replies

#### Special Achievement:
- Complete your first course while having a mentor assigned → Unlock the **"Team Up"** bronze achievement!

---

## Gamification & Rewards

### Mentor Benefits:
- **XP Bonus**: Earn 10% of all XP your mentees earn from completing courses
- **Recognition**: Activity feed shows your mentoring relationships
- **Progress Tracking**: Real-time visibility into mentee learning journeys

### Mentee Benefits:
- **Guidance**: Direct access to an experienced team member
- **Support**: Private messaging channel for questions
- **Achievement**: "Team Up" bronze achievement for completing first course with mentor

---

## Troubleshooting

### "I don't see the Mentorship Program option in Admin Panel"
**Solution**: Ensure you're logged in with an **admin** account. The option only appears for administrators.

### "I don't see the My Mentees section on my dashboard"
**Solution**: You need an admin to assign mentees to you first. The section only appears when you have active mentee assignments.

### "I don't see the My Mentor widget on my dashboard"
**Solution**: You need an admin to assign a mentor to you first. The widget only appears when you have an active mentor assigned.

### "The dropdowns are empty when creating pairings"
**Solution**: Ensure you have employee accounts created first. Use the "Bulk Enrollment" or "Manage Users" features to add employees.

### "I can't assign a mentor to someone"
**Solution**: Check if that person already has an active mentor. Each mentee can only have one mentor at a time. Remove the existing pairing first if you need to reassign.

---

## Technical Details

### Data Persistence
All mentorship data is stored in the browser's persistent storage:
- **Pairings**: Stored in `mentorship-pairings` key
- **Messages**: Stored in `mentorship-messages` key
- Data persists across sessions
- No external database required

### Component Locations
For developers:
- **Admin UI**: `/src/components/admin/MentorshipManagement.tsx`
- **Mentor Dashboard**: `/src/components/dashboard/MentorDashboard.tsx`
- **Mentee Widget**: `/src/components/dashboard/MyMentorWidget.tsx`
- **Hook**: `/src/hooks/use-mentorship.ts`
- **XP Integration**: `/src/hooks/use-mentor-xp.ts`

---

## Example Workflow

### Complete Setup Example:

1. **Admin Creates Accounts**
   - Upload employee CSV or manually create users
   - Result: Alice (experienced), Bob (new hire)

2. **Admin Creates Pairing**
   - Navigate to Mentorship Program
   - Select Alice as Mentor
   - Select Bob as Mentee
   - Click "Assign Mentor"

3. **Alice Logs In (Mentor)**
   - Sees "My Mentees" section on dashboard
   - Views Bob's progress card
   - Sends welcome message to Bob

4. **Bob Logs In (Mentee)**
   - Sees "My Mentor" widget in right sidebar
   - Views Alice's profile and rank
   - Clicks "Ask My Mentor" to send questions

5. **Bob Completes Course**
   - Earns 500 XP for course completion
   - Alice automatically receives 50 XP mentor bonus
   - Bob unlocks "Team Up" achievement

---

## Feature Checklist

✅ Admin Panel: Mentorship Management section  
✅ Mentor Selection dropdown with active mentee count  
✅ Mentee Selection dropdown with availability indicators  
✅ Active Pairings list with search/filter  
✅ Mentor Dashboard with mentee progress cards  
✅ Real-time mentee stats (XP, level, current course)  
✅ Mentor-to-mentee messaging system  
✅ My Mentor widget for mentees  
✅ Mentee-to-mentor messaging with conversation history  
✅ 10% XP bonus for mentors when mentees complete courses  
✅ "Team Up" achievement for mentees  
✅ Unread message badges and notifications  
✅ Full accessibility support (keyboard navigation, screen readers)  

---

## Support

If you continue to experience issues:
1. Check that you're using the latest version of the application
2. Clear browser cache and reload
3. Verify you're logged in with the correct role (admin/mentor/mentee)
4. Review the browser console for any error messages

The Mentorship Program is production-ready and fully functional. Happy mentoring! 🎓
