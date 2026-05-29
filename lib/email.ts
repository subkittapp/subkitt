import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendDraftsEmail(
  to: string,
  username: string,
  drafts: string[]
): Promise<void> {
  const draftBlocks = drafts
    .map(
      (draft, i) => `
      <div style="margin-bottom:24px;padding:16px 20px;background:#f9f9f9;border-left:3px solid #000;border-radius:4px;">
        <p style="margin:0 0 8px 0;font-size:11px;color:#999;font-family:monospace;text-transform:uppercase;letter-spacing:.05em;">${i + 1} / ${drafts.length}</p>
        <p style="margin:0;font-size:16px;line-height:1.6;color:#111;">${draft}</p>
        <p style="margin:10px 0 0 0;font-size:11px;color:#bbb;">${draft.length} / 280 chars</p>
      </div>`
    )
    .join('')

  await resend.emails.send({
    from: 'SubKitt <drafts@subkitt.com>',
    to,
    subject: 'Your Monday SubKitt drafts',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#000;background:#fff;">
  <h1 style="font-size:22px;font-weight:700;margin:0 0 6px 0;">Your Monday SubKitt drafts</h1>
  <p style="color:#666;margin:0 0 32px 0;font-size:15px;">5 tweets from your GitHub activity this week, @${username}. Pick one, edit it, post it.</p>
  ${draftBlocks}
  <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
  <p style="font-size:12px;color:#aaa;">SubKitt · built by <a href="https://x.com/CheemaEdu" style="color:#888;">@CheemaEdu</a></p>
</body>
</html>`,
  })
}
