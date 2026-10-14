import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { SERVER_CONFIG } from "../config/server.config.js";

const serviceMocks = vi.hoisted(() => ({
  getOrganizationJobs: vi.fn(),
  createJob: vi.fn(),
  closeJob: vi.fn(),
  reopenJob: vi.fn(),
  getJobById: vi.fn(),
  updateJob: vi.fn(),
  deleteJob: vi.fn(),
}));

vi.mock("../services/job.service.js", () => ({
  getOrganizationJobs: serviceMocks.getOrganizationJobs,
  createJob: serviceMocks.createJob,
  closeJob: serviceMocks.closeJob,
  reopenJob: serviceMocks.reopenJob,
  getJobById: serviceMocks.getJobById,
  updateJob: serviceMocks.updateJob,
  deleteJob: serviceMocks.deleteJob,
}));

import app from "../app.js";

const accessToken = (role: string) =>
  jwt.sign(
    {
      userId: "user-123",
      role,
      organizationId: "org-123",
    },
    SERVER_CONFIG.JWT_ACCESS_SECRET || "default_access_secret"
  );

describe("Job API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/jobs", () => {
    it("returns 401 when the user is not authenticated", async () => {
      const response = await request(app)
        .get("/api/v1/jobs");

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        message: "Unauthorized request",
      });
    });

    it("returns 401 when the access token is invalid", async () => {
      const response = await request(app)
        .get("/api/v1/jobs")
        .set("Cookie", "accessToken=invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        message: "Unauthorized request",
      });
    });

    it("returns 403 when the user does not have an allowed role", async () => {
      const response = await request(app)
        .get("/api/v1/jobs")
        .set("Cookie", `accessToken=${accessToken("USER")}`);

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        success: false,
        message: "Access denied for role: USER",
      });
    });

    it("returns jobs for an authenticated admin", async () => {
      const jobs = [
        {
          id: "job-123",
          title: "MERN Developer",
          status: "OPEN",
        },
      ];

      serviceMocks.getOrganizationJobs.mockResolvedValueOnce(jobs);

      const response = await request(app)
        .get("/api/v1/jobs")
        .set("Cookie", `accessToken=${accessToken("ADMIN")}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: jobs,
        message: "Jobs retrieved successfully",
      });
      expect(serviceMocks.getOrganizationJobs).toHaveBeenCalledWith("org-123");
    });
  });

  describe("POST /api/v1/jobs", () => {
    it("returns 400 when the job payload fails Zod validation", async () => {
      const response = await request(app)
        .post("/api/v1/jobs")
        .set("Cookie", `accessToken=${accessToken("RECRUITER")}`)
        .send({
          title: "JS",
          description: "Too short",
          skills: [],
          experience: "",
          location: "",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Validation error:");
      expect(response.body.message).toContain(
        "title: Title must be at least 3 characters long"
      );
      expect(response.body.message).toContain(
        "description: Description must be at least 10 characters long"
      );
      expect(response.body.message).toContain(
        "skills: At least one skill is required"
      );
      expect(response.body.message).toContain("experience: Experience is required");
      expect(response.body.message).toContain("location: Location is required");
    });

    it("creates a job for an authenticated recruiter", async () => {
      const jobData = {
        title: "MERN Developer",
        description: "A developer position",
        skills: ["React", "Node.js"],
        experience: "1-2 years",
        location: "Remote",
      };
      const createdJob = {
        id: "job-123",
        ...jobData,
        status: "OPEN",
      };

      serviceMocks.createJob.mockResolvedValueOnce(createdJob);

      const response = await request(app)
        .post("/api/v1/jobs")
        .set("Cookie", `accessToken=${accessToken("RECRUITER")}`)
        .send(jobData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        data: createdJob,
        message: "Job created successfully",
      });
      expect(serviceMocks.createJob).toHaveBeenCalledWith(
        {
          id: "user-123",
          role: "RECRUITER",
          organizationId: "org-123",
        },
        jobData
      );
    });
  });

  describe("PUT /api/v1/jobs/:jobId", () => {
    it("returns 400 when the update payload fails Zod validation", async () => {
      const response = await request(app)
        .put("/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000")
        .set("Cookie", `accessToken=${accessToken("ADMIN")}`)
        .send({
          title: "AB",
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: "Validation error: title: Title must be at least 3 characters long",
      });
    });

    it("updates a job for an authenticated admin", async () => {
      const jobId = "550e8400-e29b-41d4-a716-446655440000";
      const updateData = {
        title: "Senior MERN Developer",
      };
      const updatedJob = {
        id: jobId,
        title: updateData.title,
        status: "OPEN",
      };

      serviceMocks.updateJob.mockResolvedValueOnce(updatedJob);

      const response = await request(app)
        .put(`/api/v1/jobs/${jobId}`)
        .set("Cookie", `accessToken=${accessToken("ADMIN")}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: updatedJob,
        message: "Job updated successfully",
      });
      expect(serviceMocks.updateJob).toHaveBeenCalledWith(
        {
          id: "user-123",
          role: "ADMIN",
          organizationId: "org-123",
        },
        jobId,
        updateData
      );
    });
  });

  describe("GET /api/v1/jobs/:jobId", () => {
    it("returns a job for an authenticated admin", async () => {
      const jobId = "550e8400-e29b-41d4-a716-446655440000";
      const job = {
        id: jobId,
        title: "MERN Developer",
        status: "OPEN",
      };

      serviceMocks.getJobById.mockResolvedValueOnce(job);

      const response = await request(app)
        .get(`/api/v1/jobs/${jobId}`)
        .set("Cookie", `accessToken=${accessToken("ADMIN")}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: job,
        message: "Job retrieved successfully",
      });
      expect(serviceMocks.getJobById).toHaveBeenCalledWith(jobId);
    });

    it("returns 400 for an invalid job ID", async () => {
      const response = await request(app)
        .get("/api/v1/jobs/not-a-uuid")
        .set("Cookie", `accessToken=${accessToken("ADMIN")}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Validation error: jobId: Invalid job ID format"
      );
      expect(serviceMocks.getJobById).not.toHaveBeenCalled();
    });

    it("returns 500 when the job service fails", async () => {
      const jobId = "550e8400-e29b-41d4-a716-446655440000";
      serviceMocks.getJobById.mockRejectedValueOnce(new Error("Service failure"));

      const response = await request(app)
        .get(`/api/v1/jobs/${jobId}`)
        .set("Cookie", `accessToken=${accessToken("ADMIN")}`);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        success: false,
        message: "Database operation failed",
      });
    });
  });

  describe("DELETE /api/v1/jobs/:jobId", () => {
    it("deletes a job for an authenticated recruiter", async () => {
      const jobId = "550e8400-e29b-41d4-a716-446655440000";
      const deletedJob = {
        id: jobId,
        title: "MERN Developer",
      };

      serviceMocks.deleteJob.mockResolvedValueOnce(deletedJob);

      const response = await request(app)
        .delete(`/api/v1/jobs/${jobId}`)
        .set("Cookie", `accessToken=${accessToken("RECRUITER")}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: deletedJob,
        message: "Job deleted successfully",
      });
      expect(serviceMocks.deleteJob).toHaveBeenCalledWith(
        {
          id: "user-123",
          role: "RECRUITER",
          organizationId: "org-123",
        },
        jobId
      );
    });

    it("returns 400 for an invalid job ID", async () => {
      const response = await request(app)
        .delete("/api/v1/jobs/not-a-uuid")
        .set("Cookie", `accessToken=${accessToken("ADMIN")}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Validation error: jobId: Invalid job ID format"
      );
      expect(serviceMocks.deleteJob).not.toHaveBeenCalled();
    });

    it("returns 500 when the delete service fails", async () => {
      const jobId = "550e8400-e29b-41d4-a716-446655440000";
      serviceMocks.deleteJob.mockRejectedValueOnce(new Error("Service failure"));

      const response = await request(app)
        .delete(`/api/v1/jobs/${jobId}`)
        .set("Cookie", `accessToken=${accessToken("ADMIN")}`);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        success: false,
        message: "Database operation failed",
      });
    });
  });

  describe("PATCH /api/v1/jobs/:jobId/close", () => {
    it("closes a job for an authenticated admin", async () => {
      const jobId = "550e8400-e29b-41d4-a716-446655440000";
      const closedJob = {
        id: jobId,
        title: "MERN Developer",
        status: "CLOSED",
      };

      serviceMocks.closeJob.mockResolvedValueOnce(closedJob);

      const response = await request(app)
        .patch(`/api/v1/jobs/${jobId}/close`)
        .set("Cookie", `accessToken=${accessToken("ADMIN")}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: closedJob,
        message: "Job closed successfully",
      });
      expect(serviceMocks.closeJob).toHaveBeenCalledWith(
        {
          id: "user-123",
          role: "ADMIN",
          organizationId: "org-123",
        },
        jobId
      );
    });

    it("returns 400 for an invalid job ID", async () => {
      const response = await request(app)
        .patch("/api/v1/jobs/not-a-uuid/close")
        .set("Cookie", `accessToken=${accessToken("ADMIN")}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Validation error: jobId: Invalid job ID format"
      );
      expect(serviceMocks.closeJob).not.toHaveBeenCalled();
    });

    it("returns 500 when the close service fails", async () => {
      const jobId = "550e8400-e29b-41d4-a716-446655440000";
      serviceMocks.closeJob.mockRejectedValueOnce(new Error("Service failure"));

      const response = await request(app)
        .patch(`/api/v1/jobs/${jobId}/close`)
        .set("Cookie", `accessToken=${accessToken("ADMIN")}`);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        success: false,
        message: "Database operation failed",
      });
    });
  });

  describe("PATCH /api/v1/jobs/:jobId/reopen", () => {
    it("reopens a job for an authenticated recruiter", async () => {
      const jobId = "550e8400-e29b-41d4-a716-446655440000";
      const reopenedJob = {
        id: jobId,
        title: "MERN Developer",
        status: "OPEN",
      };

      serviceMocks.reopenJob.mockResolvedValueOnce(reopenedJob);

      const response = await request(app)
        .patch(`/api/v1/jobs/${jobId}/reopen`)
        .set("Cookie", `accessToken=${accessToken("RECRUITER")}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: reopenedJob,
        message: "Job reopened successfully",
      });
      expect(serviceMocks.reopenJob).toHaveBeenCalledWith(
        {
          id: "user-123",
          role: "RECRUITER",
          organizationId: "org-123",
        },
        jobId
      );
    });

    it("returns 400 for an invalid job ID", async () => {
      const response = await request(app)
        .patch("/api/v1/jobs/not-a-uuid/reopen")
        .set("Cookie", `accessToken=${accessToken("ADMIN")}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Validation error: jobId: Invalid job ID format"
      );
      expect(serviceMocks.reopenJob).not.toHaveBeenCalled();
    });

    it("returns 500 when the reopen service fails", async () => {
      const jobId = "550e8400-e29b-41d4-a716-446655440000";
      serviceMocks.reopenJob.mockRejectedValueOnce(new Error("Service failure"));

      const response = await request(app)
        .patch(`/api/v1/jobs/${jobId}/reopen`)
        .set("Cookie", `accessToken=${accessToken("ADMIN")}`);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        success: false,
        message: "Database operation failed",
      });
    });
  });
});