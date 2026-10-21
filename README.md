# MedCap — campus medical workspace

A refreshed React application with a Node.js 24 + SQLite backend. Original source components are retained for reference; the active workspace uses the new authenticated API, not the original open Firebase database.

## Start on Windows / VS Code

1. Install Node.js **24 or newer**.
2. Open this folder in VS Code and its terminal.
3. Run `npm install`.
4. Copy `.env.example` to `.env`. On PowerShell: `Copy-Item .env.example .env`.
5. Edit `.env` and set a private `ADMIN_PASSWORD` of at least 12 characters.
6. Run `npm run build`, then `npm start`.
7. Open **http://localhost:3001** and sign in with your password.

Development: run `npm run server` in one terminal and `npm run dev` in another. Open http://localhost:3000. The Vite proxy forwards API requests to port 3001.

## Workflow

- Register students, faculty, staff or visitors with a unique campus ID and optional phone.
- Add medicines, opening stock, units, minimum stock thresholds and expiry dates.
- Record a consultation: clinician, diagnosis/complaint, clinical notes, one or more prescribed medicines, and optional hospital referral with deadline.
- Open the consultation and choose **Issue prescription & update inventory** when medicines are physically given. Saving a prescription does not deduct stock. All prescription lines deduct atomically. Insufficient or expired stock blocks the entire issue. Duplicate issue requests cannot deduct stock twice.
- Record hospital follow-up completion when confirmed by staff. Overdue open referrals generate one notification each; completing a referral cancels queued reminders.
- The server checks overdue referrals every minute while running. Opening the workspace also triggers a check. It does not run when your computer/server is off.
- Low stock appears on the dashboard and Pharmacy screen. Restock is recorded in the activity log.
- Patient histories, searchable records, print view, JSON backup export and an activity log are included.

The database starts **empty**, so no sample medical data is confused with real records. Your previous browser/Firebase records are not automatically migrated. Keep the original app/database backup before switching. Legacy components and initial sample data remain in `src/` for reference; they are not part of the new active data flow.

## AI clinician support

Add `AI_API_KEY` to `.env`, restart the server and open a consultation. **Request AI review** sends the recorded diagnosis, clinical notes and referral advice to the configured OpenAI model. Patient identity fields are excluded, but staff must avoid including identifiers in free-text notes. This optional service requires your account and may incur charges.

AI returns referral considerations for clinician review. It does not diagnose, prescribe, automatically create hospital referrals or send patient notifications. Actual referrals and deadlines are entered by the treating clinician. Without a key, the interface clearly marks AI unavailable; there are no simulated AI outputs.

## Notifications

Without a provider, the app keeps a real notification outbox and offers an **SMS draft** for patients with a phone number. This opens the local messaging application and does not claim a message was sent.

For provider delivery, configure `NOTIFICATION_WEBHOOK` and optional `NOTIFICATION_TOKEN`. Your trusted adapter must accept POST JSON `{ "id": "...", "to": "+91...", "message": "..." }`, respect the `Idempotency-Key` header, and return success only when accepted. Messages deliberately omit diagnosis details. Staff click **Send reminder** after review; overdue detection and queuing are automatic, sending is manual. Status `accepted` means provider acceptance, not delivery confirmation. Delivery callbacks and unattended SMS dispatch are not implemented. Failed or interrupted delivery needs staff reconciliation with the provider before retrying. No messages were sent during development.

## Data and access

SQLite persists records in `data/medcap.sqlite`. For a consistent full backup stop the server and copy `data/` securely; JSON export is readable but there is no restore UI. Keep backups protected because they contain medical records.

A password is mandatory. Sessions are server-side, expire after 8 hours and invalidate on restart. Login attempts are rate limited. APIs enforce login and same-origin requests. The server binds only to 127.0.0.1. For network/production use, deploy behind HTTPS, set `COOKIE_SECURE=true`, and add individual staff accounts/roles, managed backups, encryption and a patient-data policy. This version has one shared staff administrator, not separate doctor/pharmacist authorization.

Original Firestore rules were publicly writable. The refreshed app does not connect to Firebase. The included rules now deny direct access; deploy them to your existing Firebase project if retiring the old app. This package alone does not change rules in your cloud project.

## Verification

`npm test` covers atomic dispensing, insufficient-stock rollback, repeat dispense prevention, expired medicines, validation and idempotent overdue reminders. `npm run typecheck` checks TypeScript, and `npm run build` produces the frontend.
