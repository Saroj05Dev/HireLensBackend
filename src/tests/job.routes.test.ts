import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Job API", () => {
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
  });
});