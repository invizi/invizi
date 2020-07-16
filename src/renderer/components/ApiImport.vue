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
  <div style="display: flex; justify-content: center;">
    <div class="col-lg-12 col-md-12" v-if="accountApiSetup">
      <div class="row sync-box">
        <a href="" @click="autoSync()" class="" v-if="!synchronizing">
          <img src="static/icons/font-awesome/sync-alt-solid.svg" class="icon-solo sync-icon"/>
        </a>
        <div v-if="importItemProgress && synchronizing">
          <v-progress-circular
            :rotate="360"
            :size="100"
            :width="15"
            :value="importItemProgress"
            color="teal"
            style="margin-left: 25px;"
          >
            {{ importItemProgress }}%
          </v-progress-circular>
          <a href="" @click="cancel()"><i class="fa fa-times red-text" aria-hidden="true" style="margin-left: 10px;"></i></a>
        </div>

        <div style="" class="keys">
          <img src="static/icons/font-awesome/key-solid.svg" class="icon svg-success key-icon"/>
          <a href="" @click="confirmDeleteApi()"><i class="fa fa-times red-text" aria-hidden="true" style="margin-right: 10px;"></i></a>
        </div>
      </div>
      <div>{{syncMessage}}</div>
      <div v-for="error in errors.slice(0, 5)">{{error}}</div>

      <div v-if="!synchronizing">
        <div v-if="account.last_sync_at" class="text-smaller text-center">
          <em>Last synced at {{account.last_sync_at / 1000 | formatDateTimeHuman}}</em>
        </div>
      </div>
    </div>
    <div class="col-lg-8" v-if="!accountApiSetup">
      <div class="">
        <v-text-field
          label="Api key"
          type="password"
          v-model="api.API_KEY"
          required
          :disabled="newExchangeApiSuccess"
        ></v-text-field>
      </div>
      <div class="" >
        <v-text-field
          label="Api secret"
          v-model="api.API_SECRET"
          type="password"
          required
          :disabled="newExchangeApiSuccess"
        ></v-text-field>
      </div>
      <div class="row">
        <div class="col-md-3 mb-r" style="">
          <!--Grid column-->
          <button type="button" class="btn btn-primary waves-effect
                        waves-light btn-left" @click="testApi()" v-if="!newExchangeApiSuccess"
                  :disabled="!api.API_SECRET || !api.API_KEY">Test</button>
          <button type="button" class="btn btn-primary waves-effect
                        waves-light" @click="saveApi()"
                  v-if="newExchangeApiSuccess">SAVE</button>
        </div>
        <div class="col-md-3 mb-r" style="display: flex; align-items: center;">
          <p class="green-text" v-if="newExchangeApiSuccess">
            <i class="fa fa-2x fa-check"></i>
          </p>
          <div class="red-text" v-if="newExchangeApiSuccess === false">
            <p>API keys are not working</p>
            <p>{{apiFailureMessage}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
 import OnlineAccountClient from '@/models/OnlineAccountClient'
 import InviziCache from '@/components/InviziCache'
 import BalanceHelper from '@/components/BalanceHelper'
 import TradeClient from '@/components/TradeClient'
 import ExchangeClientFactory from '@/components/ExchangeClientFactory'
 import Loader from '@/components/Loader'
 import TradeLabelExtended from '@/components/TradeLabelExtended'
 import Dialog from '@/utils/Dialog'

 let importItems = []
 export default {
   title: 'API',
   id: 'api',
   props: ['account'],
   components: {
     'trade-label-extended': TradeLabelExtended,
     'loader': Loader
   },
   data () {
     return {
       checkedTrades: {},
       selected: [],
       itemsLength: 0,
       importTradesHeader: [
         { text: 'Date', align: 'center', value: 'date', sortable: true, width: 20 },
         { text: '', value: '', sortable: false },
         { text: 'Fee', align: 'center', value: '', width: 20 },
         { text: '', value: '', sortable: false, align: 'center', class: 'invisible', width: 1 }
       ],
       itemsSlice: [],
       importItemProgress: null,
       synchronizing: false,
       allTradesLoading: false,
       apiFailureMessage: undefined,
       accountApiSetup: false,
       newExchangeApiSuccess: null,
       api: {API_KEY: null, API_SECRET: null},
       markets: [],
       sub: undefined,
       selectedMarket: null,
       syncMessage: '',
       errors: []
     }
   },
   watch: {
     account (newAccount) {
       OnlineAccountClient.load(newAccount.name).then((onlineAccount) => {
         this.accountApiSetup = onlineAccount && onlineAccount.API_KEY
       })
       let exchange = ExchangeClientFactory.create(newAccount.name)
       if (exchange && exchange.idToSymbolMap) {
         this.markets = Object.values(exchange.idToSymbolMap)
       }
     }
   },
   methods: {
     beforeFetchingTrades () {
       importItems = []
     },
     matchBalanceWithTrades () {
       OnlineAccountClient.matchBalanceWithTrades(this.account)
     },
     cancel () {
       if (this.sub) {
         this.sub.unsubscribe()
         this.sub = undefined
         this.importItemProgress = null
         this.synchronizing = false
         this.syncMessage = ''
         this.errors = []
       }
     },
     getDepWith (type) {
       this.beforeFetchingTrades()
       this.allTradesLoading = true
       this.sub = OnlineAccountClient[type](this.account).subscribe(
         trades => {
           importItems = importItems.concat(trades)
           this.importItemProgress = parseInt(trades.progress * 100)
         },
         err => console.log(err),
         () => {
           this.allTradesLoading = false
         }
       )
     },
     getDeposits () {
       this.sub = this.getDepWith('getDepositsObs')
     },
     getWithdrawals () {
       this.sub = this.getDepWith('getWithdrawalsObs')
     },
     getMyTrades () {
       this.beforeFetchingTrades()
       OnlineAccountClient.getMyTrades(this.account.name, this.selectedMarket).then((result) => {
         importItems = result
         this.updateVisibleItems()
       })
     },
     getAllTrades () {
       this.beforeFetchingTrades()
       this.allTradesLoading = true
       this.sub = OnlineAccountClient.getMyTradesObs(this.account).subscribe(
         trades => {
           importItems = importItems.concat(trades)
           this.importItemProgress = parseInt(trades.progress * 100)
         },
         err => console.log(err),
         () => {
           this.allTradesLoading = false
         }
       )
     },
     async autoSync () {
       this.beforeFetchingTrades()
       this.synchronizing = true
       let accountFull = await OnlineAccountClient.load(this.account.name)
       this.sub = OnlineAccountClient.synchronizeTransactions(accountFull).subscribe(
         result => {
           importItems = importItems.concat(result.data)
           this.importItemProgress = parseInt(result.data.progress * 100)
           this.syncMessage = `${importItems.length} new transactions fetched`
           this.errors = this.errors.concat(result.errors)
         },
         err => {
           this.synchronizing = false
           this.syncMessage = 'An error occurred while fetching. Please try again'
           console.log(err)
         },
         () => {
           this.synchronizing = false
           this.syncMessage = ''
           OnlineAccountClient.setLastSyncAt(this.account.name)
           TradeClient.add(importItems).then((key) => {
             this.$emit('account-updated', this.account)
           })
         }
       )
     },
     importSelected () {
       TradeClient.add(this.selected).then((key) => {
         this.$emit('account-updated', this.account)
       })
     },
     async getBalance () {
       let result = await OnlineAccountClient.loadBalance(this.account.name)
       console.log(result)
       // this.updateVisibleItems()
     },
     confirmDeleteApi () {
       Dialog.show({message: 'Are you sure you want to delete this account api keys?', actions: {onConfirm: () => { this.deleteApi() }}})
     },
     async deleteApi () {
       await OnlineAccountClient.delete(this.account.name)
       this.accountApiSetup = false
     },
     saveApi () {
       let toSave = Object.assign({}, {name: this.account.name}, this.api)
       OnlineAccountClient.save(toSave).then((onlineAccount) => {
         this.accountApiSetup = true
       })
       this.api = {}
     },
     testApi () {
       /* this.loading = true */
       OnlineAccountClient.loadBalance(this.account.name, this.api).then((balance) => {
         this.newExchangeApiSuccess = true
         var cleanBalance = BalanceHelper.removeZeroCoins(balance)
         InviziCache.setItem(`exchange.${this.account.name}`, cleanBalance)
       }).catch((e) => {
         this.newExchangeApiSuccess = false
         if (e && e.message) {
           this.apiFailureMessage = e.message
         }
       }).finally(() => {
         /* this.loading = false */
       })
     }
   },
   async mounted () {
     let account = await OnlineAccountClient.load(this.account.name)
     if (account) {
       this.accountApiSetup = account && account.API_KEY
       console.log(this.account)
       let exchange = ExchangeClientFactory.create(account.name)
       if (exchange && exchange.idToSymbolMap) {
         this.markets = Object.values(exchange.idToSymbolMap)
       }
     }
   }
 }
</script>

<style lang="scss">
 .sync-icon {
   position: relative;
   width: 100px;
   height: 100px;
   transition: all 0.5s ease-out;
   &:hover {
     transform: scale(1.1);
   }
 }

 .sync-box {
   display: flex;
   justify-content: center;
   align-items: center;
   padding: 3rem;
 }

 .key-icon {
   width: 30px;
   height: 30px;
 }

 .keys {
   position: absolute;
   top: 0;
   right: 0;
 }
</style>
