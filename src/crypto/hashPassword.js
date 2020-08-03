import { last } from 'lodash'
import argon2 from 'argon2'

function hashFromArgonString (digest) {
  return last(digest.split('$'))
}

function convertString (input, from, to) {
  return Buffer.from(input, from).toString(to)
}

async function hashPassword (password, salt) {
  let result = await argon2.hash(password, {salt: salt, type: argon2.argon2id})
  // result is of the form '$argon2id$v=19$m=4096,t=3,p=1$8x40JUhNrOCfYBZN3TIffZ3mRInJnw4ldKs2+i+WSaE$If8l45ISF/v+aY3mPROOaxdGlGXXtQSUYa1mqKgfDi'
  // return only the hash part
  let hashString = hashFromArgonString(result) // in base64
  return convertString(hashString, 'base64', 'hex')// in hex format
}

export default hashPassword
