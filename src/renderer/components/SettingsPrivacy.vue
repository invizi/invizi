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
    <h3 class="">Privacy</h3>
    <br>
    <input type="checkbox" id="checkbox" v-model="inviziApp.stealthMode">
    <label for="checkbox">Stealth Mode</label>
  </div>
</template>

<script>
 import SettingsSave from '@/components/SettingsSave'
 import Settings from '@/components/Settings'
 import Snackbar from '@/utils/Snackbar'

 export default {
   title: 'Privacy',
   components: {
     'settings-save': SettingsSave
   },
   methods: {
     save () {
       Settings.save('stealthMode', this.inviziApp.stealthMode)
       Snackbar.success('Settings saved')
     },
     reset () {
       this.inviziApp.stealthMode = false
       Settings.reset('stealthMode')
     }
   },
   data () {
     return {
       inviziApp: window.inviziApp
     }
   }
 }
</script>
