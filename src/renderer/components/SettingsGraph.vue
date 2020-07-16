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
    <div>
      <h3 class="">Historical SMA Duration</h3>
      <v-text-field
        label="SMA"
        v-model.number="selectedSMADuration"
        v-decimal-numbers
        class="col-lg-1"
      ></v-text-field>
    </div>
    <div>
      <h3 class="">Show coins with dust amount</h3>
      <input type="checkbox" id="checkbox" v-model="showDust">
      <label for="checkbox">Show dust coins</label>
    </div>
  </div>
</template>

<script>
 import Settings from '@/components/Settings'
 import SettingsSave from '@/components/SettingsSave'
 import Snackbar from '@/utils/Snackbar'
 import Forex from '@/components/Forex'

 export default {
   title: 'Graph',
   components: {
     'settings-save': SettingsSave
   },
   data () {
     return {
       selectedSMADuration: Settings.getSMADuration() || 9,
       showDust: Settings.get('showCoinDust')
     }
   },
   methods: {
     save () {
       Settings.saveSMADuration(this.selectedSMADuration)
       Settings.save('showCoinDust', this.showDust)
       Snackbar.success('Settings saved')
     },
     reset () {
       this.selectedSMADuration = 9
       Settings.reset('smaDuration')
     }
   },
   mounted () {
     this.selectedCurrency = Settings.get('alternateCurrency')
     this.currencies = Forex.symbols()
   }
 }
</script>
