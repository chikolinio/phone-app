export type Task = {
  id: number;
  title: string;
  details: string;
  priority: string;
  due: string;
  done: number;
};
export type Note = { id: number; title: string; body: string; updated: string };
export type Goal = { id: number; title: string; details: string; due: string };
export type Milestone = {
  id: number;
  goal_id: number;
  title: string;
  done: number;
};
export const dateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function validDate(value: string) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
export function progress(items: { done: number }[]) {
  return items.length
    ? Math.round((items.filter((x) => x.done).length / items.length) * 100)
    : 0;
}
export const todayTasks = (tasks: Task[], today: string) =>
  tasks.filter(
    (t) => t.due === today || (!t.done && (!t.due || t.due < today)),
  );
