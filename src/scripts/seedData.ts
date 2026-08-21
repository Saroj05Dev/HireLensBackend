import bcrypt from "bcryptjs";
import Organization from "../models/Organization.js";
import User, { UserRole } from "../models/User.js";
import Job, { JobStatus } from "../models/Job.js";
import Candidate, { CandidateStage } from "../models/Candidate.js";
import Interview from "../models/Interview.js";
import InterviewFeedback, { Recommendation } from "../models/InterviewFeedback.js";
import DecisionLog, { ActionType } from "../models/DecisionLog.js";

const organizationData = {
  name: "InfoTech Solutions India",
};

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const usersData: SeedUser[] = [
  { name: "Rajesh Kumar", email: "rajesh.kumar@infotech.in", password: "admin123", role: "ADMIN" },
  { name: "Priya Sharma", email: "priya.sharma@infotech.in", password: "recruiter123", role: "RECRUITER" },
  { name: "Amit Patel", email: "amit.patel@infotech.in", password: "recruiter123", role: "RECRUITER" },
  { name: "Sneha Gupta", email: "sneha.gupta@infotech.in", password: "recruiter123", role: "RECRUITER" },
  { name: "Vikram Singh", email: "vikram.singh@infotech.in", password: "interviewer123", role: "INTERVIEWER" },
  { name: "Anjali Reddy", email: "anjali.reddy@infotech.in", password: "interviewer123", role: "INTERVIEWER" },
  { name: "Karthik Iyer", email: "karthik.iyer@infotech.in", password: "interviewer123", role: "INTERVIEWER" },
  { name: "Deepika Nair", email: "deepika.nair@infotech.in", password: "interviewer123", role: "INTERVIEWER" },
  { name: "Arjun Mehta", email: "arjun.mehta@infotech.in", password: "interviewer123", role: "INTERVIEWER" },
];

interface SeedJob {
  title: string;
  description: string;
  skills: string[];
  experience: string;
  location: string;
  status: JobStatus;
}

const jobsData: SeedJob[] = [
  {
    title: "Senior Frontend Developer",
    description: "We are looking for an experienced Frontend Developer to join our team in Bangalore.",
    skills: ["React", "JavaScript", "TypeScript", "CSS", "HTML"],
    experience: "5+ years",
    location: "Bangalore, Karnataka",
    status: "OPEN",
  },
  {
    title: "Backend Engineer",
    description: "Join our backend team in Hyderabad to build scalable APIs and microservices.",
    skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "REST APIs"],
    experience: "3-5 years",
    location: "Hyderabad, Telangana",
    status: "OPEN",
  },
  {
    title: "Full Stack Developer",
    description: "Looking for a versatile developer comfortable with both frontend and backend technologies.",
    skills: ["React", "Node.js", "MongoDB", "TypeScript", "AWS"],
    experience: "4+ years",
    location: "Pune, Maharashtra",
    status: "OPEN",
  },
  {
    title: "DevOps Engineer",
    description: "Manage our cloud infrastructure and CI/CD pipelines.",
    skills: ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform"],
    experience: "3+ years",
    location: "Mumbai, Maharashtra",
    status: "OPEN",
  },
  {
    title: "UI/UX Designer",
    description: "Create beautiful and intuitive user interfaces for our products.",
    skills: ["Figma", "Adobe XD", "Sketch", "User Research", "Prototyping"],
    experience: "2-4 years",
    location: "Gurgaon, Haryana",
    status: "OPEN",
  },
  {
    title: "Data Scientist",
    description: "Analyze data and build machine learning models to drive business insights.",
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Data Analysis"],
    experience: "3+ years",
    location: "Bangalore, Karnataka",
    status: "OPEN",
  },
  {
    title: "Mobile Developer",
    description: "Build native mobile applications for iOS and Android platforms.",
    skills: ["React Native", "Swift", "Kotlin", "Mobile UI", "REST APIs"],
    experience: "3-5 years",
    location: "Chennai, Tamil Nadu",
    status: "OPEN",
  },
  {
    title: "QA Engineer",
    description: "Ensure quality through automated and manual testing.",
    skills: ["Selenium", "Jest", "Cypress", "Test Automation", "QA Processes"],
    experience: "2-4 years",
    location: "Noida, Uttar Pradesh",
    status: "OPEN",
  },
  {
    title: "Product Manager",
    description: "Lead product development from conception to launch.",
    skills: ["Product Strategy", "Agile", "User Stories", "Roadmapping", "Analytics"],
    experience: "5+ years",
    location: "Bangalore, Karnataka",
    status: "CLOSED",
  },
  {
    title: "Security Engineer",
    description: "Protect our systems and data. Experience with security best practices required.",
    skills: ["Security", "Penetration Testing", "Cryptography", "Network Security", "Compliance"],
    experience: "4+ years",
    location: "Delhi NCR",
    status: "OPEN",
  },
];

interface SeedCandidate {
  name: string;
  email: string;
  phone: string;
  currentStage: CandidateStage;
}

const candidatesData: SeedCandidate[] = [
  { name: "Rahul Verma", email: "rahul.verma@gmail.com", phone: "+91-9876543210", currentStage: "APPLIED" },
  { name: "Neha Singh", email: "neha.singh@gmail.com", phone: "+91-9876543211", currentStage: "SCREENING" },
  { name: "Suresh Kumar", email: "suresh.kumar@gmail.com", phone: "+91-9876543212", currentStage: "INTERVIEW" },
  { name: "Kavya Reddy", email: "kavya.reddy@gmail.com", phone: "+91-9876543213", currentStage: "OFFER" },
  { name: "Ravi Shankar", email: "ravi.shankar@gmail.com", phone: "+91-9876543214", currentStage: "APPLIED" },
  { name: "Pooja Patel", email: "pooja.patel@gmail.com", phone: "+91-9876543215", currentStage: "SCREENING" },
  { name: "Arun Kumar", email: "arun.kumar@gmail.com", phone: "+91-9876543216", currentStage: "INTERVIEW" },
  { name: "Meera Nair", email: "meera.nair@gmail.com", phone: "+91-9876543217", currentStage: "APPLIED" },
  { name: "Sanjay Gupta", email: "sanjay.gupta@gmail.com", phone: "+91-9876543218", currentStage: "SCREENING" },
  { name: "Divya Iyer", email: "divya.iyer@gmail.com", phone: "+91-9876543219", currentStage: "HIRED" },
  { name: "Manoj Sharma", email: "manoj.sharma@gmail.com", phone: "+91-9876543220", currentStage: "APPLIED" },
  { name: "Swati Desai", email: "swati.desai@gmail.com", phone: "+91-9876543221", currentStage: "INTERVIEW" },
  { name: "Rohan Mehta", email: "rohan.mehta@gmail.com", phone: "+91-9876543222", currentStage: "APPLIED" },
  { name: "Isha Kapoor", email: "isha.kapoor@gmail.com", phone: "+91-9876543223", currentStage: "SCREENING" },
  { name: "Varun Malhotra", email: "varun.malhotra@gmail.com", phone: "+91-9876543224", currentStage: "REJECTED" },
  { name: "Shalini Rao", email: "shalini.rao@gmail.com", phone: "+91-9876543225", currentStage: "APPLIED" },
  { name: "Nikhil Joshi", email: "nikhil.joshi@gmail.com", phone: "+91-9876543226", currentStage: "SCREENING" },
  { name: "Ananya Krishnan", email: "ananya.krishnan@gmail.com", phone: "+91-9876543227", currentStage: "INTERVIEW" },
  { name: "Akash Agarwal", email: "akash.agarwal@gmail.com", phone: "+91-9876543228", currentStage: "APPLIED" },
  { name: "Priyanka Chopra", email: "priyanka.chopra@gmail.com", phone: "+91-9876543229", currentStage: "OFFER" },
];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getRandomPastDate = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
};

const getRandomFutureDate = (daysAhead: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  date.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
  return date;
};

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log("Starting database seeding...");

    console.log("Clearing existing data...");
    await Promise.all([
      DecisionLog.deleteMany({}),
      InterviewFeedback.deleteMany({}),
      Interview.deleteMany({}),
      Candidate.deleteMany({}),
      Job.deleteMany({}),
      User.deleteMany({}),
      Organization.deleteMany({}),
    ]);
    console.log("Existing data cleared");

    console.log("Creating organization...");
    const organization = await Organization.create(organizationData);
    console.log(`Organization created: ${organization.name}`);

    console.log("Creating users...");
    const users = await Promise.all(
      usersData.map(async (userData) => {
        const hashedUserPassword = await bcrypt.hash(userData.password, 10);
        return User.create({
          ...userData,
          password: hashedUserPassword,
          organizationId: organization._id,
          isActive: true,
        });
      })
    );
    console.log(`${users.length} users created`);

    organization.ownerId = users[0]._id;
    await organization.save();

    const recruiters = users.filter((u) => u.role === "RECRUITER");
    const interviewers = users.filter((u) => u.role === "INTERVIEWER");

    console.log("Creating jobs...");
    const jobs = await Promise.all(
      jobsData.map((jobData) =>
        Job.create({
          ...jobData,
          organizationId: organization._id,
          createdBy: getRandomElement(recruiters)._id,
        })
      )
    );
    console.log(`${jobs.length} jobs created`);

    console.log("Creating candidates...");
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
          resumeUrl: `https://example.com/resumes/${candidateData.name.replace(/\s+/g, "-").toLowerCase()}.pdf`,
        });
        candidates.push(candidate);
        candidateIndex++;
      }
    }
    console.log(`${candidates.length} candidates created`);

    console.log("Creating interviews...");
    const interviewCandidates = candidates.filter((c) =>
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
          scheduledAt:
            candidate.currentStage === "INTERVIEW"
              ? getRandomFutureDate(14)
              : getRandomPastDate(30),
        })
      )
    );
    console.log(`${interviews.length} interviews created`);

    console.log("Creating interview feedback...");
    const completedInterviews = interviews.filter((i) => i.status === "COMPLETED");

    const feedbacks = await Promise.all(
      completedInterviews.map((interview) => {
        const ratings = [3, 4, 5];
        const rating = getRandomElement(ratings);
        const recommendations: Recommendation[] =
          rating >= 4 ? ["PROCEED", "PROCEED", "HOLD"] : ["HOLD", "REJECT"];

        return InterviewFeedback.create({
          interviewId: interview._id,
          candidateId: interview.candidateId,
          interviewerId: interview.interviewerId,
          rating,
          strengths:
            "Strong technical skills, good communication, problem-solving ability demonstrated during the interview.",
          weaknesses:
            "Could improve on system design concepts and scalability considerations.",
          recommendation: getRandomElement(recommendations),
        });
      })
    );
    console.log(`${feedbacks.length} interview feedbacks created`);

    console.log("Creating decision logs...");
    const decisionLogs: any[] = [];

    for (const candidate of candidates) {
      const stages = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];
      const currentIndex = stages.indexOf(candidate.currentStage);

      if (currentIndex === -1) continue;

      let daysAgo = 30 + Math.floor(Math.random() * 30);

      for (let i = 0; i <= currentIndex; i++) {
        const stageDate = new Date();
        stageDate.setDate(stageDate.getDate() - daysAgo);

        decisionLogs.push({
          organizationId: organization._id,
          candidateId: candidate._id,
          jobId: candidate.jobId,
          actionType: "STAGE_CHANGE" as ActionType,
          performedBy: getRandomElement(recruiters)._id,
          fromStage: i === 0 ? null : stages[i - 1],
          toStage: stages[i],
          note:
            i === 0
              ? `Candidate applied for the position`
              : `Candidate progressed to ${stages[i]} stage`,
          createdAt: stageDate,
        });

        daysAgo -= 3 + Math.floor(Math.random() * 5);
        if (daysAgo < 0) daysAgo = 0;
      }
    }

    for (const interview of interviews) {
      const interviewDate = new Date(interview.scheduledAt || Date.now());
      interviewDate.setDate(interviewDate.getDate() - 2);

      decisionLogs.push({
        organizationId: organization._id,
        candidateId: interview.candidateId,
        jobId: interview.jobId,
        actionType: "INTERVIEW_ASSIGNED" as ActionType,
        performedBy: getRandomElement(recruiters)._id,
        note: "Interview scheduled with candidate",
        createdAt: interviewDate,
      });
    }

    for (const feedback of feedbacks) {
      const interview = interviews.find((i) => i._id.equals(feedback.interviewId));
      const feedbackDate = new Date(interview?.scheduledAt || Date.now());
      feedbackDate.setDate(feedbackDate.getDate() + 1);

      decisionLogs.push({
        organizationId: organization._id,
        candidateId: feedback.candidateId,
        jobId: interview?.jobId,
        actionType: "FEEDBACK_SUBMITTED" as ActionType,
        performedBy: feedback.interviewerId,
        note: `Feedback submitted with recommendation: ${feedback.recommendation}`,
        createdAt: feedbackDate,
      });
    }

    await DecisionLog.insertMany(decisionLogs);
    console.log(`${decisionLogs.length} decision logs created`);

    console.log("\nDatabase seeding completed successfully!");
    console.log("\nSummary:");
    console.log(`   Organizations: 1`);
    console.log(
      `   Users: ${users.length} (1 Admin, ${recruiters.length} Recruiters, ${interviewers.length} Interviewers)`
    );
    console.log(`   Jobs: ${jobs.length}`);
    console.log(`   Candidates: ${candidates.length}`);
    console.log(`   Interviews: ${interviews.length}`);
    console.log(`   Feedbacks: ${feedbacks.length}`);
    console.log(`   Decision Logs: ${decisionLogs.length}`);

    console.log("\nLogin Credentials:");
    console.log("   Admin: rajesh.kumar@infotech.in / admin123");
    console.log("   Recruiter: priya.sharma@infotech.in / recruiter123");
    console.log("   Interviewer: vikram.singh@infotech.in / interviewer123");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};