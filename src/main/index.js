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
'use strict'

import { app, BrowserWindow, Menu } from 'electron'
import { autoUpdater } from 'electron-updater'
import hashPassword from '../crypto/hashPassword'
const electron = require('electron')
const ipcMain = electron.ipcMain

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const workerURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/worker.html`
  : `file://${__dirname}/worker.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    title: 'Invizi',
    titleBarStyle: 'hidden',
    webPreferences: {
      webSecurity: false,
      // enableRemoteModule: false,
      nodeIntegration: true,
      sandbox: false
    },
    backgroundColor: '#262626'
  })

  mainWindow.setMenuBarVisibility(false)

  mainWindow.webContents.on('will-navigate', (event, url) => {
    event.preventDefault()
  })
  ipcMain.on('worker-ready', (event, data) => {
    mainWindow.loadURL(winURL)
    mainWindow.maximize()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.webContents.on('did-finish-load', function () { })

  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
  })

  let workerWindow = new BrowserWindow({
    show: process.env.NODE_ENV === 'development',
    title: 'Worker',
    webPreferences: {
      nodeIntegration: true
    }
  })
  workerWindow.loadURL(workerURL)

  ipcMain.on('worker-request', (event, input) => {
    workerWindow.webContents.send('worker-request', input)
  })

  ipcMain.on('worker-response', (event, output) => {
    mainWindow.webContents.send('worker-response', output)
  })

  ipcMain.on('hashPassword', (_e, output) => {
    let [password, salt] = output.data
    salt = Buffer.from(salt)
    hashPassword(password, salt).then(hashedPassword => {
      mainWindow.webContents.send('hashPassword', {data: hashedPassword})
    })
  })

  workerWindow.on('closed', () => {
    app.quit()
  })
  mainWindow.on('closed', () => {
    app.quit()
  })
}

function newWindow () {
  const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`
  let win = new BrowserWindow({width: 800, height: 600})
  win.on('closed', () => {
    win = null
  })

  // Load a remote URL
  win.loadURL(winURL)
}

function addMenu () {
  const template = [
    {
      label: 'Invizi',
      submenu: [
        {role: 'quit'}
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'pasteandmatchstyle'},
        {role: 'delete'},
        {role: 'selectall'}
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    {
      role: 'window',
      submenu: [
        {role: 'close'},
        {role: 'minimize'},
        {role: 'zoom'},
        {
          label: 'New Window',
          click () { newWindow() }
        },
        {type: 'separator'},
        {role: 'front'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click () { require('electron').shell.openExternal('https://invizi.co') }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

app.on('ready', createWindow)
app.on('ready', addMenu)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdatesAndNotify()
})
