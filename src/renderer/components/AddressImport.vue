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
    <div class="row">
      <div class="col-lg-3">
        <v-select
          v-bind:items="addressTypes"
          v-model="addressType"
          label="Address Type"
          item-text="displayName"
          item-value="id"
          autocomplete >
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
      <div class="col-lg-7">
        <v-text-field
          label="Address"
          v-model="addressHash"
          required
        ></v-text-field>
      </div>
      <div class="col mb-r">
        <button type="button" class="btn btn-primary waves-effect btn-sm
                      waves-light" @click="checkAddressBalance()" v-show="addressHash">Check Balance</button>
      </div>
    </div>
    <p class="red-text" v-show="checkBalanceErrorMsg">{{checkBalanceErrorMsg}}</p>
    <div class="row">
      <table class="table col-lg-9" v-show="currentAddressBalance !== null && currentAddressBalance >= 0">
        <tbody>
          <tr>
            <td>{{currentAddressHash}}</td>
            <td> {{currentAddressBalance}} {{addressCurrency}}</td>
            <td style="padding: 0;">
              <button type="button" class="btn btn-default btn-sm waves-effect
                            waves-light" @click="addAddress()"
                      v-show="addressHash">Add</button>
            </td>
          </tr>
        </tbody>
      </table>

      <table class="table col-lg-9" v-if="addressBalances.tokens">
        <tbody>
          <tr>
            <td>{{currentAddressHash}}</td>
            <td class="text-right"> {{addressBalances.ETH.balance}} ETH</td>
            <td style="padding: 0;"> </td>
            <td style="padding: 0;">
              <button type="button" class="btn btn-default btn-sm waves-effect
                            waves-light" @click="addEthereumAddress()"
                      v-show="addressHash">Add All</button>
            </td>
          </tr>
          <tr v-for="token in addressBalances.tokens" :class="{'text-grayed': !supportedTokens[token.tokenInfo.symbol]}">
            <td></td>
            <td class="text-right"> {{  +token.balance / (10 ** +token.tokenInfo.decimals)}} {{token.tokenInfo.symbol}} <em>{{token.tokenInfo.name}}</em> </td>
            <td style="padding: 0;"> </td>
            <td style="padding: 0;"><span v-show="!supportedTokens[token.tokenInfo.symbol]">Unsupported</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
 import Address from '@/components/Address'
 import BlockchainExplorer from '@/components/BlockchainExplorer'
 import CoinImage from '@/components/CoinImage'
 import Snackbar from '@/utils/Snackbar'
 import Ticker from '@/components/Ticker'
 import TradeClient from '@/components/TradeClient'
 import { notifyRateLimit } from '@/utils/RequestManager'
 const moment = require('moment')
 export default {
   title: 'Addresses',
   id: 'addresses',
   props: ['account'],
   components: {
     'coin-image': CoinImage
   },
   data () {
     return {
       addressTypes: [],
       addressType: 'bitcoin',
       addressHash: null,
       currentAddressHash: null,
       addressCurrency: null,
       currentAddressBalance: null,
       addressBalances: [],
       supportedTokens: {},
       checkBalanceErrorMsg: null
     }
   },
   methods: {
     resetEntries () {
       this.currentAddressBalance = undefined
       this.addressHash = undefined
       this.checkBalanceErrorMsg = null
       this.supportedTokens = {}
       this.addressBalances = []
     },
     async addEthereumAddress () {
       let token, amount
       for (let i = 0; i < this.addressBalances.tokens.length; i++) {
         token = this.addressBalances.tokens[i]
         // Check we support the coin symbol
         let coin = Ticker.coin(token.tokenInfo.symbol)
         if (!coin) {
           console.error(`Not supported token ${token.tokenInfo.symbol}`)
           continue
         }
         amount = token.balance / 10 ** +token.tokenInfo.decimals
         await Address.updateLinkedTrade(coin.coin_id, this.currentAddressHash, amount, this.account)
       }
       this.$emit('account-updated', this.account)
       this.resetEntries()
     },
     addAddress () {
       let toSave = {address: this.addressHash, type: this.addressType, account_name: this.account.name}
       Address.save(toSave).then((result) => {
         const coin = Ticker.coinById(this.addressType)
         // Check if already there in trades
         TradeClient.find({account_name: this.account.name, address: this.addressHash}).then((results) => {
           let tradeToSave = {}
           let existsAlready = results && results[0]
           // update the trade if exists
           if (existsAlready) {
             tradeToSave.id = results[0].id
             Snackbar.info('Transaction already exists. Updating with new value')
           }
           Object.assign(tradeToSave, {address: this.addressHash, date: moment().unix(), from: 'usd', quantity_from: 0, to: coin.coin_id, quantity_to: this.currentAddressBalance, account_name: this.account.name, account_type: this.account.account_type})
           // save new trade
           TradeClient.add([tradeToSave]).then((key) => {
             this.$emit('account-updated', this.account)
           })
           this.resetEntries()
         })
       })
     },
     checkAddressBalance () {
       this.checkBalanceErrorMsg = null
       this.currentAddressBalance = null
       this.addressCurrency = null
       let promise = BlockchainExplorer.getAddressBalance(this.addressHash, this.addressType)
       notifyRateLimit(promise)
       promise.then((result) => {
         if (result && result.status === 'success') {
           this.currentAddressHash = this.addressHash
           // Check if ethereum accounts since it has multiple tokens
           if (result.data.tokens) {
             this.addressBalances = result.data
             this.addressBalances.tokens.forEach(token => {
               let coin = Ticker.coin(token.tokenInfo.symbol)
               if (coin) {
                 this.supportedTokens[coin.symbol] = true
               }
             })
             console.log(this.supportedTokens)
           } else {
             this.currentAddressBalance = result.data
             var currentCoin = Ticker.coinById(this.addressType)
             if (currentCoin) {
               this.addressCurrency = currentCoin.symbol
             }
           }
         } else {
           this.checkBalanceErrorMsg = result.message
         }
       })
     }
   },
   mounted () {
     let types = BlockchainExplorer.supportedBlockchainCoins()
     this.addressTypes = Ticker.fillNameAndImage(types)
   }
 }
</script>

<style lang="scss">
</style>
