// tests/assetRequest.test.js
import request from "supertest";
import app from "../src/app.js";
import { createTestUser } from "./auth.helper.js";

describe("ASSET REQUEST API", () => {
  let admin;
  let user;
  let requestId;

  beforeAll(async () => {
    admin = await createTestUser("admin");
    user = await createTestUser("user");
  });

  // ------ NEGATIVE: MISSING requestType ------
  it("should reject asset request creation without requestType", async () => {
    const res = await request(app)
      .post("/api/asset-requests")
      .set("Authorization", `Bearer ${user.token}`)
      .send({
        justification: "Missing type",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("requestType is required");
  });

  // ------ POSITIVE: CREATE REQUEST ------
  it("user should create asset request", async () => {
    const res = await request(app)
      .post("/api/asset-requests")
      .set("Authorization", `Bearer ${user.token}`)
      .send({
        requestType: "New Laptop",
        justification: "Need a laptop for development",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.request.status).toBe("Pending");
    requestId = res.body.request._id;
  });

  // ------ POSITIVE: USER LISTS OWN REQUESTS ------
  it("user should only see their own requests", async () => {
    const res = await request(app)
      .get("/api/asset-requests")
      .set("Authorization", `Bearer ${user.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  // ------ POSITIVE: ADMIN SEES ALL REQUESTS ------
  it("admin should see all requests", async () => {
    const res = await request(app)
      .get("/api/asset-requests")
      .set("Authorization", `Bearer ${admin.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  // ------ NEGATIVE: UNAUTHENTICATED CANNOT LIST ------
  it("should reject listing requests without token", async () => {
    const res = await request(app).get("/api/asset-requests");
    expect(res.statusCode).toBe(401);
  });

  // ------ POSITIVE: ADMIN CAN UPDATE STATUS ------
  it("admin should update asset request", async () => {
    const res = await request(app)
      .patch(`/api/asset-requests/${requestId}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ status: "Approved" });

    expect(res.statusCode).toBe(200);
    expect(res.body.request.status).toBe("Approved");
    expect(res.body.request.handledBy).toBeDefined();
  });

  // ------ NEGATIVE: USER CANNOT UPDATE REQUEST ------
  it("user should NOT be able to update request status", async () => {
    const res = await request(app)
      .patch(`/api/asset-requests/${requestId}`)
      .set("Authorization", `Bearer ${user.token}`)
      .send({ status: "Denied" });

    expect(res.statusCode).toBe(403);
  });

  // ------ NEGATIVE: INVALID REQUEST ID FORMAT ------
  it("should handle invalid request id format", async () => {
    const res = await request(app)
      .get("/api/asset-requests/12345")
      .set("Authorization", `Bearer ${admin.token}`);

    expect([400, 500]).toContain(res.statusCode);
  });

  // ------ NEGATIVE: USER CANNOT DELETE REQUEST ------
  it("user should NOT be able to delete a request", async () => {
    const res = await request(app)
      .delete(`/api/asset-requests/${requestId}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(res.statusCode).toBe(403);
  });

  // ------ POSITIVE: ADMIN CAN DELETE REQUEST ------
  it("admin should delete asset request", async () => {
    const res = await request(app)
      .delete(`/api/asset-requests/${requestId}`)
      .set("Authorization", `Bearer ${admin.token}`);

    expect(res.statusCode).toBe(204);
  });
});
