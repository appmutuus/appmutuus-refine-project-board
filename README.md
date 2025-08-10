# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b62ad899-1b92-4bec-89ed-c9511234a672

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b62ad899-1b92-4bec-89ed-c9511234a672) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Environment variables

Create a `.env.local` file and provide the following keys:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_SECRET_KEY=
```

## Job creation form

A basic job creation form is available at `/jobs/new`. It validates input with Zod and stores new jobs in Supabase.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b62ad899-1b92-4bec-89ed-c9511234a672) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Notifications & E-Mail Setup

The project ships with a basic notification service (push + mail). Required environment variables:

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ONESIGNAL_APP_ID=
FCM_SERVER_KEY=
APNS_KEYS_JSON=
RESEND_API_KEY=
SENDGRID_API_KEY=
EMAIL_FROM="Mutuus <info@mutuus-app.de>"
APP_BASE_URL=
REDIS_URL=
SIGNING_SECRET=
EUROPE_TZ="Europe/Berlin"
NOTIFY_RATE_LIMITS='{"perUserMinutes":10}'
QUIET_HOURS_OVERRIDE_TYPES='["NEW_LOGIN","PAYMENT_ISSUE"]'
```

### DNS

Configure SPF, DKIM and DMARC for `mutuus-app.de` so that emails from `info@mutuus-app.de` are accepted.

