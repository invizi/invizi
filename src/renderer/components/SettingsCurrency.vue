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
    <settings-save v-on:reset="reset()" v-on:save="save()"></settings-save>
    <h3 class="">Alternate Currency</h3>
    <v-select
      v-bind:items="currencies"
      v-model="selectedCurrency"
      label="Currency"
      autocomplete
      class="col-md-3"
    ></v-select>
  </div>
</template>

<script>
 import Settings from '@/components/Settings'
 import SettingsSave from '@/components/SettingsSave'
 import Forex from '@/components/Forex'

 export default {
   title: 'Currency',
   components: {
     'settings-save': SettingsSave
   },
   data () {
     return {
       currencies: [],
       selectedCurrency: null
     }
   },
   methods: {
     save () {
       Settings.saveAltCurrency(this.selectedCurrency)
     },
     reset () {
       this.selectedCurrency = null
       Settings.reset('alternateCurrency')
     }
   },
   mounted () {
     this.selectedCurrency = Settings.get('alternateCurrency')
     this.currencies = Forex.symbols()
   }
 }
</script>
