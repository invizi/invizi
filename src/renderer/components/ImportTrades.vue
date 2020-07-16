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
  <div class="section">
    <h3 class="title--separator">Import Trades</h3>
    <div class="col-lg-3">
      <button type="button" class="btn btn-block btn-primary waves-effect
                    waves-light" @click="selectFile()">Select CSV to import</button>
    </div>
    <div class="container">{{csvFileName}}</div>
    <div class="card card-cascade narrower" style="padding: 10px 10px" v-if="csvFileName">
      <div style="min-height: 48px">
        <!-- <button type="button" class="btn btn-sm btn-primary waves-effect -->
        <!-- waves-light" @click="importSelected()" v-if="selected.length > 0 && !importing">Import Trades</button> -->
        <!-- <span v-else>Select at least one row</span> -->

        <button type="button" class="btn btn-sm btn-primary waves-effect
                      waves-light" @click="importAll()" v-if="!importing">Import All Trades</button>
      </div>

      <loader style="width: 30px; height: 30px;" v-if="importing" />
    </div>

  </div>
</template>

<script>
 import Importer from '@/components/Importer'
 import OnlineAccountClient from '@/models/OnlineAccountClient'
 import TradeClient from '@/components/TradeClient'
 import Snackbar from '@/utils/Snackbar'
 const {dialog} = require('electron').remote
 const _ = require('lodash')

 export default {
   title: 'Import Trades',
   data () {
     return {
       selected: [],
       importing: false,
       csvFileName: undefined
     }
   },
   methods: {
     async importAll () {
       this.selected = this.importItems.slice()
       this.importSelected()
     },
     async importSelected () {
       performance.mark('importSelected')
       this.importing = true
       let accountNames = new Set()
       let newAccounts = new Set()
       let converted = this.selected.slice()

       converted.forEach(trade => {
         // convert the empty string values into undefined
         for (let property in trade) {
           if (trade.hasOwnProperty(property) && trade[property] === '') {
             trade[property] = undefined
           }
         }
         accountNames.add(trade.account_name)
       })

       // Check if account already exists
       let supportedExchanges = OnlineAccountClient.supportedExchanges()
       performance.mark('OnlineAccountClient.all()')
       let accounts = await OnlineAccountClient.all()
       accountNames.forEach(accountName => {
         let accountFound = _.find(accounts, {name: accountName})
         if (!accountFound) {
           // account does not exist yet, so create it
           let accountType = supportedExchanges.includes(accountName) ? 'exchange' : 'local'
           OnlineAccountClient.save({name: accountName, account_type: accountType})
           newAccounts.add(accountName)
         }
       })
       await TradeClient.add(converted)

       this.importing = false
       Snackbar.success('Trades imported successfully')
     },
     selectFile () {
       dialog.showOpenDialog({properties: ['openFile']}).then((result) => {
         // fileNames is an array that contains all the selected
         if (result.filePaths === undefined) {
           Snackbar.error('No file selected')
           return
         }
         this.csvFileName = result.filePaths[0]
         Importer.csvToTrades(this.csvFileName).then((trades) => {
           this.importItems = trades
         })
       })
     }
   }
 }
</script>
