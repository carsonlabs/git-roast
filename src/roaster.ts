import type { GitStats } from "./analyzer.js";

export interface RoastSection {
  title: string;
  lines: string[];
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function plural(n: number, word: string): string {
  return n === 1 ? `${n} ${word}` : `${n} ${word}s`;
}

export function generateRoast(stats: GitStats): RoastSection[] {
  const sections: RoastSection[] = [];

  // ── OVERVIEW ──
  const overview: string[] = [
    `Total commits: ${stats.totalCommits}`,
    `Active since: ${stats.firstCommitDate} (${stats.daysSinceFirst} days ago)`,
    `Average: ${stats.avgCommitsPerWeek} commits/week`,
  ];

  if (stats.avgCommitsPerWeek < 1) {
    overview.push(`That's less than 1 commit per week. Are you a developer or a spectator?`);
  } else if (stats.avgCommitsPerWeek < 3) {
    overview.push(`Barely alive. Your repo has a pulse, but it's faint.`);
  } else if (stats.avgCommitsPerWeek > 20) {
    overview.push(`${stats.avgCommitsPerWeek}/week? Either you're cracked or your commits are "save" buttons.`);
  } else {
    overview.push(`Respectable pace. You won't get roasted for this one. Enjoy it while it lasts.`);
  }

  sections.push({ title: "OVERVIEW", lines: overview });

  // ── COMMITMENT ISSUES ──
  const commitment: string[] = [];

  if (stats.longestGapDays > 0) {
    commitment.push(
      `Longest disappearance: ${plural(stats.longestGapDays, "day")} (${stats.longestGapStart} to ${stats.longestGapEnd})`
    );
    if (stats.longestGapDays > 90) {
      commitment.push(`${stats.longestGapDays} days. That's not a break, that's a resignation nobody filed.`);
    } else if (stats.longestGapDays > 30) {
      commitment.push(`A full month of silence. Your repo filed a missing persons report.`);
    } else if (stats.longestGapDays > 14) {
      commitment.push(`Two weeks off. PTO or existential crisis? The git log doesn't judge. I do.`);
    } else if (stats.longestGapDays > 7) {
      commitment.push(`A week gap. Probably "just thinking about the architecture." Sure.`);
    }
  }

  if (stats.timeStats.weekendCommits > 0) {
    commitment.push(
      `Weekend commits: ${stats.timeStats.weekendCommits} (${stats.timeStats.weekendPercent}% of all commits)`
    );
    if (stats.timeStats.weekendPercent > 30) {
      commitment.push(`Over 30% of your commits are on weekends. This isn't dedication, it's a cry for help.`);
    } else if (stats.timeStats.weekendPercent > 15) {
      commitment.push(`Your weekends have a higher commit rate than most people's weekdays. Concerning.`);
    }
  }

  if (stats.timeStats.lateNightCommits > 0) {
    commitment.push(
      `Late night commits (10PM-5AM): ${stats.timeStats.lateNightCommits} (${stats.timeStats.lateNightPercent}%)`
    );
    if (stats.timeStats.lateNightPercent > 20) {
      commitment.push(`One in five commits written between 10PM and 5AM. Your code has insomnia and it shows.`);
    } else if (stats.timeStats.lateNightPercent > 10) {
      commitment.push(`Nothing good happens in a codebase after midnight. Your git log proves this.`);
    }
  }

  commitment.push(`Peak productivity: ${stats.timeStats.busiestDay}s at ${formatHour(stats.timeStats.busiestHour)}`);

  if (stats.timeStats.fridayCommits > stats.timeStats.mondayCommits * 1.5) {
    commitment.push(
      `Friday commits (${stats.timeStats.fridayCommits}) vs Monday (${stats.timeStats.mondayCommits}). You deploy on Fridays more than you start on Mondays. You are the reason SREs drink.`
    );
  }

  sections.push({ title: "COMMITMENT ISSUES", lines: commitment });

  // ── COMMIT MESSAGE THERAPY ──
  const messages: string[] = [];

  messages.push(`Average message length: ${stats.messageStats.avgLength} characters`);

  if (stats.messageStats.avgLength < 10) {
    messages.push(`Single digits. Your commit messages have less substance than a fortune cookie.`);
  } else if (stats.messageStats.avgLength < 20) {
    messages.push(`Your commit messages are shorter than most tweets. And less informative.`);
  }

  if (stats.messageStats.fixPercent > 30) {
    messages.push(
      `${stats.messageStats.fixPercent}% of your commits start with "fix". You're not developing software, you're playing whack-a-mole.`
    );
  } else if (stats.messageStats.fixPercent > 15) {
    messages.push(
      `${stats.messageStats.fixPercent}% fix commits. Every commit is an apology for the last commit.`
    );
  }

  if (stats.messageStats.wipCount > 0) {
    messages.push(
      `WIP commits: ${stats.messageStats.wipCount}. That's ${plural(stats.messageStats.wipCount, "time")} you told the repo "I'll finish this later." The repo is still waiting.`
    );
  }

  if (stats.messageStats.oneWordCount > 5) {
    messages.push(
      `One-word commit messages: ${stats.messageStats.oneWordCount}. Future you is going to read "stuff" and "updates" and weep.`
    );
  }

  if (stats.messageStats.mostRepeatedCount > 3) {
    messages.push(
      `You used "${stats.messageStats.mostRepeatedMessage}" as a commit message ${plural(stats.messageStats.mostRepeatedCount, "time")}. ${pick([
        "Ctrl+C, Ctrl+V is not a commit strategy.",
        "Even copy-paste deserves variety.",
        "Git asked for a message. You gave it a mantra.",
        "At this point, just alias it.",
      ])}`
    );
  }

  if (stats.messageStats.shortestMessage.length <= 3) {
    messages.push(
      `Shortest commit message: "${stats.messageStats.shortestMessage}" — ${pick([
        "Poetry.",
        "Hemingway would be proud. And confused.",
        "The git log whispers: what does it mean?",
        "A haiku would've been more descriptive.",
      ])}`
    );
  }

  if (stats.messageStats.swearCount > 0) {
    messages.push(
      `Commits containing profanity: ${stats.messageStats.swearCount}. ${pick([
        "Your git log reads like a debugging session at 3AM. Because it was.",
        "The repo has a swear jar. You owe it money.",
        "Somewhere, a code reviewer is clutching their pearls.",
      ])}`
    );
  }

  if (stats.messageStats.questionMarkCount > 3) {
    messages.push(
      `Commits with question marks: ${stats.messageStats.questionMarkCount}. You committed code you weren't sure about. ${stats.messageStats.questionMarkCount} times. Boldly uncertain.`
    );
  }

  if (stats.messageStats.exclamationCount > 5) {
    messages.push(
      `Commits with exclamation marks: ${stats.messageStats.exclamationCount}. Every commit is URGENT and IMPORTANT and EXCITING! (It wasn't.)`
    );
  }

  sections.push({ title: "COMMIT MESSAGE THERAPY", lines: messages });

  // ── THE FILES YOU CAN'T STOP TOUCHING ──
  const files: string[] = [];

  if (stats.fileStats.mostEditedFile) {
    files.push(
      `Most edited file: ${stats.fileStats.mostEditedFile} (${plural(stats.fileStats.mostEditedCount, "edit")})`
    );
    if (stats.fileStats.mostEditedCount > 50) {
      files.push(
        `${stats.fileStats.mostEditedCount} edits to one file. This isn't development, it's a toxic relationship. Let it go.`
      );
    } else if (stats.fileStats.mostEditedCount > 20) {
      files.push(
        `You've edited this file ${stats.fileStats.mostEditedCount} times. At this point, it should be paying rent.`
      );
    }
  }

  files.push(`Total files touched: ${stats.fileStats.totalFilesTouched}`);

  if (stats.fileStats.topFiles.length > 1) {
    files.push(`\nYour top 5 most-edited files:`);
    for (const f of stats.fileStats.topFiles) {
      files.push(`  ${f.count}x  ${f.file}`);
    }
  }

  sections.push({ title: "THE FILES YOU CAN'T STOP TOUCHING", lines: files });

  // ── THE BODY COUNT ──
  const size: string[] = [];

  size.push(`Lines added: ${stats.sizeStats.totalInsertions.toLocaleString()}`);
  size.push(`Lines deleted: ${stats.sizeStats.totalDeletions.toLocaleString()}`);
  size.push(`Net contribution: ${stats.sizeStats.netLines > 0 ? "+" : ""}${stats.sizeStats.netLines.toLocaleString()} lines`);

  if (stats.sizeStats.totalDeletions > stats.sizeStats.totalInsertions) {
    size.push(
      `You've deleted more code than you've written. ${pick([
        "Technically, you're making the repo lighter. Spiritually, you're an arsonist.",
        "The best code is no code. You're living the dream.",
        "Senior developer energy: destroy more than you create.",
      ])}`
    );
  }

  if (stats.sizeStats.biggestCommitInsertions > 1000) {
    size.push(
      `Biggest single commit: +${stats.sizeStats.biggestCommitInsertions.toLocaleString()} lines ("${stats.sizeStats.biggestCommitMessage}")`
    );
    size.push(
      pick([
        "That's not a commit, that's a data migration pretending to be a feature.",
        "Nobody reviewed that. Nobody could.",
        "The PR for this commit was approved by someone who values their weekend.",
        `+${stats.sizeStats.biggestCommitInsertions.toLocaleString()} lines in one commit. Did you paste the entire node_modules?`,
      ])
    );
  }

  sections.push({ title: "THE BODY COUNT", lines: size });

  // ── BRANCH GRAVEYARD ──
  if (stats.branchStats.totalBranches > 1 || stats.branchStats.staleBranches.length > 0) {
    const branches: string[] = [];
    branches.push(`Total branches: ${stats.branchStats.totalBranches}`);
    branches.push(`Current branch: ${stats.branchStats.currentBranch}`);

    if (stats.branchStats.staleBranches.length > 0) {
      branches.push(
        `Stale branches (no commits in 30+ days): ${stats.branchStats.staleBranches.length}`
      );
      for (const b of stats.branchStats.staleBranches.slice(0, 5)) {
        branches.push(`  - ${b}`);
      }
      if (stats.branchStats.staleBranches.length > 3) {
        branches.push(
          pick([
            "These branches have been dead longer than some of your houseplants.",
            "A branch graveyard. Every one a feature that was going to change everything.",
            "Delete them or admit they're a memorial.",
          ])
        );
      }
    }

    sections.push({ title: "BRANCH GRAVEYARD", lines: branches });
  }

  // ── FINAL VERDICT ──
  const verdict: string[] = [];
  const score = calculateScore(stats);
  const bar = generateBar(score);

  verdict.push(`\n  Performance Score: ${score}/10  ${bar}\n`);
  verdict.push(getVerdict(score));

  sections.push({ title: "FINAL VERDICT", lines: verdict });

  return sections;
}

function calculateScore(stats: GitStats): number {
  let score = 5; // start neutral

  // Good habits
  if (stats.avgCommitsPerWeek >= 3 && stats.avgCommitsPerWeek <= 20) score += 1;
  if (stats.messageStats.avgLength > 20) score += 1;
  if (stats.messageStats.fixPercent < 20) score += 1;
  if (stats.longestGapDays < 14) score += 1;
  if (stats.messageStats.oneWordCount < 5) score += 1;

  // Bad habits
  if (stats.messageStats.fixPercent > 40) score -= 1;
  if (stats.messageStats.wipCount > 5) score -= 1;
  if (stats.messageStats.avgLength < 10) score -= 1;
  if (stats.longestGapDays > 60) score -= 1;
  if (stats.timeStats.lateNightPercent > 25) score -= 1;
  if (stats.messageStats.mostRepeatedCount > 10) score -= 1;
  if (stats.branchStats.staleBranches.length > 5) score -= 1;

  return Math.max(1, Math.min(10, score));
}

function generateBar(score: number): string {
  const filled = "█".repeat(score);
  const empty = "░".repeat(10 - score);
  return filled + empty;
}

function getVerdict(score: number): string {
  if (score >= 9) return pick([
    "Exceptional. Your git hygiene is better than most people's actual hygiene.",
    "Suspiciously clean. Are you a bot? Blink twice if you're a bot.",
  ]);
  if (score >= 7) return pick([
    "Solid work. A few bad habits, but nothing that would get you fired. Probably.",
    "Above average. You'd survive a git log audit. Most wouldn't.",
    "Not bad. Your future self will only mildly hate your past self.",
  ]);
  if (score >= 5) return pick([
    "Mid. You're the room temperature water of git histories.",
    "Aggressively average. Your commits say 'I was here' and nothing more.",
    "C+ developer. You show up. You commit. You leave. No one knows what you did.",
  ]);
  if (score >= 3) return pick([
    "Concerning. Your git history reads like a series of unfortunate events.",
    "Below average. If your git log were a resume, it would go in the shredder.",
    "Your repo needs therapy. And honestly? So might you.",
  ]);
  return pick([
    "Catastrophic. Your git history is a cautionary tale told at engineering offsites.",
    "This isn't a git log. This is a crime scene.",
    "I've seen abandoned repos with more coherent histories. Please seek help.",
  ]);
}

function formatHour(hour: number): string {
  if (hour === 0) return "12AM";
  if (hour === 12) return "12PM";
  return hour < 12 ? `${hour}AM` : `${hour - 12}PM`;
}
