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

describe("createListController error branches", () => {
  it("relays AppError status/message", async () => {
    const listService = jest
      .fn()
      .mockRejectedValue(new AppError("Custom failure", 422));
    const controller = createListController(listService);
    const req = { query: { limit: 10, page: 1 } } as unknown as Request;
    const res = mockRes();

    await controller(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Custom failure",
    });
  });

  it("returns 500 + generic message for unexpected errors", async () => {
    const listService = jest.fn().mockRejectedValue(new Error("raw db error"));
    const controller = createListController(listService);
    const req = { query: { limit: 10, page: 1 } } as unknown as Request;
    const res = mockRes();

    await controller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

describe("createGetController error branches", () => {
  it("relays AppError status/message", async () => {
    const getService = jest
      .fn()
      .mockRejectedValue(new AppError("Not found", 404));
    const controller = createGetController(getService);
    const req = { params: { bgg_id: [1, 2] } } as unknown as Request;
    const res = mockRes();

    await controller(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Not found",
    });
  });

  it("returns 500 + generic message for unexpected errors", async () => {
    const getService = jest.fn().mockRejectedValue(new Error("raw db error"));
    const controller = createGetController(getService);
    const req = { params: { bgg_id: [1] } } as unknown as Request;
    const res = mockRes();

    await controller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});
