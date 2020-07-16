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
function movingAvg (array, count, qualifier) {
  // calculate average for subarray
  var avg = function (array, qualifier) {
    var sum = 0
    let count = 0
    let val

    for (var i in array) {
      val = array[i]
      if (!qualifier || qualifier(val)) {
        sum += val
        count++
      }
    }

    return sum / count
  }

  let result = []
  let val

  // pad beginning of result with null values
  for (let i = 0; i < count - 1; i++) {
    result.push(null)
  }

  // calculate average for each subarray and add to result
  for (var i = 0, len = array.length - count; i <= len; i++) {
    val = avg(array.slice(i, i + count), qualifier)
    if (isNaN(val)) {
      result.push(null)
    } else {
      result.push(val)
    }
  }

  return result
}

let InviziTa = {
  sma: movingAvg
}

export default InviziTa
