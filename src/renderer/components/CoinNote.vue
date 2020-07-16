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
    <p v-if="saved" class="notice"><em>All changes encrypted and saved.</em></p>
    <p v-else class="notice"><em>Saving locally...</em></p>
    <div id="editor-container"></div>
  </div>
</template>

<script>
 import CoinNote from '@/models/CoinNote'
 const Quill = require('quill')
 const Delta = Quill.import('delta')
 let quill
 export default {
   name: 'coin-note',
   title: 'Notes',
   id: 'coin-note',
   props: ['coinId'],
   methods: {
   },
   data () {
     return {
       change: new Delta(),
       saved: true
     }
   },
   watch: {
     change (change) {
       this.saved = change.length() === 0
     },
     coinId (newCoinId) {
       CoinNote.get(this.coinId).then((result) => {
         if (result && result.text) {
           quill.setContents(result.text)
         } else {
           quill.setContents(undefined)
           this.change = new Delta()
           this.saved = true
         }
       })
     }
   },
   mounted () {
     quill = new Quill('#editor-container', {
       modules: {
         formula: true,
         toolbar: [
           [{ header: [1, 2, false] }],
           ['bold', 'italic', 'underline'],
           ['image', 'video', 'code-block'],
           ['formula']
         ]
       },
       placeholder: 'My Trade Secrets...',
       theme: 'snow'
     })

     let that = this

     // Store accumulated changes
     quill.on('text-change', function (delta) {
       that.change = that.change.compose(delta)
     })

     // Save periodically
     setInterval(function () {
       if (that.coinId && that.change.length() > 0) {
         CoinNote.save({
           coinId: that.coinId,
           text: quill.getContents()
         })
         that.change = new Delta()
       }
     }, 2 * 1000)
   }
 }
</script>

<style lang="scss">
 #editor-container {
   height: 375px;
   border-color: var(--light-border);
 }

 .ql-snow {
   .ql-stroke, .ql-fill {
     stroke: var(--gray-primary)
   }
   .ql-tooltip {
     background-color: var(--background-color);
   }
   .ql-picker-options {
     background-color: var(--background-color);
   }
 }

 .ql-snow .ql-picker, .ql-editor.ql-blank::before {
   color: var(--gray-primary)
 }

 .ql-toolbar.ql-snow {
   border: none;
 }

 .ql-container {
   font-family: var(--font-family-text);
 }

 .ql-snow.ql-toolbar button:hover .ql-stroke {
   stroke: var(--primary);
   fill: var(--primary);
 }
</style>
