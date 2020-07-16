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
import CurrencyManager from '@/components/CurrencyManager'
import Historical from '@/components/Historical'
const moment = require('moment')
const math = require('mathjs')
const _ = require('lodash')

const tickerRegex = [
  /^vol\w*(?:\s*)(?:of)?(?:\s+)([\w-]+)/i,
  /^total supply(?:\s*)(?:of)?(?:\s*)([\w+-]+)/i
]

const tickerKeyRegex = [
  { key: 'total_volume', suffix: ' usd' },
  { key: 'total_supply' }
]

function convertDateToUnix (date) {
  return moment(date, 'DDMMYYYY').unix()
}

const parser = {
  run (expr) {
    let evaluatedExp = math.format(math.evaluate(expr), {
      notation: 'fixed',
      precision: 8
    })

    return evaluatedExp
  },

  async priceOnDate (expr) {
    const regExp = /^(\w+)(?:\s+)price(?:\s*)on(?:\s*)(\d{2})(?:[//|/-]*)(\d{2})(?:[//|/-]*)(\d{4})/i

    const priceOnDateMatch = expr.match(regExp)
    if (priceOnDateMatch) {
      const [fullMatch, coinSymbol, ...date] = priceOnDateMatch
      const coin = Ticker.coinByIdOrSymbol(coinSymbol.toUpperCase())
      if (coin) {
        const unixDate = convertDateToUnix(date.join(''))
        const price = await Historical.priceOnDate(coin.coin_id, [unixDate])
        expr = expr.replace(fullMatch, `${price} usd`)
      }
    }
    return expr
  },

  async eval (expression) {
    if (!expression) return []
    let results = []

    let expr = expression.toLowerCase()

    let potentialCoin = expr.match(/^\w+[\s+]*\w+/i)
    if (potentialCoin) {
      let ticker = Ticker.last()
      if (ticker && ticker.data) {
        let coins = _.filter(ticker.data, (coin) => {
          let reg = new RegExp('^' + potentialCoin[0], 'i') // TODO move up
          return coin.symbol.match(reg) || coin.coin_id.match(reg)
        })
        coins = coins.map((coin) => {
          return Object.assign(coin, {route: `/coin/${coin.coin_id}`})
        })
        if (coins) {
          results = results.concat(Ticker.fillNameAndImage(coins)) // TODO move to Result Maker
        }
      }
    }
    const priceExp = /^price(?:\s*)(?:of)?(?:\s*)([\d|.]*)\s+([\w-]+)/i
    let priceMatch = expr.match(priceExp)
    if (priceMatch) {
      expr = expr.replace(priceMatch[0], `${priceMatch[1]} ${priceMatch[2]} in usd`)
    }

    tickerRegex.forEach((tickerReg, index) => {
      if (tickerReg.test(expr)) {
        let match = tickerReg.exec(expr)
        let coinSymbol = match[1]
        let coin = Ticker.coinByIdOrSymbol(coinSymbol)
        if (coin) {
          let tickerKey = tickerKeyRegex[index]
          expr = expr.replace(tickerReg, `${_.at(coin, tickerKey.key)}${tickerKey.suffix || ''}`)
        }
      }
    })

    expr = await this.priceOnDate(expr)

    let evaluatedExp
    // Handles non-standard coin ids
    const invalidCoins = CurrencyManager.getInvalidCoins()
    let coinIdsRegExp = new RegExp(invalidCoins.map(invalidCoin => invalidCoin.coin_id.replace(/-/, '( )')).join('|'), 'ig')
    expr = expr.replace(coinIdsRegExp, fullMatch => fullMatch.replace(' ', ''))
    try {
      evaluatedExp = math.format(math.eval(expr), {notation: 'fixed', precision: 8})
    } catch (e) {
      // result = []
    }

    if (evaluatedExp) {
      results = [{raw: evaluatedExp}].concat(results)
    }

    return results
  }
}

export default parser
