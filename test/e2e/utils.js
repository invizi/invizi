import electron from 'electron'
import { Application } from 'spectron'

export default {
  async stopApp (app) {
    if (app && app.isRunning()) {
      return app.stop()
    }
  },
  async launchApp () {
    const app = new Application({
      path: electron,
      args: ['dist/electron/main.js'],
      startTimeout: 10000,
      webdriverOptions: {
        maxInstances: 1,
        capabilities: [{
          maxInstances: 1,
          browserName: 'chrome',
          'goog:chromeOptions': {
            args: [
              '--headless', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage --window-size=1920,1080',
              '--disable-translate', '--disable-extensions', '--disable-background-networking', '--disable-sync', '--disable-default-apps',
              '--mute-audio', '--no-first-run', '--disable-prompt-on-repost'
            ]
          }
        }]
      },
      waitTimeout: 60000
    })

    await app.start()
    await app.client.waitUntilWindowLoaded(20000)
    await app.client.pause(5000)
    await app.client.windowByIndex(1)
    let title = await app.client.browserWindow.getTitle()
    expect(title).to.equal('Invizi')
    await app.client.waitForVisible('#new-password', 5000)
    return app
  }

}
