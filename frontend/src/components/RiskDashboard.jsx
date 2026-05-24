import QuantumVsClassical from './QuantumVsClassical'
import VaRGauge from './VaRGauge'

export default function RiskDashboard({ results }) {
  const { optionData, varData } = results

  return (
    <div className="dashboard">

      {/* ── 4 key metrics ─────────────────────────────────────────────────── */}
      <div className="stats-row">

        <div className="glass stat-card accent-blue">
          <span className="stat-label">Ticker</span>
          <span className="stat-value blue">{optionData.ticker}</span>
          <span className="explain italic">Stock symbol fetched from Yahoo Finance</span>
        </div>

        <div className="glass stat-card accent-white">
          <span className="stat-label">Current Price</span>
          <span className="stat-value">${optionData.current_price?.toFixed(2)}</span>
          <span className="explain italic">Latest closing price used as S₀ in simulation</span>
        </div>

        <div className="glass stat-card accent-indigo">
          <span className="stat-label">Annualised Volatility</span>
          <span className="stat-value indigo">{optionData.volatility_pct}%</span>
          <span className="stat-sub">1Y historical</span>
          <span className="explain">std(log returns) × √252 trading days</span>
        </div>

        <div className="glass stat-card accent-blue">
          <span className="stat-label">Quantum Speedup</span>
          <span className="stat-value blue">O(1/N)</span>
          <span className="stat-sub">vs classical O(1/√N)</span>
          <span className="explain italic">Theoretical convergence rate vs classical O(1/√N)</span>
        </div>

      </div>

      {/* ── Option pricing + VaR side by side ─────────────────────────────── */}
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
