/**
 * @fileoverview Genesis Manual System - Main Module
 * @module manual
 * @philosophy Documentation is not separate from the system; it IS the system
 *
 * Unix Philosophy Implementation:
 * - Do one thing well: Provide comprehensive, navigable documentation
 * - Text-based interface: Terminal-native manual pages with modern features
 * - Composable: Can be piped, scripted, and integrated with other tools
 * - Self-documenting: The manual system documents itself
 */

// Core exports
export { ManualPager } from "./core/pager.ts";
export { PageRenderer } from "./core/renderer.ts";
export { ManualRegistry, registry } from "./core/registry.ts";
export { colors, borderChars } from "./core/colors.ts";

// Type exports
export type {
  ManualPage,
  ManualSection,
  PagerConfig,
  KeyBinding,
  SearchResult,
} from "./core/types.ts";

// Manual page exports
export { genesisPage } from "./pages/genesis.ts";
export { initPage } from "./pages/init.ts";
export { devPage } from "./pages/dev.ts";
