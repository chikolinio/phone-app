import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { DataProvider } from "../src/store";
import { colors } from "../src/ui";
export default function Layout() {
  return (
    <DataProvider>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.blue,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            backgroundColor: "#101216",
            borderTopColor: colors.line,
          },
          sceneStyle: { backgroundColor: colors.bg },
          animation: "fade",
        }}
      >
        {(["index", "tasks", "notes", "goals"] as const).map((name, i) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: ["Today", "Tasks", "Notes", "Goals"][i],
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name={
                    (
                      [
                        "grid-outline",
                        "checkbox-outline",
                        "document-text-outline",
                        "flag-outline",
                      ] as const
                    )[i]
                  }
                  color={color}
                  size={size}
                />
              ),
            }}
          />
        ))}
      </Tabs>
    </DataProvider>
  );
}
