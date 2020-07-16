/*
Copyright (C) 2018-2020 AI Atelier Ltd.

This file is part of Invizi.

Invizi is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at
your option) any later version.

Invizi is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with Invizi.  If not, see <https://www.gnu.org/licenses/>.
*/
import Ticker from '@/components/Ticker'
const axios = require('axios')
const USE_LOCAL_URL = false
const ROOT_URL = USE_LOCAL_URL ? 'http://0.0.0.0:3000' : 'https://api.invizi.co'

function blockchains (address) {
  return {
    'bitcoin': { url: `${ROOT_URL}/blockchain/balance?coin_id=bitcoin&address=${address}` },
    'ethereum': { url: `${ROOT_URL}/blockchain/balance?coin_id=ethereum&address=${address}` }
  }
}

var BlockchainExplorer = {

  defaultBlockchainTypes: ['btc', 'eth'],

  blockchainTypes: ['btc', 'eth'],

  cryptoidBlockchains: [],

  formatters: {
    'bitcoin': (response) => {
      // returns satoshis
      if (response.data.data === 'Invalid Bitcoin Address') {
        return { status: 'error', message: 'Invalid Bitcoin Address' }
      } else {
        return { status: 'success', data: response.data.data / 100000000 }
      }
    },
    'ethereum': (response) => {
      if (!response) {
        return { status: 'error', message: 'error' }
      } else if (response.data && response.data.error) {
        return { status: 'error', message: response.data.error.message }
      } else {
        return { status: 'success', data: response.data }
      }
    }
  },

  getApiUrl (address, type) {
    return `${ROOT_URL}/blockchain/balance?coin_id=${type}&address=${address}`
  },

  getAddressBalance (addressHash, type) {
    let apiUrl = this.getApiUrl(addressHash, type)
    const BLOCKCHAINS = blockchains(addressHash)
    if ((BLOCKCHAINS[type] && BLOCKCHAINS[type].scrap) || this.formatters[type]) {
      return axios.get(apiUrl).then(this.formatters[type])
    } else {
      return axios.get(apiUrl).then((result) => {
        return {status: 'success', data: result.data}
      })
    }
  },

  // Returns the list of coins whose blockchain address we support
  supportedBlockchainCoins () {
    let result = []
    let allBlockchainTypes = this.defaultBlockchainTypes
    for (let symbol of allBlockchainTypes) {
      let coin = Ticker.coin(symbol.toUpperCase())
      if (coin) {
        result.push(coin)
      }
    }
    return result
  }
}

export default BlockchainExplorer
