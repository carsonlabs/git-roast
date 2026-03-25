# git-roast

The performance review your git history didn't ask for.

Analyzes your actual commits and generates a sarcastic, data-driven roast. No AI, no API keys — just your git log and the cold, hard truth.

## Install

```bash
npm install -g git-roast
```

## Usage

```bash
cd your-project
git-roast

# Or point it at a repo
git-roast --path /path/to/repo
```

## What It Analyzes

- **Overview** — commit frequency, activity span, pace rating
- **Commitment Issues** — longest disappearance, weekend/late-night commits, Friday deploy habits
- **Commit Message Therapy** — message length, fix ratio, WIP count, repeated messages, profanity, one-word commits
- **The Files You Can't Stop Touching** — most-edited files, total files touched
- **The Body Count** — insertions vs deletions, biggest single commit
- **Branch Graveyard** — stale branches collecting dust
- **Final Verdict** — 1-10 score with a sarcastic summary

## Example Output

```
═══ COMMITMENT ISSUES ════════════════════════════

Friday commits (14) vs Monday (4). You deploy on
Fridays more than you start on Mondays. You are
the reason SREs drink.

═══ COMMIT MESSAGE THERAPY ═══════════════════════

38% of your commits start with "fix". You're not
developing software, you're playing whack-a-mole.

═══ THE BODY COUNT ═══════════════════════════════

Biggest single commit: +6,351 lines
The PR for this was approved by someone who values
their weekend.

═══ FINAL VERDICT ════════════════════════════════

Performance Score: 8/10  ████████░░
Solid work. A few bad habits, but nothing that
would get you fired. Probably.
```

## Twitter Content Ideas

- Run it on React, Next.js, or any famous repo
- Screenshot the "Commitment Issues" section — it's always personal
- "I ran a performance review on my own git history and I'm not okay"

## Author

Carson Roell ([@Chuckiesbeats](https://twitter.com/Chuckiesbeats))

## License

MIT
