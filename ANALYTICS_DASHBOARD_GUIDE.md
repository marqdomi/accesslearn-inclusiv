# Analytics & Reporting Dashboard - User Guide

## Overview

The Analytics Dashboard is a comprehensive reporting system designed for administrators, HR professionals, and managers to measure training ROI, track user progress, ensure compliance, and identify content improvement areas.

## Accessing the Dashboard

1. Log in as an administrator
2. Navigate to the Admin Panel
3. Click on **"Analytics Dashboard"** from the quick actions menu

## Dashboard Structure

### High-Level Overview

The main analytics page displays key performance indicators:

- **Total Active Users**: Shows occupied seats (e.g., "150 / 200 seats active")
- **Platform Completion Rate**: Average percentage of all assigned courses completed
- **Top 5 Engaged Users**: Ranked by XP earned this month
- **Top 5 Popular Courses**: Ranked by active enrollments
- **Compliance at a Glance**: Quick view of mandatory training completion rates

### Detailed Reports

Click on any report card to drill down into specific analytics:

## 1. User Progress Report

**Purpose**: Answer "What has [User] done?"

**Features**:
- Search users by name or email
- Filter by team/department
- Filter by assigned mentor
- View detailed course completion status for each user

**Data Displayed**:
- Course title
- Status (Not Started, In Progress, Completed)
- Progress percentage
- Quiz score
- Completion date
- Enrollment date

**View Modes**:
- **Visual Mode**: Cards with progress bars and visual indicators
- **Table Mode**: Accessible HTML table for screen readers

**Export**: Click "Export to CSV" to download user progress data

---

## 2. Course Report

**Purpose**: Answer "Who has completed [Course]?"

**Features**:
- Select any published course
- See all enrolled users
- Identify users who haven't started or finished (for compliance tracking)

**Metrics**:
- Total enrolled
- Total completed
- Total in progress
- Not started
- Average score across all users

**Use Case**: Compliance tracking - quickly identify employees who haven't completed mandatory safety training

**Export**: Download complete enrollment and completion data to CSV

---

## 3. Team / Department Report

**Purpose**: Answer "How is the [Team] performing?"

**Features**:
- Select team/department from dropdown
- View aggregated team statistics
- Compare team member performance

**Metrics**:
- Average completion rate
- Total team XP earned
- Member count
- Individual member performance breakdown

**Use Case**: Identify high-performing teams or teams that need additional support

**Export**: Export team performance data for external analysis

---

## 4. Assessment Analytics Report

**Purpose**: Answer "Is our training content effective?"

**Critical for ROI**: This report shows which content needs improvement

**Features**:
- Select any quiz from any course
- View question-by-question analysis
- Identify problematic questions

**Metrics**:
- Total attempts
- Average score
- Pass rate
- Per-question correct/incorrect percentages

**Key Insight**: If "Everyone is failing Question 3", you know to improve that specific lesson

**Visual Breakdown**:
- Green bar: Percentage who answered correctly
- Red bar: Percentage who answered incorrectly
- Total responses count

**Export**: Download question analytics to identify patterns

---

## 5. Mentorship Program Report

**Purpose**: Answer "Is the Mentorship program working?"

**Features**:
- View all active mentors
- See mentor effectiveness metrics
- Track mentee progress

**Metrics per Mentor**:
- Number of assigned mentees
- Average mentee completion rate
- Total mentee XP
- Individual mentee progress

**Use Case**: Identify highly effective mentors or mentees who need additional support

**Export**: Download mentorship program data

---

## Accessibility Features

### Mandatory Requirements (WCAG 2.1 AA Compliant)

1. **Visual/Table Toggle**: Every report with charts includes a "Table" view button
   - Charts are for visual understanding
   - Tables provide semantic HTML for screen readers
   - All data is accessible via keyboard navigation

2. **Keyboard Navigation**: 
   - Tab through all filters and controls
   - Enter/Space to activate buttons
   - Arrow keys in dropdowns

3. **Screen Reader Support**:
   - All charts have text equivalents
   - Progress bars include aria-labels with percentages
   - Status badges use text, not just color

4. **High Contrast**: All visual elements respect user's high contrast preferences

---

## Data Export (CSV)

Every report includes a prominent **"Export to CSV"** button.

**Export Includes**:
- All columns visible in the table view
- Proper CSV formatting
- Headers for each column
- File named with report type and date

**Use Cases**:
- Import into Excel for advanced analysis
- Share with stakeholders
- Create executive reports
- Compliance documentation

---

## Internationalization (i18n)

The entire Analytics interface is fully translatable:

- Toggle language between English and Spanish (Español)
- All labels, titles, and descriptions translate
- Numbers and dates format according to locale
- Status badges translate

**Translation Keys**: All text uses the `t()` function from i18n system

---

## Common Workflows

### Workflow 1: Compliance Audit

1. Navigate to Analytics Dashboard
2. Check "Compliance at a Glance" widget
3. Identify courses below 90% completion
4. Click on **Course Report**
5. Select the compliance course
6. View "Not Started" users
7. Export CSV
8. Send reminder emails to incomplete users

### Workflow 2: Content Quality Improvement

1. Navigate to **Assessment Analytics Report**
2. Select a course quiz
3. Identify questions with <50% correct rate
4. Note the specific question text
5. Return to Course Management
6. Improve the lesson teaching that concept
7. Re-check analytics after users retake the quiz

### Workflow 3: Team Performance Review

1. Navigate to **Team Report**
2. Select department (e.g., "Sales")
3. Review average completion rate
4. Export data to CSV
5. Share with department manager
6. Identify low performers for additional support

### Workflow 4: Measuring Training ROI

1. View **High-Level Dashboard**
2. Note platform completion rate
3. Check top engaged users (they're getting value)
4. Review compliance metrics (risk mitigation)
5. Export **User Progress Reports** for all users
6. Calculate:
   - Hours of training completed
   - Courses finished vs. assigned
   - Improvement in assessment scores over time

---

## Technical Details

### Data Sources

The analytics dashboard pulls from:
- `users` - User account data
- `courses` - Published course catalog
- `user-progress-all` - All user course progress
- `user-stats-all` - XP and level data
- `quiz-attempts` - Assessment results
- `mentorship-pairings` - Mentor-mentee relationships
- `groups` - Team/department assignments

### Real-Time Updates

All metrics update in real-time as users:
- Complete courses
- Pass assessments
- Earn XP
- Get assigned new training

### Performance

The dashboard is optimized for:
- Large user bases (500+ employees)
- Multiple courses (100+ courses)
- Thousands of quiz attempts
- Complex filtering and sorting

---

## Troubleshooting

**Q: No data appears in reports**
A: Ensure users have been assigned courses and have some progress. New platforms start with empty analytics.

**Q: CSV export doesn't include all data**
A: Ensure you've selected filters (user/course/team) before exporting. Some reports require a selection.

**Q: Charts not visible**
A: Use the "Table" view mode for accessible data representation. Charts may not display if reduce-motion is enabled.

**Q: Translations missing**
A: Check that both `en.json` and `es.json` have been updated with all analytics keys.

---

## Future Enhancements

Potential additions:
- Date range filters for historical analysis
- Trend charts showing completion over time
- Custom report builder
- Scheduled email reports
- Dashboard widgets on main admin page
- Comparison between teams/departments
- Predictive analytics for at-risk learners

---

## Support

For questions or feature requests, contact your platform administrator or refer to the main GameLearn documentation.
