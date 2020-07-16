let { timer, BehaviorSubject, of, concat, defer } = require('rxjs')
let { reduce, map, takeWhile, switchMap, tap, delay, skip, concatMap } = require('rxjs/operators')
let axios = require('axios')

function TickerGet (val) {
  // console.log(`fetching ${val}`)
  if (val > 1) {
    return axios.get('https://apif.invizi.co/forex')
  } else {
    return axios.get('https://httpbin.org/json')
  }
}

const inter = timer(0, 5000)
const trade = inter.pipe(
  switchMap((val) => TickerGet(val)),
  takeWhile(response => { return response.data.slideshow })
)
trade.subscribe()

let counter = 0
const hbin = function () {
  console.log(`calling ${counter}`)
  counter++
  if (counter < 4) {
    return axios.get('https://apif.invizi.co/ticker')
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
    return Array.isArray(data)
  }))

let pro = result2.toPromise()
pro.then((res) => console.log(res))
