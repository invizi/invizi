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
import Trade from '@/models/Trade'

describe('Trade', () => {
  it('created an instance', function () {
    var data = {quantity_from: 100, from: 'USD', quantity_to: 2, to: 'LTC', account_name: 'binance', date: 1535999400}
    let trade1 = new Trade(data)
    expect(trade1.quantity_from).to.equal(data.quantity_from)
    expect(trade1.date).to.equal(data.date)
    return expect(trade1.price).to.equal(data.quantity_from / data.quantity_to)
  })
})
