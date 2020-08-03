import utils from '../utils'

const add1Bitcoin = async (browser) => {
  await browser.setValue('#quantity', '1')
  await browser.click('#coins')
  await browser.click('.select-coin-image')
  await browser.setValue('#trade-date', '2016-01-16')
  await browser.click('#save')
}

const navigateTo = async (browser, path) => {
  await browser.click(`aside li a[href='#/${path}'`)
}

const amountTextToFloat = (amount) => parseFloat(amount.trim().replace(/[$,]/g, ''))

const getDashboardBalance = async (browser) => {
  let amount = await browser.getText('.big-title')
  return amountTextToFloat(amount)
}

describe.only('Creating a new account with success', function () {
  let app
  before(async () => {
    app = await utils.launchApp()
  })

  after(async () => {
    await utils.stopApp(app)
  })

  it('creates the account', async function () {
    let browser = app.client
    this.timeout(10000)
    await browser.waitForVisible('#new-password', 5000)
    await browser.setValue('#new-password', 'myPassword123')
    await browser.setValue('#confirm-password', 'myPassword123')
    browser.click('#create-account')

    await browser.waitForVisible('#account-type', 2000)

    const accountType = await browser.getText('.input-group__selections__comma')
    expect(accountType).to.equal('local')
    await browser.setValue('#account-name', 'wallet1')
    browser.click('#create-account')
    await browser.waitForVisible('#account-balance-amount', 2000)
    let accountBalanceAmount = await browser.getText('#account-balance-amount')
    expect(accountBalanceAmount).to.equal('$0.00')

    await add1Bitcoin(browser)

    let balanceAmount = await browser.getText('#account-balance-amount')
    balanceAmount = amountTextToFloat(balanceAmount)
    expect(balanceAmount).to.be.above(3000)
    let balanceAmountBtc = await browser.getText('#account-balance-amount-btc')
    expect(balanceAmountBtc).to.equal('1.00000000')
    await browser.waitForVisible('.table tr', 2000)
    let tradeDate = await browser.$('.table tr > td').getText()
    expect(tradeDate).to.equal('16-01-2016 00:00:00')
    let tradeQuantity = await browser.$('.table tr td:nth-child(2) .trade-label-quantity').getText()
    expect(tradeQuantity).to.equal('1')
    let tradeCoin = await browser.$('.table tr td:nth-child(2) .coin-image-label').getText()
    expect(tradeCoin).to.equal('bitcoin')

    await browser.click('.table tr .delete-order-history')

    await browser.waitForVisible('.dialog.dialog--active .card__text')
    let deleteMessage = await browser.getText('.dialog.dialog--active .card__text')
    expect(deleteMessage).to.equal('Are you sure you want to delete this transaction?')
    await browser.waitForVisible('.dialog.dialog--active button.confirm', 2000)
    await browser.click('.dialog.dialog--active button.confirm')

    await browser.waitForVisible('.table', 2000, true)

    await add1Bitcoin(browser)
  })

  it('navigates to dashboard and display correctly', async function () {
    let browser = app.client
    await navigateTo(browser, 'main-dashboard')
    let dashboardAmount = await getDashboardBalance(browser)
    expect(dashboardAmount).to.be.above(3000)
    browser.isExisting('#historic svg')
    browser.isExisting('#historic-slice-pie svg')
    browser.click('#tab-balance-by-coin')
  })

  it('shows balance by coin correctly', async function () {
    let browser = app.client
    browser.click('#tab-balance-by-coin')
    browser.isExisting('#full-portfolio-chart svg')
    browser.isExisting('.table tr td')
  })

  it('shows balance by exchange correctly', async function () {
    let browser = app.client
    browser.click('#tab-balance-by-exchange')
    browser.isExisting('#exchange-portfolio-chart svg')
    browser.isExisting('.table tr td')
  })

  it('shows balance by fiat/crypto correctly', async function () {
    let browser = app.client
    browser.click('#tab-balance-fiat-crypto')
    browser.isExisting('#fiat-crypto-portfolio-chart svg')
    browser.isExisting('.table tr td')
  })

  it('shows balance by local/online correctly', async function () {
    let browser = app.client
    browser.click('#tab-balance-local-online')
    browser.isExisting('#local-online-portfolio-chart svg')
    browser.isExisting('.table tr td')
  })

  it('shows performance correctly', async function () {
    let browser = app.client
    browser.click('#tab-historical-performance')
    browser.isExisting('#performance-chart svg')
    browser.isExisting('.table tr td')
  })

  it('deletes the account', async function () {
    this.timeout(10000)
    let browser = app.client
    await navigateTo(browser, 'accounts/local1')
    await browser.click('#account-balance-amount')
    await browser.pause(2000)
    await browser.waitForVisible('#account-menu .menu__activator i', 5000)
    await browser.click('#account-menu-activator')
    await browser.waitForVisible('.list.menu-contextual div:nth-child(2)', 5000)
    await browser.click('.list.menu-contextual div:nth-child(2)')

    await browser.waitForVisible('.dialog.dialog--active .card__text')
    let deleteMessage = await browser.getText('.dialog.dialog--active .card__text')
    expect(deleteMessage).to.equal('Are you sure you want to delete this account?')
    await browser.click('.dialog.dialog--active .confirm')
    await browser.waitForVisible('#account-type', 3000)
  })
})
