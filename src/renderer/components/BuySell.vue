<!--
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
-->
<template>
  <div>
    <!--Main layout-->
    <div class="container-fluid">
      <div class="card card-cascade narrower" style="margin-bottom: 20px; padding: 10px 0">
        <div class="row col-lg-12">
          <div class="col-lg-2">

            <v-select
              v-bind:items="executionTypes"
              v-model="executionType"
              label=""
              item-text="name"
              dense >
            </v-select>
          </div>
        </div>
        <!--Grid row-->
        <div class="row col-lg-12">
          <div class="col-lg-1 col-md-1">

            <v-select
              v-bind:items="operationLabels"
              v-model="operation"
              label=""
              @input="onFetchCompleted()"
              item-text="name"
              dense >
            </v-select>
          </div>
          <div class="col-md-2" style="">
            <div class="md-form">
              <v-text-field
                label="Quantity"
                v-model.number="quantity"
                v-decimal-numbers
              ></v-text-field>
            </div>
          </div>
          <div class="col-lg-3 col-md-3">
            <v-select
              v-bind:items="symbols"
              v-model="firstCoin"
              label=""
              item-text="name"
              autocomplete
              >
              <template slot="item" slot-scope="data">
                <v-list-tile-avatar>
                  <coin-image :coin-id='data.item.coin_id'/>
                  <span style="margin-left: 8px; font-size: 32px"
                    v-if="data.item.iconText">{{data.item.iconText}}</span>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                </v-list-tile-content>
              </template>
            </v-select>

          </div>
          <div class="" v-if="operation" style="height: 87px; line-height: 87px; padding: 0 10px;">
            <div v-if="inviziApp.traderMode" style="margin-top: -5px;">/</div>
            <div v-else>
              <div v-if="operation.id === 'sell'">For</div>
              <div v-else>With</div>
            </div>
          </div>
          <!--Grid column : ADD COINS-->
          <div class="col-lg-3 col-md-3">
            <v-select
              v-bind:items="symbols"
              v-model="secondCoin"
              label=""
              item-text="name"
              autocomplete
              >
              <template slot="item" slot-scope="data">
                <v-list-tile-avatar>
                  <coin-image :coin-id='data.item.coin_id'/>
                  <span style="margin-left: 8px; font-size: 32px"
                    v-if="data.item.iconText">{{data.item.iconText}}</span>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                </v-list-tile-content>
              </template>
            </v-select>

          </div>
          <form class="" style="margin-top: 10px;">
            <button type="button" class="btn btn-sm btn-primary waves-effect
              waves-light" @click="showOptions()" :disabled="firstCoin && secondCoin && firstCoin.id === secondCoin.id">Show Options</button>
          </form>
        </div>
        <div class="row col-lg-12" v-if="executionType && executionType.id === 'limit' && foundExchanges.length > 0">
          <div class="col-lg-2">
            <v-text-field
              label="Price"
              v-model="price" ></v-text-field>
          </div>
          <div class="col-lg-6">{{secondCoin.symbol}}</div>
        </div>

        <div style="margin-left: 20px" v-if="foundExchanges.length > 0" class="invizi--flex-table">
          <div class="row" style="padding-bottom: 10px;">
            <div class="col">
              <input type="radio" value="1" id="foo" class="form-check-input invisible">
              <label class="form-check-label invisible">invisible</label>
            </div>
            <div class="col clickable" style="flex: 1"></div>
            <div class="col" style="flex: 4">{{firstCoin.symbol}}</div>
            <div class="col" style="flex: 4">{{secondCoin.symbol}}</div>
            <div class="col" style="flex: 4">Ask</div>
            <div class="col" style="flex: 4">Bid</div>
            <div class="col" style="flex: 4">Last</div>
            <div class="col" style="flex: 4">Total</div>
            <div class="col" style="flex: 1"></div>
            <div class="col"></div>
          </div>
          <template v-for="(exchange, index) in foundExchanges" >
          <div class="row tr" :class="{selected: selectedExchange && exchange.name === selectedExchange.name}">
            <div class="col clickable">
              <input type="radio" :value="exchange" :id="exchange.name" class="form-check-input" v-model="selectedExchange">
              <label class="form-check-label clickable" :for="exchange.name">{{exchange.name}}</label>
            </div>
            <div class="col clickable" style="flex: 1">
              <a @click="toggleShowBalanceForExchange(exchange.name)"><i v-if="allBalances[exchange.name]" :class="{'fa fa-chevron-down': !exchangeBalancesShown, 'fa fa-chevron-up': exchangeBalancesShown === exchange.name}" title="show balance"></i></a>
            </div>
            <div class="col" style="flex: 4">
              {{ allBalances[exchange.name] && allBalances[exchange.name].coins && allBalances[exchange.name].coins[firstCoin.coin_id] | formatBTC }}
            </div>
            <div class="col" style="flex: 4">
              {{ allBalances[exchange.name] && allBalances[exchange.name].coins && allBalances[exchange.name].coins[secondCoin.coin_id] | formatBTC }}
            </div>
            <div class="col" style="flex: 4">
              {{ exchange.pair && exchange.pair.ask | formatBTC }}
            </div>
            <div class="col" style="flex: 4">
              {{ exchange.pair && exchange.pair.bid | formatBTC }}
            </div>
            <div class="col" style="flex: 4">
              <em v-if="!loadingOptions && !exchange.pair" class="grey-text">pair not found</em>
              {{ exchange.pair && exchange.pair.last | formatBTC }}
            </div>
            <div class="col" style="flex: 4">
              <span v-show="exchange.pair">{{exchange.pair && +exchange.pair.last | multiplyBy(quantity) | formatBTC }}</span>
            </div>
            <div class="col" style="flex: 1">
              <span :class="{'invisible': !(operation && operation.id === 'buy' && exchangeWithPairs.length > 0 && exchange.name === exchangeWithPairs[0].name)}" class="green-text"> (lowest)</span>
              <span :class="{'invisible': !(operation && operation.id === 'sell' && exchangeWithPairs.length > 0  && exchange.name === exchangeWithPairs[0].name)}" class="green-text"> (highest)</span>
            </div>
            <div class="col">
              <loader style="width: 30px; height: 30px;" v-show="!exchange.pair"/>
            </div>
          </div>
          <transition
            name="custom-classes-transition"
            enter-active-class="animated fadeIn faster"
            leave-active-class="animated fadeOut faster">
            <div v-if="exchangeBalancesShown === exchange.name" style="border-right: 1px solid var(--gray)" >
              <BalanceByCoinForExchange :balanceByCoin="allBalances[exchange.name]"/>
            </div>
          </transition>
          </template>
        </div>
      </div>
      <div class="col-lg-11 text-right" v-if="foundExchanges.length > 0">
        <button type="button" class="btn btn-sm btn-primary waves-effect
                      waves-light" @click="prepare">Prepare</button>
      </div>

      <div v-show="preparedOrders.length > 0">
        <h4 class="text-left">Prepared Orders</h4>
        <v-data-table
          v-model="preparationSelected"
          v-bind:headers="preparedOrdersHeader"
          v-bind:items="preparedOrders"
          item-key="id"
          no-data-text="No Orders"
          class="elevation-1">
          <template slot="headers" slot-scope="props">
            <tr>
              <th v-for="header in props.headers" :key="header.text">
                {{ header.text }}
              </th>
            </tr>
          </template>
          <template slot="items" slot-scope="props">

            <tr :active="props.selected"
                  @click="props.selected = !props.selected">
              <td class="text-xs-center">{{ props.item.date | formatDateTimeHuman }}</td>
              <td class="text-xs-center">{{ props.item.exchangeId }}</td>
              <td class="text-xs-center">{{ props.item.pair }}</td>
              <td class="text-xs-center">{{ props.item.type }}</td>
              <td class="text-xs-center"><buy-sell-text :value="props.item.side"/></td>
              <td class="text-xs-center">{{ props.item.price }}</td>
              <td class="text-xs-center">{{ props.item.amount }}</td>
              <td class="text-xs-center">{{ props.item.total }} {{props.item.secondCoin.symbol}}</td>
              <td class="text-xs-center">{{ props.item.status }}</td>
              <td class="text-xs-center">
                <form class="form-inline">
                  <loader style="width: 40px; height: 40px; position: absolute;" v-show="preparedOrdersLoadingId === props.item._id"/>
                  <div :class="{invisible: preparedOrdersLoadingId === props.item._id}">
                    <button type="button" class="btn btn-sm btn-primary waves-effect
                                  waves-light" @click="confirmPreparedOrder(props.item)">Confirm</button>
                    <button type="button" class="btn btn-sm waves-effect
                                  waves-light" @click="cancelPreparedOrder(props.item)">Cancel</button>
                  </div>
                </form>
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>

      <div v-if="openOrders.length > 0">
        <h4 class="text-left">Open Orders</h4>
      </div>
      <v-data-table
        v-bind:headers="closedOrdersHeader"
        v-bind:items="openOrders"
        item-key="id"
        class="elevation-1"
        v-if="openOrders.length > 0">
        <template slot="headers" slot-scope="props">
          <tr>
            <th v-for="header in props.headers" :key="header.text">
              {{ header.text }}
            </th>
          </tr>
        </template>
        <template slot="items" slot-scope="props">

          <tr :active="props.selected"
                @click="props.selected = !props.selected">
            <td class="text-xs-center">{{ props.item.timestamp / 1000 | formatDateTime }}</td>
            <td class="text-xs-center">{{ props.item.exchangeId }}</td>
            <td class="text-xs-center"><buy-sell-text :value="props.item.side"/></td>
            <td class="text-xs-center">{{ props.item.symbol }}</td>
            <td class="text-xs-center">{{ props.item.type }}</td>
            <td class="text-xs-center">{{ props.item.price }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
            <td class="text-xs-center">{{ props.item.price | multiplyBy(props.item.amount) }}</td>
            <td class="text-xs-center">{{ props.item.status }}</td>
            <td class="text-xs-center">
              <form class="form-inline">
                <button type="button" class="btn btn-sm btn-primary waves-effect
                              waves-light" @click="cancelOpenOrder(props.item)">Cancel</button>
              </form>
            </td>
          </tr>
        </template>
      </v-data-table>

      <div v-if="closedOrders.length > 0">
        <h4 class="text-left">Closed Orders</h4>
      </div>
      <v-data-table
        v-bind:headers="closedOrdersHeader"
        v-bind:items="closedOrders"
        item-key="id"
        class="elevation-1"
        v-if="closedOrders.length > 0">
        <template slot="headers" slot-scope="props">
          <tr>
            <th v-for="header in props.headers" :key="header.text">
              {{ header.text }}
            </th>
          </tr>
        </template>
        <template slot="items" slot-scope="props">

          <tr :active="props.selected"
                @click="props.selected = !props.selected">
            <td class="text-xs-center">{{ props.item.timestamp / 1000 | formatDateTime }}</td>
            <td class="text-xs-center">{{ props.item.exchangeId }}</td>
            <td class="text-xs-center"><buy-sell-text :value="props.item.side"/></td>
            <td class="text-xs-center">{{ props.item.symbol }}</td>
            <td class="text-xs-center">{{ props.item.type }}</td>
            <td class="text-xs-center">{{ props.item.price }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
            <td class="text-xs-center">{{ props.item.cost }}</td>
            <td class="text-xs-center">{{ props.item.status }}</td>
            <td class="text-xs-center">
            </td>
          </tr>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script>
 import AppMixin from '@/components/AppMixin'
 import BalanceHelper from '@/components/BalanceHelper'
 import BalanceByCoinForExchange from '@/components/BalanceByCoinForExchange'
 import BuySellText from '@/components/BuySellText'
 import CoinImage from '@/components/CoinImage'
 import ExchangeClientFactory from '@/components/ExchangeClientFactory'
 import ExchangeOrderManager from '@/components/ExchangeOrderManager'
 import InviziCalc from '@/components/InviziCalc'
 import InviziCrypto from '@/components/InviziCrypto'
 import InviziTimer from '@/components/InviziTimer'
 import OnlineAccountClient from '@/models/OnlineAccountClient'
 import Order from '@/models/Order'
 import Ticker from '@/components/Ticker'
 const _ = require('lodash')
 const moment = require('moment')
 let fetchCurrentOrdersTimer

 /*
    ask : 0.00001173
    askVolume : 123648
    average : undefined
    baseVolume : 49332243
    bid : 0.00001172
    bidVolume : 15613
    change : -1.5 e-7
    close : 0.00001173
    datetime : "2019-01-27T05:35:46.405Z"
    high : 0.00001198
    info : {symbol: "ADABTC", priceChange: "-0.00000015", priceChangePercent: "-1.263", weightedAvgPrice: "0.00001188", prevClosePrice: "0.00001188", …}
    last : 0.00001173
    low : 0.00001168
    open : 0.00001188
    percentage : -1.263
    previousClose : 0.00001188
    quoteVolume : 585.89460038
    symbol : "ADA/BTC"
    timestamp : 1548567346405
    vwap: 0.00001188 */
 export default {
   name: 'buy-sell',
   mixins: [AppMixin],
   components: {
     'coin-image': CoinImage,
     'buy-sell-text': BuySellText,
     BalanceByCoinForExchange
   },
   computed: {
     closedOrders () {
       return this.exchangeOrders.filter(o => o.status === 'closed')
     },
     openOrders () {
       let result = this.exchangeOrders.filter(o => o.status === 'open')
       return result
     },
     sortedExchanges () {
       let result = this.foundExchanges.sort((a, b) => {
         if (this.operation.id === 'buy') {
           return a.pair && b.pair && a.pair.ask < b.pair.ask ? -1 : 1
         } else {
           return a.pair && b.pair && a.pair.bid > b.pair.bid ? -1 : 1
         }
       })
       return result
     },
     bestExchange () {
       return _.first(this.exchangeWithPairs)
     },
     exchangeWithPairs () {
       return this.sortedExchanges.filter(exchange => exchange.pair)
     }
   },
   data () {
     return {
       inviziApp: window.inviziApp,
       quantity: 1,
       price: 0,
       allBalances: {},
       selectedExchange: undefined,
       exchangeBalancesShown: undefined,
       firstCoin: undefined,
       errorMsg: undefined,
       secondCoin: undefined,
       executionTypes: [{name: 'Market', id: 'market'}, {name: 'Limit', id: 'limit'}],
       executionType: undefined,
       operationLabels: [{name: 'Buy', id: 'buy'}, {name: 'Sell', id: 'sell'}],
       operation: undefined,
       mainExchanges: ['binance', 'poloniex', 'bitfinex', 'bittrex', 'okex', 'kraken'],
       foundExchanges: [],
       loadingOptions: undefined,
       preparedOrders: [],
       exchangeOrders: [],
       preparationSelected: undefined,
       preparedOrdersHeader: [
         { text: 'Date', align: '', value: 'date' },
         { text: 'Exchange', value: '', align: '' },
         { text: 'Pair', value: '', align: '' },
         { text: 'Type', align: '', value: '' },
         { text: 'Side', value: '', align: '' },
         { text: 'Price', value: '', align: '' },
         { text: 'Amount', value: '', align: '' },
         { text: 'Total', value: '', align: '' },
         { text: 'Status', value: '', align: '' },
         { text: '', value: '', sortable: false, align: 'center', class: 'invisible' }

       ],
       preparedOrdersLoadingId: undefined,
       closedOrdersHeader: [
         { text: 'Date', align: '', value: 'date' },
         { text: 'Exchange', value: '', align: '' },
         { text: 'Side', value: '', align: '' },
         { text: 'Pair', value: '', align: '' },
         { text: 'Type', value: '', align: '' },
         { text: 'Price', value: '', align: '' },
         { text: 'Amount', value: '', align: '' },
         { text: 'Total', value: '', align: '' },
         { text: 'Status', value: '', align: '' },
         { text: '', value: '', sortable: false, align: 'center', class: 'invisible' }

       ],
       loading: false,
       symbols: []
     }
   },
   methods: {
     toggleShowBalanceForExchange (exchangeName) {
       if (this.exchangeBalancesShown) {
         this.exchangeBalancesShown = undefined
       } else {
         this.exchangeBalancesShown = exchangeName
       }
     },
     onExchangeChange () {
       // Set the limit price
       if (this.selectedExchange && this.selectedExchange.pair) {
         this.price = +this.selectedExchange.pair.last
       }
     },
     fetchBalances () {
       OnlineAccountClient.allWithApiKeys().then((accounts) => {
         accounts.forEach(account => {
           OnlineAccountClient.loadBalance(account.name).then((balance) => {
             this.allBalances[account.name] = BalanceHelper.allBalances(balance, {removeZero: true, exchange: account.name})
             this.allBalances[account.name].coins = balance
             console.log(this.allBalances)
           })
         })
       })
     },
     cancelOpenOrder (order) {
       let valid = ExchangeOrderManager.validateExchange(order.exchangeId)
       if (!valid) throw new Error('Invalid Exchange')
       let promise = ExchangeOrderManager.cancelOrder(order)
       promise.then((canceledOrder) => {
         this.exchangeOrders = this.exchangeOrders.filter(o => o.id !== canceledOrder.id)
         this.exchangeOrders.push(canceledOrder)
       }).catch((error) => {
         this.errorMsg = error.message
       })
     },
     cancelPreparedOrder (order) {
       this.preparedOrdersLoadingId = order._id
       let that = this
       setTimeout(() => {
         that.preparedOrders = _.filter(that.preparedOrders, o => o._id !== order._id)
         that.preparedOrdersLoadingId = undefined
       }, 1000)
     },
     async confirmPreparedOrder (order) {
       try {
         let createdOrder = await ExchangeOrderManager.createOrder(order)
         createdOrder.exchangeId = order.exchangeId
         this.exchangeOrders.push(createdOrder)
         this.preparedOrders = _.filter(this.preparedOrders, o => o._id !== order._id)
         this.preparedOrdersLoadingId = undefined
       } catch (error) {
         this.errorMsg = error.message
       }
     },
     buildPair () {
       return `${this.firstCoin.symbol}/${this.secondCoin.symbol}`
     },
     inversePair () {
       let tempPair = this.firstCoin
       this.firstCoin = this.secondCoin
       this.secondCoin = tempPair
       this.showOptions()
     },
     async prepare () {
       this.errorMsg = undefined
       let valid = await ExchangeOrderManager.validateExchange(this.selectedExchange.name)
       if (!valid) {
         this.errorMsg = 'Exchange is not setup or invalid.'
         return
       }
       let preparedOrder = {
         _id: InviziCrypto.uuidv4(),
         date: moment().format('X'),
         exchangeId: this.selectedExchange.name,
         pair: this.buildPair(),
         firstCoin: this.firstCoin,
         secondCoin: this.secondCoin,
         side: this.operation.id,
         type: this.executionType.id,
         price: +this.selectedExchange.pair.last,
         amount: +this.quantity,
         status: 'to confirm'
       }
       if (this.executionType && this.executionType.id === 'limit') {
         preparedOrder.price = +this.price
       }
       preparedOrder.total = InviziCalc.multiply(preparedOrder.amount, preparedOrder.price)
       this.preparedOrders.push(preparedOrder)
     },
     async fetchCurrentOrders () {
       let localOrders = await Order.all()
       let orders = []
       let exchangeSymbols = _.chain(localOrders).groupBy('exchange').mapValues(account => _.chain(account).map('original.symbol').uniq().value()).value()
       for (let exchangeId of Object.keys(exchangeSymbols)) {
         for (let symbol of exchangeSymbols[exchangeId]) {
           let currentExchangeOrders = await ExchangeOrderManager.fetchOrders(exchangeId, symbol)
           orders = orders.concat(currentExchangeOrders)
         }
       }
       this.exchangeOrders = orders
     },
     onFetchCompleted () {
       this.loadingOptions = false
       this.selectedExchange = this.exchangeWithPairs[0]
       this.onExchangeChange()
     },
     showOptions () {
       this.loadingOptions = true
       this.price = undefined
       let exchange
       this.foundExchanges = this.mainExchanges.map(exchangeName => {
         return {name: exchangeName, pair: undefined}
       })
       this.foundExchanges.length = this.foundExchanges.length
       let promises = []
       let exchangePromise
       for (let exchangeId of this.mainExchanges) {
         exchange = ExchangeClientFactory.create(exchangeId)
         exchangePromise = exchange.fetchTickers()
         exchangePromise.then((ticker) => {
           let pair = this.buildPair()
           if (ticker[pair]) {
             let exchange = {name: exchangeId, pair: ticker[pair], ticker: ticker}
             console.log(exchange)
             let foundIndex = _.findIndex(this.foundExchanges, {name: exchangeId})
             this.foundExchanges.splice(foundIndex, 1, exchange)
           }
         }).catch((error) => {
           console.error(error)
         })
         promises.push(exchangePromise)
       }

       setTimeout(this.onFetchCompleted, 4000)
       return Promise.all(promises).then(this.onFetchCompleted)
     }
   },
   destroyed () {
     fetchCurrentOrdersTimer.stop()
   },
   mounted () {
     this.executionType = _.first(this.executionTypes)
     this.fetchBalances()
     this.symbols = Ticker.allCoins({includeFiat: true})
     this.firstCoin = this.symbols[1]
     this.secondCoin = _.find(this.symbols, {coin_id: 'bitcoin'})
     this.operation = this.operationLabels[0]
     this.fetchCurrentOrders()
     fetchCurrentOrdersTimer = InviziTimer.repeat(this.fetchCurrentOrders, 20000, this)
   }
 }
</script>
<style scoped lang="scss">
 .form-check-label {
   min-width: 140px;
 }

 .form-check {
   border-top: 1px solid transparent;
   border-bottom: 1px solid transparent;
   padding-top: 3px;
   padding-bottom: 3px;
 }

 .selected {
   color: var(--primary);
 }

 .form-check-input {
   position: absolute;
   left: -5px;
 }

 .exchange-table {
   td {
     border-top: none;
   }
 }

 .table {
   tr:hover:not(.selected) {
     background-color: var(--gray-darker)
   }
 }
 .invizi--flex-table {
   .tr {
     .col {
       z-index: 2;
     }
   }
 }
</style>
