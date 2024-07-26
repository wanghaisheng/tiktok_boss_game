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
        this.spawnMonster(this.currentMonster)
    }

    spawnMonster(monster: Monster) {
        monster.spawn().on('died', this.switchToNextMonster.bind(this))
    }

    switchToNextMonster() {
        this.currentMonsterIndex++
        console.log('Switching to next monster', this.currentMonsterIndex);

        this.currentMonster = this.monsters[this.currentMonsterIndex]
        if (this.currentMonsterIndex < this.monsters.length) {
            this.spawnMonster(this.currentMonster)
        }
    }
}
