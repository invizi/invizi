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
const guid = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`
}

var repeatGlobal = {}
/*
 * time: time in milliseconds
 */
function repeatDelay (fn, time, uniqId, scope) {
  setTimeout(() => {
    fn.call(scope)
    if (repeatGlobal[uniqId]) {
      repeatDelay(fn, time, uniqId, scope)
    } else {
      console.log(`${fn.name} ${uniqId} stopped`)
    }
  }, time)
}

/*
 * time: time in milliseconds
 */
function repeat (fn, time, scope) {
  if (!fn || !time) {
    throw new Error('Missing arguments')
  }
  var uniqId = guid()
  repeatGlobal[uniqId] = true
  console.log(`${fn.name} ${uniqId} started`)
  // fn.call(scope)
  repeatDelay(fn, time, uniqId, scope)
  return {
    stop: () => {
      repeatGlobal[uniqId] = false
    }
  }
}

function sequence (fn, args, interval, scope) {
  return new Promise((resolve, reject) => {
    if (!args || args.length === 0) {
      reject(new Error('At least one argument required.'))
    }
    let currentIndex = 0
    let results = []
    function next () {
      let result = fn.call(scope, args[currentIndex])
      results.push(result)
      currentIndex++
    }

    let executed = 0
    function scheduleNext (interval) {
      next()
      executed++
      if (executed < args.length) {
        setTimeout(() => {
          scheduleNext(interval)
        }, interval)
      } else {
        resolve(results)
      }
    }

    scheduleNext(interval)
  })
}

let InviziTimer = {
  repeat: repeat,
  sequence: sequence,
  cancelAll: () => {
    repeatGlobal = {}
  }
}

export default InviziTimer
