#!/usr/bin/env python3
"""Agent Horizon checks. Runs in CI on every pull request (and data pushes) and locally before pushing.
Validates data/agents.json (shape, dates, kinds, https source on every number) and app files.
Optional: python3 scripts/check.py --links  also checks every URL answers (slow; not run in CI)."""
import json, pathlib, re, subprocess, sys, datetime, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
fail = []
KINDS = {"independent", "maintainer", "self", "vendor"}
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

def date_ok(v, where):
    if not isinstance(v, str) or not DATE.match(v):
        fail.append(f"{where}: bad date {v!r}"); return
    try: datetime.date.fromisoformat(v)
    except ValueError: fail.append(f"{where}: impossible date {v!r}")

def url_ok(v, where):
    if not isinstance(v, str) or not v.startswith("https://"):
        fail.append(f"{where}: source must be an https URL, got {v!r}")

def num_ok(v, where, lo=0, hi=100):
    if not isinstance(v, (int, float)) or not (lo <= v <= hi):
        fail.append(f"{where}: number out of range {v!r}")

# 1. JS parses.
for f in sorted(ROOT.glob("*.js")):
    r = subprocess.run(["node", "--check", str(f)], capture_output=True, text=True)
    if r.returncode:
        fail.append(f"JS syntax error in {f.name}: {(r.stderr or '').strip().splitlines()[:1]}")

# 2. JSON parses.
for f in [ROOT / "manifest.webmanifest", *ROOT.glob("data/*.json")]:
    try: json.loads(f.read_text())
    except Exception as e: fail.append(f"Bad JSON in {f.relative_to(ROOT)}: {e}")

# 3. Data schema.
urls = set()
try:
    d = json.loads((ROOT / "data/agents.json").read_text())
    date_ok(d["meta"]["updated"], "meta.updated")
    for i, s in enumerate(d["hero"]["stats"]):
        w = f"hero.stats[{i}]"; num_ok(s["value"], w, 0, 100 if s["unit"] == "%" else 1000)
        url_ok(s["source"], w); date_ok(s["date"], w); urls.add(s["source"])
        if s["kind"] not in KINDS: fail.append(f"{w}: bad kind {s['kind']}")
    for i, b in enumerate(d["scoreboard"]):
        w = f"scoreboard[{i}] {b.get('name')}"
        for k in ("name", "leader", "score", "unit", "kind", "snapshot", "source"):
            if k not in b: fail.append(f"{w}: missing {k}")
        num_ok(b["score"], w, 0, 100 if b["unit"] == "%" else 1000)
        if b.get("human") is not None: num_ok(b["human"], w + " human")
        if b["kind"] not in KINDS: fail.append(f"{w}: bad kind {b['kind']}")
        date_ok(b["snapshot"], w); url_ok(b["source"], w); urls.add(b["source"])
        if b.get("board"): url_ok(b["board"], w + " board"); urls.add(b["board"])
    for i, it in enumerate(d["hark"]["items"]):
        w = f"hark.items[{i}]"
        if it["kind"] not in KINDS: fail.append(f"{w}: bad kind")
        date_ok(it["date"], w)
        if not it.get("sources"): fail.append(f"{w}: needs at least one source")
        for s in it.get("sources", []): url_ok(s["url"], w); urls.add(s["url"])
    for n in d["hark"]["notes"]: url_ok(n["url"], "hark.notes"); urls.add(n["url"])
    p = d["progress"]
    url_ok(p["metr"]["source"], "progress.metr")
    for pt in p["metr"]["points"]: date_ok(pt["date"], "metr point"); num_ok(pt["hours"], "metr point", 0, 1000)
    for c in p["climbs"]:
        url_ok(c["source"], "climb " + c["name"]); urls.add(c["source"])
        num_ok(c["from"]["value"], "climb from"); num_ok(c["to"]["value"], "climb to")
    for e in p["timeline"]:
        date_ok(e["date"], "timeline " + e["title"]); url_ok(e["source"], "timeline " + e["title"]); urls.add(e["source"])
        if e["group"] not in {"hermes", "hark", "bench"}: fail.append(f"timeline {e['title']}: bad group")
    if not 3 <= len(d["news"]) <= 6: fail.append(f"news: expected 3-6 items, got {len(d['news'])}")
    today = datetime.date.fromisoformat(d["meta"]["updated"])
    for n in d["news"]:
        date_ok(n["date"], "news"); url_ok(n["url"], "news"); urls.add(n["url"])
        if (today - datetime.date.fromisoformat(n["date"])).days > 21:
            fail.append(f"news item older than 3 weeks: {n['title'][:50]}")
    for r in d["harness"]["rows"]: num_ok(r["score"], "harness " + r["name"])
    url_ok(d["harness"]["source"], "harness")
    for s in d["sources"]: url_ok(s["url"], "sources"); urls.add(s["url"])
except Exception as e:
    fail.append(f"data/agents.json schema error: {type(e).__name__}: {e}")

# 4. No secrets.
pat = re.compile(r"(api[_-]?key|secret|token)\s*[:=]\s*['\"][A-Za-z0-9_\-]{20,}['\"]", re.I)
for f in ROOT.glob("*.js"):
    if pat.search(f.read_text(errors="ignore")): fail.append(f"Possible secret in {f.name}")

# 5. Service worker version + referenced files exist.
if not re.search(r"agent-horizon-v\d+", (ROOT / "sw.js").read_text()): fail.append("sw.js has no version marker")
html = (ROOT / "index.html").read_text()
for ref in re.findall(r'(?:src|href)="([^"#:]+)"', html):
    if not (ROOT / ref).exists(): fail.append(f"index.html references missing file {ref}")

# 6. Optional live link check.
if "--links" in sys.argv:
    for u in sorted(urls):
        try:
            req = urllib.request.Request(u, method="GET", headers={"User-Agent": "Mozilla/5.0 agent-horizon-check"})
            code = urllib.request.urlopen(req, timeout=20).status
        except Exception as e:
            code = getattr(e, "code", str(e)[:60])
        if code not in (200, 301, 302, 403, 429): print(f"WARN link {code}: {u}")

if fail:
    print("Checks failed:")
    for x in fail: print(" -", x)
    sys.exit(1)
print(f"All Agent Horizon checks passed ({len(urls)} source URLs).")
