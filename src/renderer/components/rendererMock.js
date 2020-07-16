/*
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
*/
// import ipcRendererMock from '@/components/ipcRendererMock'
// const fs = require('fs')

// Listen for async message from renderer process
// ipcRendererMock.on('request/historical', function (event, arg) {
//   console.log('inside historical')
//   console.log(arguments)
//   fs.readFile(`${__dirname}/data/histoday_${arg}.json`, 'utf8', function (err, data) {
//     console.log(arguments)
//     if (err) throw err
//     var result = JSON.parse(data)
//     console.log(this)
//     ipcRendererMock.send(`response/historical/${arg.toLowerCase()}`, result)
//   })
// })

var renderer = {}

export default renderer
