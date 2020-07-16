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
  <section>
    <h3 class="title--separator">Export Trades</h3>
    <div class="col-lg-3">
      <button type="button" class="btn btn-block btn-primary waves-effect
                    waves-light" @click="exportTradesCsv()">Export Trades to CSV</button>
      <input type="file" id="picker" name="fileList" webkitdirectory directory class="invisible">
    </div>
  </section>
</template>

<script>
 import Snackbar from '@/utils/Snackbar'
 import Exporter from '@/components/Exporter'

 export default {
   title: 'Export Trades',
   methods: {
     exportTradesCsv () {
       document.getElementById('picker').click()
     }
   },
   mounted () {
     let picker = document.getElementById('picker')

     picker.addEventListener('change', e => {
       if (e.target.files) {
         let filePath = e.target.files[0].path
         let dirPath = filePath.split('/').slice(0, (filePath.split('/').length - 1)).join('/')
         Exporter.tradesToCsv(dirPath).then((result) => Snackbar.success('Trades exported'))
       }
     })
   }
 }
</script>
