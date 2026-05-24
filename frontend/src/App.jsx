import { useState } from 'react'
import TickerInput from './components/TickerInput'
import RiskDashboard from './components/RiskDashboard'
import './App.css'

export default function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">QuantumRisk</h1>
        <p className="app-subtitle">
          Quantum Amplitude Estimation · Classical Monte Carlo · Options &amp; VaR
        </p>
      </header>

      <TickerInput
        setResults={setResults}
        setLoading={setLoading}
        setError={setError}
        loading={loading}
      />

      {error && <div className="error-state">{error}</div>}

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          Running simulations…
        </div>
      )}

      {results && <RiskDashboard results={results} />}
    </div>
  )
}
