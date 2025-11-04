/**
 * @fileoverview Color scheme for Genesis Manual System
 * @module manual/core/colors
 * @philosophy Futuristic cyberpunk aesthetic with neon colors
 */

import { ColorSystem } from "../../utils/console-styler/mod.ts";

// =============================================================================
// COLOR SCHEME: FUTURISTIC CYBERPUNK
// =============================================================================

const c = ColorSystem.codes; // Shorthand for ANSI codes

/**
 * Helper function for colored text with automatic reset
 */
const colorize = (
  text: string,
  rgb: [number, number, number],
  bold = false,
): string => {
  const color = ColorSystem.rgb(rgb[0], rgb[1], rgb[2]);
  const prefix = bold ? `${c.bright}${color}` : color;
  return `${prefix}${text}${c.reset}`;
};

/**
 * Genesis Manual color palette
 * Cyberpunk-inspired neon colors for terminal UI
 */
export const colors = {
  // Primary neon palette
  neonCyan: (text: string) => colorize(text, [0x00, 0xff, 0xff]),
  electricBlue: (text: string) => colorize(text, [0x00, 0x80, 0xff]),
  deepPurple: (text: string) => colorize(text, [0x8b, 0x00, 0xff]),

  // Accent colors
  neonPink: (text: string) => colorize(text, [0xff, 0x00, 0xff], true),
  plasma: (text: string) => colorize(text, [0x00, 0xff, 0x88]),

  // UI elements
  border: (text: string) => colorize(text, [0x00, 0x44, 0x66]),
  highlight: (text: string) => colorize(text, [0x00, 0xff, 0xaa], true),
  dimCyan: (text: string) => colorize(text, [0x00, 0x66, 0x66]),

  // Text variations
  header: (text: string) => colorize(text, [0x00, 0xdd, 0xff], true),
  subheader: (text: string) =>
    `${c.italic}${colorize(text, [0x88, 0xaa, 0xff])}`,
  command: (text: string) => colorize(text, [0xaa, 0xff, 0xff], true),
  option: (text: string) => colorize(text, [0x66, 0xcc, 0xff]),

  // Special effects
  pulse: (text: string, frame: number) => {
    const intensity = Math.sin(frame * 0.1) * 0.5 + 0.5;
    const color = Math.floor(0x00 + intensity * 0xff);
    return colorize(text, [0x00, color, 0xff]);
  },
} as const;

/**
 * Border drawing characters for the manual pager
 */
export const borderChars = {
  top: ["╔", "═", "╗"],
  middle: ["╠", "═", "╣"],
  bottom: ["╚", "═", "╝"],
  thin: ["─", "─", "─"],
} as const;
