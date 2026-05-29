import type { Commit } from './filter'

async function ghFetch(path: string, token: string) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    next: { revalidate: 0 },
  })
  if (!res.ok) return null
  return res.json()
}

export async function getLastWeekCommits(
  accessToken: string,
  username: string
): Promise<{ repo: string; commits: Commit[] }[]> {
  const since = new Date()
  since.setDate(since.getDate() - 7)
  const sinceISO = since.toISOString()

  const repos = await ghFetch(
    `/user/repos?sort=pushed&per_page=50&affiliation=owner`,
    accessToken
  )
  if (!repos) return []

  const results: { repo: string; commits: Commit[] }[] = []

  for (const repo of repos) {
    const commitList = await ghFetch(
      `/repos/${repo.full_name}/commits?since=${sinceISO}&author=${username}&per_page=50`,
      accessToken
    )
    if (!commitList || commitList.length === 0) continue

    const commits: Commit[] = []

    for (const c of commitList.slice(0, 30)) {
      const detail = await ghFetch(
        `/repos/${repo.full_name}/commits/${c.sha}`,
        accessToken
      )
      if (!detail) continue

      commits.push({
        sha: c.sha,
        message: c.commit.message,
        date: c.commit.author.date,
        additions: detail.stats?.additions ?? 0,
        deletions: detail.stats?.deletions ?? 0,
        filesChanged: (detail.files ?? []).map((f: { filename: string }) => f.filename),
      })
    }

    if (commits.length > 0) {
      results.push({ repo: repo.full_name, commits })
    }
  }

  return results
}
