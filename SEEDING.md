# Quick Start: Database Seeding

## TL;DR

```bash
# Reset database with fresh data
npm run reset

# Or step by step:
npm run clean  # Clear all data
npm run seed   # Add sample data
```

## Login After Seeding

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@techcorp.com | admin123 |
| Recruiter | sarah.johnson@techcorp.com | recruiter123 |
| Interviewer | david.kim@techcorp.com | interviewer123 |

## What Gets Created

- ✅ 1 Organization
- ✅ 9 Users (1 Admin, 3 Recruiters, 5 Interviewers)
- ✅ 10 Jobs (various positions, 9 open, 1 closed)
- ✅ 20 Candidates (across different stages)
- ✅ ~8 Interviews (assigned and completed)
- ✅ ~5 Interview Feedbacks
- ✅ ~30 Decision Logs (complete audit trail)

## Commands

```bash
npm run seed   # Add sample data
npm run clean  # Remove all data
npm run reset  # Clean + Seed (recommended)
```

## Testing Different Roles

### As Admin
- Login: admin@techcorp.com / admin123
- Can view: Dashboard, Analytics, Jobs (read-only)
- Cannot: Edit jobs, move candidates, assign interviews

### As Recruiter
- Login: sarah.johnson@techcorp.com / recruiter123
- Can: Create jobs, add candidates, drag & drop, assign interviews
- Full pipeline management access

### As Interviewer
- Login: david.kim@techcorp.com / interviewer123
- Can: View assigned interviews, submit feedback
- Task-focused interface only

## Need More Details?

See `src/scripts/README.md` for complete documentation.
