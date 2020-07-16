import utils from '../utils'

describe('Launch', function () {
  beforeEach(utils.beforeEach)
  afterEach(utils.afterEach)

  it('shows the proper application title', function () {
    this.timeout(30000)
    return this.app.client.windowHandles()
      .then((handles) => {
        console.log(handles)
        const windowA = handles.value[0]
        const windowB = handles.value[1]
        console.log(windowA)
        console.log(windowB)
        this.app.client.window(windowB)
        // app.client.window(windowB)

        return this.app.client.getText('#elem')
          .then(titles => {
            console.log(titles)
            expect(titles).to.equal('Lorem')
          })
        // return this.app.client.getTitle()
        //   .then(title => {
        //     console.log(title)
        //     expect(title).to.equal('electron-vue')
        //   })
      })
  })

  // it('get the text', function () {
  //   return this.app.client.getText('.title')
  //     .then(titles => {
  //       console.log(titles)
  //       expect(titles[0]).to.equal('Welcome to your new project!')
  //     })
  // })

  // it('tests the title', function () {
  //   this.app.client.$('span').then(function (elem) {
  //     console.log(elem)
  //     console.log(elem.getText())
  //     return expect(elem).to.equal(true)
  //   })
  // })

  // it('does not have the developer tools open', async () => {
  //   const devToolsAreOpen = await this.app.client.waitUntilWindowLoaded().browserWindow.isDevToolsOpened()
  //   return assert.equal(devToolsAreOpen, false)
  // })

  // it('opens a window', function () {
  // this.app.client.waitUntilTextExists('#elem', 'Lorem2', 30000)
  // this.app.client.waitUntilWindowLoaded(30000)

  // return this.app.client.getText('').then(function (text) {
  //   console.log('The #license-key-label content is ' + text)
  //   expect(text).to.equal('Lorem')
  // })
  // })
  // it('shows the proper application title', function () {
  //   waitUntilWindowLoaded
  //   return this.app.client.getText('#elem').then(function (text) {
  //     console.log('The #license-key-label content is ' + text)
  //     expect().to.equal('Lorem')
  //   })
  //   // return this.app.client.getTitle()
  //   //   .then(title => {
  //   //     console.log(title)
  //   //     expect(title).to.equal('Invizi')
  //   //   })
  // })
})
