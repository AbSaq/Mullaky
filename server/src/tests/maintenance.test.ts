import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { updateMaintenanceStatus } from "../controllers/maintenance.controller.js";
import { firestore } from "../config/firebase.js";

// Mock the Firestore Admin dependencies completely
vi.mock("../config/firebase.js", () => ({
  firestore: {
    collection: vi.fn(),
  },
}));
describe("Backend Maintenance Unit System Operations", () => {
  let mockReq: any;
  let mockRes: any;
  // @ts-ignore
  let mockUpdate: vi.Mock;

  beforeEach(() => {
    mockUpdate = vi.fn();
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  it("should fail with status code 403 if a standard resident attempts to transition task lanes", async () => {
    mockReq = {
      params: { buildingId: "b-123", requestId: "r-999" },
      body: { status: "in-progress" },
      user: { uid: "user-456", role: "user" }, // Standard Tenant role vector
    };

    await updateMaintenanceStatus(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Privileged access needed to shift task lane vectors.",
    });
  });

  it("should allow building owners to successfully transition state parameters", async () => {
    mockReq = {
      params: { buildingId: "b-123", requestId: "r-999" },
      body: { status: "in-progress" },
      user: { uid: "owner-789", role: "owner" }, // Authorized building owner vector
    };

    // Simulate database lookup mock sequence
    const mockDocGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({ buildingId: "b-123" }),
    });

    vi.mocked(firestore.collection).mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: mockDocGet,
        update: mockUpdate,
      }),
    } as any);

    await updateMaintenanceStatus(mockReq, mockRes);

    expect(mockUpdate).toHaveBeenCalledWith({ status: "in-progress" });
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
