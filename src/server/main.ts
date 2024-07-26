import express from 'express'
import { WebcastPushConnection } from 'tiktok-live-connector'
import { Server as SocketIOServer } from 'socket.io'
import { createServer } from 'http'

const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
});

let tiktok = null as WebcastPushConnection | null

io.on('connection', (socket) => {
    console.log('a user connected')

    const tiktokUsername = socket.handshake.query.u as string
    if (!tiktokUsername) {
        console.error('Missing TikTok username')
        socket.disconnect(true)
        return
    }

    tiktok = new WebcastPushConnection(tiktokUsername)

    tiktok.connect().then(() => {

        console.log(`Connected to TikTok live stream of ${tiktokUsername}`)

        tiktok.on('chat', (data) => {
            io.emit('chat', data)
        })

        tiktok.on('like', (data) => {
            // console.log('Received like:', data.likeCount, data);

            io.emit('like', data)
        })

        tiktok.on('streamEnd', (actionId) => {
            if (actionId === 3) {
                console.log('Stream ended by user')
            }
            if (actionId === 4) {
                console.log('Stream ended by platform moderator (ban)')
            }
        })

        tiktok.on('disconnected', () => {
            console.log('Disconnected from TikTok live stream')
            socket.disconnect(true)
        })

        // Add more event listeners as needed
    }).catch((err) => {
        console.error('Failed to connect:', err)
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
        tiktok.disconnect()
    })
})


// if node exit, disconnect all tiktok connections
function exitHandler(options, exitCode) {
    if (exitCode || exitCode === 0) console.log(exitCode)
    if (options.exit) {
        console.log('Cleaning up before exit...')
        tiktok?.disconnect()
        process.exit()
    }
}

process.on('exit', exitHandler.bind(null, { exit: true }))

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }))

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }))
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }))

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }))


// Workaround to allow websockets on development using vite-plugin-node
export const serverListener = server.listeners('request')[0];

const PORT = 3000
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

// Export the app for Vite to use
export const viteNodeApp = app
