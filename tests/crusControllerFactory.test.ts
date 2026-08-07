import { Request, Response } from "express";
import {
  createListController,
  createGetController,
} from "../src/utils/crudController.factory";
import { AppError } from "../src/utils/appError.util";

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("createListController", () => {
  it("calls the service with limit/page from req.query and returns 200", async () => {
    const service = jest.fn().mockResolvedValue({ data: [{ name: "A" }] });
    const controller = createListController(service);
    const req = { query: { limit: 10, page: 1 } } as unknown as Request;
    const res = mockRes();

    await controller(req, res);

    expect(service).toHaveBeenCalledWith(10, 1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { data: [{ name: "A" }] },
    });
  });

  it("relays AppError status and message", async () => {
    const service = jest.fn().mockRejectedValue(new AppError("nope", 404));
    const controller = createListController(service);
    const req = { query: { limit: 10, page: 1 } } as unknown as Request;
    const res = mockRes();

    await controller(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "nope" });
  });

  it("falls back to 500 for unexpected errors", async () => {
    const service = jest.fn().mockRejectedValue(new Error("boom"));
    const controller = createListController(service);
    const req = { query: { limit: 10, page: 1 } } as unknown as Request;
    const res = mockRes();
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await controller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });

    consoleSpy.mockRestore();
  });
});

describe("createGetController", () => {
  it("calls the service with parsed bgg_id array and returns 200", async () => {
    const service = jest.fn().mockResolvedValue({ data: [{ bgg_id: 1 }] });
    const controller = createGetController(service);
    const req = { params: { bgg_id: [1, 2] } } as unknown as Request;
    const res = mockRes();

    await controller(req, res);

    expect(service).toHaveBeenCalledWith([1, 2]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("relays AppError status and message", async () => {
    const service = jest.fn().mockRejectedValue(new AppError("bad id", 400));
    const controller = createGetController(service);
    const req = { params: { bgg_id: [999] } } as unknown as Request;
    const res = mockRes();

    await controller(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "bad id",
    });
  });
});
