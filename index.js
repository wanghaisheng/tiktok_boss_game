const { WebcastPushConnection } = require('tiktok-live-connector')
const puppeteer = require('puppeteer-core');

(async () => {
    let removeLastLikeTimeout = null

    const injectUsername = async (user, x, y) => {
        await page.evaluate((user, x, y, removeLastLikeTimeout) => {
            const existingDiv = document.getElementById('user-like-div')
            if (existingDiv) {
                document.body.removeChild(existingDiv)
            }

            const div = document.createElement('div')
            div.id = 'user-like-div'
            div.style.position = 'absolute'
            div.style.top = `${y}px`
            div.style.left = `${x}px`
            div.style.padding = '5px'
            div.style.display = 'flex'
            div.style.alignItems = 'center'

            const img = document.createElement('img')
            img.src = user.profilePictureUrl
            img.style.width = '30px'
            img.style.height = '30px'
            img.style.borderRadius = '50%'
            img.style.marginRight = '10px'

            const text = document.createElement('span')
            text.innerText = user.nickname

            div.appendChild(img)
            div.appendChild(text)
            document.body.appendChild(div)

            // Clear the timeout if another user clicks before 1 second
            if (removeLastLikeTimeout) {
                clearTimeout(removeLastLikeTimeout)
            }

            // Remove the text element after 1 second if no other clicks
            removeLastLikeTimeout = setTimeout(() => {
                const lastDiv = document.getElementById('user-like-div')
                if (lastDiv) {
                    document.body.removeChild(lastDiv)
                }
            }, 1000)
        }, user, x, y, removeLastLikeTimeout)
    };

    // Username of someone who is currently live
    let tiktokUsername = "leebrucce"

    // Create a new wrapper object and pass the username
    let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername)

    // Connect to the chat (await can be used as well)
    tiktokLiveConnection.connect().then(state => {
        console.info(`Connected to roomId ${state.roomId}`)
    }).catch(err => {
        console.error('Failed to connect', err.message)
    })

    // // Define the events that you want to handle
    // // In this case we listen to chat messages (comments)
    // tiktokLiveConnection.on('chat', data => {
    //     console.log(`${data.uniqueId} writes: ${data.comment}`)
    // })

    // // And here we receive gifts sent to the streamer
    // tiktokLiveConnection.on('gift', data => {
    //     console.log(`${data.uniqueId} (userId:${data.userId}) sends ${data.giftId}`)
    // })

    tiktokLiveConnection.on('like', data => {
        console.log(`${data.uniqueId} sent ${data.likeCount} likes, total likes: ${data.totalLikeCount}`)
        console.log(data);
        clickCenter(data.likeCount, data)
    })

    tiktokLiveConnection.on('error', err => {
        console.error('Error!', err.message)
    })


    const browserURL = 'http://localhost:9222'

    // Connect to the remote Chrome instance
    const browser = await puppeteer.connect({
        browserURL
    })


    // https://games.crazygames.com/en_US/capybara-clicker/index.html
    const pages = await browser.pages()
    const page = pages[0]

    console.log(page, page.url());

    // Wait for the page to load completely
    await page.waitForSelector('canvas') // Assuming the game is rendered in a canvas element

    // Get the bounding box of the element you want to click
    const element = await page.$('#unity-canvas')
    const boundingBox = await element.boundingBox()

    // Calculate the center of the element
    const x = boundingBox.x + boundingBox.width / 2 - 100
    const y = boundingBox.y + boundingBox.height / 2

    const clickCenter = async (amount, user, timeout = 150) => {
        const click = () => new Promise(resolve => {
            setTimeout(async () => {
                await page.mouse.click(x, y)
                await injectUsername(user, x, y);
                resolve()
            }, timeout)
        })

        for (let i = 0; i < amount; i++) {
            await click()
        }
    };

    function exitHandler(options, exitCode) {
        if (exitCode || exitCode === 0) console.log(exitCode)
        if (options.exit) {
            console.log('Cleaning up before exit...')
            tiktokLiveConnection?.disconnect()
            process.exit()
        }
    }

    // do something when app is closing
    process.on('exit', exitHandler.bind(null, { exit: true }))

    // catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, { exit: true }))

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler.bind(null, { exit: true }))
    process.on('SIGUSR2', exitHandler.bind(null, { exit: true }))

    // catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(null, { exit: true }))
})();
