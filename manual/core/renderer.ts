/**
 * @fileoverview Manual page renderer
 * @module manual/core/renderer
 * @philosophy Transform structured data into beautiful terminal output
 */

import { ColorSystem } from "../../utils/genesis-trace/mod.ts";
import { borderChars, colors } from "./colors.ts";
import type { ManualPage } from "./types.ts";

// =============================================================================
// PAGE RENDERER
// =============================================================================

/**
 * Renders a manual page into formatted terminal lines
 */
export class PageRenderer {
  private terminalWidth: number;

  constructor(terminalWidth = 80) {
    this.terminalWidth = terminalWidth;
  }

  /**
   * Render a complete manual page
   */
  render(page: ManualPage): string[] {
    const lines: string[] = [];

    // Header with animation
    lines.push(this.renderBorder("top"));
    lines.push(
      this.centerText(
        colors.header(`GENESIS MANUAL - ${page.command.toUpperCase()}`),
      ),
    );
    lines.push(this.centerText(colors.subheader(page.synopsis)));
    lines.push(this.renderBorder("middle"));
    lines.push("");

    // Philosophy quote if present
    if (page.philosophy) {
      lines.push(colors.plasma("◆ PHILOSOPHY ◆"));
      lines.push("");
      page.philosophy.forEach((line) => {
        lines.push(colors.dimCyan(line));
      });
      lines.push("");
      lines.push(this.renderBorder("thin"));
      lines.push("");
    }

    // Description
    lines.push(colors.electricBlue("◆ DESCRIPTION ◆"));
    lines.push("");
    page.description.forEach((line) => {
      lines.push(this.wrapText(line));
    });
    lines.push("");

    // Main sections
    page.sections.forEach((section) => {
      lines.push(this.renderBorder("thin"));
      lines.push("");
      lines.push(colors.electricBlue(`◆ ${section.title} ◆`));
      lines.push("");

      section.content.forEach((line) => {
        if (line.includes("  ")) {
          // Indented content
          const parts = line.split(/\s{2,}/);
          const [cmd, desc] = parts;
          if (desc) {
            lines.push(
              `  ${colors.command(cmd.padEnd(20))} ${colors.dimCyan(desc)}`,
            );
          } else {
            lines.push(`  ${colors.option(line.trim())}`);
          }
        } else {
          lines.push(this.wrapText(line));
        }
      });
      lines.push("");
    });

    // See also section
    if (page.seeAlso) {
      lines.push(this.renderBorder("thin"));
      lines.push("");
      lines.push(colors.electricBlue("◆ SEE ALSO ◆"));
      lines.push("");
      lines.push(
        `  ${page.seeAlso.map((cmd) => colors.command(cmd)).join(", ")}`,
      );
      lines.push("");
    }

    // Footer
    if (page.author || page.version) {
      lines.push(this.renderBorder("thin"));
      lines.push("");
      if (page.author) lines.push(colors.dimCyan(`Author: ${page.author}`));
      if (page.version) lines.push(colors.dimCyan(`Version: ${page.version}`));
    }

    return lines;
  }

  /**
   * Render a border line
   */
  private renderBorder(type: "top" | "middle" | "bottom" | "thin"): string {
    const chars = borderChars[type];
    const [left, mid, right] = chars;
    const border = type === "thin"
      ? colors.border(mid.repeat(this.terminalWidth))
      : colors.border(left + mid.repeat(this.terminalWidth - 2) + right);

    return border;
  }

  /**
   * Center text within terminal width
   */
  private centerText(text: string): string {
    const strippedLength = ColorSystem.stripAnsi(text).length;
    const padding = Math.max(
      0,
      Math.floor((this.terminalWidth - strippedLength) / 2),
    );
    return " ".repeat(padding) + text;
  }

  /**
   * Wrap text to terminal width (simple implementation)
   */
  private wrapText(text: string): string {
    if (text.length <= this.terminalWidth) return text;
    // Simple wrapping - could be enhanced with word-aware wrapping
    return text;
  }

  /**
   * Highlight search term in text
   */
  highlightSearch(line: string, searchTerm: string): string {
    if (!searchTerm) return line;

    const regex = new RegExp(searchTerm, "gi");
    return line.replace(regex, (match) => colors.highlight(match));
  }
}
