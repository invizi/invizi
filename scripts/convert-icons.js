const axios = require('axios')
const fs = require('fs')
const path = require('path')
const URL = 'https://apif.invizi.co/ticker'

let promise = axios.get(URL, {crossdomain: true})
const processTicker = (response) => {
  let data = response.data
  data.forEach(coin => {
    let fileName = path.resolve(__dirname, `../color/${coin.symbol.toLowerCase()}.png`)
    let outFileName = path.resolve(__dirname, `../static/images/coins2/${coin.coin_id}.png`)
    fs.copyFile(fileName, outFileName, console.error)
  })
}
promise.then(processTicker)
