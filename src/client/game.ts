import * as PIXI from 'pixi.js'
import { Monster } from './monster'
import { io } from 'socket.io-client'
import { LikeEventManager } from './LikeEventManager'
import { MonsterManager } from './MonsterManager'
import { Bigfoot } from './monsters/bigfoot'

export class Game {
    app: PIXI.Application
    likeEventManager: LikeEventManager
    monsterManager: MonsterManager

    constructor() {
        console.log('Game started')

        this.app = new PIXI.Application()
        this.initialize()
    }

    async initialize() {
        await this.app.init({ background: '#1099bb', resizeTo: window })
        document.body.appendChild(this.app.canvas)

        const monsters = [
            new Bigfoot(this.app, 1026),
            new Bigfoot(this.app),
        ]

        this.monsterManager = new MonsterManager(this.app, monsters)
        this.likeEventManager = new LikeEventManager(this.app, this.monsterManager)

        const socket = io('http://localhost:3000?u=live_arcade_')

        socket.on('connect', () => {
            console.log('Connected to server')
        })

        socket.on('like', (data) => {
            console.log('Received like:', data)
            this.likeEventManager.addLikeEvent(data)
        })
    }

}
