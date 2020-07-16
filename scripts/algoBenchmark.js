const Benchmark = require('benchmark')
const crypto = require('crypto')
const forge = require('node-forge')
const AES_IV_LENGTH = 16
var suite = new Benchmark.Suite

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const key = sha256('hello').slice(0, 32)
const key2 = sha256('hello2').slice(0, 32)
const message = 'to be or not to be'

function encrypt (text, algo) {
  const iv = crypto.randomBytes(AES_IV_LENGTH)
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  // console.log(iv.toString('hex').length)
  return iv.toString('base64') + encrypted.toString('base64')
}

function decrypt (ciphertext) {
  // console.log(ciphertext.length)
  const iv = Buffer.from(ciphertext.slice(0, AES_IV_LENGTH * 1.5), 'base64') // because of base64
  // console.log(iv.length)
  let encrypted = ciphertext.slice(AES_IV_LENGTH * 1.5)
  let encryptedText = Buffer.from(encrypted, 'base64')
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key2), iv)
  let decrypted = decipher.update(encryptedText)
  console.log(decrypted)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

console.log(decrypt(encrypt(message)))

function nodeCrypto (cipherAlgoritm) {
  // var cipher = crypto.createCipher(cipherAlgoritm, key)
  // var encrypted = cipher.update(message, 'utf8', 'hex') + cipher.final('hex')
  // var decipher = crypto.createDecipher(cipherAlgoritm, key)
  // let result = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')
  // decrypt(encrypt(message))
}
// add tests
suite.add('node crypto encrypt decrypt', function () {
  nodeCrypto('aes-256-ecb')
})
  .add('forge encrypt decrypt', function () {
    var cipher = forge.cipher.createCipher('AES-CBC', key)
    let iv = forge.random.getBytesSync(AES_IV_LENGTH)
    cipher.start({iv: iv})
    cipher.update(forge.util.createBuffer(message))
    cipher.finish()
    let ciphertext = iv + cipher.output.toHex()

    iv = ciphertext.slice(0, AES_IV_LENGTH)
    let encrypted = ciphertext.slice(AES_IV_LENGTH)
    var decipher = forge.cipher.createDecipher('AES-CBC', key.slice(0, 32))
    decipher.start({iv: iv})
    decipher.update(forge.util.createBuffer(forge.util.hexToBytes(encrypted)))
    decipher.finish()
    decipher.output.toString()
  })
// add listeners
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
// run async
  .run({ 'async': true })
