/**
 * @fileoverview Manual page for genesis dev command
 */

import type { ManualPage } from "../core/types.ts";

export const devPage: ManualPage = {
  command: "genesis dev",
  synopsis: "genesis dev [--port=3000] [--host=localhost] [--watch]",
  description: [
    "Start the development server with hot reload capabilities.",
    "",
    "Monitors file changes, automatically restarts on modifications,",
    "and provides real-time feedback for rapid development cycles.",
  ],
  philosophy: [
    '"Design and build software, even operating systems,',
    'to be tried early, ideally within weeks."',
    "",
    "The dev command enables immediate feedback. No build step.",
    "No compilation wait. Change code, see results. Instantly.",
  ],
  sections: [
    {
      title: "FEATURES",
      content: [
        "• Hot Module Reload    Changes apply without restart",
        "• File Watching        Automatic detection of modifications",
        "• Error Recovery       Graceful handling of syntax errors",
        "• Performance Monitor  Real-time metrics display",
        "• Request Logging      Structured, parseable log output",
      ],
    },
    {
      title: "OPTIONS",
      content: [
        "--port=NUMBER         Set development server port (default: 3000)",
        "--host=ADDRESS        Set host address (default: localhost)",
        "--watch=PATHS         Additional paths to watch",
        "--no-clear            Don't clear terminal on restart",
        "--open                Open browser on start",
      ],
    },
    {
      title: "KEYBOARD SHORTCUTS",
      content: [
        "r    Restart server manually",
        "c    Clear console",
        "q    Quit development server",
        "h    Show help",
        "m    Display memory usage",
      ],
    },
  ],
  seeAlso: ["deploy", "init"],
  version: "2.0.0",
};
