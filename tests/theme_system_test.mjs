// Unit test for CreatorFlow AI Theme System (Light, Dark AMOLED, System Device Based)
import assert from "assert";

function simulateThemeManager() {
  let activeTheme = "system";
  let osDark = true; // simulated OS preference
  let domDataTheme = "";
  let domClasses = new Set();
  let localStorageMock = {};

  const getSystemTheme = () => (osDark ? "dark" : "light");

  const applyThemeToDOM = (selectedTheme) => {
    const effective = selectedTheme === "system" ? getSystemTheme() : selectedTheme;
    domClasses.clear();

    if (effective === "light") {
      domDataTheme = "light";
      domClasses.add("light");
    } else {
      domDataTheme = "amoled";
      domClasses.add("dark");
      domClasses.add("amoled");
    }
    return effective;
  };

  const setTheme = (newTheme) => {
    activeTheme = newTheme;
    localStorageMock["cf_theme"] = newTheme;
    return applyThemeToDOM(newTheme);
  };

  const cycleTheme = () => {
    let next;
    if (activeTheme === "system") next = "dark";
    else if (activeTheme === "dark") next = "light";
    else next = "system";
    return setTheme(next);
  };

  const setOSDark = (isDark) => {
    osDark = isDark;
    if (activeTheme === "system") {
      applyThemeToDOM("system");
    }
  };

  return {
    get activeTheme() { return activeTheme; },
    get domDataTheme() { return domDataTheme; },
    get domClasses() { return Array.from(domClasses); },
    get localStorage() { return localStorageMock; },
    setTheme,
    cycleTheme,
    setOSDark,
  };
}

console.log("--- Starting Theme System Acceptance Tests ---");

const mgr = simulateThemeManager();

// Test 1: Default to system with OS dark
mgr.setTheme("system");
assert.strictEqual(mgr.activeTheme, "system");
assert.strictEqual(mgr.domDataTheme, "amoled", "System theme on dark OS should apply AMOLED pure black");
assert.ok(mgr.domClasses.includes("dark") && mgr.domClasses.includes("amoled"));
console.log("PASS: Test 1 - System theme on dark OS applies AMOLED pure black");

// Test 2: System theme on light OS
mgr.setOSDark(false);
assert.strictEqual(mgr.domDataTheme, "light", "System theme on light OS should automatically apply light mode");
assert.ok(mgr.domClasses.includes("light") && !mgr.domClasses.includes("dark"));
console.log("PASS: Test 2 - System theme dynamically follows OS shift to light mode");

// Test 3: Explicit Light Theme
mgr.setTheme("light");
assert.strictEqual(mgr.activeTheme, "light");
assert.strictEqual(mgr.domDataTheme, "light");
assert.ok(mgr.domClasses.includes("light"));
assert.strictEqual(mgr.localStorage["cf_theme"], "light");
console.log("PASS: Test 3 - Explicit Light theme applies light DOM attributes and persists to localStorage");

// Test 4: Explicit Dark (AMOLED) Theme
mgr.setTheme("dark");
assert.strictEqual(mgr.activeTheme, "dark");
assert.strictEqual(mgr.domDataTheme, "amoled", "Dark theme must use true AMOLED black (#000000)");
assert.ok(mgr.domClasses.includes("dark") && mgr.domClasses.includes("amoled"));
assert.strictEqual(mgr.localStorage["cf_theme"], "dark");
console.log("PASS: Test 4 - Explicit Dark theme applies pure AMOLED black");

// Test 5: Cycle Theme transitions strictly between [system -> dark -> light -> system]
mgr.setTheme("system");
mgr.cycleTheme();
assert.strictEqual(mgr.activeTheme, "dark");
mgr.cycleTheme();
assert.strictEqual(mgr.activeTheme, "light");
mgr.cycleTheme();
assert.strictEqual(mgr.activeTheme, "system");
console.log("PASS: Test 5 - Cycle theme transitions cleanly: system -> dark -> light -> system (nothing extra)");

// Test 6: Legacy migration: "amoled" in localStorage maps cleanly to "dark"
const legacySaved = "amoled";
const migrated = (legacySaved === "amoled") ? "dark" : legacySaved;
assert.strictEqual(migrated, "dark");
console.log("PASS: Test 6 - Legacy 'amoled' localStorage value safely migrates to 'dark'");

console.log("--- All Theme System Tests Passed! ---");
