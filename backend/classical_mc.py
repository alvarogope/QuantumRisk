import numpy as np

def simulate_gbm(
    S0: float,
    volatility: float,
    risk_free_rate: float,
    time_horizon: float,
    n_simulations: int,
    n_steps: int
) -> np.ndarray:
    """
    Simulates the future stock price paths using the Geometric Bownian Motion.
    """
    dt = time_horizon / n_steps

    random_shocks = np.random.standard_normal((n_simulations, n_steps))

    drift = (risk_free_rate - 0.5 * volatility ** 2) * dt
    diffusion = volatility * np.sqrt(dt) * random_shocks

    price_paths = S0 * np.cumprod(np.exp(drift + diffusion), axis=1)

    return price_paths

def price_european_call(
    S0: float,
    strike: float,
    volatility: float,
    risk_free_rate: float,
    time_horizon: float,
    n_simulations: int = 10_000
) -> dict:
    """
    Prices a European call option using classical Monte Carlo
    """
    n_steps = int(252 * time_horizon)

    price_paths = simulate_gbm(
        S0, volatility, risk_free_rate, time_horizon, n_simulations, n_steps
    )

    final_prices = price_paths[:, -1]

    payoffs = np.maximum(final_prices - strike, 0)

    discount_factor = np.exp(-risk_free_rate * time_horizon)

    option_price = discount_factor * np.mean(payoffs)

    return {
        "method": "classical_monte_carlo",
        "optioclear_price": round(float(option_price), 4),
        "n_simulations": n_simulations,
        "final_prices_sample": final_prices[:5].tolist()
    }

if __name__ == "__main__":
    result = price_european_call(
        S0=178.0,       
        strike=185.0,   
        volatility=0.25,
        risk_free_rate=0.05,
        time_horizon=0.25  
    )
    print(result)