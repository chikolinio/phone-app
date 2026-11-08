import React, { useState } from "react";
import { Text, View } from "react-native";
import { useData } from "../src/store";
import { Task } from "../src/model";
import { Page, Button, Field, Empty, s } from "../src/ui";
import { TaskRow, TaskEditor } from "../src/tasks";
export default function Tasks() {
  const { tasks } = useData();
  const [editing, setEditing] = useState<Task | null | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Active");
  const visible = tasks.filter(
    (t) =>
      (filter === "All" || (filter === "Done" ? !!t.done : !t.done)) &&
      (t.title + " " + t.details).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Page title="Your tasks" subtitle="Make room for what matters.">
      <Button title="+ New task" onPress={() => setEditing(null)} />
      <Field label="Search tasks" value={query} onChangeText={setQuery} />
      <View style={s.row}>
        {["Active", "Done", "All"].map((f) => (
          <Button
            key={f}
            title={f}
            secondary={f !== filter}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>
      <Text style={s.label}>{visible.length} tasks</Text>
      {visible.map((t) => (
        <TaskRow key={t.id} task={t} onEdit={() => setEditing(t)} />
      ))}
      {!visible.length && (
        <Empty
          title="A clear runway"
          detail="No matching tasks. Add a task or change your filters."
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
