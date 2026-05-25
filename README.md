# QuantumRisk

![Qiskit](https://img.shields.io/badge/Qiskit-6929C4?style=flat&logo=qiskit&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=flat&logo=numpy&logoColor=white)

A full-stack quantum finance application that prices European call options and calculates Value at Risk (VaR) using two methods side by side — **Iterative Quantum Amplitude Estimation (IQAE)** and classical **Monte Carlo simulation**. Real market data is fetched live via the yfinance API. The quantum method achieves a theoretical **quadratic speedup** over classical Monte Carlo: O(1/N) convergence vs O(1/√N).

---

## Why Quantum?

Classical Monte Carlo prices options by simulating thousands of random future price paths. To double the accuracy you need to quadruple the number of simulations — O(1/√N) convergence.

Quantum Amplitude Estimation encodes the entire probability distribution into a quantum circuit and extracts the expected payoff directly. The convergence rate is O(1/N) — a **quadratic speedup** that becomes significant at scale.

This project implements IQAE (Iterative Quantum Amplitude Estimation) which achieves the same speedup without requiring a quantum Fourier transform, making it viable on near-term hardware with fewer qubits.

---

## ✨ Features

- ⚛️ **Quantum Option Pricing** IQAE circuit encodes log-normal stock price distribution into quantum amplitudes and extracts expected option payoff with O(1/N) convergence
- 📊 **Classical Baseline** Geometric Brownian Motion Monte Carlo with 10,000 simulated price paths for direct comparison
- 📉 **Value at Risk** Portfolio VaR calculated at 95% confidence using both methods — maximum expected 1-day loss
- 📡 **Live Market Data** Real stock prices and annualised volatility fetched from Yahoo Finance via yfinance
- 🧠 **Risk Intelligence** Rule-based recommendations interpret results — volatility warnings, daily risk alerts, method agreement analysis
- 🖥️ **Full-Stack Dashboard** FastAPI backend with React frontend — interactive risk dashboard with real-time analysis
- 🔬 **Hardware-Honest** 3-qubit simulation (8 price bins) with documented constraints — quantum advantage is theoretical, ready for real hardware

---

## ⚛️ How IQAE Works

```
Stock Price Distribution → Log-Normal Bins → Quantum Amplitude Encoding
                                                        ↓
                                          QuantumCircuit(n_qubits + 1)
                                          StatePreparation(amplitudes)
                                          mcry(payoff_angle, controls, ancilla)
                                                        ↓
                                    IterativeAmplitudeEstimation(ε=0.01)
                                                        ↓
                                    result.estimation × max_payoff × discount_factor
                                                        ↓
                                              Option Price ($)
```

| Step | Operation | Description |
|---|---|---|
| 1 | **Discretise** | Price range divided into 2^n bins (3 qubits = 8 bins) |
| 2 | **Encode Distribution** | Log-normal probabilities loaded as quantum amplitudes via StatePreparation |
| 3 | **Encode Payoff** | max(S-K, 0) payoff for each bin encoded as ancilla qubit rotation via mcry |
| 4 | **IQAE** | Iterative Quantum Amplitude Estimation extracts expected payoff amplitude |
| 5 | **Rescale** | Amplitude × max_payoff × discount factor = option price |

---

## 🏗️ Architecture

| Component | Role | Output |
|---|---|---|
| 🌐 **market_data.py** | Fetches live price and volatility from Yahoo Finance | S0, σ |
| 📈 **classical_mc.py** | GBM Monte Carlo simulation, 10,000 paths | Option price |
| ⚛️ **quantum_mc.py** | IQAE circuit with log-normal encoding and payoff oracle | Option price |
| 📉 **risk_engine.py** | Portfolio VaR using both methods | VaR ($) |
| 🔌 **main.py** | FastAPI app exposing /market-data, /price-option, /portfolio-var | JSON API |
| 🖥️ **React Frontend** | Interactive dashboard consuming FastAPI endpoints | Live UI |

---

## 🗂️ Project Structure

```
QuantumRisk/
├── backend/
│   ├── main.py              # FastAPI app, CORS, Pydantic request models
│   ├── market_data.py       # yfinance integration, volatility calculation
│   ├── classical_mc.py      # GBM simulation, European call pricing
│   ├── quantum_mc.py        # IQAE circuit, StatePreparation, payoff oracle
│   └── risk_engine.py       # Portfolio VaR, classical and quantum methods
└── frontend/
    └── src/
        ├── App.jsx
        ├── api/
        │   └── quantumRisk.js       # axios calls to FastAPI
        └── components/
            ├── TickerInput.jsx      # Ticker, strike, time horizon inputs
            ├── RiskDashboard.jsx    # Results orchestration + Risk Intelligence
            ├── QuantumVsClassical.jsx # Option pricing comparison panel
            └── VaRGauge.jsx         # Value at Risk display
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- uv (Python package manager)

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/alvarogope/QuantumRisk.git
cd QuantumRisk

# Create virtual environment and install dependencies
uv venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux

uv add fastapi uvicorn qiskit qiskit-algorithms qiskit-aer yfinance numpy scipy pydantic

# Start the backend
cd backend
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** — enter any Yahoo Finance ticker (AAPL, MSFT, TSLA, SHEL.L) and click Run Analysis.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Quantum Computing | Qiskit, qiskit-algorithms, StatevectorSampler |
| Quantum Algorithm | Iterative Quantum Amplitude Estimation (IQAE) |
| Classical Simulation | NumPy, SciPy, Geometric Brownian Motion |
| Market Data | yfinance (Yahoo Finance) |
| Backend | FastAPI, uvicorn, Pydantic |
| Frontend | React 18, Vite, axios |
| Package Management | uv (backend), npm (frontend) |
| Language | Python 3.12+, JavaScript (ES2022) |

---

## ⚠️ Hardware Constraints

This project runs on a **classical statevector simulator**, not real quantum hardware. Key limitations:

| Constraint | Value | Reason |
|---|---|---|
| Qubits | 3 | Simulator RAM grows as 2^n — 3 qubits = 8 price bins |
| Price bins | 8 | Coarse discretisation — more qubits → more accurate |
| Quantum advantage | Theoretical | Simulator has no speed advantage over classical |
| Real hardware | Not connected | IBM Quantum integration is a planned extension |

Documenting hardware constraints honestly is itself good quantum engineering practice. The algorithm is correct — the limitation is the execution environment.

---

## 🎓 Research Context

This project implements quantum finance techniques from academic literature, specifically quantum amplitude estimation applied to Monte Carlo methods in derivatives pricing. The theoretical quadratic speedup of QAE over classical MC is one of the most researched near-term quantum advantage candidates in computational finance.

Related work: Stamatopoulos et al. (2020) *Option Pricing using Quantum Computers*, Woerner & Egger (2019) *Quantum Risk Analysis*.
