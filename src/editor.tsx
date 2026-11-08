import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, s } from "./ui";
export function Editor({
  title,
  children,
  onSave,
  onClose,
  onDelete,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => Promise<void>;
  onClose: () => void;
  onDelete?: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
      onClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      visible
      animationType="slide"
      onRequestClose={() => {
        if (!busy) onClose();
      }}
    >
      <SafeAreaView style={s.page}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.content}
          >
            <Text style={s.title}>{title}</Text>
            {children}
            {!!error && (
              <Text accessibilityRole="alert" style={s.error}>
                {error}
              </Text>
            )}
            <Button
              title={busy ? "Saving…" : "Save"}
              disabled={busy}
              onPress={() => {
                void run(onSave);
              }}
            />
            <Button
              title="Cancel"
              secondary
              disabled={busy}
              onPress={onClose}
            />
            {onDelete && (
              <Button
                title="Delete permanently"
                secondary
                disabled={busy}
                onPress={() =>
                  Alert.alert("Delete this item?", "This cannot be undone.", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => {
                        void run(onDelete);
                      },
                    },
                  ])
                }
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
export function assertTitle(title: string) {
  if (!title.trim()) throw new Error("Please enter a title.");
}
export function report(action: () => Promise<void>) {
  action().catch(() =>
    Alert.alert(
      "Change not saved",
      "Please try again. Your stored data is still available.",
    ),
  );
}
