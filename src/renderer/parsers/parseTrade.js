import parseDeltaTrade from './parseDeltaTrades'
const VALID_TRADE_TYPES = ['invizi', 'delta']

// @param {array} trades
// @param {string} tradeType
const parseTrade = (trades, tradeType) => {
  const type = tradeType.toLowerCase()
  if (!tradeType || !VALID_TRADE_TYPES.includes(type)) return trades
  if (type === 'invizi') return trades
  if (type === 'delta') return parseDeltaTrade(trades)
}

export default parseTrade
