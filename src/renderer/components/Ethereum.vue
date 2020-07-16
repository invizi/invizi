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
    <div class="row">
    <div class="col-md-5" style="">
    <v-text-field
    label="Address"
    v-model="address"
    autofocus
    ></v-text-field>
    </div>
    <button type="button" class="btn btn-primary waves-effect
      waves-light" @click="check()">Check</button>
    </div>
    <p v-show="balance">Balance: {{balance}} Eth</p>
  </div>
</template>

<script>

const Web3 = require('web3')
const rpcURL = 'https://mainnet.infura.io/v3/XXX'
const web3 = new Web3(rpcURL)
export default {
  name: 'ethereum',
  data () {
    return {
      address: null,
      balance: null
    }
  },
  methods: {
    check () {
      web3.eth.getBalance(this.address, (err, wei) => {
        this.balance = web3.utils.fromWei(wei, 'ether')
        if (err) throw err
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
