const Benchmark = require('benchmark')
var suite = new Benchmark.Suite

let tradeTemplate = {from: 'usd', quantity_from: 1000, date: 1573703511, to: 'bitcoin', quantity_to: 1, account_name: 'local0'}

function createArr (n) {
  let result = []
  for (let i = 1; i <= n; i++) {
    result.push(Object.assign({}, tradeTemplate, {id: i}))
  }
  return result
}

function createObj (n) {
  let result = {}
  for (let i = 1; i <= n; i++) {
    result[i] = Object.assign({}, tradeTemplate, {id: i})
  }
  return result
}

function createMap (n) {
  let result = new Map()
  for (let i = 1; i <= n; i++) {
    result.set(i, Object.assign({}, tradeTemplate, {id: i}))
  }
  return result
}

const N = 10000
let objStore = createObj(N)
let arrStore = createArr(N)
let mapStore = createMap(N)
let arrIndex = arrStore.map(trade => trade.id)

// add tests
// suite.add('find objStore', function () {
//   let index = N / 2
//   let found = objStore[index]
// })
//   .add('find arrStore', function () {
//     let index = N / 2
//     let found = arrStore[arrIndex.indexOf(index)]
//   })
//   .add('find mapStore', function () {
//     let index = N / 2
//     let found = mapStore.get(index)
//   })
// // add listeners
//   .on('cycle', function (event) {
//     console.log(String(event.target))
//   })
//   .on('complete', function () {
//     console.log('Fastest is ' + this.filter('fastest').map('name'))
//   })
// // run async
//   .run({ 'async': true })


let newItem = Object.assign({}, tradeTemplate, {id: 999999})
// var suite2 = new Benchmark.Suite
// suite2.add('build objStore from arrayStore', function () {
//   let result = {}
//   for (let i = 0; i < arrStore.length; i++) {
//     result[arrStore[i].id] = arrStore[i]
//   }
// })
//   .add('build arrIndex', function () {
//     let arrIndex2 = arrStore.map(trade => trade.id)
//   })

//   .add('build mapStore', function () {
//     let result = {}
//     for (let i = 0; i < arrStore.length; i++) {
//       result.set([arrStore[i].id], arrStore[i])
//     }
//   })
// // add listeners
//   .on('cycle', function (event) {
//     console.log(String(event.target))
//   })
//   .on('complete', function () {
//     console.log('Fastest is ' + this.filter('fastest').map('name'))
//   })
// // run async
//   .run({ 'async': true })


var suite3 = new Benchmark.Suite
suite3.add('add to objStore', function () {
  objStore[newItem.id] = newItem
})
  .add('add to arrStore', function () {
    // arrStore.push(newItem) // go out of memory
  })
  .add('add to mapStore', function () {
    mapStore.set(newItem.id, newItem)
  })
// add listeners
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
// run async
  .run({ 'async': true })
