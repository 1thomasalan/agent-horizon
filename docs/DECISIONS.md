# Decisions

Newest first. One entry per real decision: what, why, and what we gave up.

## 2026-11-25 Launch as "Agent Horizon"
- What: named Agent Horizon (working name was Agent Pulse). Pulse-family look (glass cards, serif heads, calm motion) with its own motif: a horizon line with a travelling signal, pre-dawn teal light instead of Pulse's amber dusk.
- Why: Alan wants each app to feel distinct, and a quieter name.

## 2026-11-25 One data file, sources on every number
- What: all content in `data/agents.json`; the page only renders. Each number carries a source URL and a date, and a `kind` label (independent / maintainer / self-submitted / vendor).
- Why: a daily job can refresh data without touching code, and readers can check every figure.
- Gave up: live leaderboard fetching in the browser (many boards block cross-origin reads and change format).

## 2026-11-25 Aggregator snapshots where the board can't be read directly
- What: OSWorld, GAIA, WebArena and BrowseComp numbers come from PersonalAgentBench's dated reads of the official boards, labelled as such, with the official board linked beside them.
- Why: those boards are spreadsheets, datasets or JS apps that a plain fetch can't read reliably.
