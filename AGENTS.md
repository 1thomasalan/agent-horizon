# Rules for AI agents working on Agent Horizon

Read this before changing anything. Applies to Hark, Codex, Claude Code and any other agent or person.

## Never
- Never invent or estimate a number. Every value in `data/agents.json` must come from a page you opened, with its `source` URL and a date.
- Never present a vendor's own result as independent. Tag it `"kind": "vendor"`.
- Never compare scores across different boards, versions or harnesses as if they were the same test.
- Never commit secrets or API keys. The app needs none.
- Never push code straight to `main`. Open a pull request.

## Always
- Start from an Issue; link it in the PR ("Closes #N").
- Bump the version in `sw.js` (`agent-horizon-vN`) for any user-facing code change.
- Keep `Checks` green. Run `python3 scripts/check.py` before pushing.
- Update `meta.updated` (YYYY-MM-DD, JST) whenever data changes, and the `snapshot` date of any board you re-read.
- Record any real decision (a new benchmark, a dropped source, a design change) in `docs/DECISIONS.md`.

## Bot-owned files (written straight to main, not via PR)
| Files | Writer |
|---|---|
| `data/agents.json` | Daily refresh job, see `docs/REFRESH.md` |

## App shape
- Plain JS PWA, no build step. `index.html` loads `styles.css` and `app.js`; `app.js` fetches `data/agents.json` and renders every section.
- `sw.js` caches the app shell (stale-while-revalidate) and fetches the data network-first.
- `kind` values: `independent`, `maintainer`, `self`, `vendor`.
