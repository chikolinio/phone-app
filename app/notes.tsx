import React, { useState } from "react";
import { Pressable, Text } from "react-native";
import { useData } from "../src/store";
import { Note } from "../src/model";
import { Page, Button, Field, Empty, s } from "../src/ui";
import { Editor, assertTitle } from "../src/editor";
function NoteEditor({ note, onClose }: { note?: Note; onClose: () => void }) {
  const { write } = useData();
  const [title, setTitle] = useState(note?.title || "");
  const [body, setBody] = useState(note?.body || "");
  return (
    <Editor
      title={note ? "Edit note" : "New note"}
      onClose={onClose}
      onDelete={
        note
          ? () => write("DELETE FROM notes WHERE id=?", [note.id])
          : undefined
      }
      onSave={async () => {
        assertTitle(title);
        const now = new Date().toISOString();
        await (note
          ? write("UPDATE notes SET title=?,body=?,updated=? WHERE id=?", [
              title.trim(),
              body,
              now,
              note.id,
            ])
          : write("INSERT INTO notes(title,body,updated) VALUES(?,?,?)", [
              title.trim(),
              body,
              now,
            ]));
      }}
    >
      <Field
        label="Title"
        value={title}
        onChangeText={setTitle}
        maxLength={200}
      />
      <Field
        label="Your thoughts"
        value={body}
        onChangeText={setBody}
        multiline
        style={{ minHeight: 260 }}
      />
    </Editor>
  );
}
export default function Notes() {
  const { notes } = useData();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Note | null | undefined>();
  const visible = notes.filter((n) =>
    (n.title + " " + n.body).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Page title="Space to think." subtitle="Capture an idea. Clear your mind.">
      <Button title="+ New note" onPress={() => setEditing(null)} />
      <Field
        label="Search notes"
        value={query}
        onChangeText={setQuery}
        placeholder="Search titles and content"
      />
      {visible.map((n) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${n.title}`}
          key={n.id}
          style={s.card}
          onPress={() => setEditing(n)}
        >
          <Text style={s.section}>{n.title}</Text>
          <Text numberOfLines={3} style={s.subtitle}>
            {n.body || "No content yet"}
          </Text>
          <Text style={s.label}>
            {new Date(n.updated).toLocaleDateString()}
          </Text>
        </Pressable>
      ))}
      {!visible.length && (
        <Empty
          title={query ? "No notes found" : "Your ideas belong here"}
          detail={
            query
              ? "Try a different search."
              : "Create a note to capture something worth keeping."
          }
        />
      )}{" "}
      {editing !== undefined && (
        <NoteEditor
          note={editing || undefined}
          onClose={() => setEditing(undefined)}
        />
      )}
    </Page>
  );
}
