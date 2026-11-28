# Application registration demo

Indipay sends enquiries to Jaytrade through the existing lead API. The Indipay application ID matches Jaytrade's unique lead `external_id`. Indipay uses the existing status API and shared integration key to read progress. The two databases are separate.

| Customer stage | Source |
| --- | --- |
| Enquired | New lead or an Indipay application still waiting for lead sync |
| In Review | Jaytrade's review milestone or a legacy assignment or review status |
| Enquiry Verification | Jaytrade's verification milestone or a legacy verification, approval, or downstream processing status |
| Primary Approval | Jaytrade confirms the service, charge, assigned department, and active staff member |
| Register My Application | Indipay records a confirmed registration debit and receipt. The application then appears in Completed Applications |

Legacy statuses can show tracking progress. Payment eligibility requires a current, explicit Jaytrade approval with a matching amount and requires the application to remain eligible. A completed registration leaves Jaytrade's service processing available separately.

## Run locally

1. Point each app at its own local test database. Check the process-level `DATABASE_URL` first because it takes precedence over values loaded from `.env`.
2. From Indipay's `backend` directory, use `npm exec -- prisma migrate deploy --config prisma7.config.ts` and `npm exec -- prisma generate --config prisma7.config.ts`.
3. From Jaytrade, with its Python environment active, use `flask --app app db upgrade`.
4. Set `INDIPAY_REGISTRATION_DEMO=1` in both backends, configure matching `INDIPAY_API_KEY` values, and point Indipay's `JAYTRADE_STATUS_API_URL` at the local Jaytrade `/api/integrations/indipay/leads` endpoint. Keep the existing lead submission configuration pointed to local Jaytrade as well. Restart both backends.
5. The Add Money screen has an inert QR placeholder. To show a sample image, set `VITE_INDIPAY_DEMO_QR_ASSET` to a demo asset in the frontend. Use sample references and screenshots.

## Workflow and interfaces

- Jaytrade's Leads view lets authorized staff advance a submitted enquiry. A supervisor releases Primary Approval after verifying the assignment, service, and registration charge. The existing status API returns the resulting record in `registration`.
- Indipay serves quotes, payment confirmation, receipts, notifications, and manual retry under `/api/registration-demo`. A debit, receipt, and ledger entry commit together. Indipay sends the unique reference to Jaytrade's new `POST /api/integrations/indipay/leads/:external_id/registration` endpoint. Jaytrade treats a repeated matching reference as the same confirmation.
- Add Money creates a pending demo credit request. The Indipay admin screen links to the request queue and allows evidence review, explicit simulated reconciliation, and an approval or rejection with remarks. Approval writes one credit to the demo wallet and its ledger.
- If synchronization fails after the demo payment commits, the registration remains in Completed Applications. The same view offers a retry using the original reference. Jaytrade shows the payment status after confirmation arrives.

## Code and migrations

| Project | Changes |
| --- | --- |
| Indipay backend | `backend/server.js`, `backend/routes/registrationDemo.js`, `backend/prisma/schema.prisma`, `backend/prisma/migrations/20261126120000_application_registration_demo/migration.sql` |
| Indipay frontend | `App.jsx`, `pages/CustomerApplications.jsx`, `pages/ApplicationRegistration.jsx` and CSS, `pages/WalletCreditRequests.jsx`, `pages/ApplicationStatus.jsx`, `pages/Wallet.jsx`, `pages/Announcements.jsx`, `wallet/registrationDemo.js` under `frontend-react/src` |
| Indipay tests | `backend/tests/registrationDemo.test.js` |
| Jaytrade | `app.py`, `models.py`, `indipay_registration.py`, `templates/leads.html`, `templates/department_head_management_leads.html`, `templates/_indipay_registration.html`, `migrations/versions/9de81be225c1_indipay_registration.py` |

## Production prerequisites

The feature is disabled by default. All balances, receipts, and reconciliation in this flow are demo records. Production activation requires a separately authorized wallet ledger and company payment destination, independent bank or provider transaction verification, approved terms and refund policies, appropriate evidence storage and retention, and monitored synchronization retries. The demo review confirmation is a simulation of that process.
