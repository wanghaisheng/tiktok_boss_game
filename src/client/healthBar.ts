import * as PIXI from 'pixi.js'
import { Monster } from './monster'

export class HealthBar {
    app: PIXI.Application
    container: PIXI.Container
    healthBar: PIXI.Graphics
    healthBarBorder: PIXI.Graphics
    healthBarNumber: PIXI.Text
    monster: Monster

    constructor(monster: Monster, app: PIXI.Application) {
        this.app = app
        this.monster = monster
        this.container = new PIXI.Container()

        const initialX = this.app.screen.width / 2 - 100
        const initialY = this.monster.sprite.y - this.monster.sprite.height / 2

        const healthBarInner = new PIXI.Graphics()
        healthBarInner.rect(0, 0, 200, 24)
        healthBarInner.fill(0xFF3333)
        healthBarInner.x = initialX
        healthBarInner.y = initialY
        this.container.addChild(healthBarInner)

        this.healthBar = new PIXI.Graphics()
        this.healthBar.rect(0, 0, 200, 24)
        this.healthBar.fill(0x00CC00)
        this.healthBar.x = initialX
        this.healthBar.y = initialY
        this.container.addChild(this.healthBar)

        this.healthBarBorder = new PIXI.Graphics()
        this.healthBarBorder.rect(0, 0, 200, 24)
        this.healthBarBorder.stroke({width: 2, color: 0xffffff})
        this.healthBarBorder.x = initialX
        this.healthBarBorder.y = initialY
        this.container.addChild(this.healthBarBorder)

        const healthBarText = new PIXI.Text({
            text: monster.name,
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xffffff,
                align: 'center',
            }
        })
        healthBarText.anchor.set(0.5)
        healthBarText.x = initialX + 100
        healthBarText.y = initialY + 11
        this.container.addChild(healthBarText)

        this.healthBarNumber = new PIXI.Text({
            text: `${(this.monster.hp - this.monster.damageTaken).toLocaleString()} HP`,
            style: {
                fontFamily: 'Arial',
                fontSize: 19,
                fill: 0xffffff,
                align: 'center',
            }
        })
        this.healthBarNumber.anchor.set(0.5)
        this.healthBarNumber.x = initialX + 100
        this.healthBarNumber.y = initialY - 18
        this.container.addChild(this.healthBarNumber)

        this.app.stage.addChild(this.container)
    }

    updateHealth(percentage: number): this {
        this.healthBar.scale.x = Math.max(percentage, 0)
        this.healthBarNumber.text = `${(this.monster.hp - this.monster.damageTaken).toLocaleString()} HP`
        return this
    }


    destroy() {
        this.app.stage.removeChild(this.container)
    }
}
