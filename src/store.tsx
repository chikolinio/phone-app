import React, { createContext, useContext, useEffect, useState } from "react";
import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";
import { Task, Note, Goal, Milestone } from "./model";
export const schema = `PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, details TEXT NOT NULL DEFAULT '', priority TEXT NOT NULL DEFAULT 'Medium', due TEXT NOT NULL DEFAULT '', done INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', updated TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS goals (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, details TEXT NOT NULL DEFAULT '', due TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS milestones (id INTEGER PRIMARY KEY AUTOINCREMENT, goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE, title TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0);
PRAGMA user_version = 1;`;
type Data = {
  tasks: Task[];
  notes: Note[];
  goals: Goal[];
  milestones: Milestone[];
};
type Store = Data & {
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  write: (sql: string, params?: (string | number)[]) => Promise<void>;
};
const Context = createContext<Store | null>(null);
let database: Promise<SQLiteDatabase> | undefined;
async function getDB() {
  if (!database)
    database = (async () => {
      const db = await openDatabaseAsync("daily-command-center.db");
      await db.execAsync(schema);
      return db;
    })().catch((e) => {
      database = undefined;
      throw e;
    });
  return database;
}
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data>({
    tasks: [],
    notes: [],
    goals: [],
    milestones: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function refresh() {
    try {
      const db = await getDB();
      const tasks = await db.getAllAsync<Task>(
        "SELECT * FROM tasks ORDER BY done, CASE priority WHEN 'High' THEN 0 WHEN 'Medium' THEN 1 ELSE 2 END, due, id DESC",
      );
      const notes = await db.getAllAsync<Note>(
        "SELECT * FROM notes ORDER BY updated DESC",
      );
      const goals = await db.getAllAsync<Goal>(
        "SELECT * FROM goals ORDER BY id DESC",
      );
      const milestones = await db.getAllAsync<Milestone>(
        "SELECT * FROM milestones ORDER BY id",
      );
      setData({ tasks, notes, goals, milestones });
      setError("");
    } catch (e) {
      setError("Could not load your data. Please retry.");
      throw e;
    } finally {
      setLoading(false);
    }
  }
  async function write(sql: string, params: (string | number)[] = []) {
    const db = await getDB();
    await db.runAsync(sql, params);
    await refresh();
  }
  useEffect(() => {
    refresh().catch(() => {});
  }, []);
  return (
    <Context.Provider value={{ ...data, loading, error, refresh, write }}>
      {children}
    </Context.Provider>
  );
}
export function useData() {
  const value = useContext(Context);
  if (!value) throw new Error("Missing data provider");
  return value;
}
