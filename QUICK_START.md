# 🚀 HireLens Quick Start

## One Command to Rule Them All

```bash
npm run reset
```

This will give you a fully populated database ready for testing!

---

## 🔑 Login Credentials

After running `npm run reset`, use these credentials:

### 👑 Admin
```
Email: admin@techcorp.com
Password: admin123
```
**Can do:** View everything, analytics, read-only access

### 🎯 Recruiter (Main User)
```
Email: sarah.johnson@techcorp.com
Password: recruiter123
```
**Can do:** Everything! Create jobs, manage candidates, assign interviews, drag & drop

### 📋 Interviewer
```
Email: david.kim@techcorp.com
Password: interviewer123
```
**Can do:** View assigned interviews, submit feedback

---

## 📦 What You Get

| Item | Count | Description |
|------|-------|-------------|
| 🏢 Organizations | 1 | TechCorp Solutions |
| 👥 Users | 9 | 1 Admin, 3 Recruiters, 5 Interviewers |
| 💼 Jobs | 10 | Various positions (9 open, 1 closed) |
| 👤 Candidates | 20 | Across all stages |
| 📅 Interviews | ~8 | Some pending, some completed |
| 📝 Feedbacks | ~5 | For completed interviews |
| 📋 Decision Logs | ~30 | Complete audit trail |

---

## 🎮 Available Commands

```bash
npm run seed   # Add sample data
npm run clean  # Remove all data  
npm run reset  # Clean + Seed (⭐ recommended)
```

---

## 🧪 Testing Scenarios

### Test Recruiter Workflow
1. Login as recruiter
2. Go to Jobs → Open any job
3. See pipeline with candidates
4. Drag candidates between stages
5. Click "Assign Interview" button
6. Select interviewer and schedule

### Test Interviewer Workflow
1. Login as interviewer
2. Go to Interviews page
3. See assigned interviews
4. Click "Submit Feedback"
5. Fill form and submit
6. See interview marked as completed

### Test Admin View
1. Login as admin
2. View Dashboard statistics
3. Check Analytics page
4. View jobs (read-only, no edit buttons)

---

## 🎨 Sample Data Highlights

### Jobs Include:
- Senior Frontend Developer
- Backend Engineer
- Full Stack Developer
- DevOps Engineer
- UI/UX Designer
- Data Scientist
- Mobile Developer
- QA Engineer
- Product Manager (CLOSED)
- Security Engineer

### Candidates Across Stages:
- **APPLIED** (7) - Fresh applications
- **SCREENING** (6) - Under review
- **INTERVIEW** (4) - Scheduled interviews
- **OFFER** (2) - Offers extended
- **HIRED** (1) - Successfully hired
- **REJECTED** (1) - Not selected

---

## 🔧 Troubleshooting

**MongoDB not running?**
```bash
# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Need fresh start?**
```bash
npm run reset
```

**Want to customize data?**
Edit `src/scripts/seedData.js`

---

## 📚 More Information

- **Detailed Guide:** `src/scripts/README.md`
- **Usage Examples:** `src/scripts/USAGE.md`
- **Quick Reference:** `SEEDING.md`

---

## ⚡ Pro Tips

1. **Always use `npm run reset`** for a clean slate
2. **Test with different roles** to verify permissions
3. **Open multiple browsers** to test real-time features
4. **Check decision logs** to verify audit trail
5. **Customize `seedData.js`** for specific test scenarios

---

## 🎯 Ready to Go!

```bash
# 1. Reset database
npm run reset

# 2. Start backend
npm start

# 3. Start frontend (in another terminal)
cd ../hire-lens-frontend
npm run dev

# 4. Login and test!
```

**Happy Testing! 🎉**
