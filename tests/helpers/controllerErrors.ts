import request from "supertest";
import { Application } from "express";
import { AppError } from "../../src/utils/appError.util";

interface ErrorBranchCase {
  label: string;
  method: "get" | "post" | "put" | "delete";
  url: string;
  getSpy: () => jest.SpyInstance;
  getHeaders?: () => Record<string, string>;
  body?: Record<string, unknown>;
}

export const testControllerErrorBranches = (
  app: Application,
  { label, method, url, getSpy, getHeaders, body }: ErrorBranchCase,
) => {
  describe(`${label} error handling`, () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    const send = () => {
      let req = request(app)[method](url);
      const headers = getHeaders?.() ?? {};
      Object.entries(headers).forEach(([k, v]) => {
        req = req.set(k, v);
      });
      if (body) req = req.send(body);
      return req;
    };

    it("relays AppError status/message from the service", async () => {
      getSpy().mockRejectedValueOnce(new AppError("Custom failure", 422));
      const res = await send();
      expect(res.status).toBe(422);
      expect(res.body).toEqual({ success: false, message: "Custom failure" });
    });

    it("returns 500 + generic message for an unexpected non-AppError throw", async () => {
      const rawMessage = "raw internal db error - should never leak";
      getSpy().mockRejectedValueOnce(new Error(rawMessage));
      const res = await send();
      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        success: false,
        message: "Internal server error",
      });
      expect(JSON.stringify(res.body)).not.toContain(rawMessage);
    });
  });
};
