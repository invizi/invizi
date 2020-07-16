
# Install latest npm package
$ npm outdated
$ npm install lodash@latest --save

# Dev env Performance
$ TIMING=true npx eslint --ext .ts,.tsx src

# Change hot reload in webpack-dev-server
$ .electron-vue/dev-runner.js

# How to Debug
launch yarn run unit:debug
go to the debug server logged (usually http://0.0.0.0:9876/#)
click on debug, you will go to http://0.0.0.0:9876/debug.html
Open you spec file, place a breakpoint
reload that page

# Import in node
npx babel-cli --presets=es2015 src/renderer/components/InviziCrypto.js --out-dir lib

# CCXT

fetchOrders
{
  "info": {
    "symbol": "ETHBTC",
    "orderId": 2000000,
    "clientOrderId": "iLwxxxxxxxxxxxx",
    "price": "0.07724300",
    "origQty": "0.20000000",
    "executedQty": "0.20000000",
    "cummulativeQuoteQty": "0.01500059",
    "status": "FILLED",
    "timeInForce": "GTC",
    "type": "LIMIT",
    "side": "BUY",
    "stopPrice": "0.00000000",
    "icebergQty": "0.00000000",
    "time": 1503815208323,
    "updateTime": 1503815776923,
    "isWorking": true
  },
  "id": "2262220",
  "timestamp": 1503815208323,
  "datetime": "2017-08-27T06:26:48.353Z",
  "symbol": "ETH/BTC",
  "type": "limit",
  "side": "buy",
  "price": 0.077243,
  "amount": 0.2,
  "cost": 0.01500059,
  "average": 0.07724294999999999,
  "filled": 0.2,
  "remaining": 0,
  "status": "closed"
}

# Release Check List
* Check that version matches in package.json and main.js

# Webpack

https://slack.engineering/keep-webpack-fast-a-field-guide-for-better-build-performance-f56a5995e8f1
