import { describe, expect, it } from "vitest";
import { redactText } from "../src/redact.js";

const who = { home: "C:\\Users\\sam", username: "sam" };

describe("redactText", () => {
  it("replaces the home directory", () => {
    expect(redactText("C:\\Users\\sam\\app\\node.exe", who)).toBe(
      "<home>\\app\\node.exe",
    );
  });

  it("replaces a home directory using forward slashes", () => {
    expect(redactText("C:/Users/sam/app", who)).toBe("<home>/app");
  });

  it("ignores case in home paths", () => {
    expect(redactText("c:\\users\\SAM\\x", who)).toBe("<home>\\x");
  });

  it("replaces the username as a whole word", () => {
    expect(redactText("owner=sam;", who)).toBe("owner=<user>;");
  });

  it("does not damage words containing the username", () => {
    expect(redactText("sample samsung", who)).toBe("sample samsung");
  });

  it("handles regex characters in the username", () => {
    const odd = { home: "/home/a.b", username: "a.b" };
    expect(redactText("a.b axb /home/a.b/x", odd)).toBe("<user> axb <home>/x");
  });

  it("does nothing when the identity is empty", () => {
    expect(redactText("text", { home: "", username: "" })).toBe("text");
  });
});
