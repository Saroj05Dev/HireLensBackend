# Analytics Testing Guide

## Issue Fixed
The Analytics page was showing empty because:
1. Decision logs were missing proper `createdAt` timestamps
2. Analytics queries were using wrong field name (`stage` instead of `currentStage`)

## What Was Fixed
1. **Seed Data**: Added realistic timestamps to decision logs with 3-7 day gaps between stage transitions
2. **Analytics Repository**: Fixed field name from `stage` to `currentStage` in queries
3. **Stage Progression**: Created proper stage history starting 30-60 days ago

## How to Test

### Step 1: Reset Database with Fixed Seed Data
```bash
cd hire-lens-backend
npm run reset
```

This will:
- Clean the database
- Create 20 candidates with proper stage progression
- Generate decision logs with realistic timestamps
- Create stage transitions that analytics can track

### Step 2: Login and View Analytics
1. Start the backend: `npm start`
2. Start the frontend: `npm run dev`
3. Login as recruiter: `sarah.johnson@techcorp.com` / `recruiter123`
4. Navigate to Analytics page

### What You Should See

**Key Metrics:**
- Total Candidates: 21
- Conversion Rate: ~5% (1 hired candidate)
- Rejection Rate: ~5% (1 rejected candidate)
- Avg Time to Hire: Calculated from stage transitions

**Hiring Funnel:**
- Visual funnel showing candidates at each stage
- Conversion percentages between stages
- Color-coded bars

**Drop-off Analysis:**
- Shows where candidates are lost
- Highlights highest drop-off stage
- Provides actionable insights

**Stage Distribution:**
- Pie chart with percentages
- Real candidate counts per stage

**Job-Specific Analytics:**
- Select a job from dropdown
- View funnel for that specific job
- See time-to-hire metrics

## Expected Data Distribution
After running `npm run reset`, you should have:
- APPLIED: ~10 candidates
- SCREENING: ~4 candidates
- INTERVIEW: ~4 candidates
- OFFER: ~2 candidates
- HIRED: 1 candidate
- REJECTED: 1 candidate

## Troubleshooting

### If Analytics Still Shows Empty:
1. Check browser console for API errors
2. Verify backend is running on correct port
3. Check that you're logged in as RECRUITER or ADMIN
4. Verify MongoDB connection in backend logs

### If Funnel Shows "No funnel data available":
1. Run `npm run reset` again to regenerate data
2. Check that decision logs were created (should see ~33 logs in seed output)
3. Verify timestamps are present in decision logs

### If Time to Hire Shows "-":
1. Ensure at least one candidate is in HIRED stage
2. Check that stage transitions have proper timestamps
3. Verify decision logs have STAGE_CHANGE action type

## API Endpoints Used
- `GET /analytics/dashboard/candidates-by-stage` - Stage distribution
- `GET /analytics/jobs/:jobId/funnel` - Job-specific funnel
- `GET /analytics/jobs/:jobId/time-to-hire` - Time to hire metrics
- `GET /analytics/pipeline/summary` - Pipeline summary

All endpoints require authentication and ADMIN/RECRUITER role.
