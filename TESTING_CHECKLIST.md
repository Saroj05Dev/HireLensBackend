# 🧪 HireLens Testing Checklist

Use this checklist after running `npm run reset` to verify everything works.

## ✅ Pre-Testing Setup

- [ ] MongoDB is running
- [ ] Backend is running (`npm start`)
- [ ] Frontend is running (`npm run dev`)
- [ ] Database is seeded (`npm run reset`)

---

## 👑 Admin Role Testing

**Login:** admin@techcorp.com / admin123

### Dashboard
- [ ] Can access dashboard
- [ ] See total jobs count
- [ ] See total candidates count
- [ ] See recent activity feed
- [ ] Statistics are accurate

### Jobs Page
- [ ] Can view jobs list
- [ ] See 10 jobs displayed
- [ ] Can click to view job details
- [ ] **Cannot** see "Create Job" button
- [ ] **Cannot** see "Edit" buttons
- [ ] **Cannot** drag candidates

### Analytics
- [ ] Can access analytics page
- [ ] See funnel chart
- [ ] See time-to-hire metrics
- [ ] See drop-off stages
- [ ] Charts display data correctly

### Restrictions
- [ ] No "Add Candidate" button visible
- [ ] No "Assign Interview" button visible
- [ ] Cannot modify any data
- [ ] Read-only access confirmed

---

## 🎯 Recruiter Role Testing

**Login:** sarah.johnson@techcorp.com / recruiter123

### Dashboard
- [ ] Can access dashboard
- [ ] See statistics
- [ ] See recent activity
- [ ] All widgets functional

### Jobs Management
- [ ] Can view jobs list
- [ ] Can create new job
- [ ] Can edit existing job
- [ ] Can close/open jobs
- [ ] Can delete jobs

### Pipeline Board
- [ ] Can open job details
- [ ] See candidates in columns
- [ ] Can drag candidates between stages
- [ ] Drag & drop works smoothly
- [ ] Confirmation modal appears on drop
- [ ] Can add notes when moving candidates
- [ ] Real-time updates work

### Candidate Management
- [ ] Can add new candidate
- [ ] Can view candidate profile
- [ ] Can see candidate details
- [ ] Can see decision timeline
- [ ] Can see interview history
- [ ] Resume link works

### Interview Assignment
- [ ] Can click "Assign Interview"
- [ ] Modal opens correctly
- [ ] Can select interviewer
- [ ] Can schedule date/time
- [ ] Can add notes
- [ ] Assignment succeeds
- [ ] Interviewer receives assignment

### Candidates Page
- [ ] Can view all candidates
- [ ] Can filter by stage
- [ ] Can filter by job
- [ ] Can search by name/email
- [ ] Grid/List view toggle works
- [ ] Can view candidate profiles

### Analytics
- [ ] Can access analytics
- [ ] See organization-wide metrics
- [ ] Charts are interactive

---

## 📋 Interviewer Role Testing

**Login:** david.kim@techcorp.com / interviewer123

### Interview Tasks Page
- [ ] Can access interviews page
- [ ] See assigned interviews only
- [ ] See pending count
- [ ] See completed count
- [ ] Tabs work (Pending/Completed)

### Pending Interviews
- [ ] See list of pending interviews
- [ ] See candidate information
- [ ] See job details
- [ ] See scheduled date/time
- [ ] "Submit Feedback" button visible

### Submit Feedback
- [ ] Can click "Submit Feedback"
- [ ] Modal opens correctly
- [ ] Can rate 1-5
- [ ] Can enter strengths
- [ ] Can enter weaknesses
- [ ] Can select recommendation
- [ ] Can add notes
- [ ] Form validation works
- [ ] Submission succeeds
- [ ] Interview moves to completed

### Completed Interviews
- [ ] See completed interviews
- [ ] "View Feedback" button visible
- [ ] Can view submitted feedback
- [ ] Feedback displays correctly

### Restrictions
- [ ] **Cannot** access jobs page
- [ ] **Cannot** access candidates page
- [ ] **Cannot** access analytics
- [ ] **Cannot** see other interviewers' interviews
- [ ] Task-focused interface only

---

## 🔄 Real-Time Features Testing

### Setup
- [ ] Open two browser windows
- [ ] Login as recruiter in window 1
- [ ] Login as interviewer in window 2

### Test Real-Time Updates
- [ ] Move candidate (recruiter) → See update (both windows)
- [ ] Assign interview (recruiter) → Appears in interviewer's list
- [ ] Submit feedback (interviewer) → Updates in recruiter's view
- [ ] Stage changes reflect immediately
- [ ] No page refresh needed

---

## 📊 Data Integrity Testing

### Decision Logs
- [ ] Stage changes are logged
- [ ] Interview assignments are logged
- [ ] Feedback submissions are logged
- [ ] Logs show correct user
- [ ] Logs show correct timestamp
- [ ] Logs are visible in candidate profile

### Candidate Timeline
- [ ] View candidate profile
- [ ] See decision timeline tab
- [ ] Timeline shows all events
- [ ] Events in chronological order
- [ ] Each event has details

### Interview History
- [ ] View candidate profile
- [ ] See interviews tab
- [ ] All interviews listed
- [ ] Interview details correct
- [ ] Feedback linked correctly

---

## 🎨 UI/UX Testing

### Design Consistency
- [ ] Professional appearance
- [ ] Consistent color scheme
- [ ] Icons instead of emojis
- [ ] Smooth animations
- [ ] Responsive layout

### Navigation
- [ ] Sidebar works correctly
- [ ] Active page highlighted
- [ ] Role-based menu items
- [ ] Breadcrumbs (if any) work

### Modals
- [ ] Open smoothly
- [ ] Close with X button
- [ ] Close with Cancel button
- [ ] Close with backdrop click
- [ ] Proper size (not too big/small)
- [ ] Scrollable content

### Forms
- [ ] Validation works
- [ ] Error messages clear
- [ ] Success messages shown
- [ ] Loading states visible
- [ ] Disabled states work

---

## 🐛 Error Handling Testing

### Network Errors
- [ ] Stop backend
- [ ] Try to perform action
- [ ] Error message displayed
- [ ] User-friendly message
- [ ] Can retry after backend restart

### Validation Errors
- [ ] Submit empty form
- [ ] See validation errors
- [ ] Errors are clear
- [ ] Can correct and resubmit

### Permission Errors
- [ ] Try unauthorized action
- [ ] Appropriate error shown
- [ ] No system crash

---

## 📱 Responsive Testing

### Desktop (1920x1080)
- [ ] Layout looks good
- [ ] All features accessible
- [ ] No horizontal scroll

### Laptop (1366x768)
- [ ] Layout adapts
- [ ] Content readable
- [ ] Features work

### Tablet (768x1024)
- [ ] Responsive layout
- [ ] Touch-friendly
- [ ] Sidebar behavior

---

## 🔐 Security Testing

### Authentication
- [ ] Cannot access without login
- [ ] Logout works
- [ ] Session persists on refresh
- [ ] Invalid credentials rejected

### Authorization
- [ ] Admin cannot edit
- [ ] Interviewer cannot access jobs
- [ ] Recruiter has full access
- [ ] Role checks work

---

## 📈 Performance Testing

### Load Times
- [ ] Dashboard loads quickly
- [ ] Jobs list loads quickly
- [ ] Pipeline board loads quickly
- [ ] No significant lag

### Real-Time
- [ ] Updates appear instantly
- [ ] No delays in socket events
- [ ] Multiple users work smoothly

---

## ✨ Final Verification

- [ ] All 3 roles tested
- [ ] All major features work
- [ ] No console errors
- [ ] No broken links
- [ ] Data is consistent
- [ ] Real-time works
- [ ] UI is professional
- [ ] Ready for demo!

---

## 🎉 Success Criteria

Your application is ready when:

✅ All checkboxes above are checked  
✅ No critical bugs found  
✅ All roles work as expected  
✅ Real-time features functional  
✅ UI is polished and professional  
✅ Data integrity maintained  

---

## 📝 Notes

Use this space to note any issues found:

```
Issue 1: 
Fix: 

Issue 2:
Fix:

Issue 3:
Fix:
```

---

**Testing Date:** _______________  
**Tested By:** _______________  
**Status:** ⬜ Pass  ⬜ Fail  ⬜ Needs Review
