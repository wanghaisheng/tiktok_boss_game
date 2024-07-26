import * as PIXI from 'pixi.js'
import type { Game } from './game'

export class HealthBar {
    game: Game
    app: PIXI.Application
    container: PIXI.Container
    healthBar: PIXI.Graphics
    healthBarBorder: PIXI.Graphics
    healthBarText: PIXI.Text

    constructor(game: Game, initialX?: number, initialY?: number) {
        this.game = game
        this.app = game.app
        this.container = new PIXI.Container()

        initialX = initialX ?? this.app.screen.width / 2 - 100
        initialY = initialY ?? this.game.sprites[this.game.currentMonsterIndex].y - this.game.sprites[this.game.currentMonsterIndex].height / 2 - 100

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

        this.healthBarText = new PIXI.Text(`${(this.game.currentMonster.hp - this.game.currentMonster.damageTaken).toLocaleString()} HP`, {
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
        this.healthBarText.text = `${(this.game.currentMonster.hp - this.game.currentMonster.damageTaken).toLocaleString()} HP`
        return this
    }

    reposition(newX: number, newY: number): this {
        this.healthBar.x = newX
        this.healthBar.y = newY
        this.healthBarBorder.x = newX
        this.healthBarBorder.y = newY
        this.healthBarText.x = newX + 100
        this.healthBarText.y = newY + 10
        return this
    }

    reset(): this {
        this.updateHealth(1)
        return this
    }
}
