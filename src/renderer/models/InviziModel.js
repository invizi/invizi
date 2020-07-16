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
import db from '@/components/InviziDatabase'

class InviziModel {
  table () {
    return db[this.tableName]
  }

  all () {
    return this.table().toArray()
  }

  get (primaryKey) {
    return this.table().get(primaryKey)
  }

  save (data) {
    return this.table().put(data)
  }

  delete (primaryKey) {
    return this.table().delete(primaryKey)
  }

  count () {
    return this.table().count()
  }

  async limit (number) {
    let all = await this.all()
    return all.slice(0, number)
  }
}

export default InviziModel
