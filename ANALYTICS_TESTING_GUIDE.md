# Testing the Analytics Dashboard

## Test Credentials

Use the existing admin account:
- **Email**: `admin@gamelearn.com`
- **Password**: `Admin123!` (or whatever you set it to)

## Quick Test Workflow

### 1. Access Analytics
1. Log in as admin
2. Navigate to Admin Panel
3. Click **"Analytics Dashboard"** (should be a prominent card)

### 2. View High-Level Dashboard
You should see:
- Total Active Users widget
- Platform Completion Rate
- Total Courses
- Total XP Awarded
- Top 5 Engaged Users (if any users have XP)
- Top 5 Popular Courses (if any courses are enrolled)
- Compliance at a Glance (if any compliance courses exist)

### 3. Test User Progress Report
1. Click **"User Progress Report"** card
2. You should see a list of all non-admin users
3. Click on a user to see their detailed progress
4. Toggle between "Visual" and "Table" views
5. Click **"Export to CSV"** to download the data
6. Click **"Back to User List"** to return

**Filters to test**:
- Search bar: Type user name/email
- Filter by Team: Select a department
- Filter by Mentor: Select a mentor (if mentorships exist)

### 4. Test Course Report
1. Click **"Course Report"** card from overview
2. Select a course from the dropdown
3. View enrollment statistics:
   - Total enrolled
   - Completed count
   - In progress count
   - Average score
4. Toggle between Visual and Table views
5. Export to CSV
6. Check that the CSV contains all user enrollment data

### 5. Test Team Report
1. Click **"Team Report"** card
2. Select a team/department from dropdown
3. View team metrics:
   - Average completion rate
   - Total team XP
   - Member count
4. See individual member breakdowns
5. Toggle Visual/Table views
6. Export to CSV

### 6. Test Assessment Analytics Report
1. Click **"Assessment Analytics"** card
2. Select a quiz from the dropdown (format: "Course Title - Quiz Title")
3. View assessment metrics:
   - Total attempts
   - Average score
   - Pass rate
4. Scroll to question breakdown
5. Identify questions with low correct answer rates
6. Toggle Visual/Table views
7. Export to CSV

**What to look for**:
- Questions with <50% correct rate = content needs improvement
- High failure rate on specific questions = review that lesson

### 7. Test Mentorship Report
1. Click **"Mentorship Program Report"** card
2. View all mentors (if any mentorship pairings exist)
3. See metrics per mentor:
   - Number of mentees
   - Average mentee completion rate
   - Total courses completed by mentees
4. Toggle Visual/Table views
5. Export to CSV

### 8. Test Accessibility Features

**Keyboard Navigation**:
- Press Tab to navigate through all interactive elements
- Use Arrow keys in dropdowns
- Press Enter/Space to activate buttons
- Ensure focus is always visible

**Screen Reader** (if available):
- Toggle to Table view in any report
- Verify table headers are announced
- Verify progress percentages are announced
- Check that status badges use text, not just color

**Language Toggle**:
- Click language switcher (top right)
- Change to "Español"
- Verify all analytics text translates
- Check that "Analytics" becomes "Analíticas"

### 9. Test CSV Export

For each report type:
1. Click "Export to CSV" button
2. Check that a file downloads
3. Open in Excel/Google Sheets
4. Verify:
   - Headers are present
   - Data is correctly formatted
   - Filename includes report type and date
   - All expected columns are present

Expected CSV filenames:
- `user-progress-[username]-[date].csv`
- `course-report-[course-title]-[date].csv`
- `team-report-[team-name]-[date].csv`
- `assessment-report-[quiz-title]-[date].csv`
- `mentorship-report-[date].csv`

### 10. Test Edge Cases

**Empty States**:
- Select a course with no enrollments → Should show "No data"
- Select a team with no members → Should show appropriate message
- View analytics with no users → Should handle gracefully

**Large Data Sets**:
- If possible, create 50+ users with various progress
- Ensure reports load quickly
- Check that filtering works smoothly
- Verify CSV exports complete successfully

## Sample Test Scenarios

### Scenario 1: Compliance Audit
**Goal**: Identify employees who haven't completed "Safety Training 101"

1. Go to High-Level Dashboard
2. Look at "Compliance at a Glance" widget
3. If "Safety Training 101" shows <100%, note the percentage
4. Click Course Report
5. Select "Safety Training 101"
6. View list of enrolled users
7. Identify users with "Not Started" status
8. Export to CSV
9. Use CSV to send reminders

### Scenario 2: Content Quality Check
**Goal**: Find which quiz questions need improvement

1. Go to Assessment Analytics Report
2. Select "Web Development Basics - Final Quiz"
3. Review overall pass rate
4. Scroll to question breakdown
5. Find question with lowest correct answer rate
6. Note the question text
7. Return to Course Management to improve that lesson

### Scenario 3: Team Performance Review
**Goal**: Compare sales team performance

1. Go to Team Report
2. Select "Sales" department
3. Note average completion rate
4. View individual member performance
5. Identify top performers and those needing support
6. Export to CSV
7. Share with sales manager

### Scenario 4: ROI Measurement
**Goal**: Calculate training effectiveness

1. Go to High-Level Dashboard
2. Note Platform Completion Rate
3. Check Total XP Awarded (engagement metric)
4. Review Top 5 Engaged Users (are they getting value?)
5. Click each report type and export to CSV
6. Compile data in spreadsheet
7. Calculate:
   - % of assigned training completed
   - Average assessment scores
   - Time to completion
   - Compliance achievement rate

## Expected Results

### All Reports Should:
- ✅ Load within 2 seconds
- ✅ Display accurate data
- ✅ Allow visual/table toggle
- ✅ Support CSV export
- ✅ Work with keyboard only
- ✅ Translate to Spanish
- ✅ Handle empty states gracefully
- ✅ Show loading states if needed

### High-Level Dashboard Should:
- ✅ Show accurate user count
- ✅ Calculate correct completion rate
- ✅ List top 5 users by XP (descending)
- ✅ List top 5 courses by enrollment
- ✅ Display compliance courses with progress bars

### User Progress Report Should:
- ✅ Filter by search term
- ✅ Filter by team
- ✅ Filter by mentor
- ✅ Show course status badges (Completed, In Progress, Not Started)
- ✅ Display progress percentages
- ✅ Show quiz scores

### Course Report Should:
- ✅ List all published courses in dropdown
- ✅ Show enrollment count
- ✅ Display completion statistics
- ✅ List all enrolled users with status
- ✅ Calculate average score correctly

### Team Report Should:
- ✅ List all teams with departments
- ✅ Calculate average team completion rate
- ✅ Sum total team XP
- ✅ List individual members with metrics

### Assessment Report Should:
- ✅ List all quizzes from all courses
- ✅ Show total attempts
- ✅ Calculate average score
- ✅ Display pass rate
- ✅ Break down each question's success rate
- ✅ Use green for correct, red for incorrect

### Mentorship Report Should:
- ✅ List all mentors
- ✅ Show mentee count
- ✅ Calculate average mentee completion
- ✅ List individual mentees
- ✅ Handle case with no mentorships

## Troubleshooting

**Problem**: "No data available" everywhere
**Solution**: Ensure you have:
- Created users (not just admin)
- Published courses
- Assigned courses to users
- Users have made some progress

**Problem**: CSV export fails
**Solution**: Check browser's download settings, ensure popups are allowed

**Problem**: Filters don't work
**Solution**: Ensure users have the filter attribute (department, mentor, etc.)

**Problem**: Translations don't work
**Solution**: Clear browser cache, ensure both en.json and es.json are updated

**Problem**: Table view not accessible
**Solution**: Test with screen reader, check that semantic HTML is present

## Success Criteria Checklist

After testing, verify:

- [ ] Admin can access Analytics Dashboard from Admin Panel
- [ ] High-level overview displays correctly
- [ ] All 5 report types are accessible
- [ ] User Progress Report filters work (search, team, mentor)
- [ ] Course Report identifies incomplete users
- [ ] Team Report shows aggregate statistics
- [ ] Assessment Report shows question-by-question data
- [ ] Mentorship Report displays mentor effectiveness
- [ ] Visual/Table toggle works in all reports
- [ ] CSV export works for all reports
- [ ] All content translates to Spanish
- [ ] Keyboard navigation works throughout
- [ ] Screen readers can access data tables
- [ ] Empty states display helpful messages
- [ ] Large datasets perform well

## Demo Script for Stakeholders

**Opening**: "Today I'll demonstrate our new Analytics Dashboard, which provides comprehensive insights into training effectiveness and ROI."

**1. Overview** (30 seconds):
"The dashboard shows at-a-glance metrics: we have 150 active users out of 200 seats, with an 87% overall completion rate. Our top engaged users and most popular courses are highlighted."

**2. User Progress** (1 minute):
"Let's drill down into individual progress. I can search for any employee, filter by team or mentor, and see exactly which courses they've completed, their scores, and what's still in progress. Watch as I export this to CSV for our records."

**3. Course Report** (1 minute):
"For compliance, this is critical. I select 'Safety Training 101' and immediately see that 23 out of 30 employees have completed it. The 7 who haven't are listed here, and I can export this list to send reminders."

**4. Assessment Analytics** (1 minute):
"Here's where we measure content quality. This quiz has a 76% average score, but look at Question 3—only 34% answered correctly. That tells us we need to improve the lesson teaching that concept."

**5. Team Performance** (30 seconds):
"The Sales team has an 82% completion rate with 15,000 total XP. I can see which members are excelling and who might need additional support."

**6. Accessibility** (30 seconds):
"Notice how I can toggle to a table view for screen reader users, navigate entirely by keyboard, and switch to Spanish. Every report can be exported to CSV for external analysis."

**Closing**: "This dashboard gives us the data we need to prove training ROI, ensure compliance, and continuously improve our content."

---

## Additional Notes

- Analytics data updates in real-time as users complete courses
- No historical data yet - future enhancement will add date range filters
- CSV exports are manual - future version may include scheduled reports
- Charts use color + text + patterns for accessibility
- All calculations happen client-side for instant response

Enjoy exploring the Analytics Dashboard!
