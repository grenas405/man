import {
  assert,
  assertEquals,
  assertExists,
  assertFalse,
  assertStringIncludes,
  assertStrictEquals,
  assertThrows,
} from "@std/assert";
import {
  ManualPager,
  ManualRegistry,
  PageRenderer,
  borderChars,
  colors,
  registry as sharedRegistry,
} from "../mod.ts";
import type { ManualPage } from "../mod.ts";
import { ColorSystem } from "../../utils/genesis-trace/mod.ts";

const createPage = (overrides: Partial<ManualPage> = {}): ManualPage => ({
  command: overrides.command ?? "stub",
  synopsis: overrides.synopsis ?? "stub <command>",
  description: overrides.description ?? ["Default description body."],
  sections: overrides.sections ?? [
    {
      title: "DEFAULT",
      content: ["noop"],
    },
  ],
  ...overrides,
});

// =============================================================================
// Edge-case tests (error paths, boundary conditions, invalid input, concurrency)
// =============================================================================

Deno.test("Edge Case: ManualRegistry.get returns undefined for unknown command", () => {
  const registry = new ManualRegistry();
  const initialSize = registry.size;

  assertStrictEquals(registry.get("missing"), undefined);
  assertStrictEquals(registry.size, initialSize);
});

Deno.test("Edge Case: ManualRegistry.unregister gracefully ignores missing entries", () => {
  const registry = new ManualRegistry();

  assertFalse(registry.unregister("ghost"));
  assert(registry.size > 0);
});

Deno.test("Edge Case: ManualRegistry handles concurrent register/unregister operations", async () => {
  const registry = new ManualRegistry();
  const commands = ["alpha", "beta", "gamma", "delta"];

  await Promise.all(
    commands.map((command) =>
      Promise.resolve().then(() =>
        registry.register(command, createPage({ command }))
      )
    ),
  );

  await Promise.all([
    Promise.resolve().then(() => registry.unregister("beta")),
    Promise.resolve().then(() => registry.unregister("omega")),
  ]);

  assertStrictEquals(registry.has("beta"), false);
  assertStrictEquals(registry.has("alpha"), true);
  assertStrictEquals(registry.size, registry.list().length);
});

Deno.test("Edge Case: PageRenderer renders manuals with zero sections", () => {
  const renderer = new PageRenderer(32);
  const page = createPage({
    command: "edge",
    synopsis: "edge",
    description: ["single line"],
    sections: [],
  });

  const lines = renderer.render(page);
  assert(lines.length > 0);

  const topBorder = ColorSystem.stripAnsi(lines[0]);
  assertStrictEquals(topBorder.startsWith("╔"), true);
  const descriptionLabel = ColorSystem.stripAnsi(
    lines.find((line) => line.includes("DESCRIPTION")) ?? "",
  );
  assertStringIncludes(descriptionLabel, "DESCRIPTION");
});

Deno.test("Edge Case: PageRenderer.highlightSearch surfaces invalid regex input", () => {
  const renderer = new PageRenderer();

  assertThrows(
    () => renderer.highlightSearch("target", "["),
    SyntaxError,
  );
});

// =============================================================================
// Normal behavior tests
// =============================================================================

Deno.test("Normal Behavior: ManualRegistry.list returns alphabetically sorted commands", () => {
  const registry = new ManualRegistry();
  registry.register("zzz", createPage({ command: "zzz" }));
  registry.register("abc", createPage({ command: "abc" }));

  assertEquals(
    registry.list(),
    ["abc", "dev", "genesis", "init", "zzz"],
  );
});

Deno.test("Normal Behavior: PageRenderer pads command descriptions for readability", () => {
  const renderer = new PageRenderer();
  const page = createPage({
    sections: [
      {
        title: "COMMANDS",
        content: [
          "serve    Start local server",
        ],
      },
    ],
  });

  const lines = renderer.render(page);
  const targetLine = lines.find((line) => line.includes("Start local server"));
  assertExists(targetLine);

  const stripped = ColorSystem.stripAnsi(targetLine);
  assertStringIncludes(stripped, "serve".padEnd(20));
  assertStringIncludes(stripped, "Start local server");
});

// =============================================================================
// Interface & contract tests
// =============================================================================

Deno.test("Interface: manual/mod exposes the pager API surface", () => {
  assertEquals(typeof ManualPager, "function");
  assertEquals(typeof PageRenderer, "function");
  assertEquals(typeof ManualRegistry, "function");
  assertExists(colors);
  assertEquals(typeof colors.neonCyan, "function");
  assert(Array.isArray(borderChars.top));

  const originalConsoleSize = Deno.consoleSize;
  (Deno as { consoleSize: typeof Deno.consoleSize }).consoleSize = () => ({
    columns: 120,
    rows: 40,
  });

  try {
    const pager = new ManualPager();
    assertEquals(typeof pager.display, "function");
  } finally {
    (Deno as { consoleSize: typeof Deno.consoleSize }).consoleSize =
      originalConsoleSize;
  }
});

Deno.test("Interface: shared registry exposes documented commands", () => {
  assert(sharedRegistry.has("genesis"));
  assert(sharedRegistry.has("init"));
  assert(sharedRegistry.has("dev"));

  const genesisPage = sharedRegistry.get("genesis");
  assertExists(genesisPage);
  assert(genesisPage.sections.length > 0);
});
