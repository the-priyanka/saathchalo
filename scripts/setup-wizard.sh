#!/usr/bin/env bash
# Guided Supabase setup for SaathChalo. Run from anywhere: bash scripts/setup-wizard.sh
# Secrets are typed into this terminal and written to .env.local only. Nothing is sent anywhere.
set -euo pipefail
cd "$(dirname "$0")/.."

bold() { printf '\033[1m%s\033[0m\n' "$1"; }
pause() { read -r -p "Press Enter when done... " _; }
copy_hint() {
  # $1 = file or text source description, stdin = content
  if command -v pbcopy >/dev/null 2>&1; then
    pbcopy
    echo "(Copied to your clipboard.)"
  else
    echo "(No clipboard tool found, copy the text printed above by hand.)"
  fi
}

bold "SaathChalo Supabase setup"
echo "This takes about 10 minutes. You need a free Supabase account."
echo

bold "Step 1 of 6: create the project"
echo "1. Open https://supabase.com/dashboard and click New project."
echo "2. Name: saathchalo. Region: the closest one to you (for example Mumbai)."
echo "3. Set a database password and save it in your password manager."
echo "4. Wait until the project finishes setting up."
pause

bold "Step 2 of 6: API keys"
echo "In the dashboard open Project Settings, then API Keys (or API)."
echo "You need the Project URL, the anon (publishable) key, and the service_role (secret) key."
echo "The service_role key bypasses all security rules. It stays on this computer only."
echo
if [ -f .env.local ]; then
  read -r -p ".env.local already exists. Overwrite it? [y/N] " overwrite
  if [ "${overwrite:-N}" != "y" ] && [ "${overwrite:-N}" != "Y" ]; then
    echo "Keeping the existing .env.local."
  else
    rm .env.local
  fi
fi
if [ ! -f .env.local ]; then
  read -r -p "Project URL (https://xxxx.supabase.co): " SUPABASE_URL
  read -r -s -p "Anon / publishable key (hidden): " SUPABASE_ANON; echo
  read -r -s -p "Service role / secret key (hidden): " SUPABASE_SERVICE; echo
  umask 077
  {
    echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON"
    echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE"
  } > .env.local
  echo "Wrote .env.local (git ignores it)."
fi
echo

bold "Step 3 of 6: email codes (OTP)"
echo "Open Authentication, then Sign In / Providers, then Email. Make sure 'Confirm email' is ON."
echo "In the same Email provider screen, set 'Email OTP Length' to 6 and keep 'Email OTP Expiration' at 3600."
echo "Then open Authentication, then Emails (Templates). Edit two templates."
echo
echo "A) Template 'Confirm signup'. Subject: Your SaathChalo verification code. Body:"
TEMPLATE_CONFIRM='<h2>Verify your SaathChalo account</h2><p>Your verification code is:</p><h1>{{ .Token }}</h1><p>The code expires in one hour. If you did not sign up, ignore this email.</p>'
echo "$TEMPLATE_CONFIRM"
printf '%s' "$TEMPLATE_CONFIRM" | copy_hint confirm
pause
echo
echo "B) Template 'Reset password'. Subject: Your SaathChalo password reset code. Body:"
TEMPLATE_RESET='<h2>Reset your SaathChalo password</h2><p>Your reset code is:</p><h1>{{ .Token }}</h1><p>The code expires in one hour. If you did not ask for this, ignore this email.</p>'
echo "$TEMPLATE_RESET"
printf '%s' "$TEMPLATE_RESET" | copy_hint reset
pause
echo

bold "Step 4 of 6: enable pg_cron"
echo "Open Database, then Extensions, search for pg_cron and enable it."
pause
echo

bold "Step 5 of 6: create the tables"
echo "Open SQL Editor and run two files, in order."
echo
echo "First: supabase/migrations/0001_profiles_rides.sql"
copy_hint m1 < supabase/migrations/0001_profiles_rides.sql
echo "Paste it into a new query and click Run. Expect 'Success'."
pause
echo "Second: supabase/migrations/0002_demo_refresh.sql"
copy_hint m2 < supabase/migrations/0002_demo_refresh.sql
echo "Paste it into a new query and click Run. Expect 'Success'."
pause
echo

bold "Step 6 of 6: seed and check"
read -r -p "Run 'npm run db:seed' and 'npm run db:check' now? [Y/n] " run_now
if [ "${run_now:-Y}" = "n" ] || [ "${run_now:-Y}" = "N" ]; then
  echo "Later, run: npm run db:seed && npm run db:check"
else
  npm run db:seed
  npm run db:check
fi
echo
bold "Done. Start the app with: npm run dev"
echo "Demo login: see the README."
