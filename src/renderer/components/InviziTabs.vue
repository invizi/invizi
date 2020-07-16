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
  <div class="vertical-tabs">
    <div class="vertical-tabs--menu">
      <ul>
        <li v-for="(compo, index) in comps" :class="{active: selected === index}">
          <a href="" @click="onSelect(index)">{{compo.title}}</a>
        </li>
      </ul>
    </div>
    <div class="vertical-tabs--content">
      <div v-for="(compo, index) in comps" :class="{active: selected === index}">
        <component :is="compo"></component>
      </div>
    </div>
  </div>
</template>

<script>
 export default {
   props: ['comps'],
   data () {
     return {
       selected: 0
     }
   },
   methods: {
     onSelect (compoIndex) {
       this.selected = compoIndex
     }
   }
 }
</script>

<style scoped lang="scss">
 .vertical-tabs {
   display: flex;
   margin-left: -1rem; // to remove gap introduced by .main-content
 }

 .vertical-tabs--menu {
   flex: 1;
   padding-top: 2rem;
   a {
     color: #fff;
     display: inline-block;
     padding: 1rem 1.5rem 1rem 3rem;
     width: 100%;
     text-decoration: none;
     font-size: 1.2rem;
   }

   ul {
     list-style: none;
     min-height: 100vh;
     border-right: 1px solid var(--light-border);

     li.active {
       a, a:hover {
         /* border-right: 5px solid var(--primary); */
         background-image: linear-gradient(to right, #262626 93%, hsla(191, 100%, 65%, 0.67));
         color: var(--primary);
       }
     }
     li a:hover {
       background-color: var(--gray-darker);
       color: var(--white-text-color);
     }
   }
 }

 .vertical-tabs--content {
   flex: 4;
   padding: 3rem 1.5rem 1rem 5rem;
 }

 .vertical-tabs--content .active {
   display: block;

 }

 .vertical-tabs--content > div {
   display: none;
 }
</style>
