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
import ExchangeClient from './ExchangeClient'
import { symbolToStandard } from '@/utils/SymbolManager'
import { BehaviorSubject, defer, concat, of } from 'rxjs'
import { delay, tap, skip, concatMap, takeWhile, map, catchError } from 'rxjs/operators'
const R = require('ramda')

const HISTORY_TYPE = {
  DEPOSITS: 'deposit',
  WITHDRAWALS: 'withdrawal'
}

const symToStandard = R.curry(symbolToStandard)('kraken')

const parseLedger = (ledgerEntry) => {
  return Object.assign({
    account_name: 'kraken',
    date: Math.floor(ledgerEntry.timestamp / 1000),
    fee: ledgerEntry.fee.cost,
    fee_currency: symToStandard(ledgerEntry.fee.currency)
  }, {
    withdrawal: {
      from: symToStandard(ledgerEntry.currency),
      quantity_from: ledgerEntry.amount,
      quantity_to: 0,
      to: undefined
    },
    deposit: {
      to: symToStandard(ledgerEntry.currency),
      quantity_to: ledgerEntry.amount,
      quantity_from: 0,
      from: undefined
    }
  }[ledgerEntry.info.type])
}

class KrakenExchangeClient extends ExchangeClient {
  // Rate Limit : https://www.kraken.com/help/api#api-call-rate-limit
  constructor (...args) {
    super(...args)
    this.HISTORY_KEYS_MAPPING = {
      currency: 'asset',
      timestamp: {
        'DEPOSITS': 'time',
        'WITHDRAWALS': 'time'
      },
      amount: 'amount'
    }
    this.autosync = 'simple'
  }

  getHistoryMovements (requestParams, type) {
    let request = {
      type: HISTORY_TYPE[type]
    }
    return this.ccxt.privatePostLedgers(this.ccxt.extend(request))
  }

  // Override
  fetchDeposits (apiKey, coinId, requestParams) {
    this.initializeApiKey(apiKey)
    return this.ccxt.fetchDeposits(coinId, undefined, undefined, requestParams).then((trades) => {
      return this.parseDeposits(trades)
    })
  }

  // Override
  fetchWithdrawals (apiKey, coinId, requestParams) {
    this.initializeApiKey(apiKey)
    return this.ccxt.fetchWithdrawals(coinId, undefined, undefined, requestParams).then((trades) => {
      return this.parseWithdrawals(trades)
    })
  }

  getDepWithGeneric (type, apiKey, params) {
    let markets = this.marketSymbols(this.exchangeMarkets)
    markets = []
    let symbolIndex = -1

    const fetchData = () => {
      symbolIndex++
      return this[type](apiKey, markets[symbolIndex], params)
    }

    const mapFun = (trades = []) => {
      trades.symbolIndex = symbolIndex
      trades.marketsLength = markets.length
      trades.progress = (symbolIndex + 1) / (markets.length - 1)
      return trades
    }

    const takeWhileFun = trades => {
      return symbolIndex < markets.length - 1
    }

    return this.fetchUntil(fetchData, mapFun, takeWhileFun)
  }

  // fetch deposits AND withdrawal
  getDepositsObs (apiKey, symbolCurrencyPair = undefined, params = {}) {
    let counter = -1
    this.initializeApiKey(apiKey)
    const query = () => {
      counter++
      return this.ccxt.fetchLedger(undefined, undefined, undefined, {ofs: counter * 50})
    }

    const trades$ = defer(query)

    let load$ = new BehaviorSubject('')

    const whenToRefresh$ = of('').pipe(
      delay(5000),
      tap(_ => load$.next('')),
      skip(1))

    const byDepositAndWithdrawal = trade => trade && ['deposit', 'withdrawal'].includes(trade.info.type)

    const poll$ = concat(trades$, whenToRefresh$)

    return load$.pipe(
      concatMap(_ => poll$),
      takeWhile(data => data.length > 0),
      map(data => ({errors: [], data: data.filter(byDepositAndWithdrawal).map(parseLedger)})),
      catchError(error$ => of({errors: [error$.toString()], data: []})))
  }

  getWithdrawalsObs () {
    return of('')
  }

  // For deposit, withdraw and trade we iterate through all markets
  allTransactionsMaxIter () {
    return this.exchangeMarkets.length * 3
  }

  getMyTradesObs (apiKey, symbolCurrencyPair = undefined, params = {}) {
    let counter = -1
    this.initializeApiKey(apiKey)
    const fetchTrades = () => {
      counter++
      return super.getMyTrades(apiKey, undefined, {ofs: counter * 50})
    }

    const trades$ = defer(() => fetchTrades())

    let load$ = new BehaviorSubject('')

    const whenToRefresh$ = of('').pipe(
      delay(5000),
      tap(_ => load$.next('')),
      skip(1))

    const poll$ = concat(trades$, whenToRefresh$)
    let result$ = load$.pipe(
      concatMap(_ => poll$),
      takeWhile(data => data.length > 0),
      map(data => ({errors: [], data})),
      catchError(error$ => {
        return of({errors: [error$.toString()], data: []})
      }))
    return result$
  }

  filterByType (response) {
    return Object.values(response.result.ledger)
  }

// by default gets trades for all currencies, cannot mention a specific pair
// type = type of trade (optional)
//     all = all types (default)
//     any position = any position (open or closed)
//     closed position = positions that have been closed
//     closing position = any trade closing all or part of a position
//     no position = non-positional trades
// trades = whether or not to include trades related to position in output (optional.  default = false)
// start = starting unix timestamp or trade tx id of results (optional.  exclusive)
// end = ending unix timestamp or trade tx id of results (optional.  inclusive)
// ofs = result offset
  // getMyTrades (apiKey, symbolCurrencyPair = undefined, params)
}

export default new KrakenExchangeClient('kraken')
