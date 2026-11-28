import { Wallet } from "lucide-react";
import { formatPaise, walletEstimate } from "../../wallet/walletData";

export default function WalletEstimate({ balance = null, subtotal = null, subtotalLabel, signedIn, onEarn }) {
  const { remaining, required } = walletEstimate(balance, subtotal);
  return <section className="mp-detail-panel mp-wallet-estimate">
    <h2><Wallet size={18} aria-hidden="true" /> Superstore wallet</h2>
    <dl>
      <div><dt>Available spending balance</dt><dd>{balance !== null ? formatPaise(balance) : signedIn ? "Unavailable" : "Sign in to view"}</dd></div>
      <div><dt>{subtotalLabel}</dt><dd>{subtotal === null ? "Select options" : formatPaise(subtotal)}</dd></div>
      {remaining !== null && <div><dt>Estimated remaining balance</dt><dd>{formatPaise(remaining)}</dd></div>}
      {required !== null && <div><dt>Additional balance required</dt><dd>{formatPaise(required)}</dd></div>}
    </dl>
    {remaining !== null && <p>Your balance covers this subtotal.</p>}
    {required !== null && <p>Your balance is below this subtotal.</p>}
    <small>Estimate excludes delivery and other charges.</small>
    {required !== null && <p><button type="button" className="mp-detail-button" onClick={onEarn}>Earn More</button></p>}
  </section>;
}
