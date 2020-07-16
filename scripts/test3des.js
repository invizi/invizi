const forge = require('node-forge')
const SHA256 = require('crypto-js/sha256') // TODO use node crypto
const TRIPLEDES_IV_LENGTH = 8
const TRIPLEDES_KEY_SIZE = 24

function encrypt (message, secret) {
  let cipher = forge.cipher.createCipher('3DES-CFB', secret.slice(0, TRIPLEDES_KEY_SIZE))
  const iv = forge.random.getBytesSync(TRIPLEDES_IV_LENGTH)
  cipher.start({iv: iv})
  cipher.update(forge.util.createBuffer(message))
  cipher.finish()
  let result = cipher.output.toHex()
  console.log(result)
  return result
}

function decrypt (ciphertext, secret) {
  let decipher = forge.cipher.createDecipher('3DES-CFB', secret.slice(0, TRIPLEDES_KEY_SIZE))
  const iv = forge.random.getBytesSync(TRIPLEDES_IV_LENGTH)
  // const iv = ciphertext.slice(0, TRIPLEDES_IV_LENGTH)
  decipher.start({iv: iv})
  decipher.update(forge.util.createBuffer(forge.util.hexToBytes(ciphertext)))
  decipher.finish()
  console.log(decipher.output.toString())
  return decipher.output.toString()
}

let message = 'Hello World'
let password = 'mypassword'

let hashedPassword = SHA256(password).toString()

let ciphertext = encrypt(message, hashedPassword)
let decipherText = decrypt(ciphertext, hashedPassword)
console.log(decipherText)
