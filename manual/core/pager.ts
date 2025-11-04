/**
 * @fileoverview Interactive manual pager with vim-like navigation
 * @module manual/core/pager
 * @philosophy Less is more - vim-inspired navigation for terminal natives
 */

import { colors } from "./colors.ts";
import { PageRenderer } from "./renderer.ts";
import type { ManualPage } from "./types.ts";

// =============================================================================
// MANUAL PAGER
// =============================================================================

/**
 * Interactive pager for displaying manual pages
 */
export class ManualPager {
  private lines: string[] = [];
  private currentLine = 0;
  private terminalHeight = 24;
  private terminalWidth = 80;
  private searchTerm = "";
  private searchResults: number[] = [];
  private currentSearchIndex = 0;
  private animationFrame = 0;
  private renderer: PageRenderer;

  constructor() {
    const size = Deno.consoleSize();
    this.terminalHeight = size.rows - 4; // Leave space for status bar
    this.terminalWidth = size.columns;
    this.renderer = new PageRenderer(this.terminalWidth);
  }

  /**
   * Display a manual page interactively
   */
  async display(page: ManualPage): Promise<void> {
    this.lines = this.renderer.render(page);
    this.currentLine = 0;

    // Clear screen and hide cursor
    await this.clearScreen();
    console.log("\x1B[?25l"); // Hide cursor

    try {
      await this.renderLoop();
    } finally {
      console.log("\x1B[?25h"); // Show cursor
    }
  }

  /**
   * Main render loop with keyboard handling
   */
  private async renderLoop(): Promise<void> {
    const animInterval = setInterval(() => {
      this.animationFrame++;
    }, 50);

    while (true) {
      await this.render();

      const key = await this.readKey();

      switch (key) {
        case "q":
          clearInterval(animInterval);
          return;
        case "j":
        case "down":
          if (this.currentLine + this.terminalHeight < this.lines.length) {
            this.currentLine++;
          }
          break;
        case "k":
        case "up":
          if (this.currentLine > 0) {
            this.currentLine--;
          }
          break;
        case " ":
        case "pagedown":
          this.currentLine = Math.min(
            this.currentLine + this.terminalHeight,
            Math.max(0, this.lines.length - this.terminalHeight),
          );
          break;
        case "b":
        case "pageup":
          this.currentLine = Math.max(
            this.currentLine - this.terminalHeight,
            0,
          );
          break;
        case "g":
        case "home":
          this.currentLine = 0;
          break;
        case "G":
        case "end":
          this.currentLine = Math.max(
            0,
            this.lines.length - this.terminalHeight,
          );
          break;
        case "/":
          await this.search();
          break;
        case "n":
          this.nextSearchResult();
          break;
        case "N":
          this.prevSearchResult();
          break;
        case "h":
        case "?":
          await this.showHelp();
          break;
      }
    }
  }

  /**
   * Render current view
   */
  private async render(): Promise<void> {
    await this.clearScreen();

    // Display visible lines
    const visibleLines = this.lines.slice(
      this.currentLine,
      this.currentLine + this.terminalHeight,
    );

    visibleLines.forEach((line) => {
      console.log(this.renderer.highlightSearch(line, this.searchTerm));
    });

    // Fill remaining space
    const remaining = this.terminalHeight - visibleLines.length;
    for (let i = 0; i < remaining; i++) {
      console.log(colors.dimCyan("~"));
    }

    // Status bar
    this.renderStatusBar();
  }

  /**
   * Render status bar at bottom
   */
  private renderStatusBar(): void {
    const percent = this.lines.length > 0
      ? Math.floor(
        (this.currentLine + this.terminalHeight) / this.lines.length * 100,
      )
      : 100;

    const position = `Lines ${this.currentLine + 1}-${
      Math.min(this.currentLine + this.terminalHeight, this.lines.length)
    }/${this.lines.length}`;
    const searchInfo = this.searchTerm
      ? ` | Search: "${this.searchTerm}" (${this.searchResults.length} matches)`
      : "";

    const leftStatus = colors.neonPink(`▓▓▓ GENESIS MANUAL ▓▓▓`);
    const rightStatus = colors.highlight(
      `${position} (${percent}%)${searchInfo}`,
    );
    const help = colors.dimCyan("[q:quit j/k:scroll /:search ?:help]");

    const border = colors.border("╚" + "═".repeat(this.terminalWidth - 2) + "╗");
    console.log(border);
    console.log(`${leftStatus}  ${help}  ${rightStatus}`);
  }

  /**
   * Search for text in manual page
   */
  private async search(): Promise<void> {
    console.log(colors.electricBlue("\nSearch: "));
    this.searchTerm = prompt("") || "";

    if (this.searchTerm) {
      this.searchResults = [];
      this.lines.forEach((line, index) => {
        if (line.toLowerCase().includes(this.searchTerm.toLowerCase())) {
          this.searchResults.push(index);
        }
      });

      if (this.searchResults.length > 0) {
        this.currentSearchIndex = 0;
        this.currentLine = this.searchResults[0];
      }
    }
  }

  /**
   * Navigate to next search result
   */
  private nextSearchResult(): void {
    if (this.searchResults.length === 0) return;

    this.currentSearchIndex = (this.currentSearchIndex + 1) %
      this.searchResults.length;
    this.currentLine = this.searchResults[this.currentSearchIndex];
  }

  /**
   * Navigate to previous search result
   */
  private prevSearchResult(): void {
    if (this.searchResults.length === 0) return;

    this.currentSearchIndex = this.currentSearchIndex === 0
      ? this.searchResults.length - 1
      : this.currentSearchIndex - 1;
    this.currentLine = this.searchResults[this.currentSearchIndex];
  }

  /**
   * Show help overlay
   */
  private async showHelp(): Promise<void> {
    await this.clearScreen();

    const helpText = [
      colors.header("MANUAL PAGER CONTROLS"),
      "",
      colors.electricBlue("◆ NAVIGATION ◆"),
      "",
      "  j, ↓         " + colors.dimCyan("Scroll down one line"),
      "  k, ↑         " + colors.dimCyan("Scroll up one line"),
      "  Space, PgDn  " + colors.dimCyan("Page down"),
      "  b, PgUp      " + colors.dimCyan("Page up"),
      "  g, Home      " + colors.dimCyan("Go to top"),
      "  G, End       " + colors.dimCyan("Go to bottom"),
      "",
      colors.electricBlue("◆ SEARCH ◆"),
      "",
      "  /            " + colors.dimCyan("Search forward"),
      "  n            " + colors.dimCyan("Next search result"),
      "  N            " + colors.dimCyan("Previous search result"),
      "",
      colors.electricBlue("◆ OTHER ◆"),
      "",
      "  h, ?         " + colors.dimCyan("Show this help"),
      "  q            " + colors.dimCyan("Quit pager"),
      "",
      colors.dimCyan("Press any key to continue..."),
    ];

    helpText.forEach((line) => console.log(line));
    await this.readKey();
  }

  /**
   * Clear screen
   */
  private async clearScreen(): Promise<void> {
    console.log("\x1B[2J\x1B[H"); // Clear screen and move to top
  }

  /**
   * Read a single keypress using Deno native APIs
   */
  private async readKey(): Promise<string> {
    Deno.stdin.setRaw(true);

    try {
      const buffer = new Uint8Array(16);
      const n = await Deno.stdin.read(buffer);

      if (n === null) return "q"; // EOF - treat as quit

      const data = buffer.subarray(0, n);

      // Single byte characters
      if (n === 1) {
        const byte = data[0];

        // Control characters
        if (byte === 0x03) return "q"; // Ctrl+C
        if (byte === 0x04) return "q"; // Ctrl+D

        // Special keys
        if (byte === 0x20) return " "; // Space
        if (byte === 0x0A || byte === 0x0D) return "down"; // Enter

        // Regular printable characters
        if (byte >= 0x20 && byte <= 0x7E) {
          return String.fromCharCode(byte);
        }
      }

      // Escape sequences (arrow keys, etc.)
      if (n >= 3 && data[0] === 0x1B && data[1] === 0x5B) {
        const code = data[2];
        if (code === 0x41) return "up";    // Up arrow
        if (code === 0x42) return "down";  // Down arrow
        if (code === 0x43) return "right"; // Right arrow
        if (code === 0x44) return "left";  // Left arrow
        if (code === 0x35) return "pageup";   // Page Up
        if (code === 0x36) return "pagedown"; // Page Down
        if (code === 0x48) return "home";  // Home
        if (code === 0x46) return "end";   // End
      }

      return "";
    } finally {
      Deno.stdin.setRaw(false);
    }
  }
}
