import * as PIXI from 'pixi.js'
import { HealthBar } from './healthBar'

export class Monster extends PIXI.utils.EventEmitter {
    name: string
    hp: number
    textureUrl: string
    damageTaken: number
    killed: boolean
    sprite: PIXI.Sprite
    app: PIXI.Application
    healthBar: HealthBar

    constructor(name: string, hp: number, textureUrl: string, app: PIXI.Application) {
        super()
        this.name = name
        this.hp = hp
        this.textureUrl = textureUrl
        this.damageTaken = 0
        this.killed = false
        this.app = app
    }

    spawn() {
        PIXI.Loader.shared.add(this.name.toLowerCase(), this.textureUrl).load((loader, resources) => {
            this.sprite = new PIXI.Sprite(resources[this.name.toLowerCase()].texture)
            this.sprite.anchor.set(0.5)
            this.sprite.x = this.app.screen.width / 2
            this.sprite.y = this.app.screen.height / 2 + 20
            this.sprite.interactive = true
            this.sprite.buttonMode = true
            this.sprite.cursor = 'pointer'
            this.sprite.on('pointerdown', () => this.damage(1))
            this.app.stage.addChild(this.sprite)
            this.healthBar = new HealthBar(this, this.app)
        })

    }

    damage(amount: number): number {
        const damageWillKill = this.damageTaken + amount >= this.hp

        if (damageWillKill) {
            this.kill()
        } else {
            this.damageTaken += amount
            this.healthBar.updateHealth(this.getHealthPercentage())
        }

        this.animateDamage()
        return this.hp - this.damageTaken
    }

    kill() {
        this.damageTaken = this.hp
        this.healthBar.updateHealth(0)
        this.killed = true
        this.sprite.visible = false
        this.healthBar.destroy()
        this.emit('died')
    }

    getHealthPercentage(): number {
        return (this.hp - this.damageTaken) / this.hp
    }

    isKilled(): boolean {
        return this.killed
    }

    animateDamage() {
        const originalScaleX = 1
        const originalScaleY = 1

        this.sprite.scale.x = originalScaleX * 1.25
        this.sprite.scale.y = originalScaleY * 1.25

        setTimeout(() => {
            this.sprite.scale.x = originalScaleX
            this.sprite.scale.y = originalScaleY
        }, 100)
    }

    setVisible(visible: boolean) {
        this.sprite.visible = visible
    }

    reposition(x: number, y: number) {
        this.sprite.x = x
        this.sprite.y = y
    }
}
