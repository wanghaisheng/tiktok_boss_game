import * as PIXI from 'pixi.js'
import { Monster } from '../../monster'

export class Bigfoot extends Monster {
    constructor(app: PIXI.Application) {
        super(app)
        this.name = 'Bigfoot'
        this.hp = 200
        this.sprites = {
            idle: './sprites/bigfoot/idle.json',
            die: './sprites/bigfoot/die.json',
            damaged: './sprites/bigfoot/damaged.json',
        }
    }
}
