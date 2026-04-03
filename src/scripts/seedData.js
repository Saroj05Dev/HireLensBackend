import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import Interview from "../models/Interview.js";
import InterviewFeedback from "../models/InterviewFeedback.js";
import DecisionLog from "../models/DecisionLog.js";

// Sample data
const organizationData = {
  name: "TechCorp Solutions"
};

const usersData = [
  // Admin
  { name: "Admin User", email: "admin@techcorp.com", password: "admin123", role: "ADMIN" },
  
  // Recruiters
  { name: "Sarah Johnson", email: "sarah.johnson@techcorp.com", password: "recruiter123", role: "RECRUITER" },
  { name: "Michael Chen", email: "michael.chen@techcorp.com", password: "recruiter123", role: "RECRUITER" },
  { name: "Emily Rodriguez", email: "emily.rodriguez@techcorp.com", password: "recruiter123", role: "RECRUITER" },
  
  // Interviewers
  { name: "David Kim", email: "david.kim@techcorp.com", password: "interviewer123", role: "INTERVIEWER" },
  { name: "Jessica Martinez", email: "jessica.martinez@techcorp.com", password: "interviewer123", role: "INTERVIEWER" },
  { name: "Robert Taylor", email: "robert.taylor@techcorp.com", password: "interviewer123", role: "INTERVIEWER" },
  { name: "Amanda White", email: "amanda.white@techcorp.com", password: "interviewer123", role: "INTERVIEWER" },
  { name: "James Anderson", email: "james.anderson@techcorp.com", password: "interviewer123", role: "INTERVIEWER" },
];

const jobsData = [
  {
    title: "Senior Frontend Developer",
    description: "We are looking for an experienced Frontend Developer to join our team. You will be responsible for building responsive web applications using React and modern JavaScript.",
    skills: ["React", "JavaScript", "TypeScript", "CSS", "HTML"],
    experience: "5+ years",
    location: "San Francisco, CA",
    status: "OPEN"
  },
  {
    title: "Backend Engineer",
    description: "Join our backend team to build scalable APIs and microservices. Experience with Node.js and databases required.",
    skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "REST APIs"],
    experience: "3-5 years",
    location: "Remote",
    status: "OPEN"
  },
  {
    title: "Full Stack Developer",
    description: "Looking for a versatile developer comfortable with both frontend and backend technologies.",
    skills: ["React", "Node.js", "MongoDB", "TypeScript", "AWS"],
    experience: "4+ years",
    location: "New York, NY",
    status: "OPEN"
  },
  {
    title: "DevOps Engineer",
    description: "Manage our cloud infrastructure and CI/CD pipelines. Experience with AWS and Docker required.",
    skills: ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform"],
    experience: "3+ years",
    location: "Austin, TX",
    status: "OPEN"
  },
  {
    title: "UI/UX Designer",
    description: "Create beautiful and intuitive user interfaces. Strong portfolio required.",
    skills: ["Figma", "Adobe XD", "Sketch", "User Research", "Prototyping"],
    experience: "2-4 years",
    location: "Los Angeles, CA",
    status: "OPEN"
  },
  {
    title: "Data Scientist",
    description: "Analyze data and build machine learning models to drive business insights.",
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Data Analysis"],
    experience: "3+ years",
    location: "Boston, MA",
    status: "OPEN"
  },
  {
    title: "Mobile Developer",
    description: "Build native mobile applications for iOS and Android platforms.",
    skills: ["React Native", "Swift", "Kotlin", "Mobile UI", "REST APIs"],
    experience: "3-5 years",
    location: "Seattle, WA",
    status: "OPEN"
  },
  {
    title: "QA Engineer",
    description: "Ensure quality through automated and manual testing. Experience with testing frameworks required.",
    skills: ["Selenium", "Jest", "Cypress", "Test Automation", "QA Processes"],
    experience: "2-4 years",
    location: "Remote",
    status: "OPEN"
  },
  {
    title: "Product Manager",
    description: "Lead product development from conception to launch. Strong technical background preferred.",
    skills: ["Product Strategy", "Agile", "User Stories", "Roadmapping", "Analytics"],
    experience: "5+ years",
    location: "San Francisco, CA",
    status: "CLOSED"
  },
  {
    title: "Security Engineer",
    description: "Protect our systems and data. Experience with security best practices required.",
    skills: ["Security", "Penetration Testing", "Cryptography", "Network Security", "Compliance"],
    experience: "4+ years",
    location: "Remote",
    status: "OPEN"
  }
];

const candidatesData = [
  // Frontend Developer candidates
  { name: "Alex Thompson", email: "alex.thompson@email.com", phone: "+1-555-0101", currentStage: "APPLIED" },
  { name: "Maria Garcia", email: "maria.garcia@email.com", phone: "+1-555-0102", currentStage: "SCREENING" },
  { name: "John Smith", email: "john.smith@email.com", phone: "+1-555-0103", currentStage: "INTERVIEW" },
  { name: "Lisa Wang", email: "lisa.wang@email.com", phone: "+1-555-0104", currentStage: "OFFER" },
  
  // Backend Engineer candidates
  { name: "Chris Brown", email: "chris.brown@email.com", phone: "+1-555-0105", currentStage: "APPLIED" },
  { name: "Nina Patel", email: "nina.patel@email.com", phone: "+1-555-0106", currentStage: "SCREENING" },
  { name: "Tom Wilson", email: "tom.wilson@email.com", phone: "+1-555-0107", currentStage: "INTERVIEW" },
  
  // Full Stack Developer candidates
  { name: "Sarah Lee", email: "sarah.lee@email.com", phone: "+1-555-0108", currentStage: "APPLIED" },
  { name: "Kevin Zhang", email: "kevin.zhang@email.com", phone: "+1-555-0109", currentStage: "SCREENING" },
  { name: "Emma Davis", email: "emma.davis@email.com", phone: "+1-555-0110", currentStage: "HIRED" },
  
  // DevOps Engineer candidates
  { name: "Ryan Miller", email: "ryan.miller@email.com", phone: "+1-555-0111", currentStage: "APPLIED" },
  { name: "Sophia Martinez", email: "sophia.martinez@email.com", phone: "+1-555-0112", currentStage: "INTERVIEW" },
  
  // UI/UX Designer candidates
  { name: "Oliver Johnson", email: "oliver.johnson@email.com", phone: "+1-555-0113", currentStage: "APPLIED" },
  { name: "Ava Williams", email: "ava.williams@email.com", phone: "+1-555-0114", currentStage: "SCREENING" },
  
  // Data Scientist candidates
  { name: "Ethan Brown", email: "ethan.brown@email.com", phone: "+1-555-0115", currentStage: "REJECTED" },
  { name: "Mia Jones", email: "mia.jones@email.com", phone: "+1-555-0116", currentStage: "APPLIED" },
  
  // Mobile Developer candidates
  { name: "Noah Garcia", email: "noah.garcia@email.com", phone: "+1-555-0117", currentStage: "SCREENING" },
  { name: "Isabella Rodriguez", email: "isabella.rodriguez@email.com", phone: "+1-555-0118", currentStage: "INTERVIEW" },
  
  // QA Engineer candidates
  { name: "Liam Martinez", email: "liam.martinez@email.com", phone: "+1-555-0119", currentStage: "APPLIED" },
  { name: "Charlotte Anderson", email: "charlotte.anderson@email.com", phone: "+1-555-0120", currentStage: "OFFER" },
];

// Helper function to get random element from array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get random date in the past
const getRandomPastDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
};

// Helper function to get random future date
const getRandomFutureDate = (daysAhead) => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  date.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // 9 AM to 5 PM
  return date;
};

export const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      DecisionLog.deleteMany({}),
      InterviewFeedback.deleteMany({}),
      Interview.deleteMany({}),
      Candidate.deleteMany({}),
      Job.deleteMany({}),
      User.deleteMany({}),
      Organization.deleteMany({})
    ]);
    console.log("✅ Existing data cleared");

    // Create Organization
    console.log("🏢 Creating organization...");
    const organization = await Organization.create(organizationData);
    console.log(`✅ Organization created: ${organization.name}`);

    // Create Users
    console.log("👥 Creating users...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    const users = await Promise.all(
      usersData.map(async (userData) => {
        const hashedUserPassword = await bcrypt.hash(userData.password, 10);
        return User.create({
          ...userData,
          password: hashedUserPassword,
          organizationId: organization._id,
          isActive: true
        });
      })
    );
    console.log(`✅ ${users.length} users created`);

    // Set organization owner
    organization.ownerId = users[0]._id; // Admin as owner
    await organization.save();

    // Separate users by role
    const admin = users.find(u => u.role === "ADMIN");
    const recruiters = users.filter(u => u.role === "RECRUITER");
    const interviewers = users.filter(u => u.role === "INTERVIEWER");

    // Create Jobs
    console.log("💼 Creating jobs...");
    const jobs = await Promise.all(
      jobsData.map((jobData) =>
        Job.create({
          ...jobData,
          organizationId: organization._id,
          createdBy: getRandomElement(recruiters)._id
        })
      )
    );
    console.log(`✅ ${jobs.length} jobs created`);

    // Create Candidates (distribute across jobs)
    console.log("👤 Creating candidates...");
    const candidates = [];
    let candidateIndex = 0;
    
    for (let i = 0; i < jobs.length && candidateIndex < candidatesData.length; i++) {
      const candidatesPerJob = Math.min(2, candidatesData.length - candidateIndex);
      
      for (let j = 0; j < candidatesPerJob; j++) {
        const candidateData = candidatesData[candidateIndex];
        const candidate = await Candidate.create({
          ...candidateData,
          organizationId: organization._id,
          jobId: jobs[i]._id,
          addedBy: getRandomElement(recruiters)._id,
          resumeUrl: `https://example.com/resumes/${candidateData.name.replace(/\s+/g, '-').toLowerCase()}.pdf`
        });
        candidates.push(candidate);
        candidateIndex++;
      }
    }
    console.log(`✅ ${candidates.length} candidates created`);

    // Create Interviews (for candidates in INTERVIEW stage or beyond)
    console.log("📅 Creating interviews...");
    const interviewCandidates = candidates.filter(c => 
      ["INTERVIEW", "OFFER", "HIRED"].includes(c.currentStage)
    );
    
    const interviews = await Promise.all(
      interviewCandidates.map((candidate) =>
        Interview.create({
          organizationId: organization._id,
          candidateId: candidate._id,
          jobId: candidate.jobId,
          interviewerId: getRandomElement(interviewers)._id,
          status: candidate.currentStage === "INTERVIEW" ? "ASSIGNED" : "COMPLETED",
          scheduledAt: candidate.currentStage === "INTERVIEW" 
            ? getRandomFutureDate(14) 
            : getRandomPastDate(30)
        })
      )
    );
    console.log(`✅ ${interviews.length} interviews created`);

    // Create Interview Feedback (for completed interviews)
    console.log("📝 Creating interview feedback...");
    const completedInterviews = interviews.filter(i => i.status === "COMPLETED");
    
    const feedbacks = await Promise.all(
      completedInterviews.map((interview) => {
        const ratings = [3, 4, 5];
        const rating = getRandomElement(ratings);
        const recommendations = rating >= 4 ? ["PROCEED", "PROCEED", "HOLD"] : ["HOLD", "REJECT"];
        
        return InterviewFeedback.create({
          interviewId: interview._id,
          candidateId: interview.candidateId,
          interviewerId: interview.interviewerId,
          rating: rating,
          strengths: "Strong technical skills, good communication, problem-solving ability demonstrated during the interview.",
          weaknesses: "Could improve on system design concepts and scalability considerations.",
          recommendation: getRandomElement(recommendations)
        });
      })
    );
    console.log(`✅ ${feedbacks.length} interview feedbacks created`);

    // Create Decision Logs with realistic timestamps
    console.log("📋 Creating decision logs...");
    const decisionLogs = [];
    
    // Stage change logs with progressive timestamps
    for (const candidate of candidates) {
      const stages = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];
      const currentIndex = stages.indexOf(candidate.currentStage);
      
      if (currentIndex === -1) continue;
      
      // Start from 30-60 days ago
      let daysAgo = 30 + Math.floor(Math.random() * 30);
      
      // Create stage progression with realistic time gaps
      for (let i = 0; i <= currentIndex; i++) {
        const stageDate = new Date();
        stageDate.setDate(stageDate.getDate() - daysAgo);
        
        decisionLogs.push({
          organizationId: organization._id,
          candidateId: candidate._id,
          jobId: candidate.jobId,
          actionType: "STAGE_CHANGE",
          performedBy: getRandomElement(recruiters)._id,
          fromStage: i === 0 ? null : stages[i - 1],
          toStage: stages[i],
          note: i === 0 
            ? `Candidate applied for the position` 
            : `Candidate progressed to ${stages[i]} stage`,
          createdAt: stageDate
        });
        
        // Reduce days for next stage (3-7 days between stages)
        daysAgo -= (3 + Math.floor(Math.random() * 5));
        if (daysAgo < 0) daysAgo = 0;
      }
    }
    
    // Interview assigned logs
    for (const interview of interviews) {
      const interviewDate = new Date(interview.scheduledAt);
      interviewDate.setDate(interviewDate.getDate() - 2); // Assigned 2 days before scheduled
      
      decisionLogs.push({
        organizationId: organization._id,
        candidateId: interview.candidateId,
        jobId: interview.jobId,
        actionType: "INTERVIEW_ASSIGNED",
        performedBy: getRandomElement(recruiters)._id,
        note: "Interview scheduled with candidate",
        createdAt: interviewDate
      });
    }
    
    // Feedback submitted logs
    for (const feedback of feedbacks) {
      const interview = interviews.find(i => i._id.equals(feedback.interviewId));
      const feedbackDate = new Date(interview.scheduledAt);
      feedbackDate.setDate(feedbackDate.getDate() + 1); // Feedback 1 day after interview
      
      decisionLogs.push({
        organizationId: organization._id,
        candidateId: feedback.candidateId,
        jobId: interview.jobId,
        actionType: "FEEDBACK_SUBMITTED",
        performedBy: feedback.interviewerId,
        note: `Feedback submitted with recommendation: ${feedback.recommendation}`,
        createdAt: feedbackDate
      });
    }
    
    await DecisionLog.insertMany(decisionLogs);
    console.log(`✅ ${decisionLogs.length} decision logs created`);

    // Summary
    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Organizations: 1`);
    console.log(`   Users: ${users.length} (1 Admin, ${recruiters.length} Recruiters, ${interviewers.length} Interviewers)`);
    console.log(`   Jobs: ${jobs.length}`);
    console.log(`   Candidates: ${candidates.length}`);
    console.log(`   Interviews: ${interviews.length}`);
    console.log(`   Feedbacks: ${feedbacks.length}`);
    console.log(`   Decision Logs: ${decisionLogs.length}`);
    
    console.log("\n🔑 Login Credentials:");
    console.log("   Admin: admin@techcorp.com / admin123");
    console.log("   Recruiter: sarah.johnson@techcorp.com / recruiter123");
    console.log("   Interviewer: david.kim@techcorp.com / interviewer123");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};
