import { execSync } from "child_process";

export interface GitStats {
  totalCommits: number;
  firstCommitDate: string;
  lastCommitDate: string;
  daysSinceFirst: number;
  avgCommitsPerWeek: number;
  longestGapDays: number;
  longestGapStart: string;
  longestGapEnd: string;

  // Commit messages
  messageStats: {
    avgLength: number;
    shortestMessage: string;
    longestMessage: string;
    fixCount: number;
    fixPercent: number;
    wipCount: number;
    sameMessageCount: number;
    mostRepeatedMessage: string;
    mostRepeatedCount: number;
    swearCount: number;
    questionMarkCount: number;
    exclamationCount: number;
    emojiCount: number;
    oneWordCount: number;
  };

  // Time patterns
  timeStats: {
    weekendCommits: number;
    weekendPercent: number;
    lateNightCommits: number;
    lateNightPercent: number;
    fridayCommits: number;
    mondayCommits: number;
    busiestDay: string;
    busiestDayCount: number;
    busiestHour: number;
    busiestHourCount: number;
  };

  // Files
  fileStats: {
    mostEditedFile: string;
    mostEditedCount: number;
    totalFilesTouched: number;
    topFiles: { file: string; count: number }[];
  };

  // Branches
  branchStats: {
    totalBranches: number;
    staleBranches: string[];
    currentBranch: string;
  };

  // Size
  sizeStats: {
    totalInsertions: number;
    totalDeletions: number;
    netLines: number;
    biggestCommitMessage: string;
    biggestCommitInsertions: number;
  };
}

function run(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout: 15000, maxBuffer: 10 * 1024 * 1024 }).trim();
  } catch {
    return "";
  }
}

function daysBetween(a: string, b: string): number {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.abs(Math.floor((d2.getTime() - d1.getTime()) / 86400000));
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const SWEAR_PATTERNS = /\b(fuck|shit|damn|hell|crap|wtf|wth|omfg|dammit|goddamn|ass)\b/i;

export function analyzeRepo(): GitStats {
  // All commits: hash, date, message
  const logRaw = run(`git log --format="%H|%aI|%s" --all`);
  if (!logRaw) throw new Error("No git history found.");

  const commits = logRaw.split("\n").filter(Boolean).map((line) => {
    const [hash, date, ...msgParts] = line.split("|");
    return { hash, date, message: msgParts.join("|") };
  });

  const totalCommits = commits.length;
  if (totalCommits === 0) throw new Error("No commits found.");

  const dates = commits.map((c) => new Date(c.date)).sort((a, b) => a.getTime() - b.getTime());
  const firstCommitDate = dates[0].toISOString().split("T")[0];
  const lastCommitDate = dates[dates.length - 1].toISOString().split("T")[0];
  const daysSinceFirst = daysBetween(firstCommitDate, new Date().toISOString().split("T")[0]);
  const weeks = Math.max(daysSinceFirst / 7, 1);
  const avgCommitsPerWeek = Math.round((totalCommits / weeks) * 10) / 10;

  // Longest gap
  let longestGap = 0;
  let gapStart = "";
  let gapEnd = "";
  for (let i = 1; i < dates.length; i++) {
    const gap = daysBetween(dates[i - 1].toISOString(), dates[i].toISOString());
    if (gap > longestGap) {
      longestGap = gap;
      gapStart = dates[i - 1].toISOString().split("T")[0];
      gapEnd = dates[i].toISOString().split("T")[0];
    }
  }

  // Message analysis
  const messages = commits.map((c) => c.message);
  const avgLength = Math.round(messages.reduce((sum, m) => sum + m.length, 0) / messages.length);
  const sorted = [...messages].sort((a, b) => a.length - b.length);
  const shortestMessage = sorted[0] || "";
  const longestMessage = sorted[sorted.length - 1] || "";
  const fixCount = messages.filter((m) => /^fix/i.test(m)).length;
  const wipCount = messages.filter((m) => /^wip|work in progress/i.test(m)).length;
  const oneWordCount = messages.filter((m) => m.trim().split(/\s+/).length === 1).length;
  const swearCount = messages.filter((m) => SWEAR_PATTERNS.test(m)).length;
  const questionMarkCount = messages.filter((m) => m.includes("?")).length;
  const exclamationCount = messages.filter((m) => m.includes("!")).length;
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  const emojiCount = messages.filter((m) => emojiRegex.test(m)).length;

  // Most repeated message
  const msgCounts = new Map<string, number>();
  for (const m of messages) {
    const lower = m.toLowerCase().trim();
    msgCounts.set(lower, (msgCounts.get(lower) || 0) + 1);
  }
  let mostRepeatedMessage = "";
  let mostRepeatedCount = 0;
  let sameMessageCount = 0;
  for (const [msg, count] of msgCounts) {
    if (count > 1) sameMessageCount += count;
    if (count > mostRepeatedCount) {
      mostRepeatedCount = count;
      mostRepeatedMessage = msg;
    }
  }

  // Time patterns
  const dayCount = new Map<number, number>();
  const hourCount = new Map<number, number>();
  let weekendCommits = 0;
  let lateNightCommits = 0;
  let fridayCommits = 0;
  let mondayCommits = 0;

  for (const d of dates) {
    const day = d.getDay();
    const hour = d.getHours();
    dayCount.set(day, (dayCount.get(day) || 0) + 1);
    hourCount.set(hour, (hourCount.get(hour) || 0) + 1);
    if (day === 0 || day === 6) weekendCommits++;
    if (hour >= 22 || hour < 5) lateNightCommits++;
    if (day === 5) fridayCommits++;
    if (day === 1) mondayCommits++;
  }

  let busiestDay = 0;
  let busiestDayCount = 0;
  for (const [day, count] of dayCount) {
    if (count > busiestDayCount) {
      busiestDay = day;
      busiestDayCount = count;
    }
  }

  let busiestHour = 0;
  let busiestHourCount = 0;
  for (const [hour, count] of hourCount) {
    if (count > busiestHourCount) {
      busiestHour = hour;
      busiestHourCount = count;
    }
  }

  // Files most edited
  const fileLogRaw = run(`git log --all --name-only --format="" --diff-filter=AMRC`);
  const fileCounts = new Map<string, number>();
  if (fileLogRaw) {
    for (const f of fileLogRaw.split("\n").filter(Boolean)) {
      fileCounts.set(f, (fileCounts.get(f) || 0) + 1);
    }
  }
  const topFiles = [...fileCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([file, count]) => ({ file, count }));

  const mostEditedFile = topFiles[0]?.file || "unknown";
  const mostEditedCount = topFiles[0]?.count || 0;

  // Branches
  const branchRaw = run(`git branch -a --format="%(refname:short)"`);
  const branches = branchRaw.split("\n").filter(Boolean);
  const currentBranch = run(`git branch --show-current`) || "detached HEAD";

  // Stale branches (no commits in 30+ days)
  const staleBranches: string[] = [];
  for (const branch of branches.slice(0, 20)) {
    if (branch.includes("HEAD")) continue;
    const lastDate = run(`git log -1 --format="%aI" "${branch}" 2>/dev/null`);
    if (lastDate && daysBetween(lastDate, new Date().toISOString()) > 30) {
      staleBranches.push(branch);
    }
  }

  // Insertions / deletions
  const shortstatRaw = run(`git log --all --shortstat --format="COMMIT:%s"`);
  let totalInsertions = 0;
  let totalDeletions = 0;
  let biggestCommitMessage = "";
  let biggestCommitInsertions = 0;
  let currentMsg = "";

  for (const line of shortstatRaw.split("\n")) {
    if (line.startsWith("COMMIT:")) {
      currentMsg = line.slice(7);
    }
    const insMatch = line.match(/(\d+) insertion/);
    const delMatch = line.match(/(\d+) deletion/);
    const ins = insMatch ? parseInt(insMatch[1]) : 0;
    const del = delMatch ? parseInt(delMatch[1]) : 0;
    totalInsertions += ins;
    totalDeletions += del;
    if (ins > biggestCommitInsertions) {
      biggestCommitInsertions = ins;
      biggestCommitMessage = currentMsg;
    }
  }

  return {
    totalCommits,
    firstCommitDate,
    lastCommitDate,
    daysSinceFirst,
    avgCommitsPerWeek,
    longestGapDays: longestGap,
    longestGapStart: gapStart,
    longestGapEnd: gapEnd,
    messageStats: {
      avgLength,
      shortestMessage,
      longestMessage,
      fixCount,
      fixPercent: Math.round((fixCount / totalCommits) * 100),
      wipCount,
      sameMessageCount,
      mostRepeatedMessage,
      mostRepeatedCount,
      swearCount,
      questionMarkCount,
      exclamationCount,
      emojiCount,
      oneWordCount,
    },
    timeStats: {
      weekendCommits,
      weekendPercent: Math.round((weekendCommits / totalCommits) * 100),
      lateNightCommits,
      lateNightPercent: Math.round((lateNightCommits / totalCommits) * 100),
      fridayCommits,
      mondayCommits,
      busiestDay: DAYS[busiestDay],
      busiestDayCount,
      busiestHour,
      busiestHourCount,
    },
    fileStats: {
      mostEditedFile,
      mostEditedCount,
      totalFilesTouched: fileCounts.size,
      topFiles,
    },
    branchStats: {
      totalBranches: branches.length,
      staleBranches,
      currentBranch,
    },
    sizeStats: {
      totalInsertions,
      totalDeletions,
      netLines: totalInsertions - totalDeletions,
      biggestCommitMessage,
      biggestCommitInsertions,
    },
  };
}
