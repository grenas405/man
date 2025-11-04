/**
 * GENESIS MANUAL REPL - Restricted Shell with Manual System
 * ==========================================================
 *
 * A sandboxed shell environment for exploring the Genesis manual system
 * with basic file navigation restricted to current directory and below.
 *
 * Features:
 * - man command for viewing documentation
 * - Basic navigation (cd, ls, pwd) restricted to cwd and subdirectories
 * - File viewing capabilities (cat, less)
 * - No parent directory access for security
 */

import { join, resolve, relative, dirname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { manCommand } from "../genesis-man.ts";

// =============================================================================
// CYBERPUNK COLOR PALETTE
// =============================================================================

const colors = {
  neonCyan: "\x1b[38;2;0;255;255m",
  neonPink: "\x1b[38;2;255;0;255m",
  neonGreen: "\x1b[38;2;0;255;136m",
  electricBlue: "\x1b[38;2;0;128;255m",
  plasma: "\x1b[38;2;138;43;226m",
  gold: "\x1b[38;2;255;215;0m",
  orange: "\x1b[38;2;255;165;0m",
  red: "\x1b[38;2;255;0;80m",
  dim: "\x1b[2m",
  bright: "\x1b[1m",
  reset: "\x1b[0m",
};

// =============================================================================
// REPL CLASS
// =============================================================================

export class GenesisManRepl {
  private running = false;
  private history: string[] = [];
  private currentDir: string;
  private readonly rootDir: string; // Cannot navigate above this
  private commandCount = 0;

  constructor() {
    this.rootDir = Deno.cwd();
    this.currentDir = this.rootDir;
  }

  /**
   * Display welcome banner
   */
  private displayWelcome(): void {
    const banner = `
${colors.neonCyan}╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   ${colors.bright}███╗   ███╗ █████╗ ███╗   ██╗    ███████╗██╗  ██╗███████╗██╗     ██╗${colors.reset}${colors.neonCyan}  ║
║   ${colors.bright}████╗ ████║██╔══██╗████╗  ██║    ██╔════╝██║  ██║██╔════╝██║     ██║${colors.reset}${colors.neonCyan}  ║
║   ${colors.bright}██╔████╔██║███████║██╔██╗ ██║    ███████╗███████║█████╗  ██║     ██║${colors.reset}${colors.neonCyan}  ║
║   ${colors.bright}██║╚██╔╝██║██╔══██║██║╚██╗██║    ╚════██║██╔══██║██╔══╝  ██║     ██║${colors.reset}${colors.neonCyan}  ║
║   ${colors.bright}██║ ╚═╝ ██║██║  ██║██║ ╚████║    ███████║██║  ██║███████╗███████╗███████╗${colors.reset}${colors.neonCyan}║
║   ${colors.bright}╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝    ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝${colors.reset}${colors.neonCyan}║
║                                                                       ║
║           ${colors.neonPink}⚡ Interactive Manual Browser with Shell ⚡${colors.reset}${colors.neonCyan}            ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝${colors.reset}

${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}

${colors.neonGreen}▸${colors.reset} ${colors.bright}Root Directory:${colors.reset} ${colors.dim}${this.rootDir}${colors.reset}
${colors.neonGreen}▸${colors.reset} ${colors.bright}Access Level:${colors.reset}   ${colors.dim}Restricted to current directory and below${colors.reset}

${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}

${colors.electricBlue}Type ${colors.bright}'help'${colors.reset}${colors.electricBlue} to see available commands${colors.reset}
${colors.electricBlue}Type ${colors.bright}'man <topic>'${colors.reset}${colors.electricBlue} to view documentation${colors.reset}
${colors.electricBlue}Type ${colors.bright}'exit'${colors.reset}${colors.electricBlue} to quit${colors.reset}

`;
    console.log(banner);
  }

  /**
   * Check if a path is within the allowed root directory
   */
  private isPathAllowed(targetPath: string): boolean {
    const resolved = resolve(targetPath);
    const rel = relative(this.rootDir, resolved);

    // Check if the relative path starts with '..' or is outside root
    return !rel.startsWith('..') && !resolve(rel).startsWith('..');
  }

  /**
   * Normalize path to be within allowed bounds
   */
  private normalizePath(path: string): string {
    if (path.startsWith('/')) {
      // Absolute paths are not allowed
      return this.currentDir;
    }
    return resolve(this.currentDir, path);
  }

  /**
   * Process commands
   */
  private async processCommand(line: string): Promise<void> {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Add to history
    this.history.push(trimmed);
    this.commandCount++;

    // Parse command and arguments
    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (command) {
        case "man":
          await this.manCommand(args);
          break;
        case "cd":
          await this.cdCommand(args);
          break;
        case "ls":
          await this.lsCommand(args);
          break;
        case "pwd":
          this.pwdCommand();
          break;
        case "cat":
          await this.catCommand(args);
          break;
        case "less":
        case "more":
          await this.lessCommand(args);
          break;
        case "tree":
          await this.treeCommand(args);
          break;
        case "clear":
        case "cls":
          console.clear();
          this.displayWelcome();
          break;
        case "help":
        case "?":
          this.showHelp();
          break;
        case "history":
          this.showHistory();
          break;
        case "exit":
        case "quit":
        case "q":
          this.exit();
          break;
        default:
          console.log(`${colors.red}✗ Unknown command:${colors.reset} ${command}`);
          console.log(`${colors.dim}Type 'help' for available commands${colors.reset}\n`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`\n${colors.red}✗ Error:${colors.reset} ${errorMessage}\n`);
    }
  }

  /**
   * man command - display manual pages
   */
  private async manCommand(args: string[]): Promise<void> {
    if (args.length === 0) {
      console.log(`${colors.red}✗ Usage:${colors.reset} man <topic>`);
      console.log(`${colors.dim}Example: man genesis, man init${colors.reset}\n`);
      return;
    }

    await manCommand(args);
    console.log(); // Add spacing after manual display
  }

  /**
   * cd command - change directory (restricted)
   */
  private async cdCommand(args: string[]): Promise<void> {
    if (args.length === 0) {
      // cd with no args goes to root
      this.currentDir = this.rootDir;
      return;
    }

    const targetPath = this.normalizePath(args[0]);

    if (!this.isPathAllowed(targetPath)) {
      console.log(`${colors.red}✗ Access denied:${colors.reset} Cannot navigate to parent directories`);
      console.log(`${colors.dim}You are restricted to ${this.rootDir} and subdirectories${colors.reset}\n`);
      return;
    }

    try {
      const stat = await Deno.stat(targetPath);
      if (!stat.isDirectory) {
        console.log(`${colors.red}✗ Not a directory:${colors.reset} ${args[0]}\n`);
        return;
      }

      this.currentDir = targetPath;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        console.log(`${colors.red}✗ Directory not found:${colors.reset} ${args[0]}\n`);
      } else {
        throw error;
      }
    }
  }

  /**
   * ls command - list directory contents
   */
  private async lsCommand(args: string[]): Promise<void> {
    const targetPath = args.length > 0 ? this.normalizePath(args[0]) : this.currentDir;

    if (!this.isPathAllowed(targetPath)) {
      console.log(`${colors.red}✗ Access denied:${colors.reset} Cannot access parent directories\n`);
      return;
    }

    try {
      const entries = [];
      for await (const entry of Deno.readDir(targetPath)) {
        entries.push(entry);
      }

      // Sort: directories first, then files
      entries.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      console.log();
      for (const entry of entries) {
        const icon = entry.isDirectory ? "📁" : "📄";
        const color = entry.isDirectory ? colors.electricBlue : colors.neonGreen;
        const suffix = entry.isDirectory ? "/" : "";
        console.log(`  ${icon} ${color}${entry.name}${suffix}${colors.reset}`);
      }
      console.log();
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        console.log(`${colors.red}✗ Directory not found:${colors.reset} ${args[0] || targetPath}\n`);
      } else {
        throw error;
      }
    }
  }

  /**
   * pwd command - print working directory
   */
  private pwdCommand(): void {
    const relPath = relative(this.rootDir, this.currentDir);
    const displayPath = relPath ? `./${relPath}` : '.';
    console.log(`\n${colors.neonCyan}${this.currentDir}${colors.reset}`);
    console.log(`${colors.dim}(relative: ${displayPath})${colors.reset}\n`);
  }

  /**
   * cat command - display file contents
   */
  private async catCommand(args: string[]): Promise<void> {
    if (args.length === 0) {
      console.log(`${colors.red}✗ Usage:${colors.reset} cat <file>\n`);
      return;
    }

    const filePath = this.normalizePath(args[0]);

    if (!this.isPathAllowed(filePath)) {
      console.log(`${colors.red}✗ Access denied:${colors.reset} Cannot access parent directories\n`);
      return;
    }

    try {
      const content = await Deno.readTextFile(filePath);
      console.log();
      console.log(content);
      console.log();
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        console.log(`${colors.red}✗ File not found:${colors.reset} ${args[0]}\n`);
      } else if (error instanceof Deno.errors.PermissionDenied) {
        console.log(`${colors.red}✗ Permission denied:${colors.reset} ${args[0]}\n`);
      } else {
        throw error;
      }
    }
  }

  /**
   * less/more command - paginated file viewing
   */
  private async lessCommand(args: string[]): Promise<void> {
    if (args.length === 0) {
      console.log(`${colors.red}✗ Usage:${colors.reset} less <file>\n`);
      return;
    }

    const filePath = this.normalizePath(args[0]);

    if (!this.isPathAllowed(filePath)) {
      console.log(`${colors.red}✗ Access denied:${colors.reset} Cannot access parent directories\n`);
      return;
    }

    try {
      const content = await Deno.readTextFile(filePath);
      const lines = content.split('\n');

      console.log();
      console.log(`${colors.dim}File: ${args[0]} (${lines.length} lines)${colors.reset}`);
      console.log(colors.dim + "─".repeat(60) + colors.reset);
      console.log(content);
      console.log(colors.dim + "─".repeat(60) + colors.reset);
      console.log();
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        console.log(`${colors.red}✗ File not found:${colors.reset} ${args[0]}\n`);
      } else {
        throw error;
      }
    }
  }

  /**
   * tree command - display directory tree
   */
  private async treeCommand(args: string[]): Promise<void> {
    const targetPath = args.length > 0 ? this.normalizePath(args[0]) : this.currentDir;

    if (!this.isPathAllowed(targetPath)) {
      console.log(`${colors.red}✗ Access denied:${colors.reset} Cannot access parent directories\n`);
      return;
    }

    console.log();
    console.log(`${colors.neonCyan}${relative(this.rootDir, targetPath) || '.'}${colors.reset}`);
    await this.displayTree(targetPath, "", true);
    console.log();
  }

  /**
   * Helper for tree command - recursive tree display
   */
  private async displayTree(path: string, prefix: string, isLast: boolean): Promise<void> {
    try {
      const entries = [];
      for await (const entry of Deno.readDir(path)) {
        entries.push(entry);
      }

      entries.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const isLastEntry = i === entries.length - 1;
        const connector = isLastEntry ? "└── " : "├── ";
        const color = entry.isDirectory ? colors.electricBlue : colors.neonGreen;

        console.log(`${prefix}${connector}${color}${entry.name}${colors.reset}`);

        if (entry.isDirectory) {
          const newPrefix = prefix + (isLastEntry ? "    " : "│   ");
          const subPath = join(path, entry.name);
          if (this.isPathAllowed(subPath)) {
            await this.displayTree(subPath, newPrefix, isLastEntry);
          }
        }
      }
    } catch (error) {
      // Silently skip directories we can't read
    }
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log(`\n${colors.neonCyan}${colors.bright}═══ GENESIS MAN SHELL ═══${colors.reset}\n`);

    const commands = [
      { name: "man <topic>", desc: "Display manual page for topic" },
      { name: "cd [dir]", desc: "Change directory (restricted to cwd and below)" },
      { name: "ls [dir]", desc: "List directory contents" },
      { name: "pwd", desc: "Print working directory" },
      { name: "cat <file>", desc: "Display file contents" },
      { name: "less <file>", desc: "View file with pagination" },
      { name: "tree [dir]", desc: "Display directory tree structure" },
      { name: "clear", desc: "Clear the screen" },
      { name: "history", desc: "Show command history" },
      { name: "help", desc: "Show this help message" },
      { name: "exit", desc: "Exit the shell" },
    ];

    console.log(`${colors.neonPink}▸ ${colors.bright}Available Commands${colors.reset}\n`);

    for (const cmd of commands) {
      console.log(`  ${colors.neonGreen}${cmd.name.padEnd(20)}${colors.reset}${colors.dim}${cmd.desc}${colors.reset}`);
    }

    console.log(`\n${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.orange}⚠  Security:${colors.reset} ${colors.dim}Navigation restricted to ${this.rootDir} and subdirectories${colors.reset}`);
    console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  }

  /**
   * Show command history
   */
  private showHistory(): void {
    if (this.history.length === 0) {
      console.log(`\n${colors.dim}No command history${colors.reset}\n`);
      return;
    }

    console.log(`\n${colors.neonCyan}${colors.bright}═══ COMMAND HISTORY ═══${colors.reset}\n`);

    this.history.forEach((cmd, index) => {
      console.log(`  ${colors.dim}${String(index + 1).padStart(3)}${colors.reset} ${colors.neonGreen}▸${colors.reset} ${cmd}`);
    });

    console.log();
  }

  /**
   * Get prompt string
   */
  private getPrompt(): string {
    const relPath = relative(this.rootDir, this.currentDir);
    const displayPath = relPath ? relPath : '.';
    return `${colors.neonCyan}man-shell${colors.reset}:${colors.electricBlue}${displayPath}${colors.reset} ${colors.neonPink}▸${colors.reset} `;
  }

  /**
   * Exit the REPL
   */
  private exit(): void {
    console.log(`\n${colors.neonCyan}╭${"─".repeat(60)}╮${colors.reset}`);
    console.log(`${colors.neonCyan}│${colors.reset}  ${colors.neonPink}Exiting Genesis Man Shell...${colors.reset}`);
    console.log(`${colors.neonCyan}│${colors.reset}  ${colors.dim}Happy hacking!${colors.reset}`);
    console.log(`${colors.neonCyan}╰${"─".repeat(60)}╯${colors.reset}\n`);
    this.running = false;
  }

  /**
   * Read a line of input
   */
  private async readLine(): Promise<string | null> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let line = "";
    let cursor = 0;

    Deno.stdin.setRaw(true);

    try {
      while (true) {
        const buffer = new Uint8Array(16);
        const n = await Deno.stdin.read(buffer);

        if (n === null) {
          return null; // EOF
        }

        const data = buffer.subarray(0, n);

        // Ctrl+D - EOF
        if (n === 1 && data[0] === 0x04) {
          if (line.length === 0) {
            return null;
          }
          continue;
        }
        // Ctrl+C - clear line
        else if (n === 1 && data[0] === 0x03) {
          await Deno.stdout.write(encoder.encode("\r" + " ".repeat(this.getPrompt().length + line.length + 10) + "\r"));
          return "";
        }
        // Backspace
        else if (n === 1 && data[0] === 0x7F) {
          if (cursor > 0) {
            line = line.slice(0, cursor - 1) + line.slice(cursor);
            cursor--;
            await Deno.stdout.write(encoder.encode("\r" + this.getPrompt() + line + " \r" + this.getPrompt()));
            await Deno.stdout.write(encoder.encode(line.slice(0, cursor)));
          }
        }
        // Enter/Return
        else if (n === 1 && (data[0] === 0x0A || data[0] === 0x0D)) {
          await Deno.stdout.write(encoder.encode("\n"));
          return line;
        }
        // Arrow keys
        else if (n === 3 && data[0] === 0x1B && data[1] === 0x5B) {
          if (data[2] === 0x44 && cursor > 0) {
            // Left arrow
            cursor--;
            await Deno.stdout.write(encoder.encode("\x1b[D"));
          } else if (data[2] === 0x43 && cursor < line.length) {
            // Right arrow
            cursor++;
            await Deno.stdout.write(encoder.encode("\x1b[C"));
          }
        }
        // Printable character
        else if (n === 1 && data[0] >= 0x20 && data[0] <= 0x7E) {
          const char = decoder.decode(data);
          line = line.slice(0, cursor) + char + line.slice(cursor);
          cursor++;
          await Deno.stdout.write(encoder.encode(char));
          if (cursor < line.length) {
            await Deno.stdout.write(encoder.encode(line.slice(cursor) + "\r" + this.getPrompt()));
            await Deno.stdout.write(encoder.encode(line.slice(0, cursor)));
          }
        }
      }
    } finally {
      Deno.stdin.setRaw(false);
    }
  }

  /**
   * Start the REPL
   */
  async start(): Promise<void> {
    this.running = true;
    console.clear();
    this.displayWelcome();

    const encoder = new TextEncoder();

    while (this.running) {
      await Deno.stdout.write(encoder.encode(this.getPrompt()));

      const input = await this.readLine();

      if (input === null) {
        this.exit();
        break;
      }

      await this.processCommand(input);
    }
  }
}
