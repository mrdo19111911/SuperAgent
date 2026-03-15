# Skill Name

[One paragraph describing what this skill does]

## Installation

```bash
cd ~/.claude/skills
git clone [repo-url] skill-name
cd skill-name
./setup
```

## Usage

```bash
# Basic usage
/skill-name command

# With arguments
/skill-name command arg1 arg2

# Debug mode
/skill-name --debug command
```

## Examples

### Example 1: [Use case]

```bash
/skill-name example1
```

Output:
```
[Expected output]
```

### Example 2: [Another use case]

```bash
/skill-name example2 --flag
```

## Architecture

**Pattern:** Persistent Server

**Components:**
- `cli.ts` — Entry point, ensures server running
- `server.ts` — HTTP server with command routing
- `.gstack/skill.json` — Runtime state (PID, port, token)

**Flow:**
1. CLI reads state file
2. Checks if server alive (health check)
3. Starts new server if needed
4. Sends command via HTTP POST
5. Returns result

## Development

```bash
# Run tests
bun test

# Watch mode
bun test --watch

# Build binary
bun run build

# Run without building
bun run dev command args
```

## Integration

**Hands off to:**
- `/other-skill` — [When]

**Receives from:**
- `/calling-skill` — [What]

**Nash Triad:**
- See [SKILL.md](SKILL.md) for integration details

## License

[License type]
