import axios from 'axios'

// What is axios?

const BASE_URL = 'http://localhost:8000'

// How does js know what is fetchMarketData?

// What is async?

// What is . in js?

export const fetchMarketData = async (ticker) => {
    const response = await axios.get('`${BASE_URL}/market-data/${ticker}`')
    return response.data
}

export const priceOption = async (params) => {
    const response = await axios.post(`${BASE_URL}/price-option`, params)
    return response.data
}

// What is =>?

export const portfolioVar = async (params) => {
    const response = await axios.post(`${BASE_URL}/portfolio-var`, params)
    return response.data
}