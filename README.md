# Agent Horizon

A calm, Pulse-family dashboard on the state of AI agents: benchmark leaders, where Hark stands, how fast the frontier is moving, harness comparisons and the last two weeks of agent news. Every number links to its source. Owner: Thomas Alan (1thomasalan).

- Live: https://1thomasalan.github.io/agent-horizon/
- All content lives in one file: `data/agents.json`. The page only renders it.
- Installable PWA. Plain HTML/CSS/JS, no build step, no API keys.
- Personal project. (The MCCS work network blocks github.io; open it at home or on a phone.)

## How work flows here
1. Every code change starts as a GitHub Issue.
2. The change is made on a branch and opened as a pull request. Nothing reaches `main` without one.
3. The `Checks` workflow must pass and Alan approves the PR.
4. Merging to `main` publishes the live site.

Data publishing is the exception: the daily refresh writes only `data/agents.json` straight to `main`. See `docs/REFRESH.md` and `AGENTS.md`.

## Where things live
| What | Where |
|---|---|
| App code | repo root (`index.html`, `app.js`, `styles.css`, `sw.js`) |
| All data, sources and dates | `data/agents.json` |
| Daily refresh runbook | `docs/REFRESH.md` |
| Decisions | `docs/DECISIONS.md` |
| Rules for AI agents | `AGENTS.md` |
| Safety checks | `scripts/check.py` (run by `.github/workflows/checks.yml`) |
