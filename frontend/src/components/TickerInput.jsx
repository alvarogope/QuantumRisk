import { useState } from 'react'
import { priceOption, portfolioVar, fetchMarketData } from '../api/quantumRisk'

/* ── Famous tickers by sector ─────────────────────────────────────────────── */
const QUICK_PICKS = [
  { group: 'Tech',       tickers: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META', 'AMZN', 'TSLA'] },
  { group: 'Finance',    tickers: ['JPM', 'GS', 'V', 'MA', 'BRK-B'] },
  { group: 'Energy',     tickers: ['XOM', 'CVX', 'SHEL'] },
  { group: 'Healthcare', tickers: ['JNJ', 'UNH', 'PFE'] },
  { group: 'ETFs',       tickers: ['SPY', 'QQQ', 'IWM'] },
]

const STRIKE_MIN = 1
const STRIKE_MAX = 10000
const MONTHS_MIN = 1
const MONTHS_MAX = 60

// Parse a raw string to a clamped integer, falling back to `fallback` if empty/NaN
const parseClamp = (s, min, max, fallback) => {
  const n = parseInt(s, 10)
  if (isNaN(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

export default function TickerInput({ setResults, setLoading, setError, loading }) {
  const [ticker,         setTicker]         = useState('AAPL')

  // String state avoids the "0 remains" bug — the field stays empty while typing
  const [strikeStr,      setStrikeStr]      = useState('185')
  const [monthsStr,      setMonthsStr]      = useState('3')

  // Tracks the last fetched price so we can show the strike warning
  const [currentPrice,   setCurrentPrice]   = useState(null)
  const [strikeFetching, setStrikeFetching] = useState(false)

  /* ── Shared fetch — called both on blur and on quick-pick selection ─────── */
  const fetchAndSetStrike = async (rawTicker) => {
    const t = rawTicker.trim().toUpperCase()
    if (!t) return
    try {
      setStrikeFetching(true)
      const data  = await fetchMarketData(t)
      const price = data.current_price
      if (price && price > 0) {
        setCurrentPrice(price)
        setStrikeStr(String(Math.round(price * 1.05)))
      }
    } catch {
      // Silently ignore invalid tickers — leave strike as-is
    } finally {
      setStrikeFetching(false)
    }
  }

  /* Blur handler reads from current ticker state */
  const handleTickerBlur = () => fetchAndSetStrike(ticker)

  /* ── Blur: snap to valid range ─────────────────────────────────────────── */
  const handleStrikeBlur = () =>
    setStrikeStr(String(parseClamp(strikeStr, STRIKE_MIN, STRIKE_MAX, 185)))

  const handleMonthsBlur = () =>
    setMonthsStr(String(parseClamp(monthsStr, MONTHS_MIN, MONTHS_MAX, 3)))

  /* ── Stepper buttons ───────────────────────────────────────────────────── */
  const stepStrike = (delta) =>
    setStrikeStr(prev =>
      String(parseClamp(parseClamp(prev, STRIKE_MIN, STRIKE_MAX, 185) + delta, STRIKE_MIN, STRIKE_MAX, 185))
    )

  const stepMonths = (delta) =>
    setMonthsStr(prev =>
      String(parseClamp(parseClamp(prev, MONTHS_MIN, MONTHS_MAX, 3) + delta, MONTHS_MIN, MONTHS_MAX, 3))
    )

  /* ── Strike warning ────────────────────────────────────────────────────── */
  const strikeNum         = parseClamp(strikeStr, STRIKE_MIN, STRIKE_MAX, 185)
  const showStrikeWarning = currentPrice != null && strikeNum > currentPrice * 3

  /* ── Submit ────────────────────────────────────────────────────────────── */
  const handleRun = async () => {
    const strike           = parseClamp(strikeStr, STRIKE_MIN, STRIKE_MAX, 185)
    const timeMonths       = parseClamp(monthsStr, MONTHS_MIN, MONTHS_MAX, 3)
    const timeHorizonYears = timeMonths / 12

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const [optionData, varData] = await Promise.all([
        priceOption({
          ticker:           ticker.trim().toUpperCase(),
          strike,
          time_horizon:     timeHorizonYears,
          risk_free_rate:   0.05,
          n_simulations:    10000,
          n_qubits:         3,
        }),
        portfolioVar({
          tickers:          [ticker.trim().toUpperCase()],
          weights:          [1.0],
          portfolio_value:  100000,
          time_horizon:     1 / 252,
          confidence_level: 0.95,
          n_qubits:         3,
        }),
      ])

      setResults({ optionData, varData, strike })
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass control-panel">

      {/* Ticker — text input + quick-pick dropdown side by side */}
      <div className="input-group">
        <label className="field-label">Ticker</label>
        <div className="ticker-row">
          <input
            className="plain-input ticker-input"
            type="text"
            value={ticker}
            onChange={e => setTicker(e.target.value.toUpperCase())}
            onBlur={handleTickerBlur}
            placeholder="AAPL"
            maxLength={10}
            spellCheck={false}
            autoCapitalize="characters"
          />
          {/* Quick-pick: selecting fills the text input and auto-fetches price */}
          <select
            className="ticker-quick-pick"
            value=""
            onChange={e => {
              if (e.target.value) {
                setTicker(e.target.value)
                fetchAndSetStrike(e.target.value)
              }
            }}
            title="Quick-pick a well-known ticker"
          >
            <option value="" disabled>Quick pick…</option>
            {QUICK_PICKS.map(({ group, tickers }) => (
              <optgroup key={group} label={group}>
                {tickers.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <span className="input-hint">
          Type any Yahoo Finance ticker, or quick-pick a famous one
        </span>
      </div>

      {/* Strike Price — stepper with auto-populate on ticker blur */}
      <div className="input-group">
        <label className="field-label">Strike Price ($)</label>
        <div className="stepper">
          <button
            className="stepper-btn"
            onClick={() => stepStrike(-1)}
            disabled={loading || strikeFetching}
            tabIndex={-1}
            aria-label="Decrease strike price"
          >−</button>
          <input
            className="stepper-input"
            type="number"
            value={strikeFetching ? '' : strikeStr}
            onChange={e => setStrikeStr(e.target.value)}
            onBlur={handleStrikeBlur}
            placeholder={strikeFetching ? 'Loading…' : ''}
            min={STRIKE_MIN}
            max={STRIKE_MAX}
            step={1}
            readOnly={strikeFetching}
          />
          <button
            className="stepper-btn"
            onClick={() => stepStrike(+1)}
            disabled={loading || strikeFetching}
            tabIndex={-1}
            aria-label="Increase strike price"
          >+</button>
        </div>
        <span className="input-hint">$1 – $10,000</span>
        {showStrikeWarning && (
          <span className="strike-warning">
            Strike is far above current price. The option may be worthless.
          </span>
        )}
      </div>

      {/* Time Horizon — stepper, whole months */}
      <div className="input-group">
        <label className="field-label">Time Horizon (months)</label>
        <div className="stepper">
          <button
            className="stepper-btn"
            onClick={() => stepMonths(-1)}
            disabled={loading}
            tabIndex={-1}
            aria-label="Decrease months"
          >−</button>
          <input
            className="stepper-input"
            type="number"
            value={monthsStr}
            onChange={e => setMonthsStr(e.target.value)}
            onBlur={handleMonthsBlur}
            min={MONTHS_MIN}
            max={MONTHS_MAX}
            step={1}
          />
          <button
            className="stepper-btn"
            onClick={() => stepMonths(+1)}
            disabled={loading}
            tabIndex={-1}
            aria-label="Increase months"
          >+</button>
        </div>
        <span className="input-hint">1 – 60 months (up to 5 years)</span>
      </div>

      <button
        className="run-button"
        onClick={handleRun}
        disabled={loading}
      >
        {loading ? 'Running…' : 'Run Analysis →'}
      </button>

      {/* Panel-wide explanation — spans the full flex row */}
      <span className="explain italic" style={{ flexBasis: '100%', marginTop: 0 }}>
        Strike price is the fixed price at which the option allows you to buy the stock.
        Time horizon is how far into the future we simulate.
      </span>

    </div>
  )
}
