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
  <div class="container">
    <div style="position: fixed; left: 5%; top: 20px;">
      <i v-tooltip.top="'Back'" class="clickable fa fa-chevron-left" title="back" @click="back()" style="color: var(--gray);"></i>
    </div>
    <h1 class="text-right">Help</h1>
    <br/>
    <h2>Support</h2>
    <p class="col-lg-6">Contact our support at support@invizi.co</p>
    <br/>
    <h2>Source Code</h2>
    <p class="col-lg-6">You can find our entire source code at https://github.com/invizi/invizi</p>
    <br/>
    <h2>How secure is Invizi ?</h2>
    <p class="col-lg-6">You can find our entire source code at https://github.com/invizi/invizi</p>
    <br/>
    <h2>Where is my data stored ?</h2>
    <p class="col-lg-6">Your data is stored locally only. Your transactions never leaves your computer. They are stored in IndexedDB database encrypted using AES and 3DES.</p>
    <br/>
    <br/>
    <h2>Where can I get the latest version</h2>
    <p class="col-lg-6">You can download the latest version at https://invizi.co/download or https://github.com/invizi/invizi/releases. Never download Invizi anywhere else to ensure your security and privacy.</p>
  </div>

</template>

<script>
 export default {
   name: 'help',
   methods: {
     back () {
       this.$router.go(-1)
     }
   },
   data () {
     return {
       drawer: true
     }
   }
 }
</script>
