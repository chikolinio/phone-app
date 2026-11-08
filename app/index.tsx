import React, { useEffect, useState } from "react";
import { AppState, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useData } from "../src/store";
import { dateKey, progress, todayTasks, Task } from "../src/model";
import { Page, Button, Empty, Bar, s, colors } from "../src/ui";
import { TaskEditor, TaskRow } from "../src/tasks";
export default function Today() {
  const { tasks, goals, milestones } = useData();
  const router = useRouter();
  const [today, setToday] = useState(dateKey());
  const [editing, setEditing] = useState<Task | null | undefined>();
  useEffect(() => {
    const update = () => setToday(dateKey());
    const timer = setInterval(update, 60000);
    const sub = AppState.addEventListener("change", update);
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  const list = todayTasks(tasks, today);
  const percent = progress(list);
  const deadlines = [
    ...tasks
      .filter((t) => !t.done && t.due >= today)
      .map((t) => ({
        key: `t${t.id}`,
        title: t.title,
        due: t.due,
        route: "/tasks" as const,
      })),
    ...goals
      .filter(
        (g) =>
          g.due >= today &&
          progress(milestones.filter((m) => m.goal_id === g.id)) < 100,
      )
      .map((g) => ({
        key: `g${g.id}`,
        title: g.title,
        due: g.due,
        route: "/goals" as const,
      })),
  ]
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 5);
  return (
    <Page
      title="Own your day."
      subtitle={new Date(today + "T12:00:00").toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}
    >
      <View style={s.card}>
        <Text style={s.label}>TODAY'S MOMENTUM</Text>
        <Text style={{ fontSize: 56, fontWeight: "700", color: colors.text }}>
          {percent}
          <Text style={{ fontSize: 24, color: colors.blue }}>%</Text>
        </Text>
        <Bar value={percent} />
        <Text style={s.subtitle}>
          {list.filter((t) => t.done).length} of {list.length} tasks complete ·
          One step at a time.
        </Text>
      </View>
      <Button title="+ Quick add task" onPress={() => setEditing(null)} />
      <Text style={s.section}>Today's focus</Text>
      <Text style={s.subtitle}>
        Today's schedule, overdue work, and unscheduled tasks.
      </Text>
      {list.map((t) => (
        <TaskRow key={t.id} task={t} onEdit={() => setEditing(t)} />
      ))}
      {!list.length && (
        <Empty
          title="Start with one thing"
          detail="Add your first task and give the day some direction."
        />
      )}
      <Text style={s.section}>Upcoming deadlines</Text>
      {deadlines.map((d) => (
        <View style={s.card} key={d.key}>
          <Text style={s.text}>{d.title}</Text>
          <Text style={s.subtitle}>{d.due}</Text>
          <Button secondary title="View" onPress={() => router.push(d.route)} />
        </View>
      ))}
      {!deadlines.length && (
        <Empty
          title="Nothing on the horizon"
          detail="Scheduled tasks and goal deadlines will appear here."
        />
      )}
      {editing !== undefined && (
        <TaskEditor
          task={editing || undefined}
          onClose={() => setEditing(undefined)}
        />
      )}
    </Page>
  );
}
