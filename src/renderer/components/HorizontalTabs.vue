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
  <div class="tabs tabs--horizontal">
    <!-- Nav tabs -->
    <div class="tabs--menu">
      <ul class="nav" style="" :class="{'fit-title-container': fit}">
        <li v-for="(compo, index) in comps" :class="{active: selected === index, 'fit-title': fit}">
          <a class="nav-link waves-light waves-effect waves-light"
             role="tab" @click="onSelect(compo, index)"
             aria-expanded="true">{{compo.title}}</a>
        </li>
        <li style="flex: 1; background-color: var(--background-color); border-bottom: 1px solid var(--gray-light)" v-if="fit">
          <a class="nav-link waves-light waves-effect waves-light invisible"
             role="tab" aria-expanded="true">X</a>
        </li>
      </ul>
    </div>
    <!-- Tab panels -->
    <div class="tabs--content">
      <div v-for="(compo, index) in comps" :class="{active: selected === index}" class="tab-pane fade in show">
        <keep-alive>
          <transition
            name="custom-classes-transition"
            enter-active-class="animated fadeIn">
            <slot :name='compo.id || compo.title' v-if="selected === index"></slot>
          </transition>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
 export default {
   props: ['comps', 'fit'],
   data () {
     return {
       selected: 0
     }
   },
   methods: {
     onSelect (compo, compoIndex) {
       this.selected = compoIndex
     },
     slotName (index) {
       return 'content' + index
     }
   }
 }
</script>

<style scoped lang="scss">
 .tabs--content {
   padding: 1rem;
 }

 .tabs--menu ul {
   position: relative;
   top: 1px;
   display: flex;
   align-content: space-around;
   li {
     padding: 0.3rem 0;
     flex: 1;
     text-align: center;
     background-color: #3a3a3a;
     /* border-right: 3px solid #1f1f1f; */
     border-bottom: 1px solid var(--gray-light);
     border-top: 1px solid transparent;
   }
   li.active {
     border-bottom: none;
   }
   li:nth-last-child(1) {
     border-right: none;
   }
 }

 .tabs--content .active {
   display: block;
 }

 .tabs--content > div {
   display: none;
 }

 .tabs--horizontal .tabs--menu li.active {
   border-top: 1px solid var(--primary);
   border-right: 1px solid var(--gray-light);
   border-left: 1px solid var(--gray-light);
   background-color: var(--background-color);
 }

 .fit-title {
   min-width: 200px;
   flex: 0 !important;
 }

 .fit-title-container {
   align-items: flex-start;
 }
</style>
