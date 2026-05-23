import { useState } from 'react'
import tickerInput from './components/TickerInput'
import RiskDashboard from './components/RiskDashboard'
import './App.css'
import TickerInput from './components/TickerInput'

export default function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>QuantumRisk</h1>
          <p>Quantum Amplitude Estimation vs Classical Monte Carlo</p>
        </div>
        <div className="header-right">
          <div className="status-dot" />
        </div>
      </header>

      <TickerInput
        setResults={setResults}
        setLoading={setLoading}
        setError={setError}
        loading={loading}
      />

      {error && <div className="error-state">{error}</div>}

      {loading && (
        <div>
          <div className="loading-spinner" />
          Running simulations...
        </div>
      )}

      {results && <RiskDashboard results={results}/>}
    </div>
  )
}