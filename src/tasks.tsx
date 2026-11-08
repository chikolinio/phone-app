import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Task, validDate } from "./model";
import { useData } from "./store";
import { Button, Field, s, colors } from "./ui";
import { Editor, assertTitle, report } from "./editor";
export function TaskRow({ task, onEdit }: { task: Task; onEdit: () => void }) {
  const { write } = useData();
  return (
    <View style={[s.card, s.row]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!task.done }}
        accessibilityLabel={`Complete ${task.title}`}
        hitSlop={8}
        style={{ padding: 8 }}
        onPress={() =>
          report(() =>
            write("UPDATE tasks SET done=? WHERE id=?", [
              task.done ? 0 : 1,
              task.id,
            ]),
          )
        }
      >
        <Text
          style={{
            color: task.done ? colors.green : colors.blue,
            fontSize: 25,
          }}
        >
          {task.done ? "☑" : "☐"}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit ${task.title}`}
        style={{ flex: 1, gap: 5 }}
        onPress={onEdit}
      >
        <Text
          style={[
            s.text,
            !!task.done && {
              textDecorationLine: "line-through",
              color: colors.muted,
            },
          ]}
        >
          {task.title}
        </Text>
        <Text style={s.subtitle}>
          {task.priority} priority · {task.due || "Unscheduled"}
        </Text>
      </Pressable>
    </View>
  );
}
export function TaskEditor({
  task,
  onClose,
}: {
  task?: Task;
  onClose: () => void;
}) {
  const { write } = useData();
  const [title, setTitle] = useState(task?.title || "");
  const [details, setDetails] = useState(task?.details || "");
  const [due, setDue] = useState(task?.due || "");
  const [priority, setPriority] = useState(task?.priority || "Medium");
  return (
    <Editor
      title={task ? "Edit task" : "New task"}
      onClose={onClose}
      onDelete={
        task
          ? () => write("DELETE FROM tasks WHERE id=?", [task.id])
          : undefined
      }
      onSave={async () => {
        assertTitle(title);
        if (!validDate(due))
          throw new Error("Use a valid date: YYYY-MM-DD, or leave blank.");
        await (task
          ? write(
              "UPDATE tasks SET title=?,details=?,priority=?,due=? WHERE id=?",
              [title.trim(), details, priority, due, task.id],
            )
          : write(
              "INSERT INTO tasks(title,details,priority,due) VALUES(?,?,?,?)",
              [title.trim(), details, priority, due],
            ));
      }}
    >
      <Field
        label="Title"
        value={title}
        onChangeText={setTitle}
        maxLength={200}
      />
      <Field
        label="Details"
        multiline
        value={details}
        onChangeText={setDetails}
      />
      <Field
        label="Scheduled date · YYYY-MM-DD"
        placeholder="Leave blank for no date"
        value={due}
        onChangeText={setDue}
        maxLength={10}
      />
      <Text style={s.label}>Priority</Text>
      <View style={s.row}>
        {["Low", "Medium", "High"].map((p) => (
          <Button
            key={p}
            title={p}
            secondary={priority !== p}
            onPress={() => setPriority(p)}
          />
        ))}
      </View>
    </Editor>
  );
}
