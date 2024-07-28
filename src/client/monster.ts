import * as PIXI from 'pixi.js'
import { HealthBar } from './healthBar'
import { EventEmitter } from 'eventemitter3'

export class Monster extends EventEmitter {
    name: string
    hp: number
    damageTaken: number
    killed: boolean
    sprite: PIXI.AnimatedSprite | undefined
    sprites: { [key: string]: string }
    app: PIXI.Application
    healthBar: HealthBar
    inDamageState: boolean

    constructor(app: PIXI.Application) {
        super()
        this.killed = false
        this.app = app
    }

    async spawn() {
        this.setSprite('idle')
        this.app.stage.addChild(this.sprite)
        this.healthBar = new HealthBar(this, this.app)

        return this
    }

    damage(amount: number) {
        if (this.killed) {
            return 0
        }

        const damageWillKill = this.damageTaken + amount >= this.hp

        if (damageWillKill) {
            this.kill()
        } else {
            this.damageTaken += amount
            this.healthBar.updateHealth(this.getHealthPercentage())
            this.animateDamage()
        }

        return this.hp - this.damageTaken
    }

    kill() {
        if (this.killed) {
            return
        }

        this.damageTaken = this.hp
        this.healthBar.updateHealth(0)
        this.killed = true

        this.setSprite('die', true, false).onComplete = () => {
            this.sprite.visible = false
            this.healthBar.destroy()
            this.sprite.destroy()

            this.emit('died')
        }
    }

    getHealthPercentage(): number {
        return (this.hp - this.damageTaken) / this.hp
    }

    isKilled(): boolean {
        return this.killed
    }

    animateDamage() {
        if (!this.inDamageState) {
            this.inDamageState = true
            this.setSprite('damaged', true, false).onComplete = () => {
                this.inDamageState = false
                if (!this.killed) {
                    this.setSprite('idle', true, true)
                }
            }
        }

        const originalScaleX = 1
        const originalScaleY = 1

        this.sprite.scale.x = originalScaleX * 1.25
        this.sprite.scale.y = originalScaleY * 1.25

        setTimeout(() => {
            this.sprite.scale.x = originalScaleX
            this.sprite.scale.y = originalScaleY
        }, 100)
    }

    setSprite(name:string, addToStage = false, loop = true) {
        if (this.sprite) {
            this.app.stage.removeChild(this.sprite)
            this.sprite.destroy()
        }

        const sheet = PIXI.Assets.get(this.sprites[name])
        this.sprite = new PIXI.AnimatedSprite(sheet.animations[name])
        this.sprite.anchor.set(0.5)
        this.sprite.x = this.app.screen.width / 2
        this.sprite.y = this.app.screen.height / 2 + 20
        this.sprite.animationSpeed = sheet.data.meta.animationSpeed
        this.sprite.play()
        this.sprite.loop = loop

        if (name !== 'die') {
            this.sprite.interactive = true
            this.sprite.cursor = 'pointer'
            this.sprite.on('pointerdown', () => this.damage(1))
        }

        if (addToStage) {
            this.app.stage.addChild(this.sprite)
        }

        return this.sprite
    }
}
