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
const moment = require('moment')

let fieldValidator = {
  hasValue (fieldName) {
    return (value) => {
      return !!value || `${fieldName} is required`
    }
  },

  positiveNumber (fieldName) {
    return (value) => {
      return value > 0 || `${fieldName} should be greater than 0`
    }
  },

  date (fieldName) {
    return (value) => {
      return moment(value).isValid() || `${fieldName} should be valid`
    }
  },

  positiveIfValueisPresent (fieldName) {
    return (value) => {
      if (value) {
        return value > 0 || `${fieldName} should be greater than 0`
      } else if (value === 0) {
        return `${fieldName} should be greater than 0`
      }
      return true
    }
  }
}

export default fieldValidator
