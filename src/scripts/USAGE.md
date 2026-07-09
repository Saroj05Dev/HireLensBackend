# Database Seeding Usage Guide

## Step-by-Step Instructions

### 1. First Time Setup

```bash
cd hire-lens-backend
npm run reset
```

This will:
1. Clear any existing data
2. Create fresh sample data
3. Display login credentials

### 2. Start Your Backend

```bash
npm start
```

### 3. Login to Frontend

Open your frontend application and login with:

**Admin Access:**
```
Email: rajesh.kumar@infotech.in
Password: admin123
```

**Recruiter Access:**
```
Email: priya.sharma@infotech.in
Password: recruiter123
```

**Interviewer Access:**
```
Email: vikram.singh@infotech.in
Password: interviewer123
```

## Common Scenarios

### Scenario 1: Testing Fresh Install
```bash
npm run reset
```
Use this when you want to start completely fresh.

### Scenario 2: Adding More Data
```bash
npm run seed
```
This adds data without clearing existing data (may cause duplicates).

### Scenario 3: Clearing Everything
```bash
npm run clean
```
Removes all data from database.

### Scenario 4: Testing Specific Features

**Testing Recruiter Features:**
1. Login as: priya.sharma@infotech.in / recruiter123
2. Navigate to Jobs page
3. Open any job to see pipeline
4. Drag and drop candidates between stages
5. Assign interviews to interviewers

**Testing Interviewer Features:**
1. Login as: vikram.singh@infotech.in / interviewer123
2. Navigate to Interviews page
3. See assigned interviews
4. Submit feedback for pending interviews
5. View completed feedback

**Testing Admin Features:**
1. Login as: rajesh.kumar@infotech.in / admin123
2. View Dashboard analytics
3. Access Analytics page
4. View jobs (read-only)

## Data Structure After Seeding

```
Organization: InfoTech Solutions India
├── Users (9)
│   ├── Admin (1)
│   │   └── rajesh.kumar@infotech.in
│   ├── Recruiters (3)
│   │   ├── priya.sharma@infotech.in
│   │   ├── amit.patel@infotech.in
│   │   └── sneha.gupta@infotech.in
│   └── Interviewers (5)
│       ├── vikram.singh@infotech.in
│       ├── anjali.reddy@infotech.in
│       ├── karthik.iyer@infotech.in
│       ├── deepika.nair@infotech.in
│       └── arjun.mehta@infotech.in
│
├── Jobs (10)
│   ├── Senior Frontend Developer - Bangalore, Karnataka (OPEN) - 4 candidates
│   ├── Backend Engineer - Hyderabad, Telangana (OPEN) - 3 candidates
│   ├── Full Stack Developer - Pune, Maharashtra (OPEN) - 3 candidates
│   ├── DevOps Engineer - Mumbai, Maharashtra (OPEN) - 2 candidates
│   ├── UI/UX Designer - Gurgaon, Haryana (OPEN) - 2 candidates
│   ├── Data Scientist - Bangalore, Karnataka (OPEN) - 2 candidates
│   ├── Mobile Developer - Chennai, Tamil Nadu (OPEN) - 2 candidates
│   ├── QA Engineer - Noida, Uttar Pradesh (OPEN) - 2 candidates
│   ├── Product Manager - Bangalore, Karnataka (CLOSED) - 0 candidates
│   └── Security Engineer - Delhi NCR (OPEN) - 0 candidates
│
├── Candidates (20)
│   ├── APPLIED (7)
│   ├── SCREENING (6)
│   ├── INTERVIEW (4)
│   ├── OFFER (2)
│   ├── HIRED (1)
│   └── REJECTED (1)
│
├── Interviews (~8)
│   ├── ASSIGNED (1-2) - Pending feedback
│   └── COMPLETED (6-7) - With feedback
│
├── Interview Feedbacks (~5)
│   └── Ratings, Strengths, Weaknesses, Recommendations
│
└── Decision Logs (~30)
    ├── Stage Changes
    ├── Interview Assignments
    └── Feedback Submissions
```

## Verification Checklist

After seeding, verify:

- [ ] Can login as Admin
- [ ] Can login as Recruiter
- [ ] Can login as Interviewer
- [ ] Dashboard shows statistics
- [ ] Jobs page displays 10 jobs
- [ ] Candidates are visible in jobs
- [ ] Pipeline board shows candidates in columns
- [ ] Interviews are assigned to interviewers
- [ ] Decision logs are recorded
- [ ] Analytics page shows data

## Troubleshooting

### "Connection refused" error
**Solution:** Make sure MongoDB is running and MONGO_URL is set correctly
```bash
# Check your .env file has:
MONGO_URL=mongodb+srv://your-connection-string

# Or for local MongoDB:
MONGO_URL=mongodb://localhost:27017/hirelens

# Test connection
mongosh "your-connection-string"
```

### "Database not found" error
**Solution:** The script will create it automatically. Just ensure MongoDB is running.

### "Duplicate key error"
**Solution:** Run clean before seeding
```bash
npm run clean
npm run seed
```

### "Module not found" error
**Solution:** Install dependencies
```bash
npm install
```

## Tips for Testing

1. **Test Role-Based Access:**
   - Login as different roles
   - Verify permissions work correctly
   - Check UI elements show/hide based on role

2. **Test Real-Time Features:**
   - Open two browser windows
   - Login as recruiter in one, interviewer in another
   - Move candidates and see real-time updates

3. **Test Complete Workflow:**
   - Add candidate (Recruiter)
   - Move through stages (Recruiter)
   - Assign interview (Recruiter)
   - Submit feedback (Interviewer)
   - Check decision logs (All roles)

4. **Test Analytics:**
   - Login as Admin or Recruiter
   - View Analytics page
   - Verify charts show correct data

## Need Help?

- Check `README.md` for detailed documentation
- Review `seedData.js` to understand data structure
- Modify `seedData.js` to customize sample data
