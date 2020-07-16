let { from, timer, BehaviorSubject, of, concat, defer } = require('rxjs')
let { concatAll, map, filter, delay, tap, skip, concatMap, takeWhile } = require('rxjs/operators')
let axios = require('axios')

function fetchForex (val) {
  return axios.get('https://apif.invizi.co/forex').then(result => result.data)
}

function fetchBin (val) {
  return axios.get('https://httpbin.org/json')
}

function fetchTicker (val) {
  return axios.get('https://apif.invizi.co/ticker').then(result => result.data)
}

function getMyTrades () {
  return new Promise((resolve, reject) => {
    let counter = 0
    const hbin = function () {
      console.log(`calling ${counter}`)
      counter++
      if (counter < 4) {
        return axios.get('https://apif.invizi.co/forex')
      } else {
        return axios.get('https://httpbin.org/json')
      }
    }

    const bitcoin$ = defer(() => hbin())

    let load$ = new BehaviorSubject('')

    const whenToRefresh$ = of('').pipe(
      delay(5000),
      tap(_ => load$.next('')),
      skip(1))

    const poll$ = concat(bitcoin$, whenToRefresh$)

    let result2 = load$.pipe(
      concatMap(_ => poll$),
      map(response => response.data),
      takeWhile(data => {
        return data.timestamp
      }))
    resolve(result2)
  })
}

const trades$ = from(getMyTrades()).pipe(concatAll())
const forex$ = defer(fetchForex)
const timerObs = timer(5000)

let final$ = concat(forex$, timerObs, trades$).pipe(
  filter(data => data)
)
final$.subscribe(console.log)
