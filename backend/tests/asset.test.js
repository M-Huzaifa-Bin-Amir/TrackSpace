// tests/asset.test.js
import request from "supertest";
import path from "path";
import fs from "fs";

import app from "../src/app.js";
import { createTestUser } from "./auth.helper.js";

describe("ASSET API", () => {
  let admin;
  let user;
  let assetId; // will be set for each test

  //
  // ──────────────────────────────────────────────────────────────
  //  CREATE TEST USERS (run once)
  // ──────────────────────────────────────────────────────────────
  //
  beforeAll(async () => {
    admin = await createTestUser("admin");
    user = await createTestUser("user");
  });

  //
  // ──────────────────────────────────────────────────────────────
  //  CREATE NEW ASSET BEFORE EACH TEST
  // ──────────────────────────────────────────────────────────────
  //
  beforeEach(async () => {
    const res = await request(app)
      .post("/api/assets")
      .set("Authorization", `Bearer ${admin.token}`)
      .send({
        serialNo: "SN123",
        model: "Dell XPS",
        assetSubtype: "Hardware",
        status: "Available",
        category: "Laptop",
      });

    assetId = res.body.asset._id;
  });

  //
  // ──────────────────────────────────────────────────────────────
  //  NEGATIVE: NO TOKEN
  // ──────────────────────────────────────────────────────────────
  //
  it("should reject asset creation when no token is provided", async () => {
    const res = await request(app)
      .post("/api/assets")
      .send({
        serialNo: "NOAUTH",
        assetSubtype: "Hardware",
      });

    expect(res.statusCode).toBe(401);
  });

  //
  // ──────────────────────────────────────────────────────────────
  //  NEGATIVE: NORMAL USER CANNOT CREATE
  // ──────────────────────────────────────────────────────────────
  //
  it("should reject asset creation for normal user", async () => {
    const res = await request(app)
      .post("/api/assets")
      .set("Authorization", `Bearer ${user.token}`)
      .send({
        serialNo: "SN456",
        assetSubtype: "Hardware",
      });

    expect(res.statusCode).toBe(403);
  });

  //
  // ──────────────────────────────────────────────────────────────
  //  NEGATIVE: MISSING FIELDS
  // ──────────────────────────────────────────────────────────────
  //
  it("should fail when serialNo or assetSubtype is missing", async () => {
    const res = await request(app)
      .post("/api/assets")
      .set("Authorization", `Bearer ${admin.token}`)
      .send({
        model: "Bad Asset",
        assetSubtype: "",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("serialNo and assetSubtype are required");
  });

  //
  // ──────────────────────────────────────────────────────────────
  //  POSITIVE: LIST ASSETS
  // ──────────────────────────────────────────────────────────────
  //
  it("should list assets for authenticated user", async () => {
    const res = await request(app)
      .get("/api/assets")
      .set("Authorization", `Bearer ${user.token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  //
  // ──────────────────────────────────────────────────────────────
  //  POSITIVE: GET ASSET BY ID
  // ──────────────────────────────────────────────────────────────
  //
  it("should get single asset by id", async () => {
    const res = await request(app)
      .get(`/api/assets/${assetId}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.asset._id).toBe(assetId);
  });

  //
  // ──────────────────────────────────────────────────────────────
  //  NEGATIVE: INVALID OBJECT ID
  // ──────────────────────────────────────────────────────────────
  //
  it("should handle invalid asset id format gracefully", async () => {
    const res = await request(app)
      .get("/api/assets/12345")
      .set("Authorization", `Bearer ${user.token}`);

    expect([400, 500]).toContain(res.statusCode);
  });

  //
  // ──────────────────────────────────────────────────────────────
  //  POSITIVE: UPDATE ASSET (ADMIN ONLY)
  // ──────────────────────────────────────────────────────────────
  //
  it("admin should update asset status", async () => {
    const res = await request(app)
      .patch(`/api/assets/${assetId}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ status: "Assigned" });

    expect(res.statusCode).toBe(200);
    expect(res.body.asset.status).toBe("Assigned");
  });

  //
  // ──────────────────────────────────────────────────────────────
  //  NEGATIVE: NORMAL USER CANNOT UPDATE
  // ──────────────────────────────────────────────────────────────
  //
  it("normal user should NOT be allowed to update asset", async () => {
    const res = await request(app)
      .patch(`/api/assets/${assetId}`)
      .set("Authorization", `Bearer ${user.token}`)
      .send({ status: "Retired" });

    expect(res.statusCode).toBe(403);
  });

  //
  // ──────────────────────────────────────────────────────────────
  //  IMAGE UPLOAD TEST (multipart/form-data)
  // ──────────────────────────────────────────────────────────────
  //
  it("admin should upload an image with the asset", async () => {
    const filePath = path.join(process.cwd(), "tests", "test-image.jpg");

    // create dummy fake image
    fs.writeFileSync(filePath, "fake image content");

    const res = await request(app)
      .post("/api/assets")
      .set("Authorization", `Bearer ${admin.token}`)
      .field("serialNo", "IMG123")
      .field("model", "Image Laptop")
      .field("assetSubtype", "Hardware")
      .attach("image", filePath);

    expect(res.statusCode).toBe(201);
    expect(res.body.asset.imageUrl).toBeDefined();
    expect(res.body.asset.imageUrl).toContain("/uploads/");

    fs.unlinkSync(filePath); // cleanup
  });

  //
  // ──────────────────────────────────────────────────────────────
  //  DELETE ASSET (ADMIN ONLY)
  // ──────────────────────────────────────────────────────────────
  //
  it("admin should delete asset", async () => {
    const res = await request(app)
      .delete(`/api/assets/${assetId}`)
      .set("Authorization", `Bearer ${admin.token}`);

    expect(res.statusCode).toBe(204);
  });

  //
  // ──────────────────────────────────────────────────────────────
  //  NEGATIVE: DELETE NON-EXISTENT ASSET
  // ──────────────────────────────────────────────────────────────
  //
  it("should return 404 when deleting non-existent asset", async () => {
    const fakeId = "64b8e2b28f9d7c0012e7a888";

    const res = await request(app)
      .delete(`/api/assets/${fakeId}`)
      .set("Authorization", `Bearer ${admin.token}`);

    expect(res.statusCode).toBe(404);
  });
});
