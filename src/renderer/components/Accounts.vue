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
  <div style="height: 100%">

    <div class="row" v-if="currentAccount">
      <div class="col-lg-3">
        <v-select
          v-bind:items="accounts"
          v-model="currentAccount"
          label=""
          @input="selectAccount"
          item-text="name"
          dense
          autocomplete>
        </v-select>
      </div>
      <div class="col-lg-2" style="padding-top: 25px; padding-left: 0;">
        <v-menu offset-y>
          <i slot="activator" class="invizi-info fa fa-ellipsis-v fa-2x" title="Menu"></i>
          <v-list class="menu-contextual">
            <v-list-tile v-for="(item, index) in items" :key="index" @click="item.onClick">
              <v-list-tile-title><i class="fa" :class="item.iconClass" aria-hidden="true" style="margin-right: 8px"></i>{{ item.title }}</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </div>
    </div>
    <!--Section: Inputs-->
    <section class="col">

    <transition
      name="custom-classes-transition"
      enter-active-class="animated bounceIn"
      leave-active-class="animated bounceOut"
      >
    <div class="row card" style="margin-bottom: 15px;" v-if="currentAccount">
      <div class="card-body">
        <div class="row">
          <div class="offset-8 col-lg-4">
            <div class="text-right" v-show="allBalances && (allBalances.totalUSD >= 0 || allBalances.totalUSD <= 0)">
              <div class="title-font big-title"> {{allBalances && allBalances.totalUSD | currency}}</div>
              <h5> <i class="fa fa-btc" aria-hidden="true" style="margin-right: 2px"></i>{{allBalances && allBalances.totalBTC | formatBTC}} </h5>
            </div>
          </div>
          <div class="offset-9 col-lg-3" style="margin-top: 10px;"  v-if="websocketVisible">
            <div class="switch">
              <label>websocket</label>
              <label style="display: inline">
                off
                <input type="checkbox" checked="checked" v-model="websocketActivated" v-on:change="onWebsocketActivatedChange()">
                <span class="lever"></span> on
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    </transition>
    <div v-if="currentAccount">
      <HorizontalTabs :comps="comps" :fit="true">
        <template v-slot:manual>
          <AddTrade v-on:account-updated="selectAccount" :account-name="currentAccount.name"  style="padding-top: 30px;"/>
        </template>
        <template v-slot:csv>
          <ExchangeImportCsv style="padding-top: 50px;"/>
        </template>

        <template v-slot:api>
          <ApiImport v-on:account-updated="selectAccount" :account="currentAccount" style="padding-top: 50px;"/>
        </template>

        <template v-slot:addresses>
          <AddressImport v-on:account-updated="selectAccount" :account="currentAccount" style="padding-top: 50px;"/>
        </template>
      </HorizontalTabs>
    </div>

    <div class="col-lg-12 card mb-5" v-if="accountFetched && !currentAccount"
         style="margin-top:10px">

      <LogoTitle style="margin-top: 20vh; margin-bottom: 10rem;"/>
      <!--Grid column-->
      <div class="row">
        <div class="col-lg-4">
          <v-select
            v-bind:items="accountTypes"
            v-model="accountType"
            label="Account Type"
            @input="onSelectAccountType()"
            autocomplete
          ></v-select>

        </div>

        <div class="col-lg-4" v-if="accountType === 'local'">
          <v-text-field
            label="Account Name"
            v-model="newAccountName"
            required
          ></v-text-field>
        </div>
        <div class="col-lg-4">
          <div>
            <button type="button" class="btn waves-effect
                          waves-light" @click="cancelNewAccount()" v-if="accounts.length > 0">Cancel</button>
            <button type="button" class="btn btn-primary waves-effect
                          waves-light" @click="saveNewAccount()">Create</button>
          </div>
        </div>
      </div>
    </div>

    <div v-show="orderHistory.length > 0">
    <div class="mt-lg-5 mb-5">
      <h4 class="text-left">Trades</h4>
      <hr>
    </div>

    <table class="table">
      <template v-for="item in visibleItems" class="hidden-not-hover">
        <tr :key="item.id">
          <td class="text-xs-center" :class="{'first-edit-border edit-border': expanded === item.id}">{{ item.date | formatDateTimeHuman }}</td>
          <td :class="{'edit-border': expanded === item.id}">
            <trade-label-extended :trade="item" style="float:left"/>
          </td>
          <td class="text-xs-center" :class="{'edit-border': expanded === item.id}"><span v-if="item.fee">{{ item.fee }} {{item.fee_currency}}</span></td>
          <td class="text-xs-right" :class="{'edit-border last-edit-border': expanded === item.id}">
            <a @click="toggleEditOrderHistory(item)" style="margin-right: 10px" v-if="currentAccount && !currentAccount.API_KEY" class="gray">
              <i class="fa fa-edit show-on-hover" aria-hidden="true"></i>
            </a>
            <a @click="deleteOrderHistory(item)" v-if="currentAccount && !currentAccount.API_KEY" class="gray">
              <i class="fa fa-times-circle show-on-hover" aria-hidden="true"></i>
            </a>
          </td>
        </tr>
        <tr v-if="expanded === item.id" class="edit-row">
          <td :class="{'first-edit-border': expanded === item.id}">
              <v-flex xs4 sm8>
                <v-menu
                  lazy
                  :close-on-content-click="true"
                  v-model="editDateMenu"
                  transition="scale-transition"
                  offset-y
                  full-width
                  :nudge-left="40"
                  max-width="390px"
                >
                  <v-text-field
                    slot="activator"
                    label="Date"
                    autosave="true"
                    v-model="item._new.date"
                    prepend-icon="event"
                    required
                  ></v-text-field>
                  <v-date-picker v-model="item._new.date" scrollable actions>
                    <template slot-scope="{ save, cancel }">
                      <v-card-actions>
                        <v-btn flat primary @click.native="cancel()">Cancel</v-btn>
                        <v-btn flat primary @click.native="save()">Save</v-btn>
                      </v-card-actions>
                    </template>
                  </v-date-picker>
                </v-menu>
              </v-flex>
            </td>
            <td>
              <div style="display: flex">
                <v-text-field
                  label="Quantity"
                  v-model.number="item._new.quantity"
                  v-decimal-numbers
                  required
                  autofocus
                  :rules="quantityRules"
                  style="margin-right: 100px;"
                ></v-text-field>
                <v-text-field
                  label="Price"
                  v-model.number="item._new.price"
                  suffix="$"
                  v-decimal-numbers
                  required
                  :rules="priceRules"
                  v-if="['bought', 'sold'].includes(item._new.label)"
                ></v-text-field>
              </div>
            </td>
            <td>
              <button type="button" class="btn btn-sm waves-effect
                            waves-light" @click="expanded = undefined;">CANCEL</button>
              <button type="button" class="btn btn-primary btn-sm waves-effect
                            waves-light" @click="expanded = undefined; updateOrderHistory(item)" :disabled="!editedTradeValid">SAVE</button>
            </td>
            <td class="last-edit-border"></td>
        </tr>
      </template>
    </table>
    <pagination :length="numberOfPages" :page="this.page" @page-changed="onPageChanged"></pagination>
    <button type="button" class="btn btn-sm waves-effect
                  waves-light" v-if="currentAccount && !currentAccount.API_KEY" @click="deleteAllTrades()">Delete All</button>
    </div>

    <div v-show="addresses.length > 0">
      <div class="mt-lg-5 mb-5">
        <h4 class="text-left">Watch Addresses</h4>
        <hr>
      </div>
      <table class="table">
        <thead>
          <th>Type</th>
          <th>Address</th>
          <th>Balance</th>
        </thead>
        <tbody>
          <tr v-for="address in addresses">
            <td>{{address.to}}</td>
            <td>{{address.address}}</td>
            <td>{{address.quantity_to}} {{address.to}}</td>
          </td>
          </tr>
        </tbody>
      </table>
    </div>
    </section>
  </div>

</template>

<script>
 import AddTrade from '@/components/AddTrade'
 import AddressImport from '@/components/AddressImport'
 import ApiImport from '@/components/ApiImport'
 import AppMixin from '@/components/AppMixin'
 import BalanceHelper from '@/components/BalanceHelper'
 import DataSynchronizer from '@/components/DataSynchronizer'
 import Dialog from '@/utils/Dialog'
 import EventBus from '@/components/EventBus'
 import ExchangeClientFactory from '@/components/ExchangeClientFactory'
 import ExchangeImportCsv from '@/components/ExchangeImportCsv'
 import FieldValidator from '@/utils/FieldValidator'
 import HorizontalTabs from '@/components/HorizontalTabs'
 import InviziCache from '@/components/InviziCache'
 import OnlineAccountClient from '@/models/OnlineAccountClient'
 import Pagination from '@/components/Pagination'
 import ShowHintsButton from '@/components/ShowHintsButton'
 import Snackbar from '@/utils/Snackbar'
 import Ticker from '@/components/Ticker'
 import Trade from '@/models/Trade'
 import TradeClient from '@/components/TradeClient'
 import TradeLabelExtended from '@/components/TradeLabelExtended'
 import LogoTitle from '@/components/LogoTitle'

 const _ = require('lodash')
 const moment = require('moment')
 const ACCOUNT_TYPES = ['local'].concat(Object.keys(Ticker.SUPPORTED_EXCHANGES))
 const ITEMS_PER_PAGE = 5

 function computeVisibleItems (orderHistory, page) {
   return orderHistory.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
 }

 function calculateNumberOfPages (orderHistoryLength) {
   return Math.ceil(orderHistoryLength / ITEMS_PER_PAGE)
 }

 export default {
   name: 'accounts',
   mixins: [AppMixin],
   components: {
     'show-hints-button': ShowHintsButton,
     'pagination': Pagination,
     'trade-label-extended': TradeLabelExtended,
     LogoTitle,
     HorizontalTabs,
     AddTrade,
     ExchangeImportCsv,
     ApiImport,
     AddressImport
   },
   watch: {
     orderHistory: function (orderHistory, oldOrderHistory) {
       this.visibleItems = computeVisibleItems(orderHistory, this.page)
       this.numberOfPages = calculateNumberOfPages(orderHistory.length)
       console.log(`numberOfPages=${this.numberOfPages}`)
     },
     page: function (page, oldPage) {
       this.visibleItems = computeVisibleItems(this.orderHistory, page)
     }
   },
   computed: {
     comps () {
       if (this.currentAccount && this.currentAccount.account_type === 'local') {
         return [AddTrade, ExchangeImportCsv, AddressImport]
       } else {
         return [ApiImport, ExchangeImportCsv, AddTrade]
       }
     }
   },
   data () {
     return {
       addresses: [],
       page: 1,
       expanded: undefined,
       numberOfPages: 5,
       visibleItems: [],
       editedTradeValid: true,
       quantityRules: [
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
       items: [
         { title: 'Add account', onClick: this.addAccount, iconClass: 'fa-plus' },
         { title: 'Delete account', onClick: this.confirmDeleteAccount, iconClass: 'fa-trash' }
       ],
       websocketActivated: false,
       websocketVisible: false,
       toggleMenu: false,
       editDateMenu: false,
       currentAccountName: null,
       allBalances: null,
       balance: null,
       accounts: [],
       exchanges: [],
       accountTypes: ACCOUNT_TYPES.slice(),
       accountFetched: false,
       accountType: 'local',
       currentAccount: null,
       newAccountName: null,
       loading: false,
       orderHistorySelected: [],
       search: '',
       csvIndexRemoved: [],
       orderHistoryHeader: [
         { text: 'Date', align: 'center', value: 'date', sortable: true },
         { text: '', value: '' },
         { text: 'Fee', align: 'center', value: '' },
         { text: '', value: '', sortable: false, align: 'center', class: 'invisible' }

       ],
       orderHistory: [],
       select: {},
       symbols: []
     }
   },
   methods: {
     onPageChanged (page) {
       this.visibleItems = computeVisibleItems(this.orderHistory, page)
     },
     onWebsocketActivatedChange () {
       InviziCache.setItem(`websocketActive.${this.currentAccount.name}`, this.websocketActivated)
       DataSynchronizer.untrackExchange(this.currentAccount.name)
       DataSynchronizer.trackExchange(this.currentAccount.name)
     },
     fetchAccounts (currentAccountName) {
       return OnlineAccountClient.allAvailable().then((accounts) => {
         this.accounts = accounts
         this.accountFetched = true
         if (accounts && accounts.length > 0) {
           this.currentAccount = _.find(accounts, {name: currentAccountName})
           if (!this.currentAccount) {
             this.currentAccount = _.first(accounts)
           }
           this.selectAccount(this.currentAccount)
         }
         // filter the accounts that the user has already set up
         const userAccounts = _(accounts).map('name').value()
         this.accountTypes = _.difference(ACCOUNT_TYPES, userAccounts)
         return accounts
       })
     },
     editOrderHistory (order) {
       this.expanded = order.id
       let trade = new Trade(order)
       order._new = {}
       order._new.price = trade.price
       order._new.quantity = trade.quantity
       order._new.date = trade.dateString
       order._new.label = trade.label()
       this.editedTradeValid = true
     },
     toggleEditOrderHistory (order) {
       if (this.expanded) {
         this.expanded = undefined
       } else {
         this.editOrderHistory(order)
       }
     },
     updateOrderHistory (order) {
       /*
          if (!(Check.number(order._new.quantity) && Check.positive(order._new.quantity))) {
          return
          } */
       // Check if it will make the balance negative
       let trade = Trade.updateFromView(Object.assign({}, order, order._new))
       if (trade.automatic) {
         // Used to prevent auto fetch of trades to override the edit
         trade.edited = true
       }
       delete order._new
       let checkValidUpdateTradeResult = BalanceHelper.checkUpdateTradeEntry(trade, this.balance, order)

       if (!checkValidUpdateTradeResult.success) {
         let message = `You don't have enough ${checkValidUpdateTradeResult.problematicCoin.coinId.toUpperCase()} to execute this transaction.\n`
         Dialog.show({message: message})
         return
       }
       TradeClient.update([trade]).then((key) => {
         this.selectAccount(this.currentAccount)
         EventBus.$emit('accountsUpdated')
         Snackbar.success('Transaction updated')
       })
     },
     deleteOrderHistory (order) {
       // Check negative balance
       let checkValidTradeResult = BalanceHelper.checkDeleteTradeEntry(order, this.balance)

       if (!checkValidTradeResult.success) {
         let message = `You can't delete this transaction.`
         Dialog.show({message: message})
         return
       }
       Dialog.show({message: 'Are you sure you want to delete this transaction?', actions: {onConfirm: () => { this.doDeleteOrderHistory(order) }}})
     },
     doDeleteOrderHistory (order) {
       TradeClient.remove([order.id]).then((deleted) => {
         this.orderHistory = _.reject(this.orderHistory, function (o) {
           return o.id === order.id
         })
         // this.selectAccount(this.currentAccount)
         this.afterTradeUpdate()
       })
     },
     confirmDeleteAccount () {
       Dialog.show({message: 'Are you sure you want to delete this account?', actions: {onConfirm: this.deleteAccount}})
     },
     deleteAccount () {
       var accountToDelete = this.currentAccount
       _.remove(this.accounts, {name: accountToDelete.name})
       this.currentAccount = undefined
       TradeClient.deleteAccount(accountToDelete.name).then((deleted) => {
         OnlineAccountClient.delete(accountToDelete.name)
         DataSynchronizer.untrackExchange(accountToDelete.name)
         EventBus.$emit('accountsUpdated')
         this.orderHistory = []
         this.fetchAccounts()
       })
     },
     addAccount () {
       this.currentAccount = null
       this.orderHistory = []
       this.resetNewEntry()
     },
     onSelectAccountType () {
       this.newAccountName = undefined
     },
     afterTradeUpdate () {
       this.balance = TradeClient.addTradesToBalance(this.orderHistory)
       this.allBalances = BalanceHelper.allBalances(this.balance, {removeZero: true, exchange: this.currentAccount.name})
       this.addresses = _.filter(this.orderHistory, (trade) => {
         return trade.address
       })
     },
     async selectAccount (account) {
       this.currentAccount = _.find(this.accounts, {name: account.name})
       this.importItems = []
       this.orderHistory = []
       /* this.resetNewEntry() */

       OnlineAccountClient.load(this.currentAccount.name).then((onlineAccount) => {
         this.currentAccount = _.find(this.accounts, {name: onlineAccount.name})
       })
       TradeClient.account(account.name).then((rows) => {
         this.orderHistory = rows
         this.balance = TradeClient.addTradesToBalance(rows)
         this.allBalances = BalanceHelper.allBalances(this.balance, {removeZero: true, exchange: this.currentAccount.name})
         this.addresses = _.filter(rows, (trade) => {
           return trade.address
         })
       })
       // TODO track account instead (possible multiple listeners)
       EventBus.$on(`ExchangeClient/getTickers`, (message) => {
         if (!this.currentAccount) return
         if (message.exchange === this.currentAccount.name) {
           this.allBalances = BalanceHelper.allBalances(this.balance, {exchange: this.currentAccount.name})
           /* this.symbols = Ticker.fillFromId(Ticker.allCoins({ */
           /* exchange: this.currentAccount.name, */
           /* includeFiat: true})) */
         }
         if (!Ticker.SUPPORTED_EXCHANGES[this.currentAccount.name]) {
           this.allBalances = BalanceHelper.allBalances(this.balance)
         }
       })

       performance.mark('selectAccount end')
     },
     deleteAllTrades () {
       Dialog.show({message: `Are you sure you want to delete all trades of this account ${this.currentAccount.name} ?`, actions: {onConfirm: () => { this.doDeleteAllTrades() }}})
     },
     doDeleteAllTrades () {
       TradeClient.deleteAccount(this.currentAccount.name).then((deleted) => {
         EventBus.$emit('accountsUpdated')
         this.selectAccount(this.currentAccount)
         this.orderHistory = []
       })
     },
     cancelNewAccount () {
       this.currentAccount = _.first(this.accounts)
       this.selectAccount(this.currentAccount)
     },
     async saveNewAccount () {
       if (!this.newAccountName) {
         this.newAccountName = this.accountType
       }
       this.currentAccountName = this.newAccountName
       let detectedAccountType = this.accountType === 'local' ? this.accountType : 'exchange'

       OnlineAccountClient.save({name: this.currentAccountName, account_type: detectedAccountType})
       await DataSynchronizer.trackExchange(this.currentAccountName)
       this.balance = null
       this.allBalances = null
       this.symbols = Ticker.fillFromId(Ticker.allCoins({
         exchange: this.currentAccountName,
         includeFiat: true}))
       await this.fetchAccounts(this.currentAccountName)
       this.newAccountName = null
     },
     csvRemoveRow (index) {
       console.log(`removing index ${index}`)
     },
     resetNewEntry () {
       this.$refs.form && this.$refs.form.reset()
       this.newEntry = {
         coin: null,
         date: moment().format('YYYY-MM-DD'),
         quantity: 0,
         currency: 'usd',
         price: null,
         fee: null,
         fee_currency: null
       }
       this.tradeType = 'Bought'
       if (this.currentAccount) {
         this.websocketActivated = InviziCache.getItem(`websocketActive.${this.currentAccount.name}`)
         let exchange = ExchangeClientFactory.create(this.currentAccount.name)
         this.websocketVisible = exchange && exchange.hasWebSocket()
       }
     }
   },
   mounted () {
     this.fetchAccounts()
     this.resetNewEntry()
   }
 }
</script>

<style lang="scss" scoped>
 $edit-color: #4edeff;
 .first-edit-border {
   border-left: 1px solid $edit-color !important;
 }

 .last-edit-border {
   border-right: 1px solid $edit-color !important;
 }

 .table {
   td.edit-border {
     border-top: 1px solid $edit-color !important;
   }

   tr.edit-row td {
     border-bottom: 1px solid $edit-color !important;
   }
 }

 .datatable__expand-col--expanded {
   border-left: 1px solid $edit-color !important;
   border-right: 1px solid $edit-color !important;
   border-bottom: 1px solid $edit-color !important;
 }

 .menu-contextual .list__tile {
   font-size: 0.9rem !important;
 }
</style>
