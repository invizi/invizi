let { BehaviorSubject, of, defer } = require('rxjs')
let { delay, tap, skip, concat, concatMap, takeWhile } = require('rxjs/operators')

const trades$ = defer(() => { console.log('Fetching trades') })

let load$ = new BehaviorSubject('')
const whenToRefresh$ = of('').pipe(
  delay(1000),
  tap(_ => load$.next('')),
  skip(1))

const poll$ = concat(trades$, whenToRefresh$)
let result$ = load$.pipe(
  concatMap(_ => poll$),
  takeWhile(() => 1 < 10))

result$.subscribe(
  trades => {
    console.log(trades)
  },
  err => console.log(err),
  () => {
    console.log('done')
  }
)
