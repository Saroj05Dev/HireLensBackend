
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobStatus } from "@prisma/client";

const mocks = vi.hoisted(() => ({
  findById: vi.fn(),
  updateStatus: vi.fn(),
  redisDel: vi.fn(),
}));

vi.mock("../repositories/job.repository.js", () => ({
  create: vi.fn(),
  findByOrganizationId: vi.fn(),
  findById: mocks.findById,
  updateStatus: mocks.updateStatus,
  update: vi.fn(),
  deleteById: vi.fn(),
}));

vi.mock("../config/redis.js", () => ({
  redis: {
    del: mocks.redisDel,
  },
}));

import { closeJob } from "../services/job.service.js";

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

    expect(mocks.redisDel).toHaveBeenCalledWith(
      "cache:jobs:org-123"
    );
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
