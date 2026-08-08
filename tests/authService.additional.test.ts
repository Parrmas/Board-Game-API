import * as AuthService from "../src/module/auth/auth.service";
import User from "../src/module/auth/auth.model";
import jwt from "jsonwebtoken";

describe("AuthService additional branches", () => {
  const baseUser = {
    email: "extra@example.com",
    password: "password123",
    username: "extrauser",
    firstName: "Extra",
    lastName: "User",
  };

  describe("register", () => {
    it("rejects a duplicate email", async () => {
      await AuthService.register(baseUser);
      await expect(
        AuthService.register({ ...baseUser, username: "different" }),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Email is already registered",
      });
    });

    it("rejects a duplicate username with a different email", async () => {
      await AuthService.register(baseUser);
      await expect(
        AuthService.register({ ...baseUser, email: "other@example.com" }),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Username is already taken",
      });
    });
  });

  describe("refreshAccessToken", () => {
    it("rejects a garbage/invalid token", async () => {
      await expect(
        AuthService.refreshAccessToken("not.a.valid.jwt"),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("rejects a well-formed token for a user that no longer exists", async () => {
      const fakePayload = {
        userId: "does-not-exist",
        email: "ghost@example.com",
      };
      const token = await AuthService.generateRefreshToken(fakePayload);
      await expect(AuthService.refreshAccessToken(token)).rejects.toMatchObject(
        {
          statusCode: 401,
        },
      );
    });

    it("rejects a valid token whose hash no longer matches stored hash (reuse/rotation)", async () => {
      await AuthService.register(baseUser);
      const { refreshToken } = await AuthService.login({
        email: baseUser.email,
        password: baseUser.password,
      });

      // First use rotates the token
      await AuthService.refreshAccessToken(refreshToken);

      // Second use of the same (now stale) token must fail
      await expect(
        AuthService.refreshAccessToken(refreshToken),
      ).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });

  describe("verifyToken", () => {
    it("wraps a non-AppError failure (bad signature) into an AppError with cause", async () => {
      const tokenSignedWithWrongSecret = jwt.sign(
        { userId: "x", email: "x@example.com" },
        "wrong-secret",
      );
      await expect(
        AuthService.verifyToken(tokenSignedWithWrongSecret),
      ).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid or expired token",
      });
    });
  });

  describe("saved games — user not found branches", () => {
    it("getSavedGame throws when user does not exist", async () => {
      await expect(
        AuthService.getSavedGame("nonexistent-id"),
      ).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("addSavedGame throws when user does not exist", async () => {
      await expect(
        AuthService.addSavedGame("nonexistent-id", 1),
      ).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("removeSavedGame throws when user does not exist", async () => {
      await expect(
        AuthService.removeSavedGame("nonexistent-id", 1),
      ).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("isUserLoggedIn", () => {
    it("returns false for a nonexistent user", async () => {
      await expect(AuthService.isUserLoggedIn("nonexistent-id")).resolves.toBe(
        false,
      );
    });

    it("returns true after login, false after logout", async () => {
      const registered = await AuthService.register(baseUser);
      const user = await User.findOne({ email: baseUser.email });
      expect(user).toBeTruthy();

      await AuthService.login({
        email: baseUser.email,
        password: baseUser.password,
      });
      await expect(AuthService.isUserLoggedIn(user!.id)).resolves.toBe(true);

      const token = await AuthService.generateToken({
        userId: user!.id,
        email: user!.email,
      });
      await AuthService.logout(token);
      await expect(AuthService.isUserLoggedIn(user!.id)).resolves.toBe(false);

      void registered;
    });
  });
});
