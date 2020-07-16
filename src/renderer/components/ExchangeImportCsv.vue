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
    <div class="col text-center">
      <button type="button" class="btn btn-primary waves-effect btn-sm
                    waves-light" @click="selectFile()">Select File</button>
      <span>{{ csvFileName }}</span>
    </div>
    <div class="col mb-r">
      <button type="button" class="btn btn-primary waves-effect
                    waves-light" @click="saveCsv()" v-show="parsed.length
      > 1">Import All</button>
    </div>

    <div class="row col">
      <table class="table large-header table-simple" v-show="parsed.length > 1">
        <tr v-for="(row, index) in parsed">
          <td v-for="value in row[0].split(',')">{{value.replace(/\"/g, '')}}</td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script>
 import ExchangeClientFactory from '@/components/ExchangeClientFactory'
 import Snackbar from '@/utils/Snackbar'
 const {dialog} = require('electron').remote
 const fs = require('fs')
 const csv = require('csv')
 export default {
   title: 'Csv',
   id: 'csv',
   data () {
     return {
       parsed: [['']],
       csvFileName: undefined
     }
   },
   methods: {
     saveCsv () {
       let exchange = ExchangeClientFactory.create(this.currentAccount.name)
       exchange.csvSave(this.parsed).then(() => {
         this.parsed = []
         Snackbar.success('Transactions successfully imported')
         this.selectAccount(this.currentAccount)
       })
     },
     selectFile () {
       dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}, (filenames) => {
         // fileNames is an array that contains all the selected
         if (filenames === undefined) {
           return
         }
         this.csvFileName = filenames[0]

         var parser = csv.parse({delimiter: ';', relax: true}, (err, data) => {
           if (err) {
             throw new Error('Error')
           }
           this.parsed = data
         })
         fs.createReadStream(filenames[0]).pipe(parser)
       })
     }
   }
 }
</script>
