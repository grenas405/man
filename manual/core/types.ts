/**
 * @fileoverview Type definitions for Genesis Manual System
 * @module manual/core/types
 */

// =============================================================================
// MANUAL PAGE STRUCTURE
// =============================================================================

/**
 * A section within a manual page
 */
export interface ManualSection {
  title: string;
  content: string[];
  subsections?: ManualSection[];
}

/**
 * Complete manual page definition
 */
export interface ManualPage {
  command: string;
  synopsis: string;
  description: string[];
  sections: ManualSection[];
  seeAlso?: string[];
  author?: string;
  version?: string;
  philosophy?: string[];
}

// =============================================================================
// PAGER CONFIGURATION
// =============================================================================

/**
 * Configuration for the manual pager
 */
export interface PagerConfig {
  terminalHeight: number;
  terminalWidth: number;
  showLineNumbers?: boolean;
  enableSearch?: boolean;
  enableAnimation?: boolean;
}

/**
 * Key binding configuration
 */
export interface KeyBinding {
  key: string;
  action: string;
  description: string;
}

// =============================================================================
// SEARCH AND NAVIGATION
// =============================================================================

/**
 * Search result
 */
export interface SearchResult {
  lineNumber: number;
  line: string;
  matchStart: number;
  matchEnd: number;
}
