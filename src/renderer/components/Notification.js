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
import InviziCache from '@/components/InviziCache'
import EventBus from '@/components/EventBus'
import axios from '@/utils/InviziAxios'
const USE_LOCAL_URL = true
const MAX_NOTIFICATIONS = 20

const ROOT_URL = USE_LOCAL_URL ? 'http://0.0.0.0:3000' : 'https://api.invizi.co'
const END_POINT = `${ROOT_URL}/notifications.json`

const parseBody = body => body.replace(/\[(.*)\]\((.*)\)/, '<a href="$2">$1</a>')

let Notification = {

  async get () {
    let response = await axios.get(END_POINT, { crossdomain: true })
    let notifications = response.data || []
    notifications = notifications.slice(0, MAX_NOTIFICATIONS)
    EventBus.$emit('Notification/get', notifications)
    InviziCache.setItem('Notification.get', notifications, {persistent: true})
    return notifications
  },

  toHtml (notifications) {
    return notifications.map(notification => Object.assign({}, notification, {bodyHtml: parseBody(notification.body)}))
  },

  last () {
    return InviziCache.getItem('Notification.get')
  }
}

export default Notification
