import { useState } from 'react'
import { priceOption, portfolioVar } from '../api/quantumRisk'

export default function TickerInput({ setResults, setLoading, setError, loading }) {
  const [ticker, setTicker] = useState('AAPL')
  const [strike, setStrike] = useState(185)
  const [timeHorizon, setTimeHorizon] = useState(0.25)

  const handleRun = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const [optionData, varData] = await Promise.all([
        priceOption({
          ticker,
          strike: parseFloat(strike),
          time_horizon: parseFloat(timeHorizon),
          risk_free_rate: 0.05,
          n_simulations: 10000,
          n_qubits: 3
        }),
        portfolioVar({
          tickers: [ticker],
          weights: [1.0],
          portfolio_value: 100000,
          time_horizon: 1 / 252,
          confidence_level: 0.95,
          n_qubits: 3
        })
      ])

      setResults({ optionData, varData })
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="control-panel">
      <div className="input-group">
        <label>Ticker</label>
        <input
          value={ticker}
          onChange={e => setTicker(e.target.value.toUpperCase())}
          placeholder="AAPL"
        />
      </div>
      <div className="input-group">
        <label>Strike Price ($)</label>
        <input
          type="number"
          value={strike}
          onChange={e => setStrike(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label>Time Horizon (years)</label>
        <input
          type="number"
          step="0.05"
          value={timeHorizon}
          onChange={e => setTimeHorizon(e.target.value)}
        />
      </div>
      <button className="run-button" onClick={handleRun} disabled={loading}>
        {loading ? 'Running...' : 'Run Analysis →'}
      </button>
    </div>
  )
}

// what is the ticker setTicker? but with every component of the code like loading or strike?

// what is parseFloat?

// How did the pages change and how in the code?