import { test } from "node:test";
import assert from "node:assert/strict";
import { dateKey, validDate, progress, todayTasks } from "../src/model.ts";
test("date validation rejects impossible and malformed dates", () => {
  for (const value of ["2026-02-29", "2026-13-01", "11/08/2026", "2026-04-31"])
    assert.equal(validDate(value), false);
  for (const value of ["", "2028-02-29", "2026-11-08"])
    assert.equal(validDate(value), true);
});
test("local date and milestone progress", () => {
  assert.equal(dateKey(new Date(2026, 10, 8, 23)), "2026-11-08");
  assert.equal(progress([]), 0);
  assert.equal(progress([{ done: 1 }, { done: 0 }, { done: 1 }]), 67);
});
test("today includes overdue and unscheduled open work but excludes future and old completed work", () => {
  const dates = [
    ["2026-11-08", 0],
    ["2026-11-07", 0],
    ["", 0],
    ["2026-11-09", 0],
    ["2026-11-07", 1],
    ["2026-11-08", 1],
  ] as const;
  const tasks = dates.map(([due, done], i) => ({
    id: i,
    title: "Task",
    details: "",
    priority: "Medium",
    due,
    done,
  }));
  assert.deepEqual(
    todayTasks(tasks, "2026-11-08").map((t) => t.id),
    [0, 1, 2, 5],
  );
});
