import * as PIXI from 'pixi.js'
import { Monster } from './monster'
import { HealthBar } from './healthBar'

export class MonsterManager {
    app: PIXI.Application
    monsters: Monster[]
    currentMonsterIndex: number
    currentMonster: Monster
    healthBar: HealthBar
    lastAnimationTime: number

    constructor(app: PIXI.Application, monsters: Monster[]) {
        this.app = app
        this.monsters = monsters
        this.currentMonsterIndex = 0
        this.currentMonster = this.monsters[this.currentMonsterIndex]
        this.currentMonster.on('died', this.switchToNextMonster.bind(this)) // Listen for the 'died' event
        this.currentMonster.spawn()
    }


    switchToNextMonster() {
        this.currentMonsterIndex++
        if (this.currentMonsterIndex < this.monsters.length) {
            this.currentMonster = this.monsters[this.currentMonsterIndex]
            this.currentMonster.spawn()
        }
    }
}
