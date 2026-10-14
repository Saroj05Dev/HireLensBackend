import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { JobStatus, UserRole } from "@prisma/client";

const integrationEnabled = Boolean(process.env.DATABASE_URL_TEST);

vi.mock("../config/redis.js", () => ({
  redis: {
    del: vi.fn().mockResolvedValue(1),
  },
}));

type PrismaClient = InstanceType<
  typeof import("@prisma/client").PrismaClient
>;
type JobRepository = typeof import("../repositories/job.repository.js");
type JobService = typeof import("../services/job.service.js");

describe.skipIf(!integrationEnabled)("Job database integration", () => {
  let prisma: PrismaClient;
  let jobRepository: JobRepository;
  let jobService: JobService;
  let organizationId: string;
  let userId: string;

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;

    ({ prisma } = await import("../config/prisma.js"));
    jobRepository = await import("../repositories/job.repository.js");
    jobService = await import("../services/job.service.js");

    const organization = await prisma.organization.create({
      data: {
        name: `Job integration test ${Date.now()}`,
      },
    });
    organizationId = organization.id;

    const user = await prisma.user.create({
      data: {
        name: "Job Integration User",
        email: `job-integration-${Date.now()}@example.com`,
        role: UserRole.ADMIN,
        organizationId,
      },
    });
    userId = user.id;
  });

  beforeEach(async () => {
    await prisma.job.deleteMany({
      where: { organizationId },
    });
  });

  afterAll(async () => {
    if (!prisma) return;

    await prisma.user.deleteMany({
      where: { id: userId },
    });
    await prisma.organization.deleteMany({
      where: { id: organizationId },
    });
    await prisma.$disconnect();
  });

  it("persists and retrieves a job through the repository", async () => {
    const createdJob = await jobRepository.create({
      title: "MERN Developer",
      description: "A developer position",
      skills: ["React", "Node.js"],
      experience: "1-2 years",
      location: "Remote",
      organizationId,
      createdById: userId,
      status: JobStatus.OPEN,
    });

    const foundJob = await jobRepository.findById(createdJob.id);

    expect(foundJob).toMatchObject({
      id: createdJob.id,
      title: "MERN Developer",
      organizationId,
      createdById: userId,
      status: JobStatus.OPEN,
      createdBy: {
        email: expect.stringContaining("@example.com"),
      },
      _count: {
        candidates: 0,
      },
    });
  });

  it("updates status and job data through the repository", async () => {
    const createdJob = await jobRepository.create({
      title: "Backend Developer",
      description: "Build backend services",
      skills: ["Node.js"],
      experience: "2-4 years",
      location: "Remote",
      organizationId,
      createdById: userId,
    });

    const closedJob = await jobRepository.updateStatus(
      createdJob.id,
      JobStatus.CLOSED
    );
    const updatedJob = await jobRepository.update(createdJob.id, {
      title: "Senior Backend Developer",
    });

    expect(closedJob?.status).toBe(JobStatus.CLOSED);
    expect(updatedJob).toMatchObject({
      id: createdJob.id,
      title: "Senior Backend Developer",
      status: JobStatus.CLOSED,
    });
  });

  it("creates, closes, reopens, and updates a job through the service", async () => {
    const user = {
      id: userId,
      organizationId,
    };

    const createdJob = await jobService.createJob(user, {
      title: "Full Stack Developer",
      description: "Build product features",
      skills: ["TypeScript", "React"],
      experience: "2-5 years",
      location: "Hybrid",
    });

    expect(createdJob.status).toBe(JobStatus.OPEN);

    const closedJob = await jobService.closeJob(user, createdJob.id);
    expect(closedJob.status).toBe(JobStatus.CLOSED);

    const reopenedJob = await jobService.reopenJob(user, createdJob.id);
    expect(reopenedJob.status).toBe(JobStatus.OPEN);

    const updatedJob = await jobService.updateJob(user, createdJob.id, {
      title: "Senior Full Stack Developer",
      description: "Build and lead product features",
      skills: ["TypeScript", "React", "Node.js"],
      experience: "4-7 years",
      location: "Remote",
    });

    expect(updatedJob).toMatchObject({
      id: createdJob.id,
      title: "Senior Full Stack Developer",
      status: JobStatus.OPEN,
    });
  });

  it("prevents a user from changing a job in another organization", async () => {
    const otherOrganization = await prisma.organization.create({
      data: {
        name: `Other job integration test ${Date.now()}`,
      },
    });
    const otherUser = await prisma.user.create({
      data: {
        name: "Other Job Integration User",
        email: `other-job-integration-${Date.now()}@example.com`,
        role: UserRole.ADMIN,
        organizationId: otherOrganization.id,
      },
    });
    const foreignJob = await jobRepository.create({
      title: "Private Developer Role",
      description: "This job belongs to another organization",
      skills: ["Node.js"],
      experience: "1-3 years",
      location: "Remote",
      organizationId: otherOrganization.id,
      createdById: otherUser.id,
    });

    await expect(
      jobService.updateJob(
        { id: userId, organizationId },
        foreignJob.id,
        {
          title: "Unauthorized update",
          description: "This update must be rejected",
          skills: ["Node.js"],
          experience: "1-3 years",
          location: "Remote",
        }
      )
    ).rejects.toMatchObject({
      message: "Access denied. Job belongs to another organization",
      statusCode: 403,
    });

    await prisma.job.delete({ where: { id: foreignJob.id } });
    await prisma.user.delete({ where: { id: otherUser.id } });
    await prisma.organization.delete({ where: { id: otherOrganization.id } });
  });
});
