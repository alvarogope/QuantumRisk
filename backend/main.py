# What are API endpoints?

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from market_data import get_market_inputs
from classical_mc import price_european_call
from quantum_mc import price_european_call_quantum
from risk_engine import calculate_portfolio_var, calculate_var_quantum

#Whta is this doing?
app = FastAPI (
    title="QuantumRisk API",
    description="Quantum vs Classical Monte Carlo for options pricing and VaR",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default React port
    allow_methods=["*"],
    allow_headers=["*"]
)

class OptionRequest(BaseModel):
    ticker: str
    strike: float
    time_horizon: float = 0.25
    risk_free_rate: float = 0.05
    n_simulations: int = 10_000
    n_qubits: int = 3

class PortfolioRequest(BaseModel):
    tickers: list[str]
    weights: list[float]
    portfolio_value: float = 100_000
    time_horizon: float = 1/252
    confidence_level: float = 0.95
    n_simulations: int = 10_000
    n_qubits: int = 3

@app.get("/")
def root():
    return {"message": "QuantumRisk API is running"}


@app.get("/market-data/{ticker}")
def market_data(ticker:str):
    """
    Returns current price and volatility for a given ticker.
    The {ticker} in the URL is a path parameter — the frontend
    calls /market-data/AAPL and ticker becomes "AAPL" automatically.
    """
    try:
        return get_market_inputs(ticker.upper())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/price-option")
def price_option(request: OptionRequest):
    """
    Prices a European call option using both classical and quantum MC.
    Returns both results so the frontend can compare them side by side.

    Why POST instead of GET?
    GET requests pass data in the URL — fine for simple lookups like
    a ticker symbol. POST sends data in the request body — better for
    structured data with multiple fields like our option parameters.
    """
    try:
        market = get_market_inputs(request.ticker.upper())

        classical_result = price_european_call(
            S0=market["current_price"],
            strike=request.strike,
            volatility=market["volatility"],
            risk_free_rate=request.risk_free_rate,
            time_horizon=request.time_horizon,
            n_simulations=request.n_simulations
        )

        quantum_result = price_european_call_quantum(
            S0=market["current_price"],
            strike=request.strike,
            volatility=market["volatility"],
            risk_free_rate=request.risk_free_rate,
            time_horizon=request.time_horizon,
            n_qubits=request.n_qubits
        )

        return {
            "ticker": request.ticker.upper(),
            "current_price": market["current_price"],
            "volatility_pct": market["volatility_pct"],
            "classical": classical_result,
            "quantum": quantum_result
        }

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/portfolio-var")
def portfolio_var(request: PortfolioRequest):
    """
    Calculates Value at Risk for a portfolio using both methods.
    """
    try:
        if len(request.tickers) != len(request.weights):
            raise HTTPException(
                status_code=400,
                detail=f"Got {len(request.tickers)} tickers but {len(request.weights)} weights — they must match."
            )

        if abs(sum(request.weights) - 1.0) > 1e-6:
            raise HTTPException(
                status_code=400,
                detail="Weights must sum to 1.0"
            )

        classical_result = calculate_portfolio_var(
            tickers=request.tickers,
            weights=request.weights,
            portfolio_value=request.portfolio_value,
            time_horizon=request.time_horizon,
            confidence_level=request.confidence_level,
            n_simulations=request.n_simulations
        )

        quantum_result = calculate_var_quantum(
            tickers=request.tickers,
            weights=request.weights,
            portfolio_value=request.portfolio_value,
            time_horizon=request.time_horizon,
            confidence_level=request.confidence_level,
            n_qubits=request.n_qubits
        )

        return {
            "classical": classical_result,
            "quantum": quantum_result
        }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)