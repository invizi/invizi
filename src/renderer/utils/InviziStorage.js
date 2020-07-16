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
let InviziStorage = {

  /** Tries to convert to persisted storage.
  @returns {Promise<boolean>} Promise resolved with true if successfully
  persisted the storage, false if not, and undefined if the API is not present.
  */
  async persist () {
    return await navigator.storage && navigator.storage.persist &&
      navigator.storage.persist()
  },

  /** Check if storage is persisted already.
  @returns {Promise<boolean>} Promise resolved with true if current origin is
  using persistent storage, false if not, and undefined if the API is not
  present.
  */
  async isStoragePersisted () {
    return await navigator.storage && navigator.storage.persisted ? navigator.storage.persisted()
      : undefined
  },

  /** Queries available disk quota.
  @see https://developer.mozilla.org/en-US/docs/Web/API/StorageEstimate
  @returns {Promise<{quota: number, usage: number}>} Promise resolved with
  {quota: number, usage: number} or undefined.
  */
  async estimatedQuota () {
    return await navigator.storage && navigator.storage.estimate ? navigator.storage.estimate()
      : undefined
  },

  /** Tries to persist storage without ever prompting user.
  @returns {Promise<string>}
    "never" In case persisting is not ever possible. Caller don't bother
      asking user for permission.
    "prompt" In case persisting would be possible if prompting user first.
    "persisted" In case this call successfully silently persisted the storage,
      or if it was already persisted.
      */
  async tryPersistWithoutPromtingUser () {
    if (!navigator.storage || !navigator.storage.persisted) {
      return 'never'
    }
    let persisted = await navigator.storage.persisted()
    if (persisted) {
      return 'persisted'
    }
    if (!navigator.permissions || !navigator.permissions.query) {
      return 'prompt' // It MAY be successful to prompt. Don't know.
    }
    const permission = await navigator.permissions.query({
      name: 'persistent-storage'
    })

    if (permission.status === 'granted') {
      persisted = await navigator.storage.persist()
      if (persisted) {
        return 'persisted'
      } else {
        throw new Error('Failed to persist')
      }
    }
    if (permission.status === 'prompt') {
      return 'prompt'
    }
    return 'never'
  },

  async initStoragePersistence () {
    const persist = await this.tryPersistWithoutPromtingUser()
    switch (persist) {
      case 'never':
        console.log('Not possible to persist storage')
        break
      case 'persisted':
        // console.log('Successfully persisted storage silently')
        break
      case 'prompt':
        console.log('Not persisted')
        break
    }
  }
}

export default InviziStorage
