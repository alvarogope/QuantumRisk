import numpy as np
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler
from qiskit_algorithms import IterativeAmplitudeEstimation, EstimationProblem
from qiskit.circuit.library import StatePreparation
from scipy.stats import norm

def build_state_preparation(
    S0: float,
    strike: float,
    volatility: float,
    risk_free_rate: float,
    time_horizon: float,
    n_qubits: int = 3
) -> tuple:

    n_bins = 2 ** n_qubits

    mu= np.log(S0) + (risk_free_rate - 0.5 * volatility ** 2) * time_horizon
    sigma = volatility * np.sqrt(time_horizon)
    price_low = np.exp(mu - 3 * sigma)
    price_high = np.exp(mu + 3 * sigma)
    prices = np.linspace(price_low, price_high, n_bins)

    log_prices     = np.log(prices)
    probabilities  = norm.pdf(log_prices, mu, sigma)
    probabilities /= probabilities.sum()
    amplitudes     = np.sqrt(probabilities)

    payoffs            = np.maximum(prices - strike, 0)
    max_payoff         = max(payoffs.max(), 1e-10)
    normalised_payoffs = payoffs / max_payoff

    qc = QuantumCircuit(n_qubits + 1)

    qc.append(StatePreparation(amplitudes), range(n_qubits))

    for i, payoff in enumerate(normalised_payoffs):
        if payoff > 0:
            angle = 2 * np.arcsin(np.sqrt(min(payoff, 1.0)))
            binary = format(i, f'0{n_qubits}b')
            controls = [j for j in range(n_qubits) if binary[n_qubits - 1 - j] == '1']
            if controls:
                qc.mcry(angle, controls, n_qubits)

    return qc, prices, max_payoff

def price_european_call_quantum(
    S0: float,
    strike: float,
    volatility: float,
    risk_free_rate: float,
    time_horizon: float,
    n_qubits: int = 3,
    epsilon: float = 0.01,
    alpha: float = 0.05
) -> dict:

    qc, prices, max_payoff = build_state_preparation(
        S0, strike, volatility, risk_free_rate, time_horizon, n_qubits
    )

    problem = EstimationProblem(
        state_preparation=qc,
        objective_qubits=[n_qubits]
    )

    iqae = IterativeAmplitudeEstimation(
        epsilon_target=epsilon,
        alpha=alpha,
        sampler=StatevectorSampler()
    )
    result = iqae.estimate(problem)

    estimated_payoff = result.estimation * max_payoff
    discount_factor = np.exp(-risk_free_rate * time_horizon)
    option_price = discount_factor * estimated_payoff

    return {
        "method": "iterative_quantum_amplitude_estimation",
        "option_price": round(float(option_price), 4),
        "n_qubits": n_qubits,
        "epsilon": epsilon,
        "raw_amplitude": round(float(result.estimation), 6)
    }


if __name__ == "__main__":
    result = price_european_call_quantum(
        S0=178.0,
        strike=185.0,
        volatility=0.25,
        risk_free_rate=0.05,
        time_horizon=0.25
    )
    print(result)
