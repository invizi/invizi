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
  <v-dialog
    v-model="dialog"
    width="500"
    >

    <v-card>
      <v-card-text style="padding-top:40px;line-height: 20px">
        {{ context.message }}
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <button type="button" class="btn btn-default btn-sm waves-effect
          waves-light" 
          @click="dialog = false; context.actions.onCancel()">Cancel</button> 

        <button type="button" class="btn btn-primary btn-sm waves-effect
          waves-light" v-if="context.actions.onConfirm"
          @click="dialog = false; context.actions.onConfirm()">Confirm</button> 
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import AppMixin from '@/components/AppMixin'
  import EventBus from '@/components/EventBus'
  const _ = require('lodash')

  export default {
    name: 'InviziDialog',
    mixins: [AppMixin],
    methods: {
      // data: {message: 'hello', status: 'error'}
      show (data) {
        this.context = {}
        _.merge(this.context, this.defaultContext, data)
        this.dialog = true
      }
    },
    mounted () {
      Object.assign(this.context, this.defaultContext)
      EventBus.$on('Dialog/show', (data) => {
        this.show(data)
      })
    },
    destroyed () {
      EventBus.$off(`Dialog/show`)
    },
    data () {
      return {
        context: { actions: {} },
        dialog: false,
        defaultContext: {
          actions: {
            onCancel: () => {}
          }
        }
      }
    }
  }
</script>
<style>
  .dialog dialog--active {
    line-height: 20px;
  }
</style>
