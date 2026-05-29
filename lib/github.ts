import { BORING, type Commit } from './filter'

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
  if (!repos || !Array.isArray(repos)) return []

  const results: { repo: string; commits: Commit[] }[] = []

  for (const repo of repos) {
    const commitList = await ghFetch(
      `/repos/${repo.full_name}/commits?since=${sinceISO}&author=${username}&per_page=50`,
      accessToken
    )
    if (!commitList || !Array.isArray(commitList) || commitList.length === 0) continue

    // Pre-filter boring commits to save API quota and speed up execution
    const nonBoringCommits = commitList
      .slice(0, 30)
      .filter((c: any) => {
        const msg = c.commit?.message?.split('\n')[0].trim() || ''
        return !BORING.some(p => p.test(msg))
      })

    if (nonBoringCommits.length === 0) continue

    const commitDetails = await Promise.all(
      nonBoringCommits.map(async (c: any) => {
        try {
          const detail = await ghFetch(
            `/repos/${repo.full_name}/commits/${c.sha}`,
            accessToken
          )
          if (!detail) return null

          return {
            sha: c.sha,
            message: c.commit.message,
            date: c.commit.author.date,
            additions: detail.stats?.additions ?? 0,
            deletions: detail.stats?.deletions ?? 0,
            filesChanged: (detail.files ?? []).map((f: { filename: string }) => f.filename),
          }
        } catch (err) {
          console.error(`Error fetching details for commit ${c.sha}:`, err)
          return null
        }
      })
    )

    const validCommits = commitDetails.filter(Boolean) as Commit[]
    if (validCommits.length > 0) {
      results.push({ repo: repo.full_name, commits: validCommits })
    }
  }

  return results
}
