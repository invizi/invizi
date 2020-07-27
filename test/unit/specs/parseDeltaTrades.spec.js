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
import parseDeltaTrade from '@/parsers/parseDeltaTrades'

describe('parseDeltaTrade', () => {
  it('parse buy', function () {
    var buy1 = {
      Date: '2018-02-11 18:04:16 +02:00',
      Type: 'BUY',
      Exchange: 'Bitfinex',
      'Base amount': '1',
      'Base currency': 'BTC (Bitcoin)',
      'Quote amount': '8274.1',
      'Quote currency': 'USD',
      Fee: '',
      'Fee currency': '',
      'Costs/Proceeds': '8274.10',
      'Costs/Proceeds currency': 'USD',
      'Net worth on 2020-07-23': '9509.16',
      'Worth currency': 'USD',
      'Sync holdings': '',
      'Sent/Received from': '',
      'Sent to': '',
      Notes: ''
    }
    let trades = [buy1]
    let parsed = parseDeltaTrade(trades)
    console.log(parsed)
    return expect(parsed.length).to.equal(1)
  })
})
