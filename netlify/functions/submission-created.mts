/**
 * Netlify event function: runs after every verified (non-spam) Netlify Forms submission.
 * Sends the lead their guide by email through Resend. Lead notifications to Jorge and Chloe
 * are handled separately by Netlify's form notifications.
 *
 * Env vars (Netlify > Project configuration > Environment variables):
 *   RESEND_API_KEY   required
 *   GUIDE_EMAIL_FROM optional, defaults to "Jorge Alba <jorge@updates.albarealestategroup.com>"
 */

interface Guide {
  subject: string;
  name: string;
  pdf: string;
  intro: string;
}

// Keyed by the Netlify form name (guides.json > formName)
const GUIDES: Record<string, Guide> = {
  'first-time-homebuyer-guide': {
    subject: 'Your free First-Time Homebuyer Guide',
    name: 'First-Time Homebuyer Guide',
    pdf: '/guides/first-time-homebuyer-guide.pdf',
    intro:
      'Here is your copy of the First-Time Homebuyer Guide. It walks through Colorado low-down-payment loans and down payment assistance, step by step.',
  },
  'self-employed-borrower-guide': {
    subject: 'Your free Self-Employed Borrower Guide',
    name: 'Self-Employed Borrower Guide',
    pdf: '/guides/self-employed-borrower-guide.pdf',
    intro:
      'Here is your copy of the Self-Employed Borrower Guide. It covers four loan programs that look at your business activity instead of your tax-return income.',
  },
};

const REPLY_TO = 'jorge@albahometeam.com';
const PHONE = '720-295-4741';
const CALENDLY = 'https://calendly.com/jorge-albahometeam/15min';
const NMLS_LINE = 'Jorge Alba, Mortgage Advisor | NMLS #1935035 | Loan Advisor Group, NMLS #1647915';

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

function renderEmail(firstName: string, guide: Guide, pdfUrl: string) {
  const hello = firstName ? `Hi ${escapeHtml(firstName)},` : 'Hi,';
  const html = `<!doctype html>
<html><body style="margin:0;background:#f6f4ef;font-family:Helvetica,Arial,sans-serif;color:#141311">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4ef;padding:32px 16px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e3ded4">
<tr><td style="background:#141311;padding:18px 28px;color:#ffffff;font-size:13px;letter-spacing:.08em">ALBA REAL ESTATE GROUP</td></tr>
<tr><td style="padding:32px 28px 8px;font-size:16px;line-height:1.6">
<p style="margin:0 0 16px">${hello}</p>
<p style="margin:0 0 24px">${guide.intro}</p>
<p style="margin:0 0 28px"><a href="${pdfUrl}" style="display:inline-block;background:#141311;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:3px">Download your guide</a></p>
<p style="margin:0 0 16px">Every situation is a little different. If you would like to go over your numbers, you can <a href="${CALENDLY}" style="color:#141311">book a free 15-minute call</a> with me, call or text ${PHONE}, or simply reply to this email.</p>
<p style="margin:0 0 4px">Jorge Alba</p>
<p style="margin:0 0 24px;color:#5c5850;font-size:14px">Mortgage Advisor</p>
</td></tr>
<tr><td style="padding:20px 28px;border-top:1px solid #e3ded4;color:#9a958c;font-size:12px;line-height:1.6">${NMLS_LINE}<br>Equal Housing Opportunity. This is not a commitment to lend. All loans subject to credit approval.<br>You are receiving this email because you requested this guide.</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    hello,
    '',
    guide.intro,
    '',
    `Download your guide: ${pdfUrl}`,
    '',
    `Want to go over your numbers? Book a free 15-minute call: ${CALENDLY}`,
    `Or call or text ${PHONE}, or reply to this email.`,
    '',
    'Jorge Alba, Mortgage Advisor',
    '',
    NMLS_LINE,
    'Equal Housing Opportunity.',
  ].join('\n');

  return { html, text };
}

export default async (req: Request) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set; guide email skipped');
    return new Response('Missing configuration', { status: 200 });
  }

  const { payload } = (await req.json()) as {
    payload: { form_name: string; data: Record<string, string> };
  };
  const guide = GUIDES[payload.form_name];
  const email = payload.data?.email?.trim();
  if (!guide || !email) return new Response('Ignored', { status: 200 });

  const siteUrl = process.env.URL ?? 'https://alba-real-estate-group.netlify.app';
  const firstName = (payload.data.full_name ?? '').trim().split(/\s+/)[0] ?? '';
  const { html, text } = renderEmail(firstName, guide, new URL(guide.pdf, siteUrl).toString());

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.GUIDE_EMAIL_FROM ?? 'Jorge Alba <jorge@updates.albarealestategroup.com>',
      to: [email],
      reply_to: REPLY_TO,
      subject: guide.subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    // Logged in Netlify > Logs > Functions; the lead is still saved and notified
    console.error('Resend error', res.status, await res.text());
    return new Response('Email failed', { status: 200 });
  }
  return new Response('Sent', { status: 200 });
};
