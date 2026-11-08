import { URL } from "node:url";
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
test("schema persists CRUD across reopen and cascades deleted goal milestones", () => {
  const dir = mkdtempSync(join(tmpdir(), "dcc-"));
  const path = join(dir, "test.db");
  const source = readFileSync(
    new URL("../src/store.tsx", import.meta.url),
    "utf8",
  );
  const schema = source.match(/export const schema = `([\s\S]*?)`;/)![1];
  let db = new DatabaseSync(path);
  try {
    db.exec(schema);
    db.prepare("INSERT INTO tasks(title,priority,due) VALUES(?,?,?)").run(
      "Plan O'Brien project",
      "High",
      "2026-11-08",
    );
    db.prepare("INSERT INTO notes(title,body,updated) VALUES(?,?,?)").run(
      "Idea",
      "Offline text",
      "2026-11-08",
    );
    db.prepare("INSERT INTO goals(title) VALUES(?)").run("Ship app");
    db.prepare("INSERT INTO milestones(goal_id,title) VALUES(?,?)").run(
      1,
      "MVP",
    );
    db.prepare("UPDATE tasks SET done=1 WHERE id=1").run();
    db.close();
    db = new DatabaseSync(path);
    db.exec(schema);
    assert.equal(db.prepare("SELECT done FROM tasks").get()!.done, 1);
    assert.equal(
      db.prepare("SELECT body FROM notes").get()!.body,
      "Offline text",
    );
    assert.equal(
      db.prepare("SELECT title FROM goals").get()!.title,
      "Ship app",
    );
    db.prepare("UPDATE notes SET body=? WHERE id=1").run("Updated");
    assert.equal(db.prepare("SELECT body FROM notes").get()!.body, "Updated");
    db.prepare("UPDATE milestones SET done=1 WHERE id=1").run();
    assert.equal(db.prepare("SELECT done FROM milestones").get()!.done, 1);
    db.prepare("DELETE FROM goals WHERE id=1").run();
    assert.equal(
      db.prepare("SELECT COUNT(*) AS n FROM milestones").get()!.n,
      0,
    );
    db.prepare("DELETE FROM tasks").run();
    db.prepare("DELETE FROM notes").run();
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM tasks").get()!.n, 0);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
