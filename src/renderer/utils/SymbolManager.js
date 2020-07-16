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
import Forex from '@/components/Forex'
import Ticker from '@/components/Ticker'
import mapping from '@/components/ExchangeMapping'

function coinIdFromSymbol (symbol) {
  // Check if fiat first
  if (Forex.isFiat(symbol)) return symbol
  let found = Ticker.coin(symbol)
  if (found) {
    return found.coin_id
  } else {
    console.error(`coinIdFromSymbol  ${symbol}`)
    // throw new Error(`coinIdFromSymbol  ${symbol}`)
  }
}

function symbolToStandard (exchangeId, symbol) {
  if (!mapping[exchangeId]) {
    console.error(`missing echange id  ${exchangeId}`)
    return coinIdFromSymbol(symbol)
  }

  if (mapping[exchangeId]['cmc']) {
    let cmcId = mapping[exchangeId]['cmc'][symbol]
    if (cmcId) return cmcId
  }

  // Check in newCoins
  if (mapping[exchangeId]['newCoins']) {
    let newCoinId = mapping[exchangeId]['newCoins'][symbol]
    if (newCoinId) return newCoinId.id
  }

  return coinIdFromSymbol(symbol)
}

export { coinIdFromSymbol, symbolToStandard }
