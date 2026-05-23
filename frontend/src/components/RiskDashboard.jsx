import QuantumVsClassical from './QuantumVsClassical'
import VaRGauge from './VaRGauge'

export default function RiskDashboard({ results }) {
  const { optionData, varData } = results

  return (
    <div className="dashboard">

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Ticker</span>
          <span className="stat-value cyan">{optionData.ticker}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Current Price</span>
          <span className="stat-value">${optionData.current_price?.toFixed(2)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Annualised Volatility</span>
          <span className="stat-value indigo">{optionData.volatility_pct}%</span>
          <span className="stat-sub">1Y historical</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Quantum Speedup</span>
          <span className="stat-value cyan">O(1/N)</span>
          <span className="stat-sub">vs classical O(1/√N)</span>
        </div>
      </div>

      {/* Charts row */}
      <div className="charts-row">
        <QuantumVsClassical
          classical={optionData.classical?.option_price}
          quantum={optionData.quantum?.option_price}
        />
        <VaRGauge
          classicalVar={varData.classical?.var}
          quantumVar={varData.quantum?.var}
          portfolioValue={100000}
        />
      </div>

    </div>
  )
}