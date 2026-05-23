export default function QuantumVsClassical({ classical, quantum }) {
  const max = Math.max(classical, quantum) * 1.2

  const classicalPct = (classical / max) * 100
  const quantumPct = (quantum / max) * 100

  return (
    <div className="panel">
      <div className="panel-label">Option Pricing Comparison</div>
      <div className="method-comparison">
        <div className="method-row">
          <div className="method-header">
            <span className="method-name">CLASSICAL MONTE CARLO</span>
            <span className="method-price classical">${classical}</span>
          </div>
          <div className="method-bar-track">
            <div
              className="method-bar-fill classical"
              style={{ width: `${classicalPct}%` }}
            />
          </div>
          <span className="method-meta">10,000 simulated paths · GBM</span>
        </div>

        <div className="method-row">
          <div className="method-header">
            <span className="method-name">QUANTUM AE</span>
            <span className="method-price quantum">${quantum}</span>
          </div>
          <div className="method-bar-track">
            <div
              className="method-bar-fill quantum"
              style={{ width: `${quantumPct}%` }}
            />
          </div>
          <span className="method-meta">IQAE · 3 qubits · 8 price bins</span>
        </div>
      </div>
    </div>
  )
}