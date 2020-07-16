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
const nodecrypto = require('crypto')
const argon2 = require('argon2')
const _ = require('lodash')
const AES_IV_LENGTH = 16
const TRIPLEDES_IV_LENGTH = 8
const TRIPLEDES_KEY_SIZE = 24
const DETERMINISTIC_ALGO = 'des-ede3-cbc'
const DB_ENCODING = 'base64'

let ENCRYPT = true

function findType (any) {
  return ['Array', 'Object', 'String', 'Number'].find((type) => _[`is${type}`](any))
}

function shouldKeyBeEncrypted (key) {
  return !['coinId', 'date', 'id', 'name'].includes(key)
}

function isKeyDeterministic (key) {
  return ['account_name', 'address'].includes(key)
}

function isOtherRadix (radix, prefix) {
  return function (input) {
    return typeof input === 'string' &&
      (prefix + parseInt(input, radix).toString(radix)).toUpperCase() === input.toUpperCase()
  }
}

// @key: key in Buffer type
function nodeEncrypt (text, key) {
  const iv = nodecrypto.randomBytes(AES_IV_LENGTH)
  let cipher = nodecrypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString(DB_ENCODING) + encrypted.toString(DB_ENCODING)
}

// @ciphertext: ciphertext in DB_ENCODING (base64)
// @key: key in Buffer type
function nodeDecrypt (ciphertext, key) {
  const iv = Buffer.from(ciphertext.slice(0, AES_IV_LENGTH * 1.5), DB_ENCODING) // 1.5 because of base64
  let encrypted = ciphertext.slice(AES_IV_LENGTH * 1.5)
  let encryptedText = Buffer.from(encrypted, DB_ENCODING)
  let decipher = nodecrypto.createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

// Check if input is hexaString
function isHexa (input) {
  return isOtherRadix(16, '0x')(input)
}

// Check if input is octalString
function isOctal (input) {
  return isOtherRadix(8, '0o')(input)
}

function encryptDeterministic (message, secret) {
  const key = secret.slice(0, TRIPLEDES_KEY_SIZE)
  const iv = Buffer.alloc(TRIPLEDES_IV_LENGTH, 0) // Initialization vector.
  const cipher = nodecrypto.createCipheriv(DETERMINISTIC_ALGO, key, iv)

  let encrypted = cipher.update(message, 'utf8', DB_ENCODING)
  encrypted += cipher.final(DB_ENCODING)
  return encrypted
}

function decryptDeterministic (ciphertext, secret) {
  // The IV is usually passed along with the ciphertext.
  const iv = Buffer.alloc(TRIPLEDES_IV_LENGTH, 0) // Initialization vector.

  const key = secret.slice(0, TRIPLEDES_KEY_SIZE)
  const decipher = nodecrypto.createDecipheriv(DETERMINISTIC_ALGO, key, iv)

  let decrypted = decipher.update(ciphertext, DB_ENCODING, 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

function uuidv4 () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

function hashFromArgonString (digest) {
  return _.last(digest.split('$'))
}

function convertString (input, from, to) {
  return Buffer.from(input, from).toString(to)
}

var InviziCrypto = {

  uuidv4: uuidv4,

  sha256 (value) {
    return nodecrypto.createHash('sha256').update(value).digest('hex')
  },

  getSalt ({raw = true} = {}) {
    const SALT_LENGTH = 16
    let result = nodecrypto.randomBytes(SALT_LENGTH)
    if (raw) {
      return result
    }
    return result.toString(DB_ENCODING)
  },

  // Hash the password using argon2id, generate salt if needed
  // @salt
  async hashPassword (password, salt) {
    let result = await argon2.hash(password, {salt: salt, type: argon2.argon2id})
    // result is of the form '$argon2id$v=19$m=4096,t=3,p=1$8x40JUhNrOCfYBZN3TIffZ3mRInJnw4ldKs2+i+WSaE$If8l45ISF/v+aY3mPROOaxdGlGXXtQSUYa1mqKgfDi'
    // return only the hash part
    let hashString = hashFromArgonString(result) // in base64
    return convertString(hashString, 'base64', 'hex')// in hex format
  },

  deactivate () {
    ENCRYPT = false
    return ENCRYPT
  },

  activate () {
    ENCRYPT = true
    return ENCRYPT
  },

  // @any: any object, string, number
  // @key: the key to encrypt with: 256 bits in hex format
  encrypt (any, key) {
    if (!ENCRYPT) return arguments[0]
    let typeFound = findType(any)
    if (typeFound == null) {
      return any
    } else if (typeFound) {
      return this[`encrypt${typeFound}`].apply(this, arguments)
    } else {
      throw new Error('Invalid type to encrypt')
    }
  },

  // @any: any object, string, number
  // @key: the key to decrypt with: 256 bits in hex format
  decrypt (any, key) {
    if (!ENCRYPT) return arguments[0]
    let typeFound = findType(any)

    if (typeFound == null) {
      return any
    } else if (typeFound) {
      return this[`decrypt${typeFound}`].apply(this, arguments)
    } else {
      throw new Error('Invalid type to decrypt')
    }
  },

  encryptNumber (messageOrig, key) {
    return this.encryptString(`${messageOrig}`, key)
  },

  decryptNumber (ciphertext, key) {
    return this.decryptString(ciphertext, key)
  },

  // @key: key string in hex format
  // (length of the string should be 64 = 32 bytes)
  encryptString (messageOrig, key) {
    if (!ENCRYPT) return arguments[0]
    var message = messageOrig
    if (_.isNaN(message) || message === undefined || message === null) {
      return message
    } else {
      message = messageOrig.toString()
    }
    return nodeEncrypt(message, Buffer.from(key, 'hex'))
  },

  // @ciphertext: ciphertext in DB_ENCODING format (base64)
  // @key: key string in hex format
  // (length of the string should be 64 = 32 bytes)
  decryptString (ciphertext, key) {
    if (!ENCRYPT) return arguments[0]
    if (_.isNaN(ciphertext) || ciphertext === undefined || ciphertext === null) {
      return ciphertext
    }
    let result = nodeDecrypt(ciphertext, Buffer.from(key, 'hex'))
    let possibleFloat = +result

    // Check if hexastring
    if (!_.isNaN(possibleFloat) && !isHexa(result) && !isOctal(result)) {
      result = possibleFloat
    }
    return result
  },

  encryptArray (array, key) {
    if (!ENCRYPT) return arguments[0]
    return array.map((val) => {
      return this.encrypt(val, key)
    })
  },

  decryptArray (array, key) {
    if (!ENCRYPT) return arguments[0]
    return array.map((val) => {
      return this.decrypt(val, key)
    })
  },

  // Decrypt object (date key is not encrypted)
  encryptObject (object, key) {
    if (!ENCRYPT) return arguments[0]
    if (_.isObject(object)) {
      return _.mapValues(object, (val, k) => {
        if (['Object', 'Array'].includes(findType(val))) {
          return this.encrypt(val, key)
        } else if (!shouldKeyBeEncrypted(k)) {
          return val
        } else if (isKeyDeterministic(k)) {
          return encryptDeterministic(val, key)
        } else {
          return this.encryptString(val, key)
        }
      })
    } else {
      throw new Error('must pass an object')
    }
  },

  // Decrypt object (date key is not decrypted
  decryptObject (object, key) {
    if (!ENCRYPT) return arguments[0]
    if (_.isObject(object)) {
      let result = _.mapValues(object, (val, k) => {
        if (['Object', 'Array'].includes(findType(val))) {
          return this.decrypt(val, key)
        } else if (val === undefined || val === null || !shouldKeyBeEncrypted(k)) {
          return val
        } else if (isKeyDeterministic(k)) {
          return decryptDeterministic(val, key)
        } else {
          return this.decryptString(val, key)
        }
      })
      return result
    } else {
      throw new Error('must pass an object')
    }
  }
}

export const sha256 = InviziCrypto.sha256

export { DB_ENCODING }

export default InviziCrypto
