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
import BitfinexExchangeClient from '@/components/BitfinexExchangeClient' // eslint-disable-line no-unused-vars
import BinanceExchangeClient from '@/components/BinanceExchangeClient' // eslint-disable-line no-unused-vars
import KrakenExchangeClient from '@/components/KrakenExchangeClient' // eslint-disable-line no-unused-vars
import OnlineAccountClient from '@/models/OnlineAccountClient'

const EXCHANGE_MAPPING = {
  bitfinex: BitfinexExchangeClient,
  binance: BinanceExchangeClient,
  kraken: KrakenExchangeClient
}

var ExchangeClientFactory = {
  create (exchangeId, options = {}) {
    return EXCHANGE_MAPPING[exchangeId]
  },

  async createWithApi (exchangeId) {
    let onlineAccount = await OnlineAccountClient.load(exchangeId)
    if (!onlineAccount || !onlineAccount.API_KEY || !onlineAccount.API_SECRET) {
      throw new Error('Missing account api keys')
    }
    let apiKey = {API_KEY: onlineAccount.API_KEY, API_SECRET: onlineAccount.API_SECRET}
    let exchange = EXCHANGE_MAPPING[exchangeId]
    exchange.initializeApiKey(apiKey)
    return exchange
  }
}

export default ExchangeClientFactory
