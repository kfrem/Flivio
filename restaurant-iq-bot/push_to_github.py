"""
push_to_github.py
=================
Run this ONCE from inside your C:\\RestaurantIQ folder:

    cd C:\\RestaurantIQ
    python push_to_github.py

It will:
  1. Write README.md, DEVELOPER.md and .gitignore into this folder
  2. Initialise a git repo (or use the existing one)
  3. Commit everything
  4. Push to https://github.com/kfrem/restaurant-iq-bot

Requirements:
  - git must be installed (https://git-scm.com/download/win)
  - You must be logged into GitHub on this machine
    (or have a Personal Access Token ready)
"""

import os, subprocess, sys, textwrap

# ── helpers ──────────────────────────────────────────────────────────────────

def run(cmd, check=True):
    print(f"  > {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.stdout.strip():
        print(result.stdout.strip())
    if result.stderr.strip():
        print(result.stderr.strip())
    if check and result.returncode != 0:
        print(f"\nERROR: command failed (exit {result.returncode}). Stopping.")
        sys.exit(1)
    return result.returncode

def write(path, content):
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    print(f"  wrote {path}")

# ── file content ─────────────────────────────────────────────────────────────

README = r"""# Restaurant-IQ Bot

A Telegram bot that captures operational data from restaurant staff — voice notes, invoice photos, and text updates — and turns it into a weekly AI-generated intelligence briefing with a branded PDF report.

All AI runs **locally** on your machine via [Ollama](https://ollama.com). No data leaves your network.

---

## What It Does

Staff in a Telegram group simply send:

| Input | What happens |
|---|---|
| **Voice note** | Transcribed by Whisper → analysed for revenue, covers, waste, issues |
| **Photo** (invoice / receipt) | Read by vision model → supplier name, total, line items extracted |
| **Text message** | Analysed for category, summary, urgency |

At the end of the week, the owner runs `/weeklyreport` and receives:
- A structured text briefing directly in Telegram
- A branded A4 PDF attached to the same message

---

## Architecture

```
bot.py                  Telegram bot entry point (python-telegram-bot)
├── transcriber.py      Voice → text  (faster-whisper, runs on CPU)
├── analyzer.py         Text/photo → structured JSON  (Ollama: gemma3:4b + qwen3-vl:30b)
├── report_generator.py Weekly text → branded PDF  (ReportLab)
├── database.py         SQLite persistence  (no ORM, plain sqlite3)
└── config.py           Environment variable loading  (python-dotenv)
```

### AI Models (via Ollama)

| Model | Use | Why |
|---|---|---|
| `gemma3:4b` | Text entry analysis | Fast; good structured JSON extraction |
| `qwen3-vl:30b` | Invoice photo reading + weekly report narrative | Vision capability; best quality |
| Whisper `base` | Voice transcription | Runs on CPU; no API cost |

### Database (SQLite)

Four tables:

```
restaurants          — one row per registered Telegram group
staff                — auto-registered when a member first sends a message
daily_entries        — every voice note / photo / text captured
weekly_reports       — saved report text for each week
```

---

## Prerequisites

| Requirement | Notes |
|---|---|
| Windows 10/11 or macOS | Linux also works |
| Python 3.11+ | [python.org](https://python.org) |
| [Ollama](https://ollama.com) | Must be running before starting the bot |
| Telegram bot token | Create via [@BotFather](https://t.me/BotFather) |

### Pull the required Ollama models (one-time, ~20 GB total)

```bash
ollama pull gemma3:4b
ollama pull qwen3-vl:30b
```

> The `qwen3-vl:30b` model requires ~20 GB RAM. If your machine has less, swap it for `qwen2.5-vl:7b` in `.env` — quality will be lower but it will run.

---

## Quick Start (Windows)

1. Create a folder: `C:\RestaurantIQ`
2. Download `install.py` from this repo into that folder
3. Open Command Prompt and run:
   ```
   cd C:\RestaurantIQ
   python install.py
   ```
4. When Notepad opens, replace `your_token_here` with your Telegram bot token and save
5. Make sure Ollama is running, then:
   ```
   python bot.py
   ```

---

## Quick Start (Manual)

```bash
# 1. Clone
git clone https://github.com/kfrem/restaurant-iq-bot.git
cd restaurant-iq-bot

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure
cp .env.example .env
# Edit .env and set TELEGRAM_BOT_TOKEN

# 4. Run
python bot.py
```

---

## Environment Variables

Copy `.env.example` to `.env`:

| Variable | Default | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | — | **Required.** Token from @BotFather |
| `OLLAMA_MODEL` | `qwen3-vl:30b` | Vision + report model |
| `OLLAMA_TEXT_MODEL` | `gemma3:4b` | Fast text analysis model |
| `WHISPER_MODEL_SIZE` | `base` | `tiny` / `base` / `small` / `medium` |
| `DB_PATH` | `restaurant_iq.db` | SQLite database file path |

---

## Bot Commands

| Command | Who uses it | What it does |
|---|---|---|
| `/start` | Anyone | Shows welcome message and usage guide |
| `/register Name` | Owner | Registers this Telegram group as a restaurant |
| `/status` | Owner / manager | Shows entry count and breakdown for the current week |
| `/weeklyreport` | Owner | Generates and sends the weekly briefing + PDF |

---

## Telegram Group Setup

1. Create a Telegram group for your restaurant team
2. Add the bot to the group
3. Promote the bot to **admin** (so it can read all messages)
4. Send `/register Your Restaurant Name`
5. Tell staff to send voice notes, photos, or texts — the bot captures everything automatically

Multiple restaurants are supported: each Telegram group is a separate restaurant.

---

## File Layout

```
restaurant-iq-bot/
├── bot.py                  Main entry point
├── config.py               Environment variable loading
├── database.py             SQLite database layer
├── transcriber.py          Whisper voice transcription
├── analyzer.py             Ollama AI analysis
├── report_generator.py     ReportLab PDF generation
├── requirements.txt        Python dependencies
├── .env.example            Environment variable template
├── install.py              Windows one-click installer
├── setup_windows.bat       Windows dependency installer
└── reports/                Generated PDFs (auto-created)
```

---

## Dependencies

```
python-telegram-bot==22.6   Telegram Bot API async client
faster-whisper==1.2.1       Local Whisper transcription
ollama==0.6.1               Ollama Python client
Pillow==12.1.1              Image handling
reportlab==4.4.10           PDF generation
python-dotenv==1.2.2        .env file loading
```

---

## Troubleshooting

**Bot starts but doesn't respond to messages**
- Check the bot is an admin in the group
- Make sure you sent `/register` first

**"Error connecting to Ollama"**
- Open Ollama from the system tray (Windows) or run `ollama serve` in a terminal
- Confirm models are downloaded: `ollama list`

**Voice notes not transcribing**
- Whisper downloads its model on first use (~150 MB for `base`) — wait for it to finish
- Try `WHISPER_MODEL_SIZE=small` in `.env` for better accuracy

**Weekly report is very slow**
- The `qwen3-vl:30b` model takes 3–5 minutes on a typical laptop
- For faster (lower quality) reports, set `OLLAMA_MODEL=gemma3:4b` in `.env`

---

## Outstanding Work

See [DEVELOPER.md](DEVELOPER.md) for the full technical handover including outstanding features, architecture decisions, and implementation notes for the next developer.
"""

DEVELOPER = r"""# Developer Handover — Restaurant-IQ Bot

This document covers the full technical context for the next developer picking up this project: what is built, how it works, what is outstanding, and recommended implementation approach.

---

## Project Purpose

Restaurant-IQ is a Telegram bot for independent restaurant owners. Staff send operational updates throughout the day (voice notes after a busy shift, photos of invoices, quick text observations). The bot accumulates this data and produces a weekly AI intelligence briefing — structured insights about revenue, waste, costs, staff issues, and supplier anomalies.

**Key constraint:** All AI processing runs locally via Ollama. No data is sent to external APIs. This is a deliberate privacy/cost decision.

---

## Current State (Phase 1 Complete)

### What works today

- `/register`, `/start`, `/status`, `/weeklyreport` commands
- Voice note → Whisper transcription → Ollama structured extraction
- Invoice/receipt photo → Ollama vision model → supplier + line item extraction
- Text message → Ollama fast model → categorised entry
- SQLite persistence (restaurants, staff, daily entries, weekly reports)
- Weekly briefing generation (markdown narrative via Ollama)
- Branded A4 PDF report (ReportLab)
- Windows one-click installer (`install.py`)
- Multi-restaurant support (each Telegram group = separate restaurant)

### What is not yet built (Phase 2)

These are listed in priority order — tackle them in this sequence.

---

## Outstanding Work

### 1. Ollama Health Check on Startup
**Priority: High — blocks usability if Ollama is down**

Currently, if Ollama isn't running when the bot starts, the first message from staff will silently fail (the error is only printed to the server console, not sent back to Telegram).

**What to build:**
- At bot startup (in `main()` in `bot.py`), call `ollama.list()` and check it returns successfully
- If it fails, log a clear warning: `"WARNING: Ollama not reachable. Analysis will fail until Ollama is started."`
- Optionally, send a message to a configured admin Telegram ID if `ADMIN_TELEGRAM_ID` is set in `.env`
- Check every 60 seconds in a background task and send an alert if it goes down mid-session

**Files to touch:** `bot.py`, `config.py` (add `ADMIN_TELEGRAM_ID`)

---

### 2. Scheduled Weekly Reports
**Priority: High — owners forget to run `/weeklyreport`**

Currently, owners must manually run `/weeklyreport`. Most won't remember consistently.

**What to build:**
- Every Monday at 08:00 local time, auto-generate and send the weekly report to every registered restaurant group
- Add `REPORT_DAY` (default: `monday`) and `REPORT_TIME` (default: `08:00`) to `.env`
- Use `python-telegram-bot`'s built-in `JobQueue` — it is already available in the `Application` object, no extra library needed
- The job should call the same logic as `cmd_weekly_report` but triggered by the scheduler, not a user command

**Implementation sketch:**
```python
# In main(), after app is built:
app.job_queue.run_daily(
    auto_weekly_report,
    time=datetime.time(hour=8, minute=0),
    days=(0,),          # 0 = Monday
)

async def auto_weekly_report(context: ContextTypes.DEFAULT_TYPE):
    restaurants = get_all_restaurants()   # add this to database.py
    for restaurant in restaurants:
        entries = get_week_entries(restaurant["id"])
        if not entries:
            continue
        await context.bot.send_message(chat_id=restaurant["telegram_group_id"], text=report)
```

**New database function needed:**
```python
def get_all_restaurants() -> list:
    with _db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM restaurants")
        return c.fetchall()
```

**Files to touch:** `bot.py`, `database.py`, `config.py`

---

### 3. `/today` End-of-Day Summary
**Priority: Medium — quick value add**

A lightweight command that gives the owner a same-day summary rather than making them wait for Monday's full report.

**What to build:**
- `/today` command: summarise today's entries only (not the whole week)
- Uses the fast text model (`OLLAMA_TEXT_MODEL`) not the large report model
- Returns a short (5–10 line) plain-text summary, no PDF
- Format: total entries today, top category, any high-urgency flags, one action item

**Files to touch:** `bot.py`, `analyzer.py` (add `generate_daily_summary(entries, restaurant_name)`)

---

### 4. `/history` — Retrieve Past Reports
**Priority: Medium**

Owners sometimes need last week's report or a report from a specific date.

**What to build:**
- `/history` — lists the last 4 weekly reports with dates
- `/history 2024-01-08` — sends the specific report for that week
- Reports are already saved in `weekly_reports` table; this is a read-only query + send

**Files to touch:** `bot.py`, `database.py` (add `get_weekly_reports(restaurant_id, limit)` and `get_report_by_week(restaurant_id, week_start)`)

---

### 5. Rebuild `install.py` After Any Code Changes
**Priority: Medium — the Windows installer is currently stale**

`install.py` embeds all source files as base64 so Windows users can bootstrap from a single file. It was generated from an earlier version and does **not** reflect the current code.

**What to do:**
Run this from inside the `restaurant-iq-bot/` directory after any code change to regenerate it. See the existing `install.py` for the expected output format — it reads each source file, base64-encodes it, and writes a self-extracting Python script.

Consider making this a pre-commit hook so it stays in sync automatically.

---

### 6. `/deletedata` — GDPR Compliance
**Priority: Medium (required before any commercial use)**

Staff voice notes and message text are personal data. There must be a way to delete it.

**What to build:**
- `/deletedata` (owner only) — deletes all daily entries older than 90 days
- `/deletedata all` — deletes all entries for this restaurant
- Add `owner_telegram_id` check before executing (only the person who ran `/register` can delete)

---

### 7. Export to CSV
**Priority: Low**

Some owners will want to import the weekly data into Excel or accounting software.

**What to build:**
- `/export` command — generates a CSV of all entries for the current week
- Columns: date, time, type, category, summary, raw_text, urgency
- Send as a file attachment (same as the PDF, using `reply_document`)

---

### 8. Multi-Language Support
**Priority: Low**

Some London restaurant teams communicate in languages other than English.

**What to build:**
- Pass `language=None` to `model.transcribe()` in `transcriber.py` to enable auto-detect (Whisper supports this)
- Add detected language to the entry metadata
- The Ollama prompts are in English; consider adding a `REPORT_LANGUAGE` env var

---

## Architecture Notes

### Adding a New Bot Command

1. Write the handler function in `bot.py`:
   ```python
   async def cmd_mycommand(update: Update, context: ContextTypes.DEFAULT_TYPE):
       restaurant = await _require_restaurant(update)
       if not restaurant:
           return
       # ... your logic
   ```
2. Register it in `main()`:
   ```python
   app.add_handler(CommandHandler("mycommand", cmd_mycommand))
   ```
3. Update the `/start` message to document the new command

### Adding a Database Query

All DB access goes through `database.py`. Never call sqlite3 directly from `bot.py`.

```python
def get_something(restaurant_id: int):
    with _db() as conn:
        c = conn.cursor()
        c.execute("SELECT ...", (restaurant_id,))
        return c.fetchall()
```

### Changing an AI Prompt

Prompts live in `analyzer.py`. When changing a prompt:
- Keep the JSON schema in the prompt identical to what callers expect
- The `_extract_json()` helper tolerates model preamble/postamble — it finds the first `{...}` block
- Always test with `temperature=0.1` for structured output

### PDF Report Format

The PDF is generated in `report_generator.py`. The report text coming from Ollama uses markdown-style formatting:
- `## Heading` → section heading
- `- item` or `* item` → bullet point
- `1.` `2.` etc. → numbered list
- `---` → horizontal rule

To change the visual style, edit the `ParagraphStyle` definitions in `_build_styles()`. Colours are defined as hex constants at the top of the file.

---

## Known Limitations

| Limitation | Notes |
|---|---|
| SQLite is single-writer | Fine for a single bot instance. If you ever run multiple bot workers, switch to PostgreSQL |
| No authentication on commands | Any Telegram user in a registered group can trigger `/weeklyreport`. Add an owner-check if needed |
| `qwen3-vl:30b` requires ~20 GB RAM | On machines with less RAM, substitute `qwen2.5-vl:7b` |
| Voice files are deleted after transcription | Intentional (privacy + disk space). Remove the `finally: os.remove()` blocks in `bot.py` if you need archives |
| Weekly report splits at 4000 chars | Telegram's limit is 4096 chars. Long reports are cut with `[continued in PDF...]` |

---

## Environment Variables Reference

| Variable | Default | Notes |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | — | Required |
| `OLLAMA_MODEL` | `qwen3-vl:30b` | Vision + report model |
| `OLLAMA_TEXT_MODEL` | `gemma3:4b` | Fast analysis model |
| `WHISPER_MODEL_SIZE` | `base` | `tiny` fastest, `medium` most accurate |
| `DB_PATH` | `restaurant_iq.db` | Change to an absolute path for production |
| `ADMIN_TELEGRAM_ID` | — | To add: Telegram user ID to receive health alerts |
| `REPORT_DAY` | — | To add: Day to auto-send reports (e.g. `monday`) |
| `REPORT_TIME` | — | To add: Time to auto-send reports (e.g. `08:00`) |

---

## Running in Production (Linux Server / VPS)

```bash
pip install -r requirements.txt
cp .env.example .env
nano .env   # set token + absolute DB_PATH
```

Run as a systemd service — create `/etc/systemd/system/restaurant-iq.service`:

```
[Unit]
Description=Restaurant-IQ Telegram Bot
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/restaurant-iq-bot
ExecStart=/usr/bin/python3 bot.py
Restart=always
RestartSec=10
EnvironmentFile=/home/ubuntu/restaurant-iq-bot/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable restaurant-iq
sudo systemctl start restaurant-iq
sudo journalctl -u restaurant-iq -f
```

**Ollama on a server:** Run `ollama serve` as a separate systemd service. Bot connects to `http://localhost:11434` by default. Set `OLLAMA_HOST` env var if Ollama is on a different machine.

---

## Testing

No automated tests yet. Recommended additions:
- Unit tests for `_extract_json()` in `analyzer.py` — most fragile function
- Unit tests for `database.py` using in-memory SQLite (`DB_PATH=":memory:"`)
- `pytest` + `pytest-asyncio` for async Telegram handlers

---

## Repo Structure

```
restaurant-iq-bot/
├── README.md               User-facing documentation
├── DEVELOPER.md            This file
├── bot.py                  Entry point + Telegram handlers
├── config.py               Env var loading
├── database.py             SQLite layer
├── transcriber.py          Whisper voice transcription
├── analyzer.py             Ollama AI analysis
├── report_generator.py     PDF generation
├── requirements.txt        Python dependencies
├── .env.example            Env var template
├── install.py              Windows one-click bootstrapper
└── setup_windows.bat       Windows pip installer
```
"""

GITIGNORE = """.env
*.db
*.sqlite3
reports/
voice_files/
photo_files/
__pycache__/
*.py[cod]
*.pyo
.venv/
venv/
env/
*.egg-info/
dist/
build/
"""

# ── main ─────────────────────────────────────────────────────────────────────

def main():
    here = os.path.dirname(os.path.abspath(__file__))
    os.chdir(here)
    print(f"\nWorking in: {here}\n")

    # 1. Write documentation files
    print("Step 1: Writing documentation files...")
    write("README.md", README)
    write("DEVELOPER.md", DEVELOPER)
    write(".gitignore", GITIGNORE)

    # 2. Git init (safe to run on an existing repo)
    print("\nStep 2: Setting up git...")
    is_new_repo = not os.path.isdir(".git")
    if is_new_repo:
        run("git init")
        run("git branch -M main")
    else:
        print("  (git repo already exists)")

    # 3. Configure git identity if not set
    name = subprocess.run("git config user.name", shell=True, capture_output=True, text=True).stdout.strip()
    if not name:
        run('git config user.name "Restaurant-IQ"')
        run('git config user.email "noreply@restaurant-iq"')

    # 4. Stage and commit
    print("\nStep 3: Staging and committing...")
    run("git add .")
    diff = subprocess.run("git diff --cached --name-only", shell=True, capture_output=True, text=True).stdout.strip()
    if diff:
        run('git commit -m "Initial commit - Restaurant-IQ Bot Phase 1"')
    else:
        print("  Nothing new to commit — all files already committed.")

    # 5. Set remote
    print("\nStep 4: Setting GitHub remote...")
    existing = subprocess.run("git remote get-url origin", shell=True, capture_output=True, text=True)
    if existing.returncode != 0:
        run("git remote add origin https://github.com/kfrem/restaurant-iq-bot.git")
    else:
        print(f"  remote already set: {existing.stdout.strip()}")

    # 6. Push
    print("\nStep 5: Pushing to GitHub...")
    print("  (A browser window or credential prompt may appear — sign in to GitHub)\n")
    result = run("git push -u origin main", check=False)
    if result != 0:
        print("\nPush failed. Possible fixes:")
        print("  a) Make sure git credential manager is installed:")
        print("     https://git-scm.com/download/win  (includes it by default)")
        print("  b) Or set a Personal Access Token:")
        print("     git remote set-url origin https://YOUR_TOKEN@github.com/kfrem/restaurant-iq-bot.git")
        print("     then re-run:  git push -u origin main")
        sys.exit(1)

    print("\nDone! Your code is live at:")
    print("  https://github.com/kfrem/restaurant-iq-bot")

if __name__ == "__main__":
    main()
