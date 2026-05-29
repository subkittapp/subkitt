import { getLastWeekCommits } from './github'
import { filterCommits } from './filter'
import { generateDraftsWithAI, type AIProvider } from './ai'
import { sendDraftsEmail } from './email'
import { createServerClient } from './supabase-server'

interface User {
  id?: string
  github_username: string
  github_email: string
  access_token: string
  ai_provider?: string
  writing_tone?: string
  gemini_api_key?: string
  openai_api_key?: string
  anthropic_api_key?: string
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

    const provider = (user.ai_provider || process.env.DEFAULT_AI_PROVIDER || 'anthropic') as AIProvider
    const tone = user.writing_tone || 'default'
    
    const userKeys = {
      gemini: user.gemini_api_key || undefined,
      openai: user.openai_api_key || undefined,
      anthropic: user.anthropic_api_key || undefined,
    }

    const drafts = await generateDraftsWithAI(filtered, provider, tone, userKeys)
    if (drafts.length === 0) return { status: 'no_drafts' }

    console.log('\n====================================')
    console.log(`📝 GENERATED TWEET DRAFTS FOR @${user.github_username}:`)
    drafts.forEach((d, i) => console.log(`${i + 1}. ${d}`))
    console.log('====================================\n')

    // Save batch to database history
    if (user.id) {
      try {
        const supabase = createServerClient()
        const { error: dbErr } = await supabase
          .from('draft_batches')
          .insert({
            user_id: user.id,
            drafts,
            provider,
          })
        if (dbErr) {
          console.error('Database history insert error:', dbErr)
        }
      } catch (dbErr) {
        console.error('Error saving drafts batch to history table:', dbErr)
      }
    }

    await sendDraftsEmail(user.github_email, user.github_username, drafts)
    return { status: 'sent', drafts }
  } catch (err) {
    return { status: 'error', error: String(err) }
  }
}
