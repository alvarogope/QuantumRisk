# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuantumRisk is a financial risk analysis tool that compares **quantum Monte Carlo** vs **classical Monte Carlo** simulations for computing Value at Risk (VaR) and related metrics. It fetches live market data via `yfinance`, runs both simulation approaches, and displays results in a React dashboard.

## Environment & Package Manager

This project uses **`uv`** (not pip) for Python dependency management, with Python 3.14.

```bash
uv sync                    # install dependencies
uv run main.py             # run the project entry point
uv add <package>           # add a new dependency
uv run python backend/market_data.py  # run a specific module
```

Dependencies are declared in [pyproject.toml](pyproject.toml). The lockfile is `uv.lock`.

## Architecture

### Backend (`backend/`)

The backend is pure Python with no web framework yet — these modules are intended to be called programmatically or exposed via an API later:

- [market_data.py](backend/market_data.py) — **only fully implemented file**. Fetches historical price data from Yahoo Finance via `yfinance`, computes annualised volatility from daily log returns (252 trading days), and returns a `dict` with `ticker`, `current_price`, `volatility`, `volatility_pct`.
- [classical_mc.py](backend/classical_mc.py) — classical Monte Carlo simulation stub. Will take S₀, σ, and simulate GBM price paths to estimate VaR.
- [quantum_mc.py](backend/quantum_mc.py) — quantum Monte Carlo simulation stub. Quantum amplitude estimation approach for the same VaR calculation.
- [risk_engine.py](backend/risk_engine.py) — orchestration stub. Intended to call both MC engines with inputs from `market_data` and return unified results.
- [visualizer.py](backend/visualizer.py) — output/plotting stub.

### Frontend (`frontend/`)

React app (no `package.json` yet — not scaffolded). Planned component structure:

- [App.jsx](frontend/src/App.jsx) — root component
- [TicketInput.jsx](frontend/src/components/TicketInput.jsx) — stock ticker entry form
- [RiskDashboard.jsx](frontend/src/components/RiskDashboard.jsx) — main results view
- [QuantumVsClassical.jsx](frontend/src/components/QuantumVsClassical.jsx) — side-by-side comparison of both simulation methods
- [VaRGauge.jsx](frontend/src/components/VaRGauge.jsx) — visual VaR indicator
- [api/quantumRisk.js](frontend/api/quantumRisk.js) — API client for backend calls

## Key Domain Concepts

- **VaR (Value at Risk)**: the maximum expected loss at a given confidence level (e.g. 95%) over a time horizon.
- **GBM (Geometric Brownian Motion)**: the stochastic model used in classical MC for price path simulation.
- **Annualised volatility**: computed as `daily_std * sqrt(252)` from log returns.
- **Quantum advantage**: quantum amplitude estimation can achieve quadratic speedup over classical MC for VaR — this is the core research motivation.
