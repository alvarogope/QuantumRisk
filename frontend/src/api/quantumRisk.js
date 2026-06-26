import axios from 'axios'

const BASE_URL = 'https://quantum-risk.vercel.app'

export const fetchMarketData = async (ticker) => {
    const response = await axios.get(`${BASE_URL}/market-data/${ticker}`)
    return response.data
}

export const priceOption = async (params) => {
    const response = await axios.post(`${BASE_URL}/price-option`, params)
    return response.data
}

export const portfolioVar = async (params) => {
    const response = await axios.post(`${BASE_URL}/portfolio-var`, params)
    return response.data
}
