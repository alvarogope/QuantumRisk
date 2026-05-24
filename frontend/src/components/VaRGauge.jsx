export default function VaRGauge({ classicalVar, quantumVar, portfolioValue }) {
  const safeClassical = classicalVar ?? 0
  const safeQuantum   = quantumVar   ?? 0

  const classicalPct   = ((safeClassical / portfolioValue) * 100).toFixed(2)
  const rawQuantumPct  = (safeQuantum / portfolioValue) * 100
  // Cap displayed pct at 100% — 8-bin IQAE is a coarse approximation
  const quantumPctDisplay = Math.min(rawQuantumPct, 100).toFixed(2)

  // Flag when quantum estimate clearly exceeds portfolio value
  const isQuantumOvershooting = safeQuantum > portfolioValue

  const getRisk = (pct) => {
    const n = parseFloat(pct)
    if (n < 1) return 'low'
    if (n < 2) return 'medium'
    return 'high'
  }

  const getRiskLabel = (pct) => {
    const n = parseFloat(pct)
    if (n < 1) return 'Low Risk'
    if (n < 2) return 'Medium Risk'
    return 'High Risk'
  }

  const fmtDollar = (v) =>
    v != null
      ? `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      : '—'

  return (
    <div className="glass panel">
      <div className="panel-title">
        <span className="panel-title-text">Value at Risk — 1 Day · 95% Confidence</span>
      </div>

      {/* Panel header explanation */}
      <p className="explain italic" style={{ marginTop: 0, marginBottom: '1.125rem' }}>
        Value at Risk: the maximum expected loss over 1 trading day at 95% confidence.
        Only 5% of simulated outcomes exceed this loss.
      </p>

      <div className="var-panel">

        {/* Classical */}
        <div className="var-block">
          <span className="var-method classical">Classical MC</span>
          <span className="var-amount">{fmtDollar(safeClassical)}</span>
          <span className="var-pct">{classicalPct}% of portfolio</span>
          <span className={`risk-badge ${getRisk(classicalPct)}`}>
            {getRiskLabel(classicalPct)}
          </span>
          <span className="var-disclaimer">
            Monte Carlo simulation · 10,000 paths
          </span>
        </div>

        {/* Quantum */}
        <div className="var-block">
          <span className="var-method quantum">Quantum AE</span>
          {isQuantumOvershooting && (
            <span className="var-estimated">~ estimated</span>
          )}
          <span className="var-amount">{fmtDollar(safeQuantum)}</span>
          <span className="var-pct">{quantumPctDisplay}% of portfolio</span>
          <span className={`risk-badge ${getRisk(rawQuantumPct)}`}>
            {getRiskLabel(rawQuantumPct)}
          </span>
          <span className="var-disclaimer">
            quantum estimate — proxy via IQAE option pricing
          </span>
        </div>

      </div>
    </div>
  )
}
