---
name: database-schema-design
description: Use this skill when performing database schema design, table modeling, relation planning, migration design, or persistence-layer restructuring.
---

# Goal
Design durable data models that reflect the domain clearly and support application queries, integrity, and future evolution.

# Instructions
1. Identify the core entities, relationships, constraints, and query patterns before defining tables or collections.
2. Model primary keys, foreign keys, uniqueness, optionality, and lifecycle states explicitly.
3. Normalize where it improves integrity, and denormalize only when access patterns justify the tradeoff.
4. Plan migrations, backfills, and compatibility steps for live systems before changing production schemas.
5. Review indexing, cascading behavior, and data retention requirements before finalizing the design.

# Input
A request to design a schema, create migrations, model relationships, add constraints, or restructure persistence for a feature.

# Output
Database schemas, migrations, ORM models, and notes about data integrity, rollout order, or query implications.

# Best Practices
- Favor explicit constraints over trusting application code alone.
- Index for real query patterns, not every column by default.
- Keep naming consistent across tables, foreign keys, and relation fields.
- Plan for safe evolution of live data, including rollback and backfill concerns.
