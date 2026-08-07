import * as AuthService from "../src/module/auth/auth.service";

describe("AuthService token blacklist (bypassing HTTP layer)", () => {
  it("verifyToken rejects a token after logout blacklists it", async () => {
    const payload = { userId: "test-user-id", email: "blacklist@example.com" };
    const token = await AuthService.generateToken(payload);

    // sanity check: token is valid before logout
    await expect(AuthService.verifyToken(token)).resolves.toBeDefined();

    await AuthService.logout(token);

    // should now throw
    await expect(AuthService.verifyToken(token)).rejects.toThrow();
  });
});
