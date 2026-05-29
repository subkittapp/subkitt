import { getLastWeekCommits } from './github'
import { filterCommits } from './filter'
import { generateDrafts } from './claude'
import { sendDraftsEmail } from './email'

interface User {
  github_username: string
  github_email: string
  access_token: string
}

export async function runPipeline(user: User): Promise<{
  status: 'sent' | 'no_commits' | 'no_drafts' | 'error'
  drafts?: string[]
  error?: string
}> {
  try {
    const commitGroups = await getLastWeekCommits(user.access_token, user.github_username)

    const filtered = commitGroups
      .map(({ repo, commits }) => ({ repo, commits: filterCommits(commits) }))
      .filter(({ commits }) => commits.length > 0)

    if (filtered.length === 0) return { status: 'no_commits' }

    const drafts = await generateDrafts(filtered)
    if (drafts.length === 0) return { status: 'no_drafts' }

    await sendDraftsEmail(user.github_email, user.github_username, drafts)
    return { status: 'sent', drafts }
  } catch (err) {
    return { status: 'error', error: String(err) }
  }
}
