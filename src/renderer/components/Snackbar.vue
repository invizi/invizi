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
  <v-snackbar
    v-model="snackbar"
    :right="true"
    :top="true"
    :multi-line="true"
    :timeout="timeout"
    :color="color"
    >
    {{ text }}
    <v-btn
      color="snack-gray"
      flat
      @click="snackbar = false"
      style="font-family: Arial;"
      >
      X
    </v-btn>
  </v-snackbar>
</template>

<script>
 import AppMixin from '@/components/AppMixin'
 import EventBus from '@/components/EventBus'

 export default {
   name: 'snackbar',
   mixins: [AppMixin],
   methods: {
     // data: {message: 'hello', status: 'error'}
     show (data) {
       this.text = data.message
       this.color = (data.status || this.color)
       this.snackbar = true
     }
   },
   mounted () {
     EventBus.$on('Snackbar/show', (data) => {
       this.show(data)
     })
   },
   destroyed () {
     EventBus.$off(`Snackbar/show`)
   },
   data () {
     return {
       snackbar: false,
       timeout: 3000,
       color: 'success',
       text: ''
     }
   }
 }
</script>
<style>
 .snack .success {
   background-color: #85c18a !important;
   border-color: #85c18a !important;
 }

 .snack .error {
   background-color: #BF7070 !important;
   border-color: #BF7070 !important;
 }

 .snack-gray--text .btn__content {
   color: #484848;
 }
 .snack-gray--text .btn__content:before {
   content: 'x';
   color: #fff;
   font-weight: 300;
   font-family: Arial, sans-serif;
 }
</style>
