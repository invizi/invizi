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
    <table class="table" v-if="slice && slice.length > 0">
      <thead>
        <tr>
          <th style="width: 20px;">
            <v-checkbox
              primary
              hide-details
              v-model="allChecked"
              @click.native="toggleAll"
            ></v-checkbox>
          </th>
          <th> </th>
          <th>Date</th>
          <th></th>
          <th>Fee</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in slice" :key="item[idKey]">
          <td>
            <v-checkbox
              primary
              hide-details
              v-model="checkedTrades[item[idKey]]"
              @change="checkboxFilter()"
            ></v-checkbox>
          </td>
          <td></td>
          <td class="text-xs-center">{{ item.date | formatDate }}</td>
          <td>
            <trade-label-extended :trade="item" style="float:left"/>
          </td>
          <td class="text-xs-center"><span v-if="item.fee">{{ item.fee }} {{item.fee_currency}}</span></td>
        </tr>
        <tr v-for="i in lastPageMissingItemsNumber" v-if="slice.length !== itemsPerPage">
          <td>
            <v-checkbox
              primary
              hide-details
              v-show="false"
            ></v-checkbox>
          </td>
        </tr>
      </tbody>
    </table>
    <Pagination :length="numberOfPages" :page="page" @page-changed="onPageChanged" v-show="numberOfPages > 1"/>
  </div>
</template>
<script>
 import TradeLabelExtended from '@/components/TradeLabelExtended'
 import Pagination from '@/components/Pagination'

 export default {
   props: {
     'slice': Array,
     'idKey': {
       type: String,
       default: 'id'
     },
     'checkedTrades': Object,
     'itemsLength': Number,
     'itemsPerPage': {
       type: Number,
       default: 10
     }
   },
   components: {
     'trade-label-extended': TradeLabelExtended,
     Pagination
   },
   data () {
     return {
       page: 1,
       allChecked: true
     }
   },
   watch: {
     page (page, oldPage) {
       this.$emit('page-changed', page, this.itemsPerPage)
     }
   },
   computed: {
     numberOfPages () {
       return Math.ceil(this.itemsLength / this.itemsPerPage)
     },
     lastPageMissingItemsNumber () {
       return this.itemsPerPage - this.itemsLength % this.itemsPerPage
     }
   },
   methods: {
     toggleAll () {
       this.$emit('toggle-all', this.allChecked)
     },
     onPageChanged (page) {
       this.$emit('page-changed', page, this.itemsPerPage)
     },
     checkboxFilter () {
       this.$emit('item-checked')
     }
   },
   mounted () {
     this.toggleAll()
   }
 }
</script>
