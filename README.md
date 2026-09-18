# Dafah Bank

Dafah Bank is a front-end simulation of a digital banking platform — a landing page, account dashboard, transfers, loans, statements, and an in-app customer-service chatbot. It's built with vanilla HTML, CSS, and JavaScript (plus jQuery and Chart.js), with all "banking" data mocked and stored in the browser's `localStorage`. There is no real backend, real money movement, or real security — this is a UI/UX and front-end engineering showcase, not a production banking system.

## Features

- **Landing page** — hero carousel, mega-menu navigation, feature sections
- **Sign up / Sign in** — mock authentication (email + password), forgot-password flow with a recovery-code step
- **Dashboard** — balance, weekly deposit/withdraw chart, recent transactions, quick actions (add money, freeze/unfreeze card, cheque book requests, bill payments, flight/event bookings)
- **Transfers** — Dafah-to-Dafah, local bank transfer, and global/international transfer flows
- **Scheduled transfers** — recurring (daily/weekly/monthly) transfers that auto-run on load
- **Beneficiaries** — saved recipients management
- **Loans** — loan product info page
- **Mobile top-up** — airtime/data purchase flow
- **Transaction history & statement generation**
- **Profile & settings**
- **Customer service** — a rule-based chatbot (keyword matching on balance, account number, loans, transactions, etc.)
- **Light/dark theme toggle**

## Tech stack

- HTML5, CSS3, vanilla JavaScript (no build step, no framework)
- jQuery, Font Awesome (via CDN)
- Chart.js (dashboard/analytics charts)
- Python/Flask (`api/chat.py`) — powers the customer-service chatbot as a serverless function on Vercel
- Data persistence: browser `localStorage` only (no database)

## Project structure

```
├── home-page/              Landing page (entry point)
├── dashboard.html + js/dashboard.js   Main account dashboard
├── sign-up/                 Sign up / sign in / password reset
├── transfer.html, dafah-transfer.html, globalTransfer.html
│   global-transfer-section/  Transfer flows
├── scheduled-section/       Scheduled/recurring transfers
├── beneficiaries-section/    Saved beneficiaries
├── loan-section/             Loan info
├── mobile-topup/              Airtime/data top-up
├── transaction-history-section/
├── statement-section/         Statement generation
├── customer-service/          Chatbot UI
├── profile.html, card.html    Profile & card management
├── analytics.html
├── css/                        Shared stylesheets (dashboard, theme, transfer, etc.)
├── js/                         Shared scripts (data.js holds the mock data layer)
├── img/                        Images and review videos
├── api/chat.py                 Flask serverless function for the chatbot
├── requirements.txt, api/requirements.txt   Python deps for the API
└── vercel.json                  Vercel routing/rewrite config
```

## Running locally

This is a static site with one serverless API route, so a full local run needs two things:

1. **Front end** — open `home-page/index.html` with a local server (e.g. the VS Code "Live Server" extension, or `npx serve`). Opening it directly via `file://` will break the CSS/JS paths described below.
2. **Chatbot API (optional)** — the customer-service page calls `/api/chat`, which only exists as a Vercel serverless function. To test it locally you'd need the Vercel CLI (`vercel dev`) or to run the Flask app directly and point `customer-service/customer.js` at it.

## Deployment

This project is currently packaged for **Vercel**. `vercel.json` rewrites `/` to `home-page/index.html`. Internal links and asset paths use root-relative URLs such as `/css/...`, `/js/...`, and `/img/...`, so they work from the project root in Live Server and on Vercel. `api/chat.py` deploys automatically as a Vercel Python serverless function.

**Important:** this project is not yet portable to other static hosts (Appwrite, Netlify, GitHub Pages, etc.) without changes, because:
- Those hosts may require an equivalent rewrite from `/` to `home-page/index.html` for the root URL
- The Flask chatbot API has no equivalent on most other platforms and would need to be rewritten (e.g. as an Appwrite Function, or moved to client-side JS)

## Known issues / cleanup backlog

- `card.html` is currently an empty file
- Several `<img>` tags (mainly the homepage hero slides) are missing `alt` attributes
- Auth is mock-only: users and passwords are stored in plaintext in `localStorage`, with no real backend, hashing, or session security — fine for a demo, not for production

**Already fixed:**
- ~~`js/dashboard.js` defined `formatDate`, `getIcon`, and `getIconClass` twice~~ — deduplicated into single definitions (kept the AM/PM time format and the mobile-data icon mapping that the duplicate was silently dropping)
- ~~Commented-out/superseded code in `js/data.js`, `js/dashboard.js`, `mobile-topup/script.js`, `js/dafah-transfer.js`, `transaction-history-section/transaction.js`, `customer-service/customer.js`~~ — removed; decorative section-header comments were kept intentionally
- Internal links and assets now use root-relative paths so the site works with Live Server as well as Vercel
- ~~`mobile-topup/index.html` linked to a non-existent loan section~~ — fixed to `/loan-section/loan.html`
- ~~`js/transfer.js` had an inconsistent bare-relative redirect (`"dafah-bank/dashboard.html"`, missing its leading slash)~~ — fixed to match the absolute scheme

## Disclaimer

Dafah Bank is a demo/portfolio project. It does not process real transactions, does not represent a real financial institution, and should not be used to store or simulate real financial credentials.
