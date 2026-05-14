---
name: claude-agent-sdk-python
description: Comprehensive reference for building AI agents with the Claude Agent SDK Python package (claude-agent-sdk). Use when writing Python code that imports claude-agent-sdk, designing agent architectures with subagents, configuring hooks/permissions/MCP servers, troubleshooting SDK issues, or choosing between query() and ClaudeSDKClient. Covers authentication (Claude Max subscription recommended), tools, structured output, sessions, and skills.
allowed-tools: Read, Grep, Glob
user-invocable: true
---

# Claude Agent SDK (Python) — Build Reference

Load the full API reference from [full-reference.md](references/full-reference.md) when you need detailed documentation.

## Quick Facts

- **Package**: `claude-agent-sdk` (PyPI). Formerly `claude-code-sdk`.
- **Prerequisites**: Python 3.10+, Node.js 18+, Claude Code CLI (`npm install -g @anthropic-ai/claude-code`)
- **Auth (recommended)**: Claude Max subscription — run `claude`, select subscription. Auto-detected from `~/.claude/.credentials.json`. No env vars needed.
- **Auth (alternative)**: `export ANTHROPIC_API_KEY="..."` (pay-per-use)
- **Gotcha**: If `ANTHROPIC_API_KEY` is set, it overrides Max subscription. Unset it.

## Two Modes

| Mode | When |
|---|---|
| `query(prompt, options)` | One-shot. Scripts, batch, simple queries |
| `ClaudeSDKClient` | Stateful multi-turn. Custom tools, hooks, bidirectional |

## Core Imports

```python
from claude_agent_sdk import (
    query, ClaudeSDKClient, ClaudeAgentOptions, AgentDefinition,
    tool, create_sdk_mcp_server, HookMatcher,
    UserMessage, AssistantMessage, SystemMessage, ResultMessage,
    TextBlock, ToolUseBlock, ToolResultBlock, ThinkingBlock,
    ClaudeSDKError, CLINotFoundError, CLIConnectionError, ProcessError, CLIJSONDecodeError,
)
```

## Custom Tool Return Format (Critical — Not Guessable)

```python
@tool("name", "description", {"param": str})
async def handler(args):
    return {"content": [{"type": "text", "text": "result"}]}
    # Error: return {"content": [...], "is_error": True}
```

## Hook Return Key Gotcha

Key is `continue_` (trailing underscore), NOT `continue`:
- Block: `{"continue_": False, "stopReason": "..."}`
- Modify: `{"toolInput": {...}}`
- Allow: `{}`

## Critical Gotchas

- `allowed_tools` only auto-approves — does NOT restrict. Use `disallowed_tools` to block.
- `can_use_tool` requires `ClaudeSDKClient`, not `query()`.
- `Task` must be in `allowed_tools` for subagent invocation.
- MCP tool names: `mcp__<server>__<tool>` (double underscores).
- Skills need `setting_sources=["user","project"]` AND `"Skill"` in `allowed_tools`.

## For Complete Details

Read [references/full-reference.md](references/full-reference.md) for all 21 sections including:
- Full ClaudeAgentOptions dataclass (30+ fields with descriptions)
- Message & content block types
- MCP server configs (Stdio, SSE, HTTP, SDK)
- Hooks (PreToolUse, PostToolUse, PostToolUseFailure) with callback signatures
- Permission processing order and canUseTool callback
- Subagents (AgentDefinition fields, parallel execution)
- Structured output (output_format with JSON schema)
- Session management (resume, fork, continue)
- Error hierarchy
- Skills (SKILL.md format, locations, design patterns)
- 7 real-world agent architecture patterns
- Agent design tips and cost optimization
