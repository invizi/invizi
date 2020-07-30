import utils from '../utils'

describe.only('Creating a new account with no passwords', function () {
  let app
  beforeEach(async function () {
    app = await utils.launchApp()
  })

  afterEach(async () => {
    await utils.stopApp(app)
  })

  // before(utils.launchApp)
  // after(utils.stopApp)
  it('fails when no passwords are provided', async function () {
    this.timeout(10000)
    const browser = app.client
    // New password and Confirm password fields should be there
    await browser.waitForVisible('#new-password', 5000)
    browser.click('#create-account')
    const notMatchingError = await browser.getText('#error-msg')
    expect(/do not match/.test(notMatchingError)).to.equal(true)
  })
})
