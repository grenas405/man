#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env

/**
 * GENESIS MANUAL SYSTEM
 * ======================
 *
 * Interactive shell with manual system integration.
 *
 * Unix Philosophy Implementation:
 * - Do one thing well: Provide comprehensive, navigable documentation
 * - Text-based interface: Terminal-native manual pages with modern features
 * - Composable: Can be piped, scripted, and integrated with other tools
 * - Self-documenting: The manual system documents itself
 *
 * Philosophy:
 * "Documentation is not separate from the system; it IS the system"
 * - Every command is self-describing
 * - Every function tells its story
 * - Every module explains its purpose
 * - The code and documentation converge into one truth
 *
 * When run directly, drops into an interactive shell with man command
 * and basic navigation (restricted to current directory and below).
 */

import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";
import { ManualPager, registry, colors } from "./manual/mod.ts";
import { GenesisManRepl } from "./utils/genesisRepl.ts";

// =============================================================================
// COMMAND FUNCTIONS
// =============================================================================

/**
 * Display a manual page
 */
async function showManual(topic: string): Promise<void> {
  const page = registry.get(topic.toLowerCase());

  if (!page) {
    console.log(colors.neonPink(`◆ ERROR ◆`));
    console.log(colors.electricBlue(`No manual entry for '${topic}'`));
    console.log("");
    console.log(colors.dimCyan("Available manual pages:"));
    registry.list().forEach((cmd) => {
      console.log(`  ${colors.command(cmd)}`);
    });
    return;
  }

  const pager = new ManualPager();
  await pager.display(page);
}

/**
 * List all available commands
 */
async function listAllCommands(): Promise<void> {
  console.log(colors.header("◆ GENESIS MANUAL SYSTEM ◆"));
  console.log("");
  console.log(colors.electricBlue("Available manual pages:"));
  console.log("");

  const commands = registry.list();
  const maxWidth = Math.max(...commands.map((k) => k.length));

  for (const cmd of commands) {
    const page = registry.get(cmd);
    if (page) {
      const padding = " ".repeat(maxWidth - cmd.length + 4);
      console.log(
        `  ${colors.command(cmd)}${padding}${
          colors.dimCyan(page.description[0])
        }`,
      );
    }
  }

  console.log("");
  console.log(colors.dimCyan("Usage: genesis man <command>"));
  console.log(colors.dimCyan("   or: deno run genesis-man.ts <command>"));
}

/**
 * Show help information
 */
function showHelp(): void {
  console.log(colors.header("◆ GENESIS MANUAL SYSTEM ◆"));
  console.log("");
  console.log(colors.electricBlue("Usage:"));
  console.log("  genesis man <command>     View manual for command");
  console.log("  genesis man --list        List all available manuals");
  console.log("  genesis man --help        Show this help");
  console.log("");
  console.log(colors.electricBlue("Pager Controls:"));
  console.log("  j/k or arrows  Navigate line by line");
  console.log("  space/b        Page down/up");
  console.log("  /              Search");
  console.log("  q              Quit");
}

/**
 * Show version information
 */
function showVersion(): void {
  console.log(colors.header("Genesis Manual System v2.0.0"));
  console.log(colors.dimCyan("Built with Unix Philosophy and Deno"));
}

// =============================================================================
// MAIN ENTRY POINT
// =============================================================================

async function main(): Promise<void> {
  const args = parse(Deno.args, {
    boolean: ["help", "list", "version"],
    alias: { h: "help", l: "list", v: "version" },
  });

  if (args.version) {
    showVersion();
    return;
  }

  if (args.help) {
    showHelp();
    return;
  }

  if (args.list || args._.length === 0) {
    await listAllCommands();
    return;
  }

  const topic = String(args._[0]);
  await showManual(topic);
}

// =============================================================================
// EXPORTS FOR LIBRARY USAGE
// =============================================================================

/**
 * Export for programmatic use in Genesis CLI
 */
export async function manCommand(args: string[]): Promise<number> {
  try {
    const topic = args[0] || "genesis";
    await showManual(topic);
    return 0;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(colors.neonPink(`Error: ${errorMessage}`));
    return 1;
  }
}

// Execute if run directly - drop into interactive REPL shell
if (import.meta.main) {
  // Check if arguments were provided (use traditional CLI mode)
  if (Deno.args.length > 0) {
    await main();
  } else {
    // No arguments - start interactive REPL shell
    const repl = new GenesisManRepl();
    await repl.start();
  }
}
