/**
 * @fileoverview Manual page registry
 * @module manual/core/registry
 * @philosophy Single source of truth for all available manual pages
 */

import type { ManualPage } from "./types.ts";
import { genesisPage } from "../pages/genesis.ts";
import { initPage } from "../pages/init.ts";
import { devPage } from "../pages/dev.ts";

// =============================================================================
// MANUAL PAGE REGISTRY
// =============================================================================

/**
 * Central registry of all available manual pages
 */
export class ManualRegistry {
  private pages: Map<string, ManualPage>;

  constructor() {
    this.pages = new Map([
      ["genesis", genesisPage],
      ["init", initPage],
      ["dev", devPage],
    ]);
  }

  /**
   * Get a manual page by command name
   */
  get(command: string): ManualPage | undefined {
    return this.pages.get(command.toLowerCase());
  }

  /**
   * Check if a manual page exists
   */
  has(command: string): boolean {
    return this.pages.has(command.toLowerCase());
  }

  /**
   * Get all available command names
   */
  list(): string[] {
    return Array.from(this.pages.keys()).sort();
  }

  /**
   * Get all manual pages
   */
  getAll(): Map<string, ManualPage> {
    return new Map(this.pages);
  }

  /**
   * Register a new manual page
   */
  register(command: string, page: ManualPage): void {
    this.pages.set(command.toLowerCase(), page);
  }

  /**
   * Unregister a manual page
   */
  unregister(command: string): boolean {
    return this.pages.delete(command.toLowerCase());
  }

  /**
   * Get the number of registered pages
   */
  get size(): number {
    return this.pages.size;
  }
}

/**
 * Default registry instance
 */
export const registry = new ManualRegistry();
