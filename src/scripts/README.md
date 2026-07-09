# HireLens Database Seeding Scripts

This directory contains scripts to seed and manage test data for the HireLens application.

## Available Scripts

### 1. Seed Database
Populates the database with sample data for testing.

```bash
npm run seed
```

**What it creates:**
- 1 Organization (InfoTech Solutions India)
- 9 Users:
  - 1 Admin
  - 3 Recruiters
  - 5 Interviewers
- 10 Jobs (various positions)
- 20 Candidates (distributed across jobs)
- ~8 Interviews (for candidates in interview stages)
- ~5 Interview Feedbacks (for completed interviews)
- ~30 Decision Logs (tracking all actions)

### 2. Clean Database
Removes all data from the database.

```bash
npm run clean
```

**Warning:** This will delete ALL data from your database!

### 3. Reset Database
Cleans and then seeds the database in one command.

```bash
npm run reset
```

This is equivalent to running `npm run clean` followed by `npm run seed`.

## Login Credentials

After seeding, you can log in with these credentials:

### Admin
- **Email:** rajesh.kumar@infotech.in
- **Password:** admin123

### Recruiter
- **Email:** priya.sharma@infotech.in
- **Password:** recruiter123

Other recruiters:
- amit.patel@infotech.in / recruiter123
- sneha.gupta@infotech.in / recruiter123

### Interviewer
- **Email:** vikram.singh@infotech.in
- **Password:** interviewer123

Other interviewers:
- anjali.reddy@infotech.in / interviewer123
- karthik.iyer@infotech.in / interviewer123
- deepika.nair@infotech.in / interviewer123
- arjun.mehta@infotech.in / interviewer123

## Data Overview

### Organizations
- **InfoTech Solutions India** - Main organization with all users and jobs

### Jobs (10 total)
1. Senior Frontend Developer - Bangalore, Karnataka (OPEN)
2. Backend Engineer - Hyderabad, Telangana (OPEN)
3. Full Stack Developer - Pune, Maharashtra (OPEN)
4. DevOps Engineer - Mumbai, Maharashtra (OPEN)
5. UI/UX Designer - Gurgaon, Haryana (OPEN)
6. Data Scientist - Bangalore, Karnataka (OPEN)
7. Mobile Developer - Chennai, Tamil Nadu (OPEN)
8. QA Engineer - Noida, Uttar Pradesh (OPEN)
9. Product Manager - Bangalore, Karnataka (CLOSED)
10. Security Engineer - Delhi NCR (OPEN)

### Candidates (20 total)
Candidates are distributed across different jobs and stages:
- **APPLIED**: Fresh applications
- **SCREENING**: Under initial review
- **INTERVIEW**: Scheduled for interviews
- **OFFER**: Offer extended
- **HIRED**: Successfully hired
- **REJECTED**: Not selected

### Interviews
- Automatically created for candidates in INTERVIEW, OFFER, or HIRED stages
- Assigned to random interviewers
- Scheduled dates set appropriately (future for pending, past for completed)

### Interview Feedback
- Created for all completed interviews
- Includes ratings (1-5), strengths, weaknesses, and recommendations
- Recommendations: PROCEED, HOLD, or REJECT

### Decision Logs
- Tracks all stage changes
- Records interview assignments
- Logs feedback submissions
- Maintains complete audit trail

## Customization

To customize the seed data, edit `seedData.js`:

- **organizationData**: Change organization name
- **usersData**: Add/modify users
- **jobsData**: Add/modify job postings
- **candidatesData**: Add/modify candidates

## Troubleshooting

### Connection Issues
If you get connection errors, ensure:
1. MongoDB is running
2. `.env` file has correct `MONGODB_URI`
3. Database name is correct

### Permission Issues
If you get permission errors:
1. Check MongoDB user permissions
2. Ensure database exists or user can create it

### Data Conflicts
If seeding fails due to existing data:
1. Run `npm run clean` first
2. Then run `npm run seed`
3. Or use `npm run reset` to do both

## Development Workflow

### Starting Fresh
```bash
npm run reset
```

### Testing Specific Scenarios
1. Clean database: `npm run clean`
2. Modify `seedData.js` for your scenario
3. Seed database: `npm run seed`

### Production Warning
**Never run these scripts in production!** They will delete all data.

These scripts are for development and testing only.
