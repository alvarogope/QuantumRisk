import QuantumVsClassical from './QuantumVsClassical'
import VaRGauge from './VaRGauge'

/* ── Recommendation engine ────────────────────────────────────────────────── */
function buildRecommendations(optionData, varData, strike) {
  const recs           = []
  const ticker         = optionData.ticker
  const volPct         = parseFloat(optionData.volatility_pct)   // e.g. 23.4
  const currentPrice   = optionData.current_price
  const classicalOpt   = optionData.classical?.option_price
  const quantumOpt     = optionData.quantum?.option_price
  const classicalVar   = varData.classical?.var ?? 0
  const varPct         = (classicalVar / 100_000) * 100           // % of $100k portfolio
  const varDisplay     = `$${Math.round(classicalVar).toLocaleString()}`

  /* 1 · Volatility ──────────────────────────────────────────────────────── */
  if (volPct < 15) {
    recs.push({
      tag: 'VOLATILITY', color: 'green',
      text: `Low volatility detected. ${ticker} is historically stable. Option premiums are relatively cheap.`,
    })
  } else if (volPct <= 30) {
    recs.push({
      tag: 'VOLATILITY', color: 'amber',
      text: `Moderate volatility. Option pricing reflects normal market uncertainty for ${ticker}.`,
    })
  } else {
    recs.push({
      tag: 'VOLATILITY', color: 'red',
      text: `High volatility detected (${volPct.toFixed(1)}%). Option premiums are elevated. This asset carries significant price uncertainty.`,
    })
  }

  /* 2 · VaR / daily risk ────────────────────────────────────────────────── */
  if (varPct < 1) {
    recs.push({
      tag: 'DAILY RISK', color: 'green',
      text: `Portfolio risk is low. A $100,000 position in ${ticker} has a 95% chance of losing less than ${varDisplay} in a single trading day.`,
    })
  } else if (varPct <= 2) {
    recs.push({
      tag: 'DAILY RISK', color: 'amber',
      text: `Moderate daily risk. Consider whether this position size aligns with your risk tolerance.`,
    })
  } else {
    recs.push({
      tag: 'DAILY RISK', color: 'red',
      text: `Elevated daily risk. At ${varPct.toFixed(2)}% of portfolio, consider reducing position size or hedging with put options.`,
    })
  }

  /* 3 · Quantum vs classical divergence ─────────────────────────────────── */
  if (classicalOpt != null && quantumOpt != null) {
    if (classicalOpt === 0 && quantumOpt === 0) {
      recs.push({
        tag: 'METHOD AGREEMENT', color: 'green',
        text: 'Both methods predict a near-zero option value, indicating high agreement on this out-of-the-money position.',
      })
    } else if (classicalOpt > 0) {
      const diff = Math.abs(classicalOpt - quantumOpt) / classicalOpt * 100
      if (diff < 10) {
        recs.push({
          tag: 'METHOD AGREEMENT', color: 'green',
          text: 'Quantum and classical methods are in close agreement. Result confidence is high.',
        })
      } else if (diff <= 30) {
        recs.push({
          tag: 'METHOD AGREEMENT', color: 'amber',
          text: `Moderate divergence between methods (${diff.toFixed(1)}%). This is expected with 3-qubit discretisation.`,
        })
      } else {
        recs.push({
          tag: 'METHOD AGREEMENT', color: 'red',
          text: `Significant divergence between methods (${diff.toFixed(1)}%). Quantum estimate is less precise for this asset. Increase qubits for better accuracy.`,
        })
      }
    }
  }

  /* 4 · Deep out of the money ───────────────────────────────────────────── */
  if (strike != null && currentPrice != null && strike > currentPrice * 1.3) {
    recs.push({
      tag: 'OPTION DEPTH', color: 'amber',
      text: 'Strike price is significantly above current price. This is a deep out-of-the-money option, with low probability of profit but limited downside to the premium paid.',
    })
  }

  return recs
}

/* ── Recommendation row ───────────────────────────────────────────────────── */
function RecRow({ tag, color, text }) {
  return (
    <div className="rec-row">
      <span className={`rec-dot rec-dot--${color}`} aria-hidden="true" />
      <div className="rec-body">
        <span className="rec-tag">{tag}</span>
        <span className="rec-text">{text}</span>
      </div>
    </div>
  )
}

/* ── Dashboard ────────────────────────────────────────────────────────────── */
export default function RiskDashboard({ results }) {
  const { optionData, varData, strike } = results

  const recs = buildRecommendations(optionData, varData, strike)

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

      {/* ── Risk Intelligence ──────────────────────────────────────────────── */}
      <div className="glass panel risk-intel-panel">
        <div className="panel-title">
          <span className="panel-title-text">Risk Intelligence</span>
        </div>
        <div className="rec-list">
          {recs.map((r, i) => (
            <RecRow key={i} tag={r.tag} color={r.color} text={r.text} />
          ))}
        </div>
      </div>

    </div>
  )
}
