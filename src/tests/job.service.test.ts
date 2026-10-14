
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobStatus } from "@prisma/client";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  findById: vi.fn(),
  updateStatus: vi.fn(),
  update: vi.fn(),
  redisDel: vi.fn(),
}));

vi.mock("../repositories/job.repository.js", () => ({
  create: mocks.create,
  findByOrganizationId: vi.fn(),
  findById: mocks.findById,
  updateStatus: mocks.updateStatus,
  update: mocks.update,
  deleteById: vi.fn(),
}));

vi.mock("../config/redis.js", () => ({
  redis: {
    del: mocks.redisDel,
  },
}));

import {
  closeJob,
  createJob,
  reopenJob,
  updateJob,
} from "../services/job.service.js";

const user = {
  id: "user-123",
  organizationId: "org-123",
};

const job = {
  id: "job-123",
  title: "MERN Developer",
  description: "A developer position",
  skills: ["React", "Node.js"],
  experience: "1-2 years",
  location: "Remote",
  status: JobStatus.OPEN,
  organizationId: "org-123",
  createdById: "user-123",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("createJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.redisDel.mockResolvedValue(1);
  });

  it("creates an open job and invalidates the jobs cache", async () => {
    const jobData = {
      title: "MERN Developer",
      description: "A developer position",
      skills: ["React", "Node.js"],
      experience: "1-2 years",
      location: "Remote",
    };

    mocks.create.mockResolvedValue({
      ...job,
      ...jobData,
      status: JobStatus.OPEN,
    });

    const result = await createJob(user, jobData);

    expect(mocks.create).toHaveBeenCalledWith({
      ...jobData,
      organizationId: "org-123",
      createdById: "user-123",
      status: JobStatus.OPEN,
    });

    expect(result).toMatchObject({
      id: "job-123",
      ...jobData,
      status: JobStatus.OPEN,
      createdById: "user-123",
    });

    expect(mocks.redisDel).toHaveBeenCalledWith(["cache:jobs:org-123"]);
  });

  it("throws a 400 error when required fields are missing", async () => {
    await expect(
      createJob(user, {
        title: "",
        description: "A developer position",
        skills: ["React"],
        experience: "1-2 years",
        location: "Remote",
      })
    ).rejects.toMatchObject({
      message:
        "All fields (title, description, skills, experience, location) are required",
      statusCode: 400,
    });

    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.redisDel).not.toHaveBeenCalled();
  });

  it("throws a 400 error when skills is empty", async () => {
    await expect(
      createJob(user, {
        title: "MERN Developer",
        description: "A developer position",
        skills: [],
        experience: "1-2 years",
        location: "Remote",
      })
    ).rejects.toMatchObject({
      message: "Skills must be a non-empty array",
      statusCode: 400,
    });

    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.redisDel).not.toHaveBeenCalled();
  });
});

describe("updateJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.redisDel.mockResolvedValue(1);
  });

  it("updates a job and invalidates the jobs cache", async () => {
    const jobData = {
      title: "Senior MERN Developer",
      description: "An updated developer position",
      skills: ["React", "Node.js", "TypeScript"],
      experience: "3-5 years",
      location: "Hybrid",
    };

    mocks.findById.mockResolvedValue(job);
    mocks.update.mockResolvedValue({
      ...job,
      ...jobData,
    });

    const result = await updateJob(user, "job-123", jobData);

    expect(mocks.findById).toHaveBeenCalledWith("job-123");
    expect(mocks.update).toHaveBeenCalledWith("job-123", jobData);
    expect(result).toMatchObject({
      id: "job-123",
      ...jobData,
      status: JobStatus.OPEN,
    });
    expect(mocks.redisDel).toHaveBeenCalledWith(["cache:jobs:org-123"]);
  });

  it("throws a 404 error when the job does not exist", async () => {
    mocks.findById.mockResolvedValue(null);

    await expect(
      updateJob(user, "missing-job", {
        title: "Updated title",
        description: "Updated description",
        skills: ["React"],
        experience: "2-4 years",
        location: "Remote",
      })
    ).rejects.toMatchObject({
      message: "Job not found",
      statusCode: 404,
    });

    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.redisDel).not.toHaveBeenCalled();
  });

  it("rejects a job belonging to another organization", async () => {
    mocks.findById.mockResolvedValue({
      ...job,
      organizationId: "another-org",
    });

    await expect(
      updateJob(user, "job-123", {
        title: "Updated title",
        description: "Updated description",
        skills: ["React"],
        experience: "2-4 years",
        location: "Remote",
      })
    ).rejects.toMatchObject({
      message: "Access denied. Job belongs to another organization",
      statusCode: 403,
    });

    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.redisDel).not.toHaveBeenCalled();
  });

  it("throws a 400 error when required fields are missing", async () => {
    mocks.findById.mockResolvedValue(job);

    await expect(
      updateJob(user, "job-123", {
        title: "",
        description: "Updated description",
        skills: ["React"],
        experience: "2-4 years",
        location: "Remote",
      })
    ).rejects.toMatchObject({
      message:
        "All fields (title, description, skills, experience, location) are required",
      statusCode: 400,
    });

    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.redisDel).not.toHaveBeenCalled();
  });

  it("throws a 400 error when skills is empty", async () => {
    mocks.findById.mockResolvedValue(job);

    await expect(
      updateJob(user, "job-123", {
        title: "Updated title",
        description: "Updated description",
        skills: [],
        experience: "2-4 years",
        location: "Remote",
      })
    ).rejects.toMatchObject({
      message: "Skills must be a non-empty array",
      statusCode: 400,
    });

    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.redisDel).not.toHaveBeenCalled();
  });
});

describe("closeJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.redisDel.mockResolvedValue(1);
  });

  it("closes an open job and invalidates the jobs cache", async () => {
    mocks.findById.mockResolvedValue(job);

    mocks.updateStatus.mockResolvedValue({
      ...job,
      status: JobStatus.CLOSED,
    });

    const result = await closeJob(user, "job-123");

    expect(mocks.findById).toHaveBeenCalledWith("job-123");

    expect(mocks.updateStatus).toHaveBeenCalledWith(
      "job-123",
      JobStatus.CLOSED
    );

    expect(result.status).toBe(JobStatus.CLOSED);

    expect(mocks.redisDel).toHaveBeenCalledWith(["cache:jobs:org-123"]);
  });

  it("throws a 404 error when the job does not exist", async () => {
    mocks.findById.mockResolvedValue(null);

    await expect(closeJob(user, "missing-job")).rejects.toMatchObject({
      message: "Job not found",
      statusCode: 404,
    });

    expect(mocks.updateStatus).not.toHaveBeenCalled();
    expect(mocks.redisDel).not.toHaveBeenCalled();
  });

  it("rejects a job belonging to another organization", async () => {
    mocks.findById.mockResolvedValue({
      ...job,
      organizationId: "another-org",
    });

    await expect(closeJob(user, "job-123")).rejects.toMatchObject({
      message: "Access denied. Job belongs to another organization",
      statusCode: 403,
    });

    expect(mocks.updateStatus).not.toHaveBeenCalled();
    expect(mocks.redisDel).not.toHaveBeenCalled();
  });

  it("rejects a job that is already closed", async () => {
    mocks.findById.mockResolvedValue({
      ...job,
      status: JobStatus.CLOSED,
    });

    await expect(closeJob(user, "job-123")).rejects.toMatchObject({
      message: "Job is already closed",
      statusCode: 400,
    });

    expect(mocks.updateStatus).not.toHaveBeenCalled();
    expect(mocks.redisDel).not.toHaveBeenCalled();
  });
});

describe("reopenJob", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.redisDel.mockResolvedValue(1);
    });

    it("reopens a closed job and invalidates the jobs cache", async () => {
        mocks.findById.mockResolvedValue({
            ...job,
            status: JobStatus.CLOSED,
        });

        mocks.updateStatus.mockResolvedValue({
            ...job,
            status: JobStatus.OPEN,
        });

        const result = await reopenJob(user, "job-123");

        expect(mocks.findById).toHaveBeenCalledWith("job-123");

        expect(mocks.updateStatus).toHaveBeenCalledWith(
            "job-123",
            JobStatus.OPEN
        );

        expect(result.status).toBe(JobStatus.OPEN);

        expect(mocks.redisDel).toHaveBeenCalledWith(["cache:jobs:org-123"]);
    });

    it("throws a 404 error when the job does not exist", async() => {
        mocks.findById.mockResolvedValue(null);

        await expect(reopenJob(user, "missing-job")).rejects.toMatchObject({
            message: "Job not found",
            statusCode: 404,
        });

        expect(mocks.updateStatus).not.toHaveBeenCalled();
        expect(mocks.redisDel).not.toHaveBeenCalled();
    });

    it("rejects a job belonging to another organization", async() => {
        mocks.findById.mockResolvedValue({
            ...job,
            status: JobStatus.CLOSED,
            organizationId: "another-org"
        });

        await expect(reopenJob(user, "job-123")).rejects.toMatchObject({
            message: "Access denied. Job belongs to another organization",
            statusCode: 403,
        });

        expect(mocks.updateStatus).not.toHaveBeenCalled();
        expect(mocks.redisDel).not.toHaveBeenCalled();
    });

    it("rejects a job that is already open", async() => {
        mocks.findById.mockResolvedValue({
            ...job,
            status: JobStatus.OPEN,
        });

        await expect(reopenJob(user, "job-123")).rejects.toMatchObject({
            message: "Job is already open",
            statusCode: 400,
        });

        expect(mocks.updateStatus).not.toHaveBeenCalled();
        expect(mocks.redisDel).not.toHaveBeenCalled();
    });
});