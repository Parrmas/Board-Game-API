import { Response } from "express";
import { sendSuccess, sendError } from "../src/utils/response.util";

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("sendSuccess", () => {
  it("defaults to status 200 and wraps data as { success: true, data }", () => {
    const res = mockRes();
    sendSuccess(res, { foo: "bar" });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { foo: "bar" },
    });
  });

  it("uses a custom status code when provided", () => {
    const res = mockRes();
    sendSuccess(res, { id: "1" }, 201);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: "1" } });
  });
});

describe("sendError", () => {
  it("wraps a message as { success: false, message } with the given status", () => {
    const res = mockRes();
    sendError(res, 404, "Not found");

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Not found",
    });
  });
});
