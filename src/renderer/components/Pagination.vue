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
  <span ng-show="length > 1" class="pagination-container">
    <a class="next-page" :class="{'invisible': currentPage <= 1}" @click="firstPage"><i class="fa fa-2x fa-angle-double-left" title="first"></i></a>
    <a class="previous-page" :class="{'invisible': currentPage <= 1}" @click="previousPage"><i class="fa fa-2x fa-angle-left" title="previous"></i></a>
    <div class="page-numbers">
      <input type="text" style="width:40px;text-align: center" v-model="currentPage">
      <span>/</span>
      <span>{{this.length}}</span>
    </div>
    <a class="next-page" :class="{'invisible': currentPage >= length}" @click="nextPage"><i class="fa fa-2x fa-angle-right" title="next"></i></a>
    <a class="next-page" :class="{'invisible': currentPage >= length}" @click="lastPage"><i class="fa fa-2x fa-angle-double-right" title="last"></i></a>
  </span>
</template>

<script>
  export default {
    props: {
      length: {
        type: Number
      },
      page: {
        type: Number,
        default: 1
      }
    },
    data: function () {
      return {
        currentPage: this.page
      }
    },
    watch: {
      currentPage (newPage) {
        this.$emit('page-changed', newPage)
      }
    },
    methods: {
      firstPage () {
        this.currentPage = 1
      },
      lastPage () {
        this.currentPage = this.length
      },
      previousPage () {
        if (this.currentPage > this.length) {
          this.currentPage = this.length
        } else if (this.currentPage > 1) {
          this.currentPage = this.currentPage - 1
        }
      },
      nextPage () {
        if (this.currentPage < this.length) {
          this.currentPage = this.currentPage + 1
        }
      }
    }
  }
</script>
<style>
 .page-numbers {
   display: inline-block;
   margin-right: 5px;
 }
 .page-numbers * {
   position: relative;
   top: -5px;
 }
 .next-page {
  user-select: none;
 }
</style>
