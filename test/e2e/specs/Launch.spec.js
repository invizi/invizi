import utils from '../utils'

describe.only('Creating a new account with different passwords', function () {
  let app
  beforeEach(async () => {
    app = await utils.launchApp()
  })

  afterEach(async () => {
    await utils.stopApp(app)
  })

  // before(utils.launchApp)
  // after(utils.stopApp)
  it('displays correctly', async function () {
    this.timeout(10000)
    const browser = app.client
    // New password and Confirm password fields should be there
    await browser.waitForVisible('#new-password', 5000)
    let confirmPasswordEls = await browser.$('#confirm-password')
    expect(!!confirmPasswordEls.value).to.equal(true)

    // Single password field should not be there
    let passwordEls = await browser.$$('#password')
    expect(passwordEls.length).to.equal(0)
    const confirmPassword = 'myPassword345'
    await browser.setValue('#new-password', 'myPassword123')
    await browser.setValue('#confirm-password', confirmPassword)
    browser.click('#create-account')
    const notMatchingError = await browser.getText('#error-msg')
    expect(/do not match/.test(notMatchingError)).to.equal(true)
    // Navigation menu should not be visible
    // Click Create Account should display an error
    // Fill the fields with different passwords should display an error
  })
})
