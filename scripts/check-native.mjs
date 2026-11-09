import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";

// Check the same native metadata consumed by Expo's Android Gradle plugin.
const result = JSON.parse(
  execFileSync(
    process.execPath,
    [
      "node_modules/expo-modules-autolinking/bin/expo-modules-autolinking.js",
      "resolve",
      "--platform",
      "android",
      "--json",
    ],
    { encoding: "utf8" },
  ),
);
for (const module of result.modules) {
  for (const project of module.projects ?? []) {
    if (project.publication) {
      assert.ok(
        project.publication.version,
        `${module.packageName}: Android publication version is missing`,
      );
    }
  }
}
console.log(
  `Android publication metadata valid for ${result.modules.length} native modules.`,
);
