export default function QuantumVsClassical({ classical, quantum }) {
  const safeClassical = (classical != null && !isNaN(classical)) ? Number(classical) : null
  const safeQuantum   = (quantum   != null && !isNaN(quantum))   ? Number(quantum)   : null

  const maxVal       = Math.max(safeClassical ?? 0, safeQuantum ?? 0) * 1.2 || 1
  const classicalPct = safeClassical != null ? (safeClassical / maxVal) * 100 : 0
  const quantumPct   = safeQuantum   != null ? (safeQuantum   / maxVal) * 100 : 0

  const fmt = (v) => v != null ? `$${v.toFixed(2)}` : '—'

  return (
    <div className="glass panel">
      <div className="panel-title">
        <span className="panel-title-text">Option Pricing Comparison</span>
      </div>

      {/* Panel header explanation */}
      <p className="explain italic" style={{ marginTop: 0, marginBottom: '1.25rem' }}>
        A European call option gives the right to buy at the strike price on expiry.
        We price it by estimating the expected discounted payoff across simulated futures.
      </p>

      <div className="method-comparison">

        {/* Classical */}
        <div className="method-row">
          <div className="method-header">
            <span className="method-name">Classical Monte Carlo</span>
            <span className="method-price classical">{fmt(safeClassical)}</span>
          </div>
          <div className="method-bar-track">
            <div className="method-bar-fill classical" style={{ width: `${classicalPct}%` }} />
          </div>
          <span className="method-meta">
            10,000 GBM simulated paths · discounted to present value
          </span>
        </div>

        {/* Quantum */}
        <div className="method-row">
          <div className="method-header">
            <span className="method-name">Quantum AE</span>
            <span className="method-price quantum">{fmt(safeQuantum)}</span>
          </div>
          <div className="method-bar-track">
            <div className="method-bar-fill quantum" style={{ width: `${quantumPct}%` }} />
          </div>
          <span className="method-meta">
            IQAE · 3 qubits · 8 price bins · O(1/N) convergence
          </span>
        </div>

      </div>

      {/* Bottom note */}
      <p className="explain italic" style={{ marginTop: '1.125rem' }}>
        Difference between methods reflects 3-qubit discretisation (8 price bins).
        More qubits → closer convergence.
      </p>
    </div>
  )
}
