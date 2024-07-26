import * as PIXI from 'pixi.js'
import { Monster } from './monster'
import { io } from 'socket.io-client'
import { LikeEventManager } from './LikeEventManager'
import { MonsterManager } from './MonsterManager'

export class Game {
    app: PIXI.Application
    likeEventManager: LikeEventManager
    monsterManager: MonsterManager

    constructor() {
        console.log('Game started')

        this.app = new PIXI.Application({ width: 800, height: 600 })
        this.app.renderer.backgroundColor = 0x1099bb
        document.body.appendChild(this.app.view)

        const monsters = [
            new Monster('Bunny', 2, 'https://pixijs.com/assets/bunny.png', this.app),
            new Monster('Monster', 1500, 'https://pixijs.com/assets/eggHead.png', this.app),
            new Monster('Alien', 2500, 'https://pixijs.com/assets/flowerTop.png', this.app),
        ]

        this.monsterManager = new MonsterManager(this.app, monsters)
        this.likeEventManager = new LikeEventManager(this.app, this.monsterManager)

        const socket = io('http://localhost:3000?u=tbell112')

        socket.on('connect', () => {
            console.log('Connected to server')
        })

        socket.on('like', (data) => {
            console.log('Received like:', data)
            this.likeEventManager.addLikeEvent(data)
        })
    }
}
