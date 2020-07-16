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
import EventBus from '@/components/EventBus'

let dialog = {
  show (data) {
    EventBus.$emit('Dialog/show', data)
  },
  error (message) {
    EventBus.$emit('Dialog/show', {message: message, status: 'error'})
  },
  success (message) {
    EventBus.$emit('Dialog/show', {message: message, status: 'success'})
  },
  confirm (message) {
    EventBus.$emit('Dialog/show', {message: message, status: 'success'})
  }
}

export default dialog
