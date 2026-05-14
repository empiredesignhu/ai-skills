# Claude Agent SDK — Python — Comprehensive Reference
IMPORTANT: you have access to up to date documentation via Context7 MCP - use it when needed!
> **Package**: `claude-agent-sdk` (PyPI)
> **Repository**: [github.com/anthropics/claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python)
> **Official Docs**: [platform.claude.com/docs/en/agent-sdk](https://platform.claude.com/docs/en/agent-sdk/overview)
> **Formerly**: `claude-code-sdk` (deprecated, renamed to `claude-agent-sdk`)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Installation & Setup](#2-installation--setup)
3. [Core Concepts](#3-core-concepts)
4. [Quick Start](#4-quick-start)
5. [API: `query()` and `ClaudeSDKClient`](#5-api-query-and-claudesdkclient)
6. [API: `ClaudeAgentOptions`](#6-api-claudeagentoptions)
7. [Message & Content Block Types](#7-message--content-block-types)
8. [Built-in Tools](#8-built-in-tools)
9. [Custom Tools & MCP Servers](#9-custom-tools--mcp-servers)
10. [Hooks](#10-hooks)
11. [Permissions](#11-permissions)
12. [Subagents](#12-subagents)
13. [Structured Output](#13-structured-output)
14. [Session Management](#14-session-management)
15. [Error Handling](#15-error-handling)
16. [Environment Variables & Authentication](#16-environment-variables--authentication)
17. [Type Definitions Reference](#17-type-definitions-reference)
18. [Migration from Claude Code SDK](#18-migration-from-claude-code-sdk)
19. [Patterns & Best Practices](#19-patterns--best-practices)
20. [Skills](#20-skills)
21. [Use Cases & Agent Design Patterns](#21-use-cases--agent-design-patterns)

---

## 1. Overview

The **Claude Agent SDK** is a Python library for building production AI agents. It provides the same tools, agent loop, and context management that power **Claude Code**, as a programmable SDK.

Agents autonomously: read/write/edit files, run shell commands, search the web, use custom tools via MCP, delegate to subagents for parallel work, and manage conversation sessions with resume/fork/continue.

The SDK handles the **agentic loop** automatically: gather context, take action, verify work, repeat.

| Principle | Description |
|---|---|
| **Computer access** | Agents operate in a sandboxed computer environment |
| **Built-in tools** | File I/O, shell, web search out of the box |
| **MCP extensibility** | Add any custom tool via Model Context Protocol |
| **Context management** | Automatic compaction prevents context overflow |
| **Permission control** | Fine-grained per-tool allow/deny/hook system |
| **Subagent support** | Parallel execution with isolated context windows |

---

## 2. Installation & Setup

### Prerequisites

- Python 3.10+
- Node.js 18+ (for the CLI runtime)
- **Claude Max subscription** (recommended) or an Anthropic API key

### Step 1: Install Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
# Verify: claude --version (should be 2.0.0+)
```

### Step 2: Authenticate — Claude Max Subscription (Recommended)

> **This is the recommended default.** Fixed monthly cost, no per-token charges, no API key management.

```bash
claude
# Select: "Claude account with subscription" (Pro, Max, Team, or Enterprise)
# Browser opens → click "Authorize"
```

Once authenticated, the CLI stores credentials in `~/.claude/.credentials.json`. The SDK **auto-detects** these — no environment variables needed. Your Python code just works with no API key configuration.

**Key benefits:**
- **Fixed monthly cost** — no budget surprises
- **No API key management** — credentials stored and refreshed automatically
- **Same models** — full access to Sonnet, Opus, Haiku
- **Usage resets automatically** — limits reset after a few hours

**Troubleshooting:**
```bash
claude /logout && claude /login   # Switch accounts
claude /status                    # Check plan and usage
unset ANTHROPIC_API_KEY           # IMPORTANT: if set, SDK uses API billing instead of subscription
```

> **Gotcha:** If `ANTHROPIC_API_KEY` is set in your environment, the SDK prioritizes it over your subscription, resulting in pay-per-use charges. Unset it to use your Max plan.

### Step 2 (Alternative): API Key Authentication

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

### Step 3: Install the Python SDK

```bash
pip install claude-agent-sdk
```

### Authentication Priority Order

| Priority | Method | Billing |
|---|---|---|
| 1 (highest) | `ANTHROPIC_API_KEY` env var | Pay-per-use |
| 2 | CLI credentials (`~/.claude/.credentials.json`) | **Max/Pro subscription** |
| 3 | `CLAUDE_CODE_USE_BEDROCK=1` / `CLAUDE_CODE_USE_VERTEX=1` / `CLAUDE_CODE_USE_FOUNDRY=1` | Cloud provider |

---

## 3. Core Concepts

### Two Interaction Modes

| Mode | Use Case |
|---|---|
| **`query()`** | One-shot / unidirectional. Simple queries, batch processing, scripts |
| **`ClaudeSDKClient`** | Bidirectional / stateful. Multi-turn chat, custom in-process tools, hooks |

Both return an `AsyncIterator` of message objects. `query()` is simpler; `ClaudeSDKClient` adds multi-turn, custom tools, and bidirectional streaming.

### Message Flow

```
Your Code ──prompt──▶ SDK ──spawns──▶ Claude Code CLI ──API──▶ Claude Model
                       │                                          │
                       ◀──streams messages──◀──tool use/results──◀┘
```

---

## 4. Quick Start

These two examples are canonical. Copy-paste them to verify your setup.

### `query()` — One-shot

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(
        prompt="What files are in this directory?",
        options=ClaudeAgentOptions(allowed_tools=["Bash", "Glob"])
    ):
        if hasattr(message, "result"):
            print(message.result)

asyncio.run(main())
```

### `ClaudeSDKClient` — Stateful

```python
import asyncio
from claude_agent_sdk import ClaudeSDKClient, AssistantMessage, TextBlock, ResultMessage

async def main():
    async with ClaudeSDKClient() as client:
        await client.query("What is the capital of France?")
        async for msg in client.receive_response():
            if isinstance(msg, AssistantMessage):
                for block in msg.content:
                    if isinstance(block, TextBlock):
                        print(block.text)
            elif isinstance(msg, ResultMessage):
                print(f"Cost: ${msg.total_cost_usd:.4f}")

asyncio.run(main())
```

---

## 5. API: `query()` and `ClaudeSDKClient`

### `query(prompt, options) -> AsyncIterator[Message]`

One-shot async iterator. Takes a `str` prompt and `ClaudeAgentOptions`. Yields `UserMessage`, `AssistantMessage`, `SystemMessage`, `ResultMessage`, or `StreamEvent`.

### `ClaudeSDKClient`

Bidirectional, stateful client. Use as async context manager (`async with`). Alternatively, call `connect()` / `disconnect()` manually.

**Methods:**

| Method | Description |
|---|---|
| `connect()` | Establish connection to CLI subprocess |
| `disconnect()` | Close connection |
| `query(prompt: str)` | Send a message within the current session |
| `receive_response()` | `AsyncIterator[Message]` — yields messages from current query |
| `receive_messages()` | Same as `receive_response()` but includes `UserMessage` (tool results) for full visibility |

**Key differences from `query()`:**

| Feature | `query()` | `ClaudeSDKClient` |
|---|---|---|
| Multi-turn conversations | No | Yes |
| Custom in-process tools | No | Yes |
| Hooks (via options) | Yes | Yes |
| Bidirectional streaming | No | Yes |
| Session resume | Yes (via `resume` option) | Yes |

For multi-turn, send multiple `query()` calls on the same client — the session persists. Use `receive_response()` after each `query()` to consume the reply before sending the next.

---

## 6. API: `ClaudeAgentOptions`

Central configuration dataclass. All fields optional with sensible defaults.

```python
@dataclass
class ClaudeAgentOptions:
    # Tool Configuration
    tools: list[str] | ToolsPreset | None = None
    allowed_tools: list[str] = field(default_factory=list)
    disallowed_tools: list[str] = field(default_factory=list)
    can_use_tool: CanUseTool | None = None

    # System Configuration
    system_prompt: str | SystemPromptPreset | None = None
    model: str | None = None
    fallback_model: str | None = None
    betas: list[SdkBeta] = field(default_factory=list)

    # MCP and Server Configuration
    mcp_servers: dict[str, McpServerConfig] | str | Path = field(default_factory=dict)
    permission_mode: PermissionMode | None = None
    permission_prompt_tool_name: str | None = None

    # Conversation Management
    continue_conversation: bool = False
    resume: str | None = None
    fork_session: bool = False
    max_turns: int | None = None
    include_partial_messages: bool = False

    # Execution Constraints
    max_budget_usd: float | None = None
    max_buffer_size: int | None = None
    max_thinking_tokens: int | None = None

    # File and Directory Configuration
    cwd: str | Path | None = None
    cli_path: str | Path | None = None
    settings: str | None = None
    add_dirs: list[str | Path] = field(default_factory=list)

    # Environment and Arguments
    env: dict[str, str] = field(default_factory=dict)
    extra_args: dict[str, str | None] = field(default_factory=dict)

    # Output and Formatting
    output_format: OutputFormat | None = None

    # Debugging and Callbacks
    stderr: Callable[[str], None] | None = None

    # Hooks and Events
    hooks: dict[HookEvent, list[HookMatcher]] | None = None

    # User and Agent Configuration
    user: str | None = None
    agents: dict[str, AgentDefinition] | None = None
    setting_sources: list[SettingSource] | None = None
```

### Field Descriptions

| Property | Type | Default | Description |
|---|---|---|---|
| `tools` | `list[str] \| ToolsPreset \| None` | `None` | Base tool set. Use `{"type": "preset", "preset": "claude_code"}` for defaults, or `[]` to disable all |
| `allowed_tools` | `list[str]` | `[]` | Auto-approve these tools (bypass permission prompts). Does NOT restrict availability |
| `disallowed_tools` | `list[str]` | `[]` | Completely disable these tools. Overrides `allowed_tools` |
| `can_use_tool` | `CanUseTool \| None` | `None` | Runtime permission callback. Requires `ClaudeSDKClient` (streaming mode) |
| `system_prompt` | `str \| SystemPromptPreset \| None` | `None` | Plain string, or preset: `{"type": "preset", "preset": "claude_code"}`. Add `"append"` key to extend preset |
| `model` | `str \| None` | `None` | Model name: `"sonnet"`, `"opus"`, `"haiku"`, or full ID |
| `fallback_model` | `str \| None` | `None` | Fallback if primary model fails |
| `betas` | `list[SdkBeta]` | `[]` | Currently: `"context-1m-2025-08-07"` for 1M context window |
| `mcp_servers` | `dict[str, McpServerConfig] \| str \| Path` | `{}` | MCP server configs or path to config file |
| `permission_mode` | `PermissionMode \| None` | `None` | `"default"`, `"acceptEdits"`, `"plan"`, or `"bypassPermissions"` |
| `permission_prompt_tool_name` | `str \| None` | `None` | MCP tool for permission prompts. Mutually exclusive with `can_use_tool` |
| `continue_conversation` | `bool` | `False` | Continue most recent conversation |
| `resume` | `str \| None` | `None` | Session ID to resume |
| `fork_session` | `bool` | `False` | Fork to new session when resuming (branch, not continue) |
| `max_turns` | `int \| None` | `None` | Maximum conversation turns |
| `include_partial_messages` | `bool` | `False` | Yield `StreamEvent` messages during streaming |
| `max_budget_usd` | `float \| None` | `None` | Maximum spend in USD |
| `max_buffer_size` | `int \| None` | `None` | Max bytes buffering CLI stdout |
| `max_thinking_tokens` | `int \| None` | `None` | Max tokens for extended thinking blocks |
| `cwd` | `str \| Path \| None` | `None` | Working directory for file operations |
| `cli_path` | `str \| Path \| None` | `None` | Custom path to CLI executable |
| `settings` | `str \| None` | `None` | Path to settings file |
| `add_dirs` | `list[str \| Path]` | `[]` | Additional directories Claude can access |
| `env` | `dict[str, str]` | `{}` | Environment variables passed to CLI |
| `extra_args` | `dict[str, str \| None]` | `{}` | Additional CLI arguments |
| `output_format` | `OutputFormat \| None` | `None` | `{"type": "json_schema", "schema": {...}}` for structured output |
| `stderr` | `Callable[[str], None] \| None` | `None` | Callback for stderr output |
| `hooks` | `dict[HookEvent, list[HookMatcher]] \| None` | `None` | Event hooks for intercepting tool calls |
| `user` | `str \| None` | `None` | User identifier |
| `agents` | `dict[str, AgentDefinition] \| None` | `None` | Programmatic subagent definitions |
| `setting_sources` | `list[SettingSource] \| None` | `None` | `"user"`, `"project"`, `"local"`. `None` = no filesystem settings. Must include `"project"` to load CLAUDE.md |

### Validation Rules

- `can_use_tool` requires streaming mode (`ClaudeSDKClient` or `AsyncIterable` prompt)
- `can_use_tool` and `permission_prompt_tool_name` are mutually exclusive
- Paths must exist when specified

---

## 7. Message & Content Block Types

### Message Types

| Type | Description | Key Fields |
|---|---|---|
| `AssistantMessage` | Claude's response | `content: list[ContentBlock]`, `model: str` |
| `UserMessage` | User messages and tool results | `content: list[ContentBlock]` |
| `SystemMessage` | SDK events (init, etc.) | `subtype: str`, `data: dict`. Subtype `"init"` contains `session_id` |
| `ResultMessage` | Final completion message | `session_id`, `duration_ms`, `duration_api_ms`, `num_turns`, `total_cost_usd`, `result` |
| `StreamEvent` | Partial messages (when `include_partial_messages=True`) | Streaming deltas |

### Content Block Types

| Block | Key Fields | Found In |
|---|---|---|
| `TextBlock` | `text: str` | `AssistantMessage.content` |
| `ToolUseBlock` | `id: str`, `name: str`, `input: dict` | `AssistantMessage.content` |
| `ToolResultBlock` | `tool_use_id: str`, `content: Any` | `UserMessage.content` |
| `ThinkingBlock` | `thinking: str` | `AssistantMessage.content` (extended thinking) |

Process messages by iterating content blocks with `isinstance()` checks.

---

## 8. Built-in Tools

No implementation needed — the SDK provides these:

| Tool | Description |
|---|---|
| `Read` | Read file contents |
| `Write` | Create or overwrite files |
| `Edit` | Precise edits to existing files |
| `MultiEdit` | Multiple edits in one call |
| `Bash` | Run shell commands |
| `Glob` | Find files by pattern |
| `Grep` | Search file contents with regex |
| `LS` | List directory contents |
| `WebSearch` | Search the web |
| `WebFetch` | Fetch and parse web pages |
| `Task` | Spawn subagents (required for subagent invocation) |
| `TodoWrite` | Manage to-do lists |
| `NotebookEdit` | Edit Jupyter notebook cells |

**Default when `cwd` is set:** `Read`, `Grep`, `Glob`, `LS` (read-only). Add `Write`, `Edit`, `Bash` etc. via `allowed_tools` and set `permission_mode="acceptEdits"` for file modifications.

**MCP tool naming convention:** `mcp__<server_name>__<tool_name>` (double underscores).

**Bash restriction syntax:** `"Bash(git:*)"` allows only git commands.

---

## 9. Custom Tools & MCP Servers

### Defining Tools with `@tool`

The `@tool` decorator takes `(name, description, input_schema)`. The handler receives `args: dict` and must return a specific format:

```python
from claude_agent_sdk import tool, create_sdk_mcp_server

@tool("greet", "Greet a user by name", {"name": str})
async def greet_user(args):
    return {
        "content": [{"type": "text", "text": f"Hello, {args['name']}!"}]
    }

# Error response:
# return {"content": [{"type": "text", "text": "Error msg"}], "is_error": True}
```

**Return format (important — not guessable):**
- Success: `{"content": [{"type": "text", "text": "..."}]}`
- Error: Same but add `"is_error": True`

### Creating an SDK MCP Server

Bundle `@tool`-decorated functions into an in-process server with `create_sdk_mcp_server(name, version, tools)`. Then reference in `ClaudeAgentOptions.mcp_servers` and allow via `allowed_tools` using `mcp__<server_name>__<tool_name>`.

### MCP Server Config Types

**In-process SDK server:** Pass the `create_sdk_mcp_server()` result directly as the config value.

**Subprocess/stdio:** `{"command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]}`

**SSE:** `{"type": "sse", "url": "https://my-server.com/sse"}`

**HTTP:** `{"type": "http", "url": "https://my-server.com/mcp"}`

Multiple servers can be combined in one `mcp_servers` dict, mixing types freely.

---

## 10. Hooks

Hooks intercept tool execution at lifecycle events for logging, guardrails, and custom logic.

### Hook Events

| Event | Timing | Use Cases |
|---|---|---|
| `PreToolUse` | Before tool call | Block dangerous ops, validate/modify inputs |
| `PostToolUse` | After tool returns | Log results, add context on errors, halt on critical failures |
| `PostToolUseFailure` | After tool call fails | Error recovery, alerting |

### `HookMatcher`

`HookMatcher(matcher="<regex>", hooks=[fn1, fn2])` — `matcher` is a regex against tool names. Omit `matcher` to match all tools.

Common patterns: `"Bash"`, `"Write|Edit|Delete"`, `"^mcp__"`, or omitted for global.

### Hook Callback Signature and Return Values

```python
async def my_hook(
    input_data: dict,           # tool_name, tool_input (Pre) or tool_response (Post)
    tool_use_id: str | None,    # Correlates Pre/Post for same call
    context: HookContext         # Contains AbortSignal
) -> dict:
    ...
```

**PreToolUse `input_data` keys:** `tool_name`, `tool_input`

**Return values (important — `continue_` has trailing underscore):**

| Return | Effect |
|---|---|
| `{}` | Allow the tool call |
| `{"continue_": False, "stopReason": "..."}` | Block the call |
| `{"toolInput": {...}}` | Modify the tool input |
| `{"systemMessage": "..."}` | Inject a system message into context |

**PostToolUse** receives `tool_response` in `input_data`. Same return options plus:
- `{"continue_": True}` — explicitly continue
- `{"hookSpecificOutput": {"hookEventName": "PostToolUse", "additionalContext": "..."}}` — add context

### Registration

Pass hooks in `ClaudeAgentOptions.hooks` as a dict mapping `HookEvent` to `list[HookMatcher]`:

```python
hooks={
    "PreToolUse": [
        HookMatcher(matcher="Write|Edit", hooks=[protect_env]),
        HookMatcher(hooks=[global_logger]),  # all tools
    ],
    "PostToolUse": [
        HookMatcher(matcher="Bash", hooks=[check_errors]),
    ],
}
```

---

## 11. Permissions

### Processing Order

```
PreToolUse Hook → Deny Rules → Allow Rules → Ask Rules → Permission Mode → canUseTool → PostToolUse Hook
```

### Permission Modes

| Mode | Description |
|---|---|
| `"default"` | Standard; prompts for dangerous operations |
| `"acceptEdits"` | Auto-accept file edits (Read/Write/Edit) |
| `"plan"` | Planning only — no execution |
| `"bypassPermissions"` | Skip all checks (trusted environments only) |

### `allowed_tools` vs `disallowed_tools`

**Critical distinction:** `allowed_tools` only controls auto-approval (bypasses prompts). It does NOT restrict which tools Claude can use. Use `disallowed_tools` to completely disable tools.

### `canUseTool` Callback

`Callable[[str, dict, ToolPermissionContext], Awaitable[PermissionResult]]` — receives tool name, input dict, and context. Returns either:

- **Allow:** `{"behavior": "allow", "updatedInput": input_data}` (can modify input)
- **Deny:** `{"behavior": "deny", "message": "reason"}` (add `"interrupt": True` to halt session)

Requires `ClaudeSDKClient` (streaming mode). Mutually exclusive with `permission_prompt_tool_name`.

---

## 12. Subagents

Subagents are specialized agents with isolated context windows. They enable **parallelization** (multiple agents working simultaneously) and **context management** (only results flow back to the orchestrator).

### `AgentDefinition`

| Field | Required | Type | Description |
|---|---|---|---|
| `description` | Yes | `str` | When to use this agent (main agent reads this to decide delegation) |
| `prompt` | Yes | `str` | System prompt defining role and behavior |
| `tools` | No | `list[str] \| None` | Allowed tools. Inherits from main agent if omitted |
| `model` | No | `"sonnet" \| "opus" \| "haiku" \| "inherit" \| None` | Model override |

### Key Rules

1. **`Task` tool must be in `allowed_tools`** for the main agent to invoke subagents
2. Subagents get **isolated context** — only results return to orchestrator
3. Multiple subagents run **in parallel**
4. Use different `model` per subagent (e.g., `"haiku"` for cheap fast subtasks)

Pass subagents via `ClaudeAgentOptions(agents={"name": AgentDefinition(...)})`.

---

## 13. Structured Output

Force responses to conform to a JSON schema by setting `output_format`:

```python
output_format={"type": "json_schema", "schema": {<standard JSON Schema>}}
```

The result appears on `message.structured_output` (when using `hasattr` check) or in the `ResultMessage`. Combine with subagents and tools freely — the schema applies to the final output.

---

## 14. Session Management

Sessions persist across queries and can be resumed, forked, or continued.

**Capture session ID:** Listen for `SystemMessage` with `subtype == "init"` — `message.data.get("session_id")`.

**Resume:** Set `resume=session_id` in options. Claude retains full conversation context.

**Fork:** Set `resume=session_id` + `fork_session=True`. Creates a new branch from the session — original is unchanged. Useful for exploring alternatives.

**Continue most recent:** Set `continue_conversation=True`.

**Partial messages:** Set `include_partial_messages=True` to receive `StreamEvent` objects as Claude types.

**Dynamic permission mode:** In streaming mode, call `await q.set_permission_mode("acceptEdits")` on the query object mid-session.

Sessions are stored in `~/.claude/projects/`.

---

## 15. Error Handling

### Exception Hierarchy

```
ClaudeSDKError (base)
├── CLINotFoundError        — CLI not installed or not in PATH
├── CLIConnectionError      — Failed to connect to CLI subprocess
├── ProcessError            — CLI exited with error (has exit_code: int, stderr: str)
└── CLIJSONDecodeError      — Failed to parse response (has line: str)
```

Also handle `asyncio.TimeoutError` for long-running queries.

Always use `try/except/finally` with `disconnect()` when managing connections manually (context manager handles this automatically).

---

## 16. Environment Variables & Authentication

### Claude Max/Pro Subscription (Recommended Default)

No environment variables needed. Log in once with `claude`, select subscription, and the SDK auto-detects credentials from `~/.claude/.credentials.json`.

```bash
claude /status    # Check plan and usage
unset ANTHROPIC_API_KEY  # Ensure subscription is used, not API billing
```

### API Key (Alternative)

```bash
export ANTHROPIC_API_KEY="your-api-key"
```

### Third-Party Providers

```bash
export CLAUDE_CODE_USE_BEDROCK=1    # Amazon Bedrock
export CLAUDE_CODE_USE_VERTEX=1     # Google Vertex AI
export CLAUDE_CODE_USE_FOUNDRY=1    # Azure AI Foundry
```

### Proxy / Gateway

Set `ANTHROPIC_BASE_URL` for LiteLLM, Vercel AI Gateway, etc. For gateway auth headers: `ANTHROPIC_CUSTOM_HEADERS="x-ai-gateway-api-key: Bearer ..."`.

### CLI Timeout

```bash
export CLAUDE_CODE_STREAM_CLOSE_TIMEOUT=120000  # milliseconds
```

Pass custom env vars to the CLI via `ClaudeAgentOptions(env={"KEY": "value"})`.

---

## 17. Type Definitions Reference

### Complete Imports

```python
from claude_agent_sdk import (
    # Core
    query, ClaudeSDKClient, ClaudeAgentOptions, AgentDefinition,
    # Tools
    tool, create_sdk_mcp_server,
    # Hooks
    HookMatcher,
    # Messages
    UserMessage, AssistantMessage, SystemMessage, ResultMessage,
    # Content blocks
    TextBlock, ToolUseBlock, ToolResultBlock, ThinkingBlock,
    # Errors
    ClaudeSDKError, CLINotFoundError, CLIConnectionError, ProcessError, CLIJSONDecodeError,
)
```

### Literal Types

```python
PermissionMode = Literal["default", "acceptEdits", "plan", "bypassPermissions"]
HookEvent = Literal["PreToolUse"] | Literal["PostToolUse"] | Literal["PostToolUseFailure"]
SdkBeta = Literal["context-1m-2025-08-07"]
SettingSource = Literal["user", "project", "local"]
```

### MCP Server Config Union

```python
McpServerConfig = McpStdioServerConfig | McpSSEServerConfig | McpHttpServerConfig | McpSdkServerConfig
```

| Type | Key Fields |
|---|---|
| `McpStdioServerConfig` | `command: str`, `args: list[str]`, optional `env: dict` |
| `McpSSEServerConfig` | `type: "sse"`, `url: str` |
| `McpHttpServerConfig` | `type: "http"`, `url: str` |
| `McpSdkServerConfig` | `type: "sdk"`, `name: str`, `instance: Any` |

### Permission Types

```python
PermissionResultAllow = {"behavior": "allow", "updatedInput": dict}
PermissionResultDeny = {"behavior": "deny", "message": str, "interrupt": bool}
PermissionResult = PermissionResultAllow | PermissionResultDeny

CanUseTool = Callable[[str, dict[str, Any], ToolPermissionContext], Awaitable[PermissionResult]]
```

### System Prompt Preset

Plain string or dict: `{"type": "preset", "preset": "claude_code"}` with optional `"append": "extra instructions"`.

### Tools Preset

`{"type": "preset", "preset": "claude_code"}` for the default Claude Code toolset.

---

## 18. Migration from Claude Code SDK

Package renamed from `claude-code-sdk` to `claude-agent-sdk` at version 0.1.0.

| Before | After |
|---|---|
| `pip install claude-code-sdk` | `pip install claude-agent-sdk` |
| `from claude_code_sdk import ...` | `from claude_agent_sdk import ...` |
| `ClaudeCodeOptions` | `ClaudeAgentOptions` |
| Separate system prompt fields | Single `system_prompt` field (string or preset) |
| No settings isolation | `setting_sources` (default `None` = no filesystem settings) |
| No subagents | `agents` parameter with `AgentDefinition` |
| No session forking | `fork_session` parameter |

---

## 19. Patterns & Best Practices

### Safety & Control
- **Start with minimal tools** — only enable what the agent needs
- **Use `"acceptEdits"` not `"bypassPermissions"`** for automation
- **Set `max_turns` and `max_budget_usd`** to prevent runaway agents
- **Add hooks** for production logging and security guardrails
- **Use `disallowed_tools`** to hard-block dangerous tools (it overrides `allowed_tools`)

### Architecture
- **Use subagents for parallel work** — isolated context, concurrent execution
- **Use `"haiku"` for cheap subtasks** via subagent `model` override
- **Use structured output** when agent output feeds another system
- **Set `setting_sources=None`** for reproducible, programmatic-only config
- **Set `cwd` explicitly** — don't rely on process working directory

### Cost Monitoring
- Track via `ResultMessage.total_cost_usd` after each query
- Set `max_budget_usd` as a hard cap
- With Claude Max subscription, costs are included in your plan

### Common Gotchas
- `allowed_tools` does NOT restrict tools — it only auto-approves them. Use `disallowed_tools` to block
- Hook return key is `continue_` (trailing underscore), not `continue` (Python keyword conflict)
- `can_use_tool` requires `ClaudeSDKClient` (streaming mode), not `query()`
- `can_use_tool` and `permission_prompt_tool_name` are mutually exclusive
- MCP tool names use double underscores: `mcp__server__tool`
- `Task` must be in `allowed_tools` for subagent invocation
- If `ANTHROPIC_API_KEY` is set, it overrides your Max subscription credentials

---

## 20. Skills

Skills are **reusable instruction packages** that Claude discovers and loads on-demand. Unlike subagents (which are defined programmatically), Skills are **filesystem artifacts** — directories containing a `SKILL.md` file. Claude reads the skill content only when it determines the skill is relevant, keeping the context window efficient.

### How Skills Work

1. **Defined as filesystem artifacts** — `SKILL.md` files in `.claude/skills/` directories
2. **Loaded from filesystem** — requires `setting_sources` to be configured
3. **Auto-discovered at startup** — metadata indexed from user and project directories
4. **Lazy-loaded** — full content loaded into context only when Claude invokes the skill
5. **Model-invoked** — Claude autonomously decides when to use a skill based on its description

### Enabling Skills in the SDK

Two requirements — both must be met:

1. **Set `setting_sources`** to include `"user"` and/or `"project"` (default is `None`, which loads nothing)
2. **Add `"Skill"` to `allowed_tools`**

```python
options = ClaudeAgentOptions(
    cwd="/path/to/project",                    # Must contain .claude/skills/
    setting_sources=["user", "project"],       # Required — loads skills from filesystem
    allowed_tools=["Skill", "Read", "Write", "Bash"]  # "Skill" enables skill invocation
)
```

> **Default behavior:** The SDK loads NO filesystem settings by default. Without `setting_sources`, skills (and CLAUDE.md files) are invisible.

### Skill Locations

| Source | Directory | Loaded When |
|---|---|---|
| **Project skills** | `.claude/skills/` (relative to `cwd`) | `setting_sources` includes `"project"` |
| **User skills** | `~/.claude/skills/` | `setting_sources` includes `"user"` |
| **Plugin skills** | Bundled with installed Claude Code plugins | Automatic when plugin installed |

Project skills are shareable via git. User skills are personal and apply across all projects.

### Creating a Skill

A skill is a directory containing a `SKILL.md` file with YAML frontmatter:

```
.claude/skills/
└── process-csv/
    ├── SKILL.md
    ├── scripts/
    │   └── validate.py
    └── references/
        └── schema.md
```

**SKILL.md format:**

```markdown
---
name: CSV Processor
description: Processes and validates CSV files, fixing common formatting issues
allowed-tools: "Read, Write, Bash(python {baseDir}/scripts/:*)"
---

# CSV Processing Skill

When asked to process a CSV file:
1. Read the file and validate against the schema in `{baseDir}/references/schema.md`
2. Run `python {baseDir}/scripts/validate.py --input <file>` to check for errors
3. Fix any issues found and write the corrected file
```

**Frontmatter fields:**

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Human-readable skill name |
| `description` | Yes | **Critical** — Claude reads this to decide when to invoke the skill. Be specific. |
| `allowed-tools` | No | Tools the skill needs. `{baseDir}` resolves to the skill's directory |

### Skill Design Patterns

**Pattern 1 — Script Automation:** The skill tells Claude to run a bundled script and process its output. Put deterministic logic in `scripts/`, keep Claude for interpretation and error handling. Use `allowed-tools: "Bash(python {baseDir}/scripts/:*)"` to restrict Bash to only the skill's scripts.

**Pattern 2 — Read-Process-Write:** The simplest pattern — read input, transform per instructions, write output. No scripts needed. Good for format conversions, data cleanup, report generation.

**Pattern 3 — Reference-Guided:** The skill loads detailed reference material from `references/` only when needed. Put API schemas, style guides, checklists, or large pattern libraries in `references/`. Keeps `SKILL.md` lean while giving Claude access to deep context.

**Pattern 4 — Multi-Step Workflow:** The skill defines a sequential workflow with validation gates. Each step has clear success criteria. Claude proceeds step-by-step, verifying before advancing.

### `{baseDir}` Variable

In both `SKILL.md` content and the `allowed-tools` frontmatter, `{baseDir}` resolves to the skill's directory at runtime. Use it for referencing bundled scripts, references, and assets.

### Skills vs Subagents vs System Prompts

| Aspect | Skills | Subagents | System Prompts |
|---|---|---|---|
| **Defined** | Filesystem (`SKILL.md`) | Programmatic (`AgentDefinition`) | Programmatic (string/preset) |
| **Context** | Loaded on-demand into main context | Isolated context window | Always in context |
| **When to use** | Reusable workflows, team-shared procedures | Parallel work, specialized roles | Global behavior, tone, constraints |
| **Shareable** | Via git (project skills) | Via code | Via code or CLAUDE.md |
| **Invocation** | Claude decides autonomously | Claude delegates via `Task` tool | Always active |

### Common Skill Gotchas

- **Missing `setting_sources`** — most common issue. Without it, skills are invisible
- **Wrong `cwd`** — must point to the directory containing `.claude/skills/`, not the skills directory itself
- **Vague `description`** — Claude uses the description to decide relevance. "Helps with stuff" won't trigger; "Processes and validates CSV files with column type checking" will
- **No programmatic API** — you cannot register skills via Python code; they must be filesystem artifacts
- **Linux path issue (SDK ≤ v0.2.x)** — early SDK versions had hardcoded macOS paths for skill discovery; ensure you're on a recent version

---

## 21. Use Cases & Agent Design Patterns

This section describes real-world agent architectures you can build with the SDK. These are described in natural language — Opus can generate the implementation code from these descriptions and the API reference above.

### Code Review Pipeline

Build a multi-subagent code review system. The orchestrator receives a PR diff or file list and delegates to specialized subagents:

- **Security scanner** subagent — uses `Read` and `Grep` to find hardcoded secrets, SQL injection patterns, XSS vectors. Model: `haiku` (fast, cheap). Returns a structured list of findings with severity.
- **Style checker** subagent — reads files and checks against project conventions from a CLAUDE.md or skill. Flags inconsistencies.
- **Test analyzer** subagent — uses `Read` and `Bash` to check test coverage, identify untested paths, suggest missing test cases.
- **Orchestrator** — collects all subagent results via `Task` tool, synthesizes into a unified review. Uses structured output to produce a JSON report.

Key config: `allowed_tools=["Task", "Read", "Grep", "Glob"]`, three `AgentDefinition` entries, `output_format` with JSON schema for the final report.

### Research Agent

A multi-phase research system that gathers, synthesizes, and reports:

- Phase 1: **Query expansion** — the orchestrator takes a research question and generates multiple search queries
- Phase 2: **Parallel search** — subagents run `WebSearch` and `WebFetch` concurrently to gather sources
- Phase 3: **Synthesis** — orchestrator reads all subagent results and produces a structured report with citations

Tip: Use `max_turns=10` on search subagents to prevent them from spiraling. Use `"haiku"` for search subagents (they just need to fetch and extract), `"opus"` or `"sonnet"` for the synthesis step.

### Email Automation Agent

An agent that manages email workflows via MCP:

- Connect an IMAP MCP server for reading emails, an SMTP MCP server for sending
- Add a calendar MCP server for scheduling
- The agent triages incoming emails, drafts responses, schedules meetings, and flags items needing human review
- Use `PreToolUse` hooks to require confirmation before sending emails (critical — never let an agent send without review in early iterations)
- Use `canUseTool` for runtime approval of outgoing messages

### Document Analysis Agent

Process documents at scale using Skills and built-in tools:

- Create a `process-pdf` skill with bundled Python scripts for PDF text extraction
- Create a `summarize-findings` skill with a reporting template
- The agent reads documents, extracts key data, fills templates, and writes reports
- Use structured output to produce consistent JSON for downstream systems
- `add_dirs` to give the agent access to an input documents folder and an output folder

### Deployment & CI Agent

Automate deployment verification workflows:

- The agent runs pre-deployment checks via `Bash`: environment variables set, database connections valid, no hardcoded secrets, all services running
- Uses `PreToolUse` hooks to block destructive commands (`rm -rf`, `DROP TABLE`, force pushes)
- Subagent architecture: one agent runs tests, another checks configs, a third verifies infrastructure
- Uses `max_turns` and `max_budget_usd` as safety rails
- Session management: resume the same session across CI runs to maintain context about previous deployments

### Financial/Compliance Agent

Process financial documents with strict guardrails:

- Download encrypted documents → decrypt → extract data → validate against rules → load into database
- Each step is a separate operation via `Bash`, with `PostToolUse` hooks validating output before proceeding
- `disallowed_tools` to block `WebSearch` and `WebFetch` (no external data leakage)
- Structured output for audit-ready JSON reports
- `max_budget_usd` as a hard cap for cost control

### Interactive Chat Agent with Tools

Build a conversational assistant with persistent sessions:

- Use `ClaudeSDKClient` for multi-turn conversations
- Enable `Read`, `Write`, `Edit`, `Bash`, `WebSearch` for full capability
- Capture `session_id` from the init `SystemMessage` to enable resume across restarts
- Store session IDs in a database keyed by user ID
- Use `fork_session=True` to let users branch conversations and explore alternatives
- Add custom MCP tools for domain-specific operations (database queries, API calls, etc.)

### Agent Design Tips

**Start simple, add complexity.** Begin with `query()` and two or three tools. Only move to `ClaudeSDKClient` when you need multi-turn or custom tools. Only add subagents when you need parallelism or context isolation.

**Use the right model per task.** `haiku` for data extraction, search, simple transforms. `sonnet` for coding, analysis, most general work. `opus` for complex reasoning, synthesis, architecture decisions. Mix models via subagent `model` overrides to optimize cost.

**Skills for team knowledge, subagents for parallel roles.** If the capability is a reusable procedure that your team shares (like "how we process invoices"), make it a skill. If it's a specialized role that runs in parallel (like "security reviewer"), make it a subagent.

**Always set `cwd` explicitly.** Don't rely on the process working directory — it leads to inconsistent behavior across environments.

**Use `setting_sources=None` for reproducibility.** When you want fully programmatic, deterministic agent behavior with no filesystem influence, set `setting_sources=None`. When you want skills and CLAUDE.md, set `setting_sources=["user", "project"]`.

**Hook everything in production.** Log every tool call with `PostToolUse` hooks. Block dangerous patterns with `PreToolUse` hooks. This is your observability layer.

**Budget and turn limits are not optional.** In production, always set `max_budget_usd` and `max_turns`. Agents can loop, retry, and spiral. These are your circuit breakers.

**Structured output for machine consumption.** Whenever an agent's output feeds another system (API, database, pipeline), use `output_format` with a JSON schema. Don't parse free text.

**Session management for long-running workflows.** Capture session IDs, store them, resume later. Fork sessions to explore alternatives without losing the original state. This is how you build workflows that span multiple invocations.

---

## Appendix: Quick Reference Card

```
INSTALL
  npm install -g @anthropic-ai/claude-code
  pip install claude-agent-sdk
  claude  → login with Max subscription (recommended)

TWO MODES
  query(prompt, options)   — one-shot async iterator
  ClaudeSDKClient          — stateful, multi-turn, custom tools + hooks

KEY IMPORTS
  query, ClaudeSDKClient, ClaudeAgentOptions, AgentDefinition
  tool, create_sdk_mcp_server, HookMatcher
  AssistantMessage, TextBlock, ResultMessage, UserMessage, SystemMessage
  ToolUseBlock, ToolResultBlock, ThinkingBlock
  ClaudeSDKError, CLINotFoundError, CLIConnectionError, ProcessError

PERMISSION MODES
  "default"  "acceptEdits"  "plan"  "bypassPermissions"

BUILT-IN TOOLS
  Read  Write  Edit  MultiEdit  Bash  Glob  Grep
  LS  WebSearch  WebFetch  Task  TodoWrite  NotebookEdit

HOOK EVENTS
  PreToolUse  PostToolUse  PostToolUseFailure

MCP TOOL NAMING
  mcp__<server_name>__<tool_name>

SKILLS
  Filesystem: .claude/skills/<name>/SKILL.md
  Requires: setting_sources=["user","project"] + "Skill" in allowed_tools
  {baseDir} → resolves to skill directory at runtime

SESSION
  resume=session_id  fork_session=True  continue_conversation=True

COST
  ResultMessage.total_cost_usd
  max_budget_usd=1.0
```

---

*Generated from official Anthropic documentation, Context7, and community sources. February 2026.*
