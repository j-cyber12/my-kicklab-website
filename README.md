This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## WhatsApp Ordering

- Set `NEXT_PUBLIC_WHATSAPP_LINK` in `.env.local` to a WhatsApp Business short link (e.g. `https://wa.me/message/ZC23PRNRWILSN1`) to open chats directly to your WhatsApp with a prefilled cart or product summary.
- Alternatively, set `NEXT_PUBLIC_WHATSAPP_PHONE` (e.g. `+254712345678`) to use `https://wa.me/<phone>?text=...`. If neither is set, the app falls back to `https://wa.me/?text=...` which prompts the user to pick a contact.
- Note: WhatsApp links cannot auto-attach images. The message includes each product’s image URL for quick reference.

## Deploying on Render

- Environment variables from `.env.local` are not present on Render unless you add them in the Render dashboard. In production, Next.js bakes `NEXT_PUBLIC_*` variables at build time.
- In your Render service, go to Settings → Environment → Environment Variables and add either of:
  - `NEXT_PUBLIC_WHATSAPP_LINK` set to your WhatsApp short link (e.g. `https://wa.me/message/…`).
  - or `NEXT_PUBLIC_WHATSAPP_PHONE` set to your phone in E.164 format (e.g. `+254712345678`).
- Trigger a redeploy after saving the variables so the build picks them up.
- Tip: You can use `.env.example` as a reference for all required variables.
