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
const math = require('mathjs')

function add (a, b) {
  return math.number(math.sum(math.bignumber(a), math.bignumber(b)))
}

function subtract (a, b) {
  return math.number(math.subtract(math.bignumber(a), math.bignumber(b)))
}

let InviziCalc = {
  fiatFormat (currency) {
    return +(+currency).toFixed(2)
  },
  add,
  subtract,
  multiply (a, b) {
    return math.number(math.multiply(math.bignumber(a), math.bignumber(b)))
  },

  divide (a, b) {
    return math.number(math.divide(math.bignumber(a), math.bignumber(b)))
  },

  btcFormat (btc) {
    return +(+btc).toFixed(8)
  },

  roundFiat (amount) {
    return Math.round(amount * 100) / 100
  }
}

export {add, subtract}

export default InviziCalc
