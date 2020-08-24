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
  <v-dialog v-model="dialog" width="500" persistent>
    <v-card>
      <v-select
        v-bind:items="categories"
        v-model="newFeedback.category"
        label="Category"
        item-text="name"
        item-value="id"
        dense
        autocomplete
        required ></v-select>
      <div class="text-smaller">
        <em>Your submission is anonymous.</em>
        <i v-if="this.newFeedback.category" v-tooltip="`On submit we send the following information: message, category=${this.newFeedback.category.name} operating system=${this.platform} and Invizi version=${this.version}`" class="fa fa-question-circle" title="info" style="margin-right: 2px"/>
      </div>
      <textarea maxlength="1000" id="message" style="margin-top:40px;" class="textarea" name="" rows="10" v-model="newFeedback.message"></textarea>

      <v-card-actions>
        <v-spacer></v-spacer>

        <button type="button" class="btn btn-default btn-sm waves-effect
                      waves-light"
                @click="dialog = false; onCancel()">Cancel</button>

        <button type="button" class="btn btn-primary btn-sm waves-effect
                      waves-light confirm"
                @click="onSubmit()" :disabled="!newFeedback.message">Submit</button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
 import AppMixin from '@/components/AppMixin'
 import EventBus from '@/components/EventBus'
 import axios from '@/utils/InviziAxios'
 import InviziConfig from '../InviziConfig'
 import Snackbar from '@/utils/Snackbar'
 const _ = require('lodash')
 const END_POINT = 'https://api.invizi.co/feedbacks'

 export default {
   name: 'FeedbackForm',
   mixins: [AppMixin],
   methods: {
     reset () {
       this.newFeedback = {}
       this.newFeedback.category = this.categories[0]
     },
     async onSubmit () {
       let toSubmit = Object.assign({version: InviziConfig.version, platform: process.platform}, this.newFeedback)
       toSubmit.category = toSubmit.category.id
       try {
         await axios.post(END_POINT, toSubmit)
         Snackbar.success('Thank you for your feedback.')
         this.dialog = false
       } catch (e) {
         Snackbar.error('An error occurred. Please contat us at contact@invizi.co')
       }
     },
     onCancel () {
       this.reset()
     },
     show (data) {
       this.context = {}
       _.merge(this.context, this.defaultContext, data)
       this.dialog = true
     }
   },
   destroyed () {
     EventBus.$off(`FeedbackForm/show`)
   },
   data () {
     return {
       categories: [
         {name: 'Feedback', id: 'feedback'},
         {name: 'Bug', id: 'bug'},
         {name: 'Feature Request', id: 'feature-request'}
       ],
       newFeedback: {},
       context: { actions: {} },
       dialog: false,
       version: null,
       platform: '',
       defaultContext: {
         actions: {
           onCancel: () => {}
         }
       }
     }
   },
   mounted () {
     Object.assign(this.context, this.defaultContext)
     this.newFeedback.category = this.categories[0]
     this.version = InviziConfig.version
     this.platform = process.platform
     EventBus.$on('FeedbackForm/show', (data) => {
       this.reset()
       this.show(data)
     })
   }
 }
</script>
<style>
 .dialog .card {
   padding: 10px 20px;
 }

 .textarea {
   width: 100%;
   padding: 10px;
   font-family: var(--font-family-text);
   border-radius: 2px;
   border: 1px solid var(--light-border);
 }
</style>
