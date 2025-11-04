# Genesis Manual System

A modular, terminal-native manual pager for the Deno Genesis Meta Operating System.

## Philosophy

> "Documentation is not separate from the system; it IS the system"

- Every command is self-describing
- Every function tells its story
- Every module explains its purpose
- The code and documentation converge into one truth

## Architecture

```
manual/
├── core/              # Core system components
│   ├── types.ts       # Type definitions
│   ├── colors.ts      # Cyberpunk color scheme
│   ├── renderer.ts    # Page rendering logic
│   ├── pager.ts       # Interactive pager with vim-like navigation
│   └── registry.ts    # Manual page registry
├── pages/             # Individual manual pages
│   ├── genesis.ts     # Main Genesis command
│   ├── init.ts        # Init command
│   └── dev.ts         # Dev command
├── components/        # Reusable UI components (future)
└── mod.ts            # Main module exports
```

## Features

### Core Features
- **Vim-like Navigation**: j/k, space/b, g/G for intuitive scrolling
- **Search Functionality**: Forward search with `/`, navigate with n/N
- **Cyberpunk Aesthetic**: Neon colors using console-styler library
- **Modular Design**: Easy to add new manual pages

### Color Scheme
The system uses a futuristic cyberpunk color palette:
- **Neon Cyan** (#00FFFF) - Primary highlights
- **Electric Blue** (#0080FF) - Section headers
- **Plasma Green** (#00FF88) - Philosophy sections
- **Neon Pink** (#FF00FF) - Errors and emphasis
- **Deep Purple** (#8B00FF) - Special accents

## Usage

### Command Line

```bash
# Run directly
deno run --allow-read --allow-write --allow-env genesis-man.ts [command]

# Show all available manuals
deno run --allow-read --allow-write --allow-env genesis-man.ts --list

# View specific manual
deno run --allow-read --allow-write --allow-env genesis-man.ts init

# Show help
deno run --allow-read --allow-write --allow-env genesis-man.ts --help
```

### As a Library

```typescript
import { ManualPager, registry } from "./manual/mod.ts";

// Display a manual page
const pager = new ManualPager();
const page = registry.get("genesis");
if (page) {
  await pager.display(page);
}

// List all available commands
const commands = registry.list();
console.log(commands); // ["dev", "genesis", "init"]
```

## Adding New Manual Pages

1. Create a new file in `manual/pages/`:

```typescript
// manual/pages/deploy.ts
import type { ManualPage } from "../core/types.ts";

export const deployPage: ManualPage = {
  command: "genesis deploy",
  synopsis: "genesis deploy <domain> [options]",
  description: [
    "Deploy your Genesis application to production.",
  ],
  sections: [
    {
      title: "OPTIONS",
      content: [
        "--nginx        Generate nginx configuration",
        "--systemd      Generate systemd service file",
      ],
    },
  ],
  version: "2.0.0",
};
```

2. Register it in `manual/core/registry.ts`:

```typescript
import { deployPage } from "../pages/deploy.ts";

// In the ManualRegistry constructor:
this.pages = new Map([
  ["genesis", genesisPage],
  ["init", initPage],
  ["dev", devPage],
  ["deploy", deployPage], // Add this line
]);
```

3. Export it from `manual/mod.ts`:

```typescript
export { deployPage } from "./pages/deploy.ts";
```

## Pager Controls

### Navigation
- `j` or `↓` - Scroll down one line
- `k` or `↑` - Scroll up one line
- `Space` or `PgDn` - Page down
- `b` or `PgUp` - Page up
- `g` or `Home` - Go to top
- `G` or `End` - Go to bottom

### Search
- `/` - Search forward
- `n` - Next search result
- `N` - Previous search result

### Other
- `h` or `?` - Show help
- `q` - Quit pager

## Dependencies

- **Deno** - Runtime environment
- **console-styler** - Color and formatting library (../utils/console-styler/)
- **keypress** - Keyboard input handling (https://deno.land/x/keypress)

## Unix Philosophy

The Genesis Manual System embodies Unix principles:

1. **Do One Thing Well**: Provide comprehensive, navigable documentation
2. **Text-Based Interface**: Terminal-native with no external dependencies
3. **Composability**: Can be piped, scripted, and integrated
4. **Self-Documenting**: The manual documents itself

## Development

### Running Tests

```bash
# Test all commands
deno run --allow-read --allow-write --allow-env genesis-man.ts --version
deno run --allow-read --allow-write --allow-env genesis-man.ts --list
deno run --allow-read --allow-write --allow-env genesis-man.ts --help
deno run --allow-read --allow-write --allow-env genesis-man.ts genesis
```

### Module Structure

- **types.ts**: TypeScript interfaces and type definitions
- **colors.ts**: Color scheme and styling functions
- **renderer.ts**: Converts ManualPage to formatted terminal lines
- **pager.ts**: Interactive viewing with keyboard navigation
- **registry.ts**: Central repository of all manual pages

## Version

Genesis Manual System v2.0.0

## Author

Pedro M. Dominguez, Dominguez Tech Solutions LLC
