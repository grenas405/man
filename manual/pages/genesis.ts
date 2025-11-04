/**
 * @fileoverview Manual page for genesis command
 */

import type { ManualPage } from "../core/types.ts";

export const genesisPage: ManualPage = {
  command: "genesis",
  synopsis: "genesis <command> [options]",
  description: [
    "The Deno Genesis CLI - where Unix Philosophy meets Modern Runtime.",
    "",
    "A revolutionary framework proving that timeless principles + modern",
    "technology = unprecedented developer empowerment.",
  ],
  philosophy: [
    '"Make each program do one thing well." - Doug McIlroy',
    "",
    "Genesis embodies this principle: One framework, one runtime,",
    "infinite possibilities. No webpack. No npm. No complexity.",
    "Just pure, composable TypeScript that runs everywhere.",
  ],
  sections: [
    {
      title: "CORE COMMANDS",
      content: [
        "init       Initialize new Genesis project with hub-and-spoke architecture",
        "dev        Start development server with hot reload and file watching",
        "deploy     Generate nginx and systemd configs for production deployment",
        "db         Setup MariaDB with multi-tenant architecture",
        "new        Generate industry-specific frontend from business info",
        "man        Display this manual system (you are here)",
      ],
    },
    {
      title: "UNIX PHILOSOPHY IMPLEMENTATION",
      content: [
        "• Do One Thing Well",
        "  Each command has a single, focused responsibility",
        "",
        "• Text Streams as Universal Interface",
        "  All output is parseable, pipeable, scriptable",
        "",
        "• Composability Over Monoliths",
        "  Commands work together through standard interfaces",
        "",
        "• Explicit Over Implicit",
        "  Every permission, every dependency, every action is visible",
      ],
    },
    {
      title: "SECURITY MODEL",
      content: [
        "Deno's permission system ensures complete security:",
        "",
        "--allow-read      File system read access",
        "--allow-write     File system write access",
        "--allow-net       Network access",
        "--allow-env       Environment variable access",
        "--allow-run       Subprocess execution",
        "",
        "No permission is ever granted implicitly.",
        "Every action requires explicit user consent.",
      ],
    },
    {
      title: "EXAMPLES",
      content: [
        "# Initialize new project",
        "genesis init my-project",
        "",
        "# Start development server",
        "genesis dev --port=3000",
        "",
        "# Generate production configs",
        "genesis deploy example.com",
        "",
        "# View command help",
        "genesis man init",
      ],
    },
  ],
  seeAlso: ["init", "dev", "deploy", "db", "new"],
  author: "Pedro M. Dominguez, Dominguez Tech Solutions LLC",
  version: "2.0.0",
};
