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
  <img :src="`static/images/coins2/${this.coinId}.png`" class="coinImage" :alt="this.coinId" onerror="this.src='static/images/empty.png';this.className += ' transparent-image'"
  v-if="this.coinId" :class="{'small': small}"/>
</template>

<script>
  export default {
    props: ['coinId', 'small']
  }
</script>

<style>
 img.coinImage {
   width: 32px;
   height: 32px;
   filter: sepia(100%) hue-rotate(160deg) saturate(120%);
 }

 .transparent-image {
   opacity: 0;
 }

 img.small {
   height: 25px;
   width: 25px;
 }
</style>
