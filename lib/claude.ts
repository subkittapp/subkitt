import Anthropic from '@anthropic-ai/sdk'
import type { Commit } from './filter'

const client = new Anthropic()

export async function generateDrafts(
  commitGroups: { repo: string; commits: Commit[] }[]
): Promise<string[]> {
  const commitSummary = commitGroups
    .flatMap(({ repo, commits }) =>
      commits.map(c => {
        const msg = c.message.split('\n')[0]
        return `[${repo}] ${msg} (+${c.additions}/-${c.deletions} lines, ${c.filesChanged.length} files)`
      })
    )
    .join('\n')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a ghostwriter for a technical founder. Here are the commits they shipped this week:

${commitSummary}

Write 5 ready-to-post tweets that share what they built, in a direct builder's voice. Each tweet must be under 280 characters. No hashtags. No emojis unless the founder uses them. Sound like a person, not a press release.

Return ONLY the 5 tweets, numbered 1-5, one per line. No preamble, no explanation.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') return []

  return content.text
    .split('\n')
    .filter(line => /^\d+\./.test(line.trim()))
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 5)
}
