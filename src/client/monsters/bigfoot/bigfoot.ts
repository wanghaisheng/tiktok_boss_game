import * as PIXI from 'pixi.js'
import { Monster } from '../../monster'

export class Bigfoot extends Monster {
    constructor(app: PIXI.Application) {
        super(app)
        this.name = 'Bigfoot'
        this.hp = 2
        this.sprites = {
            idle: './sprites/bigfoot/idle.json',
            die: './sprites/bigfoot/die.json',
        }
    }
}
