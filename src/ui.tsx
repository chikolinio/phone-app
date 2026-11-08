import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useData } from "./store";
export const colors = {
  bg: "#08090B",
  card: "#15171C",
  line: "#292D36",
  text: "#F6F7FB",
  muted: "#999FAA",
  blue: "#79A9FF",
  green: "#8DDBBC",
};
export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 22, paddingBottom: 100, gap: 16 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -1,
  },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  text: { color: colors.text, fontSize: 16, lineHeight: 23 },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 10,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: {
    backgroundColor: "#101216",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 14,
    color: colors.text,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.blue,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#080D17", fontWeight: "700", fontSize: 14 },
  empty: {
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
  },
  section: { fontSize: 19, fontWeight: "600", color: colors.text },
  error: { color: "#FF9F9F", lineHeight: 22 },
  bar: {
    height: 6,
    borderRadius: 4,
    backgroundColor: colors.line,
    overflow: "hidden",
  },
});
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && { backgroundColor: colors.line },
        { opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[s.buttonText, secondary && { color: colors.text }]}>
        {title}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#666D79"
        accessibilityLabel={label}
        {...props}
        style={[
          s.input,
          props.multiline && { minHeight: 120, textAlignVertical: "top" },
          props.style,
        ]}
      />
    </View>
  );
}
export function Empty({ title, detail }: { title: string; detail: string }) {
  return (
    <View style={s.empty}>
      <Text style={s.section}>{title}</Text>
      <Text style={s.subtitle}>{detail}</Text>
    </View>
  );
}
export function Bar({ value }: { value: number }) {
  return (
    <View accessibilityLabel={`${value}% complete`} style={s.bar}>
      <View
        style={{ width: `${value}%`, height: 6, backgroundColor: colors.blue }}
      />
    </View>
  );
}
export function Page({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const data = useData();
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={s.page}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.content}
      >
        <Text style={s.label}>DAILY COMMAND CENTER</Text>
        <Text style={s.title}>{title}</Text>
        <Text style={s.subtitle}>{subtitle}</Text>
        {data.loading ? (
          <ActivityIndicator
            color={colors.blue}
            accessibilityLabel="Loading data"
          />
        ) : data.error ? (
          <View style={s.card}>
            <Text style={s.error}>{data.error}</Text>
            <Button
              title="Retry"
              onPress={() => {
                data.refresh().catch(() => {});
              }}
            />
          </View>
        ) : (
          children
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
