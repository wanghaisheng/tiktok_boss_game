import * as PIXI from 'pixi.js'
import { Monster } from './monster'
import { HealthBar } from './healthBar'
import { io } from 'socket.io-client'

export class Game {
    app: PIXI.Application
    monsters: Monster[]
    currentMonsterIndex: number
    currentMonster: Monster
    lastAnimationTime: number
    animationCooldown: number
    sprites: PIXI.Sprite[]
    healthBar: HealthBar
    userInfoContainer: PIXI.Container
    likeEventQueue: any[]
    isProcessingQueue: boolean

    constructor() {
        console.log('Game started')

        this.app = new PIXI.Application({ width: 800, height: 600 })
        this.app.renderer.backgroundColor = 0x1099bb
        document.body.appendChild(this.app.view)

        this.monsters = [
            new Monster('Bunny', 100, 'https://pixijs.com/assets/bunny.png'),
            new Monster('Monster', 1500, 'https://pixijs.com/assets/eggHead.png'),
            new Monster('Alien', 2500, 'https://pixijs.com/assets/flowerTop.png')
        ]

        this.currentMonsterIndex = 0
        this.currentMonster = this.monsters[this.currentMonsterIndex]
        this.lastAnimationTime = 0
        this.animationCooldown = 100 // 100ms cooldown

        this.likeEventQueue = []
        this.isProcessingQueue = false

        PIXI.Loader.shared
            .add('bunny', this.monsters[0].textureUrl)
            .add('monster', this.monsters[1].textureUrl)
            .add('alien', this.monsters[2].textureUrl)
            .load((loader, resources) => this.setup(resources))

        const socket = io('http://localhost:3000?u=bewitchingyt')

        socket.on('connect', () => {
            console.log('Connected to server')
        })

        socket.on('like', (data) => {
            console.log('Received like:', data)
            this.likeEventQueue.push(data)
            this.processLikeEventQueue()
        })

        this.userInfoContainer = new PIXI.Container()
        this.app.stage.addChild(this.userInfoContainer)
    }

    setup(resources: any) {
        this.sprites = this.monsters.map((monster, index) => {
            const texture = resources[monster.name.toLowerCase()].texture
            texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST

            const sprite = new PIXI.Sprite(texture)
            sprite.anchor.set(0.5)
            sprite.x = this.app.screen.width / 2
            sprite.y = this.app.screen.height / 2 + 20
            sprite.interactive = true
            sprite.buttonMode = true
            sprite.cursor = 'pointer'
            sprite.on('pointerdown', () => this.onClick(index))
            sprite.visible = index === this.currentMonsterIndex

            this.app.stage.addChild(sprite)
            return sprite
        })

        this.healthBar = new HealthBar(this)
    }

    onClick(index: number, damage = 1) {
        if (this.currentMonster.isKilled()) {
            return
        }

        this.attack(index, damage)

        const currentTime = Date.now()
        if (currentTime - this.lastAnimationTime >= this.animationCooldown) {
            this.lastAnimationTime = currentTime
            const sprite = this.sprites[index]
            this.animateSprite(sprite)
        }
    }

    attack(index: number, damage: number) {
        const remainingHp = this.currentMonster.damage(damage)
        this.healthBar.updateHealth(this.currentMonster.getHealthPercentage())

        if (this.currentMonster.isKilled()) {
            this.switchToNextMonster()
        }

        return remainingHp
    }

    switchToNextMonster() {
        this.sprites[this.currentMonsterIndex].visible = false
        this.currentMonsterIndex++
        if (this.currentMonsterIndex < this.monsters.length) {
            this.currentMonster = this.monsters[this.currentMonsterIndex]
            this.sprites[this.currentMonsterIndex].visible = true
            this.healthBar
                .reset()
                .reposition(
                    this.app.screen.width / 2 - 100,
                    this.sprites[this.currentMonsterIndex].y - this.sprites[this.currentMonsterIndex].height / 2 - 100
                )
        }
    }

    animateSprite(sprite: PIXI.Sprite) {
        const originalScaleX = 1
        const originalScaleY = 1

        sprite.scale.x = originalScaleX * 1.25
        sprite.scale.y = originalScaleY * 1.25

        setTimeout(() => {
            sprite.scale.x = originalScaleX
            sprite.scale.y = originalScaleY
        }, 100)
    }

    onLikeEvent(data: any) {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fill: '#ffffff',
            align: 'center'
        })
        const containerY = this.app.screen.height / 2 - 100
        const containerX = this.app.screen.width / 2

        const usernameText = new PIXI.Text(`(-${data.likeCount}HP) ${data.nickname}`, textStyle)
        usernameText.anchor.set(0.5)
        usernameText.x = containerX
        usernameText.y = containerY

        const profilePic = PIXI.Sprite.from(data.profilePictureUrl)
        profilePic.anchor.set(0.5)
        profilePic.width = 30
        profilePic.height = 30
        profilePic.y = containerY

        // Create a circular mask for the profile picture
        const mask = new PIXI.Graphics()
        mask.beginFill(0xffffff)
        mask.drawCircle(0, 0, profilePic.width / 2)
        mask.endFill()
        mask.x = profilePic.x
        mask.y = profilePic.y
        profilePic.mask = mask

        // Calculate the width of the text and position the profile picture accordingly
        const textWidth = usernameText.width
        profilePic.x = containerX - textWidth / 2 - profilePic.width / 2 - 10 // 10px padding
        mask.x = profilePic.x // Update mask position based on profilePic

        const userContainer = new PIXI.Container()
        userContainer.addChild(profilePic)
        userContainer.addChild(mask) // Add the mask to the container
        userContainer.addChild(usernameText)
        this.userInfoContainer.addChild(userContainer)

        this.onClick(this.currentMonsterIndex, data.likeCount)

        // Create a ticker to animate the text
        const ticker = new PIXI.Ticker()
        let elapsed = 0
        ticker.add((delta) => {
            elapsed += delta
            userContainer.y -= 1 // Move up by 1 pixel each frame
            userContainer.alpha -= 0.004 // Fade out

            // Remove the text after 2 seconds
            if (elapsed > 120) {
                this.userInfoContainer.removeChild(userContainer)
                ticker.stop()
            }
        })
        ticker.start()
    }

    processLikeEventQueue() {
        if (this.isProcessingQueue) return
        this.isProcessingQueue = true

        const processNext = () => {
            if (this.likeEventQueue.length === 0) {
                this.isProcessingQueue = false
                return
            }

            const data = this.likeEventQueue.shift()
            this.onLikeEvent(data)

            setTimeout(processNext, 350) // Adjust the interval as needed
        }

        processNext()
    }
}
