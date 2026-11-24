# Daily refresh runbook

Goal: keep `data/agents.json` current without touching code. One commit per run, straight to `main` (bot-owned file).

## When
Daily, early morning JST. Skip the commit if nothing changed.

## Steps
1. **Read the current file** from `main` (`data/agents.json`) and keep its shape exactly.
2. **Leaderboards** (`scoreboard[]`): open each board below, read the top entry, runner-up and the page's own date. Update `leader`, `leader_detail`, `score`, `runner_up`, `snapshot` (date you read it, or the board's date if older) only if the page you opened says so.
   - ShellBench: https://openclaw.ai/blog/shellbench (check for a paper or leaderboard page)
   - Online-Mind2Web: https://www.careerflow.ai/human-data/online-mind2web and https://huggingface.co/spaces/osunlp/Online_Mind2Web_Leaderboard
   - Terminal-Bench: https://www.tbench.ai/leaderboard (note the version, e.g. 4.1)
   - OSWorld / GAIA / WebArena / BrowseComp: the official board if readable, else https://personalagentbench.com/benchmarks/<name>/ (keep the `board` link to the official page)
   - METR: https://metr.org/assets/benchmark_results_1_1.yaml (page frozen since 2026-09-08; re-check monthly)
3. **Hark** (`hark.items[]`): re-read the Online-Mind2Web board and https://assistantbenchmark.com/agents/hark?benchmark=general. Search for any new Handoff result (especially a third-party Online-Mind2Web score for Handoff²). Vendor numbers stay `"kind": "vendor"`.
4. **Hero** (`hero.stats[]`): update only if ShellBench or METR changed.
5. **Progress**: append a `progress.timeline[]` item for a notable release or new benchmark leader (date, title, short note, group `hermes`/`hark`/`bench`, source). Hermes releases: https://github.com/NousResearch/hermes-agent/releases (stable tags only; update `hermes_cadence`). Keep the list to the last ~6 months.
6. **News** (`news[]`): web-search agent news from the last 14 days. Keep 3-5 items, newest first, one line each, each with `date`, `title`, `source_name`, `url`. Open each article before using it. Drop items older than 14 days.
7. **Sources** (`sources[]`): add any new source with today's `read` date.
8. Set `meta.updated` to today (YYYY-MM-DD, JST).
9. **Validate**: `python3 scripts/check.py` must pass (schema, dates, every URL is https, numbers in range).
10. **Commit via the GitHub API** to `main`:
    - get the file sha: `GET /repos/1thomasalan/agent-horizon/contents/data/agents.json`
    - `PUT /repos/1thomasalan/agent-horizon/contents/data/agents.json` with `message: "Data refresh YYYY-MM-DD"`, base64 `content`, `sha`, `branch: main`.
    (Hark: `apicall github contents_put owner=1thomasalan repo=agent-horizon path=data/agents.json branch=main sha=<sha> message=... content=$(base64 -w0 data/agents.json)`.)
11. Pages republishes in about a minute. Check https://1thomasalan.github.io/agent-horizon/data/agents.json shows the new `updated` date.

## Rules
- No number without a page you opened that day. If a board can't be read, leave the old value and its old snapshot date.
- If a change would alter the layout (a new section, a new field type), stop and open an Issue instead.
