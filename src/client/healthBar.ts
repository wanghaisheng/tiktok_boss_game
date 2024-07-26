import * as PIXI from 'pixi.js'
import { Monster } from './monster'

export class HealthBar {
    app: PIXI.Application
    container: PIXI.Container
    healthBar: PIXI.Graphics
    healthBarBorder: PIXI.Graphics
    healthBarText: PIXI.Text
    monster: Monster

    constructor(monster: Monster, app: PIXI.Application) {
        this.app = app
        this.monster = monster
        this.container = new PIXI.Container()

        const initialX = this.app.screen.width / 2 - 100
        const initialY = this.monster.sprite.y - this.monster.sprite.height / 2 - 100

        this.healthBar = new PIXI.Graphics()
        this.healthBar.beginFill(0xff0000)
        this.healthBar.drawRect(0, 0, 200, 20)
        this.healthBar.endFill()
        this.healthBar.x = initialX
        this.healthBar.y = initialY
        this.container.addChild(this.healthBar)

        this.healthBarBorder = new PIXI.Graphics()
        this.healthBarBorder.lineStyle(2, 0xffffff)
        this.healthBarBorder.drawRect(0, 0, 200, 20)
        this.healthBarBorder.x = initialX
        this.healthBarBorder.y = initialY
        this.container.addChild(this.healthBarBorder)

        this.healthBarText = new PIXI.Text(`${(this.monster.hp - this.monster.damageTaken).toLocaleString()} HP`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            align: 'center',
        })
        this.healthBarText.anchor.set(0.5)
        this.healthBarText.x = initialX + 100
        this.healthBarText.y = initialY + 10
        this.container.addChild(this.healthBarText)

        this.app.stage.addChild(this.container)
    }

    updateHealth(percentage: number): this {
        this.healthBar.scale.x = Math.max(percentage, 0)
        this.healthBarText.text = `${(this.monster.hp - this.monster.damageTaken).toLocaleString()} HP`
        return this
    }


    destroy() {
        this.app.stage.removeChild(this.container)
    }
}
