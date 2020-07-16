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
import BinanceExchangeClient from '@/components/BinanceExchangeClient'
import KrakenExchangeClient from '@/components/KrakenExchangeClient'
import BitfinexExchangeClient from '@/components/BitfinexExchangeClient'
import InviziModel from '@/models/InviziModel.js'
import Ticker from '@/components/Ticker'
import TradeClient from '@/components/TradeClient'
import BalanceHelper from '@/components/BalanceHelper'
import { concat, from, timer } from 'rxjs'
import { filter, map, tap } from 'rxjs/operators'
const _ = require('lodash')

const EXCHANGE_MAPPING = {
  binance: BinanceExchangeClient,
  kraken: KrakenExchangeClient,
  bitfinex: BitfinexExchangeClient
}

function ensureSupportedExchange (accountName) {
  if (!EXCHANGE_MAPPING[accountName]) {
    throw new Error('Invalid accountName' + accountName)
  }
  return true
}

class OnlineAccountClient extends InviziModel {
  constructor () {
    super()
    this.tableName = 'onlineAccounts'
  }

  supportedExchanges () {
    return Object.keys(EXCHANGE_MAPPING)
  }

  async allAvailable () {
    let allAccounts = await this.limit()
    return allAccounts
  }

  async allWithApiKeys () {
    let allAccounts = await this.limit()
    return allAccounts.filter(acc => this.hasApiKeys(acc))
  }

  hasApiKeys (account) {
    return account && account.API_KEY && account.API_SECRET
  }

  async load (accountName) {
    let allAccounts = await this.all()
    return _.find(allAccounts, {name: accountName})
  }

  async allExchangeNames () {
    let allAccounts = await this.all()
    let result = _.filter(allAccounts, account => !!Ticker.SUPPORTED_EXCHANGES[account.name] === true)
    return result
  }

  async lastSyncAt (accountName) {
    let account = await this.load(accountName)
    return account.last_sync_at
  }

  async setLastSyncAt (accountName) {
    let account = await this.load(accountName)
    return this.save(Object.assign(account, {last_sync_at: Date.now()}))
  }

  loadBalance (accountName, apiKeys, options) {
    return this.load(accountName).then((account) => {
      if (!account) {
        account = {name: accountName}
      }
      let apiToUse = apiKeys
      if (!apiToUse) {
        apiToUse = _.pick(account, ['API_KEY', 'API_SECRET'])
      }

      if (!EXCHANGE_MAPPING[accountName]) {
        throw new Error('Invalid accountName' + account.name)
      } else {
        return EXCHANGE_MAPPING[accountName].loadBalance(apiToUse, options)
      }
    })
  }

  // Like loadBalance but convert into trades
  async loadBalanceForTrades (account) {
    let result = await this.loadBalance(account.name)
    let importItems = TradeClient.balanceToTrades(result, account.name, account.account_type, {fromExchange: true})
    // Remove from the imported balance the ones already present in db
    let exchangeDbTrades = await TradeClient.account(account.name)
    let exchangeOrderHistory = exchangeDbTrades.filter(trade => trade.fromExchange === true)
    let newExchangeTrades = _.differenceWith(importItems, exchangeOrderHistory, (a, b) => {
      return a.to === b.to && a.quantity_to === b.quantity_to
    })
    newExchangeTrades = newExchangeTrades.map(trade => Object.assign({}, trade, {_id: TradeClient.hashId(trade)}))
    let oldLocalTrades = _.differenceWith(exchangeOrderHistory, importItems, (a, b) => {
      return a.to === b.to && a.quantity_to === b.quantity_to
    })
    // Delete old local trades since they are not on exchange anymore
    TradeClient.remove(oldLocalTrades.map(trade => trade.id))

    return newExchangeTrades
  }

  // Fetch the remote balance and add trades to match the current balance
  async matchBalanceWithTrades (account) {
    let balanceRemote = await this.loadBalance(account.name)
    let localTrades = await TradeClient.account(account.name)
    let balanceLocal = TradeClient.addTradesToBalance(localTrades)
    console.log(`balanceLocal`)
    console.log(balanceLocal)

    let balanceDiff = BalanceHelper.diffBalances(balanceRemote, balanceLocal)
    console.log(`balanceDiff`)
    console.log(balanceDiff)
    let compensatingTrades = TradeClient.balanceToTrades(balanceDiff, account.name, account.account_type, {fromExchange: true})
    console.log(`compensatingTrades`)
    console.log(compensatingTrades)
    // Add the trades in db
    // await TradeClient.add(compensatingTrades)
    return compensatingTrades
  }

  // Fetch all trades, all deposits and withdraws
  // returns obs
  synchronizeTransactions (account, symbolCurrencyPair, apiKeys, params) {
    const allTrades$ = this.getMyTradesObs(...arguments)
    const withdrawals$ = this.getWithdrawalsObs(...arguments)
    const deposits$ = from(this.getDepositsObs(...arguments))
    const timer$ = timer(5000)
    const maxIter = this.allTransactionsMaxIter(account.name)
    let currentIter = 1

    let load$ = concat(deposits$, timer$, withdrawals$, timer$, allTrades$).pipe(
      tap(data => {
        console.log(data)
      }),
      filter(data => data), // filter timerObs values
      map(result => {
        let tradesFiltered = result.data
        // if (account.last_sync_at) {
        //   tradesFiltered = result.data.filter(trade => trade.date > account.last_sync_at / 1000)
        // }
        tradesFiltered.progress = (currentIter + 1) / maxIter
        currentIter++
        return result
      })
    )
    return load$
  }

  allTransactionsMaxIter (accountName) {
    return EXCHANGE_MAPPING[accountName].allTransactionsMaxIter()
  }

  getDepositsObs (account, symbolCurrencyPair, apiKeys, params) {
    ensureSupportedExchange(account.name)
    account = account || {name: account.name}
    let apiToUse = apiKeys || _.pick(account, ['API_KEY', 'API_SECRET'])
    return EXCHANGE_MAPPING[account.name].getDepositsObs(apiToUse, symbolCurrencyPair, params)
  }

  getWithdrawalsObs (account, symbolCurrencyPair, apiKeys, params) {
    ensureSupportedExchange(account.name)
    account = account || {name: account.name}
    let apiToUse = apiKeys || _.pick(account, ['API_KEY', 'API_SECRET'])
    return EXCHANGE_MAPPING[account.name].getWithdrawalsObs(apiToUse, symbolCurrencyPair, params)
  }

  getMyTradesObs (account, symbolCurrencyPair, apiKeys, params) {
    ensureSupportedExchange(account.name)
    account = account || {name: account.name}
    let apiToUse = apiKeys || _.pick(account, ['API_KEY', 'API_SECRET'])
    return EXCHANGE_MAPPING[account.name].getMyTradesObs(apiToUse, symbolCurrencyPair, params)
  }

  getMyTrades (accountName, symbolCurrencyPair, apiKeys, params) {
    return this.load(accountName).then((account) => {
      ensureSupportedExchange(accountName)
      account = account || {name: accountName}
      let apiToUse = apiKeys || _.pick(account, ['API_KEY', 'API_SECRET'])
      return EXCHANGE_MAPPING[accountName].getMyTrades(apiToUse, symbolCurrencyPair, params)
    })
  }

  // TODO: Merge deposit and withdrawal into one method
  getWithdrawalHistory (accountName, apiKeys, params) {
    return this.load(accountName).then((account) => {
      if (!account) {
        account = {name: accountName}
      }
      var apiToUse = apiKeys
      if (!apiToUse) {
        apiToUse = _.pick(account, ['API_KEY', 'API_SECRET'])
      }
      if (!EXCHANGE_MAPPING[accountName]) {
        throw new Error('Invalid accountName' + account.name)
      } else {
        return EXCHANGE_MAPPING[accountName].getDepositOrWithdrawalHistory(apiToUse, 'WITHDRAWALS', params)
      }
    })
  }

  clientFromOnlineAccountName (accountName) {
    const mapping = {}
    return mapping[accountName.toUpperCase()]
  }
}

export default new OnlineAccountClient()
