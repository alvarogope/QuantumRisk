export default function VaRGauge({ classicalVar, quantumVar, portfolioValue }) {
    const classicalPct = ((classicalVar / portfolioValue) * 100).toFixed(2)
    const quantumPct = ((quantumVar / portfolioValue) * 100).toFixed(2)
  
    const getRisk = (pct) => {
      if (pct < 1) return 'low'
      if (pct < 2) return 'medium'
      return 'high'
    }
  
    const getRiskLabel = (pct) => {
      if (pct < 1) return 'LOW RISK'
      if (pct < 2) return 'MEDIUM RISK'
      return 'HIGH RISK'
    }
  
    return (
      <div className="panel">
        <div className="panel-label">Value at Risk — 1 Day · 95% Confidence</div>
        <div className="var-panel">
          <div className="var-block classical">
            <span className="var-method classical">Classical MC</span>
            <span className="var-amount">${classicalVar?.toLocaleString()}</span>
            <span className="var-pct">{classicalPct}% of portfolio</span>
            <span className={`risk-badge ${getRisk(classicalPct)}`}>
              {getRiskLabel(classicalPct)}
            </span>
          </div>
          <div className="var-block quantum">
            <span className="var-method quantum">Quantum AE</span>
            <span className="var-amount">${quantumVar?.toLocaleString()}</span>
            <span className="var-pct">{quantumPct}% of portfolio</span>
            <span className={`risk-badge ${getRisk(quantumPct)}`}>
              {getRiskLabel(quantumPct)}
            </span>
          </div>
        </div>
      </div>
    )
  }