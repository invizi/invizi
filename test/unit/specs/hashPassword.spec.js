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
import InviziCrypto from '@/components/InviziCrypto'
import hashPassword from '@/crypto/hashPassword'
const SALT = InviziCrypto.getSalt()

describe.only('hashPassword', () => {
  const password = 'super$password54'
  const badPassword = 'mybadpass123#'
  let key, key2

  it('hashes the password correctly', async () => {
    key = await hashPassword(password, SALT)
    expect(key.length).to.be.equal(64) // 32 bytes
    key2 = await hashPassword(badPassword, SALT)
    expect(key.length).to.be.equal(64) // 32 bytes
  })

})
