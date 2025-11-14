import request from "supertest";
import app from "../app";

describe("Healthcheck API", () => {
  it("should return 200 OK with backend running message", async () => {
    const res = await request(app).get("/api/health");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("message", "Joblelo backend is running");
  });

  it("should return 404 Not Found for a non-existent route", async () => {
    const res = await request(app).get("/api/non-existent-route");
    expect(res.statusCode).toBe(404);
  });
});
