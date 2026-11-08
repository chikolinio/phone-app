import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useData } from "../src/store";
import { Goal, Milestone, progress, validDate } from "../src/model";
import { Page, Button, Field, Empty, Bar, s, colors } from "../src/ui";
import { Editor, assertTitle, report } from "../src/editor";
function GoalEditor({ goal, onClose }: { goal?: Goal; onClose: () => void }) {
  const { write } = useData();
  const [title, setTitle] = useState(goal?.title || "");
  const [details, setDetails] = useState(goal?.details || "");
  const [due, setDue] = useState(goal?.due || "");
  return (
    <Editor
      title={goal ? "Edit goal" : "New goal"}
      onClose={onClose}
      onDelete={
        goal
          ? () => write("DELETE FROM goals WHERE id=?", [goal.id])
          : undefined
      }
      onSave={async () => {
        assertTitle(title);
        if (!validDate(due))
          throw new Error("Use a valid date: YYYY-MM-DD, or leave blank.");
        await (goal
          ? write("UPDATE goals SET title=?,details=?,due=? WHERE id=?", [
              title.trim(),
              details,
              due,
              goal.id,
            ])
          : write("INSERT INTO goals(title,details,due) VALUES(?,?,?)", [
              title.trim(),
              details,
              due,
            ]));
      }}
    >
      <Field
        label="Goal title"
        value={title}
        onChangeText={setTitle}
        maxLength={200}
      />
      <Field
        label="Why it matters"
        value={details}
        onChangeText={setDetails}
        multiline
      />
      <Field
        label="Deadline · YYYY-MM-DD"
        value={due}
        onChangeText={setDue}
        maxLength={10}
        placeholder="Optional"
      />
    </Editor>
  );
}
function MilestoneEditor({
  goalId,
  milestone,
  onClose,
}: {
  goalId: number;
  milestone?: Milestone;
  onClose: () => void;
}) {
  const { write } = useData();
  const [title, setTitle] = useState(milestone?.title || "");
  return (
    <Editor
      title={milestone ? "Edit milestone" : "New milestone"}
      onClose={onClose}
      onDelete={
        milestone
          ? () => write("DELETE FROM milestones WHERE id=?", [milestone.id])
          : undefined
      }
      onSave={async () => {
        assertTitle(title);
        await (milestone
          ? write("UPDATE milestones SET title=? WHERE id=?", [
              title.trim(),
              milestone.id,
            ])
          : write("INSERT INTO milestones(goal_id,title) VALUES(?,?)", [
              goalId,
              title.trim(),
            ]));
      }}
    >
      <Field
        label="Milestone"
        value={title}
        onChangeText={setTitle}
        maxLength={200}
      />
    </Editor>
  );
}
export default function Goals() {
  const { goals, milestones, write } = useData();
  const [editing, setEditing] = useState<Goal | null | undefined>();
  const [milestoneEdit, setMilestoneEdit] = useState<{
    goalId: number;
    milestone?: Milestone;
  }>();
  return (
    <Page
      title="Build your future."
      subtitle="Big ambitions. Small, deliberate steps."
    >
      <Button title="+ New goal" onPress={() => setEditing(null)} />
      {!goals.length && (
        <Empty
          title="Choose your next horizon"
          detail="Create a goal, then break it down into milestones."
        />
      )}
      {goals.map((g) => {
        const items = milestones.filter((m) => m.goal_id === g.id);
        const p = progress(items);
        return (
          <View style={s.card} key={g.id}>
            <Text style={s.section}>{g.title}</Text>
            {!!g.details && <Text style={s.subtitle}>{g.details}</Text>}
            <Text style={s.subtitle}>
              {g.due ? `Deadline ${g.due}` : "No deadline"} · {p}% complete
            </Text>
            <Bar value={p} />
            <Text style={s.label}>
              {items.filter((m) => m.done).length}/{items.length} milestones
            </Text>
            {items.map((m) => (
              <View style={s.row} key={m.id}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: !!m.done }}
                  accessibilityLabel={`Complete ${m.title}`}
                  style={{ padding: 8 }}
                  onPress={() =>
                    report(() =>
                      write("UPDATE milestones SET done=? WHERE id=?", [
                        m.done ? 0 : 1,
                        m.id,
                      ]),
                    )
                  }
                >
                  <Text
                    style={{
                      fontSize: 24,
                      color: m.done ? colors.green : colors.blue,
                    }}
                  >
                    {m.done ? "☑" : "☐"}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${m.title}`}
                  style={{ flex: 1 }}
                  onPress={() =>
                    setMilestoneEdit({ goalId: g.id, milestone: m })
                  }
                >
                  <Text
                    style={[
                      s.text,
                      !!m.done && {
                        color: colors.muted,
                        textDecorationLine: "line-through",
                      },
                    ]}
                  >
                    {m.title}
                  </Text>
                </Pressable>
              </View>
            ))}
            {!items.length && (
              <Text style={s.subtitle}>
                Add your first milestone to start tracking progress.
              </Text>
            )}
            <Button
              title="+ Add milestone"
              secondary
              onPress={() => setMilestoneEdit({ goalId: g.id })}
            />
            <Button title="Edit goal" secondary onPress={() => setEditing(g)} />
          </View>
        );
      })}
      {editing !== undefined && (
        <GoalEditor
          goal={editing || undefined}
          onClose={() => setEditing(undefined)}
        />
      )}{" "}
      {milestoneEdit && (
        <MilestoneEditor
          {...milestoneEdit}
          onClose={() => setMilestoneEdit(undefined)}
        />
      )}
    </Page>
  );
}
