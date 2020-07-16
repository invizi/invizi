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
import { Dep, autorun } from '@/utils/Dep.js'

describe('Dep', () => {
  before(function () {
  })

  it('set the dependencies and triggers in correct order', () => {
    let dep1 = new Dep()
    let val = 0
    let result
    function getIt () {
      dep1.depend()
      return val
    }

    function setIt (value) {
      let diff = val - value
      val = value
      dep1.notify(diff)
    }

    autorun((diff) => {
      if (diff) {
        expect(diff).to.equal(-1)
      }
      result = getIt()
    })

    expect(result).to.equal(0)
    setIt(1)
    expect(result).to.equal(1)
    setIt(2)
    expect(result).to.equal(2)
  })
})
