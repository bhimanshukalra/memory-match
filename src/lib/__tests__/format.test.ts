import { formatTime } from "../format";

describe("formatTime", () => {
  it.each([
    [0, "0:00"],
    [5, "0:05"],
    [59, "0:59"],
    [60, "1:00"],
    [75, "1:15"],
    [3599, "59:59"],
  ])("formats %i seconds as %s", (seconds, expected) => {
    expect(formatTime(seconds)).toBe(expected);
  });
});
