import assert from "node:assert/strict";
import { test } from "node:test";
import { accountWallet, shoppingWallet, walletStatement } from "../src/wallet/walletData.js";

test("one Customer Money wallet supplies complete Indipay history and shopping-only history", () => {
  const customer = { id: "customer-1" };
  const entries = [
    ["application-credit:TEST1", 500000],
    ["application:DEMO-REG-1", -150000],
    ["order:checkout-1", -80000],
    ["refund:order-1", 10000],
  ].map(([reference, amountPaise], index) => ({
    id: String(index), reference, amountPaise,
    createdAt: new Date(Date.UTC(2026, 10, 1 + index)).toISOString(),
  }));
  const wallet = accountWallet({ wallet: { balancePaise: 280000, entries }, orders: [] }, customer);
  assert.equal(wallet.availablePaise, 280000);
  assert.equal(wallet.transactions.length, 4);
  assert.deepEqual(wallet.transactions.map((row) => row.type).sort(),
    ["application-payment", "purchase", "refund", "wallet-credit"]);
  const shopping = shoppingWallet(wallet);
  assert.equal(shopping.availablePaise, wallet.availablePaise);
  assert.deepEqual(shopping.transactions.map((row) => row.type).sort(), ["purchase", "refund"]);
  const statement = walletStatement(wallet, "2026-11-01", "2026-11-30");
  assert.equal(statement.credits, 510000);
  assert.equal(statement.debits, 230000);
});
