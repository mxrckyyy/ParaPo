import { describe, expect, it } from "vitest";
import { tallyVotes } from "./votes";

describe("tallyVotes", () => {
  const rows = [
    { user_id: "a", value: 1 as const },
    { user_id: "b", value: 1 as const },
    { user_id: "c", value: -1 as const },
  ];

  it("counts up/down and finds the caller's vote", () => {
    expect(tallyVotes(rows, "c")).toEqual({ up: 2, down: 1, mine: -1 });
  });

  it("returns mine=null for guests and strangers", () => {
    expect(tallyVotes(rows, null).mine).toBe(null);
    expect(tallyVotes(rows, "zzz").mine).toBe(null);
  });

  it("handles empty input", () => {
    expect(tallyVotes([], "a")).toEqual({ up: 0, down: 0, mine: null });
  });

  it("ignores malformed values instead of crashing", () => {
    expect(tallyVotes([{ user_id: "x", value: 7 } as never], null)).toEqual({ up: 0, down: 0, mine: null });
  });
});
