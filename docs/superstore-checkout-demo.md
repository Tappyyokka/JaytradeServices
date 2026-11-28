# Super Store Step 5 demo

Checkout uses the existing Super Store Customer Money wallet, stock and ledger in one database transaction. This demo is disabled by default and refuses payment when `NODE_ENV=production`, even with the demo flag. Delivery methods, prices and dates are test data.

## Run locally

1. Point the backend at a dedicated local PostgreSQL test database. Check for a shell-level `DATABASE_URL` first, because it takes precedence over `.env`.
2. From `backend`, run `npm exec -- prisma migrate deploy --config prisma7.config.ts` and `npm exec -- prisma generate --config prisma7.config.ts`.
3. Run the backend with `INDIPAY_SUPERSTORE_CHECKOUT_DEMO=1` and `NODE_ENV=development`. Set `INDIPAY_REGISTRATION_DEMO=1` on that same development instance to enable the existing screenshot and verification screens for demo top-ups.
4. Publish test listings with existing merchant accounts and use a different test customer or merchant to purchase. Sample storefront catalogue items remain browsing previews. Checkout supports active `MarketplaceVariant` records configured in the test database, including a separate price and stock count per variant. The merchant listing editor handles its existing base listings.
5. Add a sample delivery address and select a delivery method per store. A verified demo credit updates only the Super Store wallet. Return to checkout and review the updated quote before confirming payment.

Use sample addresses, screenshots, and payment references throughout. The Super Store Add Money page displays an inert QR placeholder.

## Verification

- Run `node --test tests/superstoreCheckout.test.js tests/registrationDemo.test.js` from `backend`. To run the PostgreSQL case, provide `SUPERSTORE_TEST_DATABASE_URL` for a migrated disposable database named `checkout_test` or `checkout_test_*`.
- The checkout migration adds saved addresses, variant inventory, checkout receipts, store-specific order details, and a purpose field for approved demo credits. Its existing wallet and ledger tables remain the source of truth.
- An interrupted confirmation can be recovered with **Check payment status**. Retries keep the same checkout reference for the same browser tab. The server returns the original receipt for an already committed checkout.
