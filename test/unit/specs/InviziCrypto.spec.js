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
const _ = require('lodash')
const SALT = InviziCrypto.getSalt()

describe.only('InviziCrypto', () => {
  const message = 'In code we trust'
  const password = 'super$password54'
  const badPassword = 'mybadpass123#'
  let key, key2
  const arrString1 = ['message1', 'message2']
  const arrObj1 = [{foo: 'message1', bar: 1}, {foo: 'message2', bar: 2}]
  var isArrayEqual = function (x, y) {
    return _(x).differenceWith(y, _.isEqual).isEmpty()
  }

  it('hashes the password correctly', async () => {
    key = await InviziCrypto.hashPassword(password, SALT)
    expect(key.length).to.be.equal(64) // 32 bytes
    key2 = await InviziCrypto.hashPassword(badPassword, SALT)
    expect(key.length).to.be.equal(64) // 32 bytes
  })

  it('encrypt - decrypt Strings correctly', () => {
    var ciphertext = InviziCrypto.encryptString(message, key)
    var plaintext = InviziCrypto.decryptString(ciphertext, key)
    expect(plaintext).to.be.equal(message)
    expect(() => { InviziCrypto.decryptString(ciphertext, key2) }).to.throw()
  })

  it('encrypt - decrypt special values', () => {
    var ciphertext = InviziCrypto.encryptString(NaN, key)
    var plaintext = InviziCrypto.decryptString(ciphertext, key)
    expect(_.isNaN(plaintext)).to.be.equal(true)
  })

  it('encrypt - decrypt arrays of string', () => {
    var ciphertext = InviziCrypto.encryptArray(arrString1, key)
    var plaintext = InviziCrypto.decryptArray(ciphertext, key)
    expect(isArrayEqual(arrString1, plaintext)).to.be.equal(true)
  })

  it('encrypt - decrypt arrays of objects', () => {
    var ciphertext = InviziCrypto.encryptArray(arrObj1, key)
    var plaintext = InviziCrypto.decryptArray(ciphertext, key)
    expect(isArrayEqual(arrObj1, plaintext)).to.be.equal(true)
  })

  it('encrypt - decrypt Objects correctly', () => {
    const obj1 = {from: 'USD', quantity_from: null, to: 'BTC', quantity_to: 1, date: 1515609000, account_name: 'Coinbase'}
    var cipherObj = InviziCrypto.encryptObject(obj1, key)
    expect(cipherObj.date).to.be.equal(obj1.date)
    var plaintext = InviziCrypto.decryptObject(cipherObj, key)
    expect(_.isEqual(plaintext, obj1)).to.be.equal(true)
  })

  it('encryptAny - decryptAny - string', () => {
    var ciphertext = InviziCrypto.encrypt(message, key)
    var plaintext = InviziCrypto.decrypt(ciphertext, key)
    expect(plaintext).to.be.equal(message)
    expect(() => { InviziCrypto.decryptString(ciphertext, key2) }).to.throw()
  })

  it('encryptAny - decryptAny - object', () => {
    const obj1 = {from: 'USD', quantity_from: null, to: 'BTC', quantity_to: 1, date: 1515609000, account_name: 'Coinbase'}
    var cipherObj = InviziCrypto.encrypt(obj1, key)
    expect(cipherObj.date).to.be.equal(obj1.date)
    var plaintext = InviziCrypto.decrypt(cipherObj, key)
    expect(_.isEqual(plaintext, obj1)).to.be.equal(true)
  })

  it('does nothing if not activated', () => {
    InviziCrypto.deactivate()
    var plaintext = InviziCrypto.encrypt(message, key)
    expect(plaintext).to.be.equal(message)
    InviziCrypto.activate()
  })

  it('encryptAny - decryptAny arrays of objects', () => {
    var ciphertext = InviziCrypto.encrypt(arrObj1, key)
    var plaintext = InviziCrypto.decrypt(ciphertext, key)
    expect(isArrayEqual(arrObj1, plaintext)).to.be.equal(true)
  })
})
