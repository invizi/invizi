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
  <div class="section">
    <h3 class="title--separator">Delete Invizi Database</h3>
    <div class="col-lg-3">
      <button type="button" class="btn btn-block btn-primary waves-effect
                    waves-light" @click="emptyInviziAccount()">Reset</button>
    </div>
  </div>
</template>

<script>
 import DatabaseHelper from '@/utils/DatabaseHelper'
 import ElectronUtils from '@/utils/ElectronUtils'
 export default {
   title: 'Delete Database',
   methods: {
     async emptyInviziAccount () {
       await DatabaseHelper.reset()
       ElectronUtils.relaunchApp()
     }
   }
 }
</script>
