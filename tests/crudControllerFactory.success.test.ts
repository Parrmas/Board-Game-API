import { Request, Response } from "express";
import {
  createGetController,
  createListController,
} from "../src/utils/crudController.factory";

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe("createListController success", () => {
  it("calls the service with limit/page and returns 200", async () => {
    const data = [{ name: "A" }];
    const service = jest.fn().mockResolvedValue({ data });
    const controller = createListController(service);
    const req = { query: { limit: 10, page: 1 } } as unknown as Request;
    const res = mockRes();

    await controller(req, res);

    expect(service).toHaveBeenCalledWith(10, 1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { data },
    });
  });
});

describe("createGetController success", () => {
  it("calls the service with parsed bgg_id array and returns 200", async () => {
    const service = jest.fn().mockResolvedValue({ data: [{ bgg_id: 1 }] });
    const controller = createGetController(service);
    const req = { params: { bgg_id: [1, 2] } } as unknown as Request;
    const res = mockRes();

    await controller(req, res);

    expect(service).toHaveBeenCalledWith([1, 2]);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
