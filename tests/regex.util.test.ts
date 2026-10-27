import { escapeRegex } from "../src/utils/regex.util";

describe("escapeRegex", () => {
  it("escapes regex characters", () => {
    expect(escapeRegex("Catan (2nd ed.)")).toBe("Catan \\(2nd ed\\.\\)");
    expect(escapeRegex(".*+?^${}()|[]\\")).toBe(
      "\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\",
    );
  });

  it("leaves plain strings unchanged", () => {
    expect(escapeRegex("Catan")).toBe("Catan");
  });
});
