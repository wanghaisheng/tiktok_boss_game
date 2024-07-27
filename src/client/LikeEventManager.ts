import * as PIXI from 'pixi.js'
import { MonsterManager } from './MonsterManager'

export class LikeEventManager {
    app: PIXI.Application
    userInfoContainer: PIXI.Container
    likeEventQueue: any[]
    isProcessingQueue: boolean
    monsterManager: MonsterManager

    constructor(app: PIXI.Application, monsterManager: MonsterManager) {
        this.app = app
        this.monsterManager = monsterManager
        this.likeEventQueue = []
        this.isProcessingQueue = false

        this.userInfoContainer = new PIXI.Container()
        this.app.stage.addChild(this.userInfoContainer)
    }

    addLikeEvent(data: any) {
        this.likeEventQueue.push(data)
        this.processLikeEventQueue()
    }

    private processLikeEventQueue() {
        if (this.isProcessingQueue) return
        this.isProcessingQueue = true

        const processNext = () => {
            if (this.likeEventQueue.length === 0) {
                this.isProcessingQueue = false
                return
            }

            const data = this.likeEventQueue.shift()
            this.displayLikeEvent(data)
            this.monsterManager.currentMonster.damage(data.likeCount)

            setTimeout(processNext, 350) // Adjust the interval as needed
        }

        processNext()
    }

    private async displayLikeEvent(data: any) {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fill: '#ffffff',
            align: 'center'
        })
        const containerY = this.app.screen.height / 2 - 100
        const containerX = this.app.screen.width / 2

        const usernameText = new PIXI.Text({text: `🗡️(-${data.likeCount}💔) ${data.nickname}`, style: textStyle})
        usernameText.anchor.set(0.5)
        usernameText.x = containerX
        usernameText.y = containerY

        // load the profile picture
        const profilePicTexture = await PIXI.Assets.load(data.profilePictureUrl)
        const profilePic = PIXI.Sprite.from(profilePicTexture)
        profilePic.anchor.set(0.5)
        profilePic.width = 30
        profilePic.height = 30
        profilePic.y = containerY

        // Create a circular mask for the profile picture
        const mask = new PIXI.Graphics()
        mask.circle(0, 0, profilePic.width / 2)
        mask.fill(0xffffff)
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
}
