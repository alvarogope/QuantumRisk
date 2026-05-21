import numpy as np
from market_data import get_market_inputs
from classical_mc import simulate_gbm
from quantum_mc import price_european_call_quantum

def calculate_portfolio_var(
    tickers: list,
    weights: list,
    portfolio_value: float,
    time_horizon: float = 1/252,
    confidence_level: float = 0.95,
    n_simulations: int = 10_000
) -> dict:
    """
    Calculates Value at Risk for a portfolio of stocks.

    tickers: list of stock symbols e.g. ["AAPL", "MSFT", "GOOGL"]
    weights: how much of the portfolio each stock represents e.g. [0.4, 0.3, 0.3]
             must sum to 1.0
    portfolio_value: total portfolio value in dollars
    time_horizon: how far ahead we're measuring risk (default 1 trading day)
    confidence_level: 0.95 means 95% confidence — we're looking at the
                      worst 5% of outcomes
    n_simulations: number of Monte Carlo paths per stock

    Why simulate each stock separately then combine?
    Each stock has its own volatility and starting price. We simulate
    them independently then combine using weights — this is a simplified
    model that ignores correlation between stocks. Good enough for a
    portfolio demo; a production system would use a covariance matrix.
    """
    if abs(sum(weights) - 1.0 > 1e-6):
        raise ValueError('Weights must sum to 1.0')

    if len(tickers) != len(weights):
        raise ValueError('Number of tickers must match number of weights.')

    portfolio_returns = np.zeros(n_simulations)

    for ticker, weight in zip(tickers, weights):
        # This fetches real market data for each stock.
        market_data = get_market_inputs(ticker)
        S0 = market_data["current_price"]
        volatility = market_data["volatility"]

        #Simulates price paths for the stock
        price_paths = simulate_gbm(
            S0=S0,
            volatility=volatility,
            risk_free_rate=0.05,
            time_horizon=time_horizon,
            n_simulations=n_simulations,
            n_steps=max(int(252 * time_horizon), 1)
        )

        #Calculates return for each simulated path
        final_prices = price_paths[:, -1]
        stock_returns = (final_prices - S0) / S0
        
        # Weights each stock's contribution to portfolio return
        portfolio_returns += weight * stock_returns
    
    # Convert returns to dollar P&L
    portfolio_pnl = portfolio_returns * portfolio_value

    var_percentile = (1 - confidence_level) * 100
    var_classical = -np.percentile(portfolio_pnl, var_percentile)

    return {
        "method": "classical_monte_carlo",
        "portfolio_value": portfolio_value,
        "tickers": tickers,
        "weights": weights,
        "confidence_level": confidence_level,
        "time_horizon_days": round(time_horizon * 252),
        "var": round(float(var_classical), 2),
        "var_pct": round(float(var_classical / portfolio_value * 100), 4),
        "n_simulations": n_simulations
    }

def calculate_var_quantum(
    tickers: list,
    weights: list,
    portfolio_value: float,
    time_horizon: float = 1/252,
    confidence_level: float = 0.95,
    n_qubits: int = 3
) -> dict:
    """
    Quantum VaR estimation using the quantum MC results per stock.

    Why is this simpler than the classical version?
    We use the quantum pricer to estimate the expected move per stock,
    then combine them. This is a proof-of-concept quantum VaR. In a
    real system you'd encode the full portfolio distribution into one
    circuit, but that would require many more qubits than a local
    simulator can handle.
    """
    weighted_quantum_var = 0.0

    # what is zip()?

    for ticker, weight in zip(tickers, weights):
        market_data = get_market_inputs(ticker)
        S0 = market_data["current_price"]
        volatility = market_data["volatility"]

    # This gives the quantum estimate of price movement
    result = price_european_call_quantum(
        S0=S0,
        strike=S0,
        volatility=volatility,
        risk_free_rate=0.05,
        time_horizon=time_horizon,
        n_qubits=n_qubits
    ) 

    quantum_var_estimate = result["option_price"] * portfolio_value * weight
    weighted_quantum_var += quantum_var_estimate

    return {
        "method": "quantum_amplitude_estimation",
        "portfolio_value": portfolio_value,
        "tickers": tickers,
        "weights": weights,
        "confidence_level": confidence_level,
        "time_horizon_days": round(time_horizon * 252),
        "var": round(float(weighted_quantum_var), 2),
        "var_pct": round(float(weighted_quantum_var / portfolio_value * 100), 4),
        "n_qubits": n_qubits
    }


if __name__ == "__main__":
    result = calculate_portfolio_var(
        tickers=["AAPL", "MSFT"],
        weights=[0.6, 0.4],
        portfolio_value=100_000
    )
    print(result)