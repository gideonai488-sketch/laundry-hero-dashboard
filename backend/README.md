# Highest Wash — Merchant Backend Agent Brief

This folder is the **single source of truth** for the backend agent. The
merchant frontend (this repo) is shipped and assumes everything below is
live in the shared Supabase project (ref `jxilnjudduetykuxiehp`) used by
the customer + rider apps.

> **Read these files in order:**
> 1. `PROMPT.md` — full context + non-negotiables (start here)
> 2. `SCHEMA.md` — every table, column, index, RLS the merchant app needs
> 3. `GEO_ROUTING.md` — country/city/area job-routing rules (READ THIS)
> 4. `EDGE_FUNCTIONS.md` — every edge function + payload contract
> 5. `REALTIME.md` — publication + replica identity setup
> 6. `TODO.md` — ordered checklist (tick as you ship)

If anything in the merchant frontend (`src/`) references a table/RPC/edge
function that isn't in these docs, **stop and ask** — don't guess.
