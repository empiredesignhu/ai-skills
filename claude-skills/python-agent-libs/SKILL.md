---
name: python-agent-libs
description: "Comprehensive Python library reference for AI agent development. Covers frameworks, LLM SDKs, vector databases, web scraping, data processing, databases, orchestration, observability, CLI/GUI, packaging, and architecture patterns. Use when selecting Python libraries for any use case including agents, APIs, data pipelines, automation, scraping, dashboards, or desktop apps."
argument-hint: "[use-case or question]"
---

# Python Agent & Application Libraries Reference

When the user asks about Python libraries, frameworks, or architecture for any use case, consult this guide and the full reference at `/Users/gorogadam/Documents/python-agent-libraries-guide.md`.

---

## Quick Decision Framework

**Building an AI agent?**
- Simple single-agent with tools → PydanticAI (type-safe, dependency injection, model-agnostic)
- Complex multi-step workflows with branching → LangGraph (graph-based state machines, checkpointing)
- Team of role-based agents collaborating → CrewAI (role/goal/backstory per agent, delegation)
- Minimal footprint, code-writing agents → Smolagents (HuggingFace, ~1000 LOC)
- Production multi-agent with handoffs → OpenAI Agents SDK (handoffs, guardrails, tracing)
- Enterprise actor-model agents → AutoGen / Microsoft Agent Framework

**Building a web API?**
- Modern async API → FastAPI + Pydantic v2
- Simple microservice → Flask
- High-performance async → Starlette (FastAPI's foundation)

**Need a database?**
- Prototyping with vectors → ChromaDB (zero-config, in-process)
- Production vector search → Qdrant (Rust core, ~1ms queries, filtering)
- Managed vector service → Pinecone (serverless, auto-scaling)
- In-memory similarity → FAISS (Meta, fastest raw speed ~0.3ms)
- Already using PostgreSQL → pgvector extension
- Relational + Pydantic models → SQLModel
- Full ORM power → SQLAlchemy 2.0 + Alembic migrations

**Processing data?**
- General data wrangling → pandas (universal ecosystem)
- Performance-critical / large datasets → polars (5-50x faster, Rust core, lazy evaluation)
- Both together → polars for compute, pandas for ecosystem compatibility

**Task orchestration?**
- Distributed task queue → Celery + Redis/RabbitMQ
- Durable long-running workflows → Temporal (survives crashes, auto-retry)
- ML/data pipelines → Prefect (Python-native, DAG-free)
- Batch ETL scheduling → Airflow

---

## AI/LLM Agent Frameworks

### LangGraph (LangChain ecosystem)
Best for complex, stateful multi-step agent workflows. Models agents as directed graphs where nodes are actions and edges are transitions. Built-in checkpointing lets you pause/resume/rewind. Human-in-the-loop support. Streaming token-by-token output. Use when you need branching logic, cycles, or persistent state across agent steps. Requires understanding graph concepts. Part of the LangChain ecosystem but can be used independently.

### CrewAI
Best for multi-agent collaboration with defined roles. Each agent gets a role, goal, and backstory. Agents delegate tasks to each other. Sequential or hierarchical process flows. Built-in memory (short-term, long-term, entity). Good for content pipelines, research teams, analysis workflows. Simpler API than LangGraph but less flexible for complex branching.

### PydanticAI
Best for type-safe single agents with dependency injection. Built by the Pydantic team. Agents return structured Pydantic models. Model-agnostic (OpenAI, Anthropic, Gemini, Groq, Mistral, Ollama). Dependency injection system for testing. Logfire integration for observability. Excellent when you want validated, typed outputs from LLM calls. Newer framework but production-ready.

### Smolagents (HuggingFace)
Minimal agent framework (~1000 lines of code). Agents write Python code as actions rather than using JSON tool calls. CodeAgent generates and executes code directly. Supports any LLM via LiteLLM. Best when you want a lightweight, auditable agent without framework overhead.

### OpenAI Agents SDK (formerly Swarm)
Production multi-agent orchestration from OpenAI. Key concept: "handoffs" where one agent transfers to another. Built-in guardrails for input/output validation. Tracing for debugging agent flows. Best for OpenAI-centric stacks needing multi-agent coordination.

### AutoGen / Microsoft Agent Framework
Actor-model based multi-agent conversations. Agents send messages to each other asynchronously. Supports group chat patterns. Good for enterprise scenarios with many specialized agents. More complex setup but very flexible communication patterns.

### LlamaIndex
Best for RAG (Retrieval-Augmented Generation) and data-connected agents. Excellent document loaders (PDF, web, databases, APIs). Sophisticated indexing and retrieval strategies. Query engines that combine retrieval with LLM reasoning. Use when your agent needs to work with large document collections or knowledge bases.

---

## LLM Provider SDKs & Utilities

### Provider SDKs
- **openai** — Official OpenAI SDK. Chat completions, embeddings, function calling, vision, audio. The de facto standard interface pattern.
- **anthropic** — Official Anthropic SDK. Claude models, tool use, long context. Streaming support.
- **google-generativeai** — Google's Gemini models. Multimodal (text, image, video, audio).

### Unified Interfaces
- **litellm** — Single interface for 100+ LLM providers. Drop-in OpenAI replacement. Handles auth, rate limiting, fallbacks, cost tracking. Essential for multi-provider strategies.
- **instructor** — Structured output extraction from any LLM. Wraps provider SDKs to return Pydantic models. Handles retries and validation. Use whenever you need reliable structured data from LLM calls.

---

## Data Validation & Serialization

### Pydantic v2
The foundation of modern Python data handling. 5-50x faster than v1 (Rust core). Use for API request/response models, configuration, LLM output schemas, database models (via SQLModel). Discriminated unions for polymorphic data. Custom validators and serializers. Every Python agent project should use Pydantic.

### msgspec
Alternative to Pydantic when raw speed matters most. Even faster serialization. Less ecosystem integration but excellent for high-throughput data processing.

---

## HTTP Clients & API Frameworks

### FastAPI
The standard for Python async APIs. Automatic OpenAPI docs. Pydantic integration for request validation. Dependency injection. WebSocket support. Use for agent API endpoints, webhook receivers, and microservices.

### httpx
Modern async/sync HTTP client. Drop-in replacement for requests with async support. HTTP/2, connection pooling, timeout handling. Use for all outbound HTTP calls in async applications.

### aiohttp
Alternative async HTTP client/server. Mature, battle-tested. WebSocket client/server. Good when you need both client and server in one package.

### requests
Synchronous HTTP client. Universal, simple API. Use only in synchronous code or scripts. For async applications, prefer httpx.

---

## Web Scraping & Browser Automation

### Playwright
Best for JavaScript-rendered pages. Controls Chromium, Firefox, WebKit. Auto-waiting for elements (no manual sleep). Handles SPAs, lazy loading, infinite scroll. Async-first. Use for any scraping that requires JavaScript execution. Stealth mode with playwright-stealth for anti-bot bypass.

### BeautifulSoup4 + httpx
Best for static HTML pages. Fast, lightweight. Use httpx for fetching, BS4 for parsing. No JavaScript rendering. Ideal for simple scraping tasks, RSS feeds, and static content extraction.

### Scrapy
Best for large-scale crawling. Built-in request scheduling, deduplication, rate limiting. Middleware pipeline for processing. Use when scraping thousands of pages with complex crawling logic.

### crawl4ai
Purpose-built for LLM-ready content extraction. Converts web pages to clean markdown. Handles chunking for LLM context windows. Use when scraping specifically to feed content into LLM pipelines.

---

## Vector Databases & Embeddings

### Embedding Models
- **OpenAI text-embedding-3-small/large** — Best general-purpose. 1536/3072 dimensions. Matryoshka support for dimension reduction.
- **sentence-transformers** — Open-source, local. all-MiniLM-L6-v2 for speed, all-mpnet-base-v2 for quality. Free, no API costs.
- **Cohere embed-v3** — Excellent multilingual. Compression support.
- **FastEmbed** — Optimized local inference, ONNX runtime.

### Vector Database Comparison

| Database | Best For | Query Speed | Setup |
|----------|----------|-------------|-------|
| ChromaDB | Prototyping | ~2.6ms | Zero-config, pip install |
| Qdrant | Production | ~1ms | Docker or cloud |
| Pinecone | Managed service | ~300ms | Cloud-only, serverless |
| FAISS | Raw speed | ~0.3ms | In-memory, no persistence |
| Milvus | Enterprise | ~2ms | Kubernetes |
| Weaviate | Hybrid search | ~3ms | Docker or cloud |
| pgvector | Existing PostgreSQL | ~5ms | PostgreSQL extension |

**Decision guide**: Start with ChromaDB for prototyping. Move to Qdrant for production self-hosted or Pinecone for managed. Use FAISS only for in-memory batch processing. Use pgvector if you're already on PostgreSQL and don't want another database.

---

## Data Processing & Analysis

### pandas
Universal data manipulation. DataFrames for tabular data. Extensive ecosystem (every library integrates with pandas). Use for data cleaning, transformation, analysis, CSV/Excel/SQL I/O. Memory-heavy for large datasets.

### polars
High-performance alternative to pandas. 5-50x faster on benchmarks. Rust core with Python bindings. Lazy evaluation (query optimization before execution). Better memory efficiency. Use for large datasets, performance-critical pipelines, or when pandas is too slow. Growing ecosystem but not yet universal.

### NumPy
Foundation for numerical computing. Array operations, linear algebra, random sampling. Used by nearly every scientific Python library. Essential for any mathematical computation.

---

## Databases & ORMs

### SQLModel
Pydantic + SQLAlchemy in one model definition. Define your database schema and API schema with the same class. Best for FastAPI projects. Simpler than raw SQLAlchemy for common patterns.

### SQLAlchemy 2.0 + Alembic
Full-featured ORM with migration support. New 2.0 style uses more Pythonic patterns. Alembic handles schema migrations. Use for complex database applications needing full ORM power.

### asyncpg
Fastest PostgreSQL driver for Python. Pure async. Use when you need maximum PostgreSQL performance in async applications. Often used behind SQLAlchemy's async engine.

### redis-py (with async)
Redis client for caching, session storage, pub/sub, task queues. Async support. Use for caching LLM responses, rate limiting, real-time features.

### sqlite3 (stdlib) / aiosqlite
Built-in SQLite for local persistence. Zero-config. aiosqlite for async access. Perfect for local agent state, caching, and small applications.

---

## Task Queues & Workflow Orchestration

### Celery
Standard distributed task queue. Redis or RabbitMQ as broker. Task routing, retries, rate limiting, scheduled tasks. Use for background job processing, distributed computing. Mature and well-documented.

### Temporal
Durable workflow execution. Workflows survive process crashes, server restarts, even deployments. Automatic retry with backoff. Activity heartbeating. Use for long-running agent workflows (hours/days), financial transactions, or any workflow that must complete reliably.

### Prefect
Python-native workflow orchestration. No DAG files—just decorate functions. Built-in UI for monitoring. Good for ML pipelines and data workflows. Simpler than Airflow for Python-centric teams.

### Airflow
Batch ETL scheduling. DAG-based workflow definition. Extensive operator library. Use for scheduled data pipelines, not real-time processing. Enterprise standard but complex setup.

---

## CLI & Terminal UI

### Typer
Build CLI tools from type-annotated functions. Auto-generates help text. Built on Click. Use for any command-line tool or agent interface.

### Rich
Beautiful terminal formatting. Tables, progress bars, syntax highlighting, markdown rendering, tree views. Use for any terminal output that needs to look good.

### Textual
Full terminal UI framework. CSS-like styling (TCSS). Widgets, layouts, scrolling, input fields. Build dashboard-style terminal applications. Can serve via browser with `textual serve`. 32k+ GitHub stars, very active.

---

## Observability & Logging

### structlog
Structured logging for production. JSON output, context binding, processor pipeline. Use in production applications where logs need to be parsed by log aggregation systems.

### loguru
Developer-friendly logging. Beautiful colored output, simple API, automatic rotation. Use for development and simpler applications. One-line setup.

### OpenTelemetry
Distributed tracing standard. Traces requests across services. Exports to Jaeger, Zipkin, cloud providers. Use for microservice architectures and debugging distributed agent systems.

### Agent-Specific Observability
- **LangSmith** — LangChain ecosystem tracing. Visualize agent steps, token usage, latency.
- **Logfire** — Pydantic team's observability. Deep PydanticAI integration. OpenTelemetry-based.
- **Langfuse** — Open-source LLM observability. Self-hostable. Prompt management. Works with any framework.

---

## File Processing

### PyMuPDF (fitz)
Fastest PDF library. Text extraction, rendering, annotation. Use for any PDF processing in agents. Package name is `PyMuPDF`, import as `fitz`.

### python-docx / openpyxl
Word and Excel file manipulation. Create, read, modify Office documents. Use when agents need to generate reports or process uploaded documents.

### Pillow
Image processing. Resize, crop, filter, format conversion. Use for image preprocessing before sending to vision models.

---

## Authentication & Security

### keyring
OS-native credential storage (macOS Keychain, Windows Credential Locker, Linux Secret Service). Use for storing API keys, tokens, and passwords securely. Never store credentials in plaintext files.

### python-jose / PyJWT
JWT creation and verification. Use for API authentication tokens.

### passlib
Password hashing (bcrypt, argon2). Use for user authentication systems.

### cryptography
Low-level cryptographic operations. Encryption, signing, certificates. Use when you need custom crypto beyond hashing and JWT.

---

## Testing

### pytest
Standard Python test framework. Fixtures, parametrize, plugins. Use for all testing.

### pytest-asyncio
Async test support for pytest. Use for testing async agents, API endpoints, and database operations.

### respx / pytest-httpx
Mock HTTP responses in tests. Use for testing code that calls external APIs without making real requests.

### factory-boy
Test data factories. Generate realistic test objects. Use for creating test fixtures for database models.

---

## Async & Concurrency

### asyncio (stdlib)
Python's async runtime. Event loop, coroutines, tasks. Foundation for all async Python code. Use `asyncio.gather()` for concurrent operations, `asyncio.Queue` for producer-consumer patterns.

### anyio
Async runtime abstraction. Works with both asyncio and trio. Use when you want runtime-agnostic async code.

### multiprocessing (stdlib)
True parallelism for CPU-bound work. Process pools for parallel computation. Use for heavy data processing, image/video manipulation, or any CPU-intensive task that needs to bypass the GIL.

---

## GUI Frameworks (Desktop Applications)

### PySide6 (Qt)
Professional desktop applications. LGPL license (free commercial use). Extensive widget library including tables, charts, media players. Signals/slots for clean event handling. Qt Designer for visual UI building. Handles thousands of table rows efficiently. Use for any serious desktop application. Exe size: 80-150MB.

### CustomTkinter
Modern-looking simple utilities. Ships with Python (base Tkinter). Dark mode support. Smallest executables (15-30MB). Best AI code generation reliability. Use for simple tools, config editors, utilities. Development has slowed (last release Jan 2024).

### Dear PyGui
GPU-accelerated dashboards and real-time visualization. 88fps vs 12fps for PyQt on dashboards. DirectX/Metal/OpenGL rendering. ImPlot built-in for real-time charting. Async by default. Use for monitoring tools, simulations, scientific visualization. Exe size: 30-50MB.

### Kivy
Only Python option for iOS/Android. GPU-accelerated OpenGL. Multi-touch support. Non-native appearance on all platforms. Complex mobile build process (Buildozer). Use only when you need Python on mobile.

### NiceGUI
Backend-first web UI. FastAPI + Vue.js under the hood. 10ms refresh intervals. AG-Grid integration. Offline-capable. Use for dashboards, monitoring interfaces, and internal tools where browser-based is acceptable.

### Flet
Flutter-powered cross-platform. Win/Mac/Linux/iOS/Android/Web from single codebase. 100+ Material & Cupertino controls. Hot reload. Flet 1.0 in beta. Growing AI reliability.

### Textual
Terminal UI framework. CSS-like styling. Native asyncio. Browser serving. Best for CLI-first applications, SSH-accessible tools, embedded systems.

---

## Packaging & Distribution

### PyInstaller (v6.18.0)
Standard Python-to-executable packager. One-folder mode (faster startup, fewer antivirus issues) vs one-file mode (simpler distribution). Use clean virtual environments. Exclude unused Qt modules to reduce size.

### Size reduction tips
- Clean venv with only required packages
- Exclude matplotlib if unused
- Exclude QtWebEngine if unused (saves 175MB+)
- UPX compression
- Framework-specific: CustomTkinter needs `--add-data`, Kivy needs sdl2/glew in spec, Flet has built-in `flet build`

### Code signing
- Windows: Microsoft Trusted Signing ($9.99/month) or OV Certificate ($215-350/year)
- macOS: Apple Developer Program ($99/year), notarization required for distribution outside App Store

---

## Common Agent Architecture Patterns

### Pattern 1: Simple RAG Agent
User query → embed query → vector search → retrieve relevant chunks → combine with prompt → LLM generates answer. Use LlamaIndex or LangChain for document loading and indexing. ChromaDB or Qdrant for vector storage. Best for Q&A over documents, knowledge bases, support bots.

### Pattern 2: Multi-Agent Pipeline
Orchestrator agent receives task → decomposes into subtasks → delegates to specialist agents (researcher, writer, critic) → aggregates results → returns final output. Use CrewAI for role-based teams or LangGraph for graph-based orchestration. Best for content creation, analysis workflows, complex research tasks.

### Pattern 3: Tool-Using API Agent
User request → LLM decides which tools to call → executes API calls, database queries, calculations → LLM synthesizes results → responds to user. Use PydanticAI or OpenAI function calling. Define tools as typed Python functions. Best for assistants that interact with external services, data retrieval, automated actions.

### Pattern 4: Long-Running Durable Workflow
Trigger event → Temporal workflow starts → executes activities (API calls, LLM inference, human review) → survives crashes → completes over hours/days. Use Temporal for durability. Activities can be LLM calls, tool executions, or human-in-the-loop approvals. Best for business processes, document review, multi-day agent tasks.

### Pattern 5: Document Processing Pipeline
Ingest documents → extract text (PyMuPDF) → chunk intelligently → embed chunks → store in vector DB → serve queries. Add metadata extraction, table parsing (pdfplumber), and image description (vision models) for richer indexing. Best for enterprise document search, legal discovery, research databases.

### Pattern 6: Web Research Agent
Receive research topic → generate search queries → scrape/fetch web pages (Playwright/httpx) → extract relevant content (crawl4ai/BS4) → synthesize findings with LLM → generate structured report. Add fact-checking by cross-referencing sources. Use async for concurrent fetching. Best for market research, competitive analysis, literature review.

---

## Recommended Base Stack for New Agent Projects

**Core**: Python 3.12+, Pydantic v2, httpx, structlog/loguru
**Agent framework**: PydanticAI (single agent) or LangGraph (multi-step) or CrewAI (multi-agent)
**LLM access**: litellm (multi-provider) or direct SDK (openai/anthropic)
**Structured output**: instructor
**Vector storage**: ChromaDB (prototype) → Qdrant (production)
**Database**: SQLModel + SQLite (small) or PostgreSQL + asyncpg (production)
**API layer**: FastAPI
**Testing**: pytest + pytest-asyncio + respx
**CLI**: Typer + Rich
**GUI**: PySide6 (complex) or CustomTkinter (simple)

---

## Install Cheatsheet

**Agent essentials**: pydantic, httpx, litellm, instructor, openai, anthropic
**LangChain stack**: langchain, langgraph, langchain-openai, langchain-anthropic, langsmith
**CrewAI stack**: crewai, crewai-tools
**Vector DBs**: chromadb, qdrant-client, pinecone-client, faiss-cpu
**Web scraping**: playwright, beautifulsoup4, scrapy, crawl4ai
**Data**: pandas, polars, numpy
**Database**: sqlmodel, sqlalchemy, alembic, asyncpg, aiosqlite, redis
**API**: fastapi, uvicorn
**CLI/TUI**: typer, rich, textual
**Testing**: pytest, pytest-asyncio, respx, factory-boy
**Logging**: structlog, loguru
**Files**: PyMuPDF, python-docx, openpyxl, Pillow
**GUI**: PySide6, customtkinter, dearpygui, kivy, nicegui, flet

For the full comprehensive guide with more details, implementation ideas, and architecture explanations, read: `/Users/gorogadam/Documents/python-agent-libraries-guide.md`
