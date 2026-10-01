# Contact form relay

A Cloudflare Worker that receives the contact form from www.polancoventures.com
and sends one email to contact@polancoventures.com through Resend. It stores
nothing. The site falls back to the visitor's own mail app if the Worker is
unreachable or `FORM_ENDPOINT` in `script.js` is empty.

## One-time setup (Santiago)

1. Resend: create an account, add the domain `polancoventures.com`, and add the
   DNS records Resend shows (a DKIM TXT record and an SPF record on a `send`
   subdomain; the root domain's existing SPF is not touched). Wait for the
   domain to show as verified. Create an API key with "Sending access" only.
2. Cloudflare: create an account if needed. No DNS change and no domain
   transfer is required; the Worker runs on its `workers.dev` address.
3. From this folder:

       npx wrangler login
       npx wrangler secret put RESEND_API_KEY     # paste the Resend key
       npx wrangler deploy

   The deploy prints a URL like `https://polancoventures-contact.<account>.workers.dev`.
4. Put that URL in `FORM_ENDPOINT` at the top of `script.js`, commit, push.
5. Optional, recommended: in the Cloudflare dashboard add a rate limiting rule
   for the Worker (for example 5 requests per minute per IP).

## Local test

    cp .dev.vars.example .dev.vars    # then edit values
    npx wrangler dev

`.dev.vars` is ignored by git. Never commit the API key.

## What it checks

- Origin must be www.polancoventures.com (CORS and a server-side check).
- Field lengths match the form's `maxlength` values; email format; audience is
  one of the three options.
- Honeypot field `website` must be empty and the form must have been open for
  at least three seconds. Failures answer "ok" without sending, so bots learn
  nothing.
- Reply-To is set to the visitor's address so a reply from the inbox goes
  straight back to them.
