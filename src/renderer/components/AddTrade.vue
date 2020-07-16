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
  <div class="fade in active show" id="panel36" role="tabpanel" aria-expanded="true">
    <v-form class="col-lg-10" ref="form" v-model="valid" lazy-validation >
      <div class="row" style="margin-bottom: 20px;">
        <div class="col-md-3" style="">
          <v-select
            v-bind:items="tradeTypes"
            v-model="tradeType"
            label="Transaction Type"
            autocomplete
            required
          ></v-select>
          <!-- <i class="invizi-info invizi-info-select fa fa-info-circle fa-small" title="The type of transaction"></i>-->
        </div>
        <!--Grid column-->
        <div class="col-md-3" style="">

          <div class="md-form">
            <v-text-field
              label="Quantity"
              v-model.number="newEntry.quantity"
              v-decimal-numbers
              required
              :rules="quantityRules"
            ></v-text-field>
          </div>

        </div>

        <!--Grid column : ADD COINS-->
        <div class="col-lg-3 col-md-3">
          <v-select
            v-bind:items="symbols"
            v-model="newEntry.coin"
            label="Coin/Currency"
            item-text="name"
            item-value="coin_id"
            @select="onCoinSelect"
            autocomplete
            required
            :rules="coinRules"
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
        <!--Grid column-->
        <div class="col-lg-3 col-md-3">
          <v-menu
            ref="menu"
            lazy
            :close-on-content-click="false"
            :return-value.sync="newEntry.date"
            v-model="menu"
            transition="scale-transition"
            offset-y
            full-width
            :nudge-left="40"
            max-width="390px"
          >
            <v-text-field
              slot="activator"
              :label="tradeType + ' on'"
              autosave="true"
              v-model="newEntry.date"
              prepend-icon="event"
              :rules="dateRules"
              required
            ></v-text-field>
            <v-date-picker v-model="newEntry.date" scrollable actions>
              <v-spacer></v-spacer>
              <v-btn flat color="primary" @click="menu = false">Cancel</v-btn>
              <v-btn flat color="primary" @click="$refs.menu.save(newEntry.date)">OK</v-btn>
            </v-date-picker>
          </v-menu>
        </div>

      </div>

      <div class="row">

        <div class="col-md-3" v-if="['Bought', 'Sold'].indexOf(tradeType) >= 0">

          <div class="md-form">
            <v-text-field
              label="Price"
              v-model.number="newEntry.price"
              v-decimal-numbers
              required
              :rules="priceRules"
            ></v-text-field>
          </div>

        </div>

        <div class="col-md-3" v-if="['Bought', 'Sold'].indexOf(tradeType) >= 0">

          <v-select
            v-bind:items="currencies"
            v-model="newEntry.currency"
            @select="onCurrencySelect"
            autocomplete
          ></v-select>
        </div>
        <div class="col-md-3">
          <div class="md-form">
            <v-text-field
              label="Fee"
              v-model.number="newEntry.fee"
              v-decimal-numbers
              :rules="feeRules"
              @input="onFeeChange"
            ></v-text-field>
          </div>
        </div>
        <div class="col-md-3">
          <v-select
            v-bind:items="symbols"
            item-text="name"
            item-value="coin_id"
            v-model="newEntry.fee_currency"
            label="Fee Coin"
            disabled
          ></v-select>
        </div>
        <div class="col-lg-2">
          <!--Grid column-->
          <button type="button" class="btn btn-primary waves-effect
                        waves-light" @click="save()" :disabled="!valid">Save</button>
        </div>
      </div>
    </v-form>
  </div>
</template>

<script>
 import TradeClient from '@/components/TradeClient'
 import EventBus from '@/components/EventBus'
 import Snackbar from '@/utils/Snackbar'
 import FieldValidator from '@/utils/FieldValidator'
 import Ticker from '@/components/Ticker'
 import Forex from '@/components/Forex'
 import CoinImage from '@/components/CoinImage'

 export default {
   props: ['accountName'],
   title: 'Manual',
   id: 'manual',
   components: {
     'coin-image': CoinImage
   },
   data () {
     return {
       valid: true,
       newEntry: {},
       tradeTypes: ['Bought', 'Sold', 'Deposited', 'Withdrawn'],
       quantityRules: [
         FieldValidator.hasValue('Quantity'),
         FieldValidator.positiveNumber('Quantity')
       ],
       dateRules: [
         FieldValidator.date('Date')
       ],
       coinRules: [
         FieldValidator.hasValue('Coin')
       ],
       priceRules: [
         FieldValidator.positiveNumber('Price')
       ],
       feeRules: [
         FieldValidator.positiveIfValueisPresent('Fee', this)
       ],
       currentNewEntryCoin: null,
       symbols: [],
       menu: false,
       currencies: ['usd', 'bitcoin', 'ethereum'],
       tradeType: 'Deposited'
     }
   },
   methods: {
     compensateTransaction (toSave, checkValidTradeResult) {
       // Create a reverse transaction to make sure balance is 0
       let compensatingTrade = TradeClient.buildCompensatingTransaction(checkValidTradeResult.problematicCoin)
       compensatingTrade.account_name = toSave.account_name
       compensatingTrade.date = toSave.date
       TradeClient.add([compensatingTrade]).then(() => {
         this.doSaveTrade(toSave)
       })
     },
     resetNewEntry () {
       this.$refs.form.reset()
       this.newEntry.quantity = undefined
       this.newEntry.fee = undefined
       this.newEntry.fee_currency = undefined
       this.tradeType = 'Deposited'
     },
     doSaveTrade (toSave) {
       TradeClient.add([toSave]).then((key) => {
         EventBus.$emit('accountsUpdated')
         this.$emit('account-updated', {name: this.accountName})
         this.resetNewEntry()
         Snackbar.success('Transaction added')
       })
     },
     async save () {
       if (!this.$refs.form.validate()) {
         return
       }

       this.newEntry['account_name'] = this.accountName
       let toSave = TradeClient.convertNewEntry(this.newEntry, this.tradeType)
       // Check negative balance
       /* let balanceUpToTradeDate = TradeClient.addTradesToBalance(this.orderHistory, {}, toSave.date) */
       /* let checkValidTradeResult = BalanceHelper.checkInvalidTradeEntry(toSave, balanceUpToTradeDate) */
       /*  */
       /* if (!checkValidTradeResult.success) { */
       /* let message = `You don't have enough ${checkValidTradeResult.problematicCoin.coinId.toUpperCase()} to execute this transaction.\n Do you want Invizi to add a compensating transaction ?` */
       /* Dialog.show({message: message, actions: {onConfirm: () => { this.compensateTransaction(toSave, checkValidTradeResult) }}}) */
       /* return */
       /* } */
       this.doSaveTrade(toSave)
     },
     onCurrencySelect () {
       if (this.currentNewEntryCoin) {
         if (this.newEntry.currency === 'usd') {
           this.newEntry.price = this.currentNewEntryCoin.price_usd
         } else if (this.newEntry.currency === 'bitcoin') {
           this.newEntry.price = this.currentNewEntryCoin.price_btc
         }
       }
     },
     onFeeChange () {
       if (this.newEntry.fee && this.newEntry.fee > 0) {
         this.newEntry.fee_currency = this.newEntry.coin
       } else {
         this.newEntry.fee_currency = null
       }
     },
     onCoinSelect () {
       this.currentNewEntryCoin = null
       if (this.newEntry && this.newEntry.coin) {
         this.currentNewEntryCoin = Ticker.coin(this.newEntry.coin, {exchange: this.accountName})
         if (this.currentNewEntryCoin) {
           this.newEntry.price = this.currentNewEntryCoin.price_usd
           this.newEntry.currency = 'usd'
         }
       }
     }
   },
   watch: {
     accountName (newAccountName) {
       Ticker.fillFromIdAsync(Ticker.allCoins({ // TODO optimize
         exchange: this.newAccountName, includeFiat: true})).then(symbols => { this.symbols = symbols })
     }
   },
   mounted () {
     if (this.accountName) {
       Ticker.fillFromIdAsync(Ticker.allCoins({ // TODO optimize
         exchange: this.accountName, includeFiat: true})).then(symbols => { this.symbols = symbols })
     }
     this.currencies = this.currencies.concat(Forex.symbols())
   }
 }
</script>
