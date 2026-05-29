export interface Commit {
  sha: string
  message: string
  date: string
  additions: number
  deletions: number
  filesChanged: string[]
}

export const BORING: RegExp[] = [
  /^fix:\s*(typo|spelling|grammar|whitespace|formatting)/i,
  /^chore:/i,
  /^bump version/i,
  /^\bwip\b/i,
  /^merge (branch|pull request|remote)/i,
  /^update (yarn\.lock|package-lock|\.gitignore|readme)/i,
  /^revert/i,
  /^style:/i,
]

const INTERESTING: RegExp[] = [
  /^feat:/i,
  /^feature:/i,
  /^release/i,
  /\bship\b/i,
  /^add\b/i,
  /^launch/i,
  /^implement/i,
  /^create/i,
  /^introduce/i,
  /^enable/i,
  /^new:/i,
  /^build:/i,
]

export function filterCommits(commits: Commit[]): Commit[] {
  return commits.filter(commit => {
    const msg = commit.message.split('\n')[0].trim()
    const totalLines = commit.additions + commit.deletions

    if (BORING.some(p => p.test(msg))) return false
    if (INTERESTING.some(p => p.test(msg))) return true
    if (totalLines < 10) return false
    if (totalLines >= 50) return true

    return false
  })
}
