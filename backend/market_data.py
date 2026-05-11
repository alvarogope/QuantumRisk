import yfinance as yf
import numpy as np

def fetch_stock_data(ticker: str, period: str = "1y"):
    """
    Fetch historical price data for a given ticker.
    Period options: 1mo, 3mo, 6mo, 1y, 2y, 5y.
    """
    stock = yf.Ticker(ticker)
    hist = stock.history(period=period)

    if hist.empty:
        raise ValueError(f"No data found for ticker '{ticker}'. Check the symbol is valid.")

    closing_prices = hist["Close"]
    return closing_prices

def get_current_price(ticker: str) -> float:
    """
    Returns the most recent closing price.
    This becomes the starting point (SO) in our Monte Carlo simulation.
    """
    prices = fetch_stock_data(ticker)
    return float(prices.iloc[-1])

def get_volatility(ticker: str, period: str = "1y") -> float:
    """
    Calculates annualised volatility from daily log returns.
    """
    prices = fetch_stock_data(ticker, period)
    log_returns = np.log(prices / prices.shift(1)).dropna()
    daily_vol = log_returns.std()
    annualised_vol = daily_vol * np.sqrt(252)
    return float(annualised_vol)

def get_market_inputs(ticker: str) -> dict:
    """
    Single function that returns what the engine needs.
    """
    return {
        "ticker": ticker,
        "current_price": get_current_price(ticker),
        "volatility": annualised_vol := get_volatility(ticker),
        "volatility_pct": round(annualised_vol * 100, 2)
    }