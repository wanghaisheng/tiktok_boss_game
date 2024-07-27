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
    upNextContainer: PIXI.Container;

    constructor(app: PIXI.Application, monsters: Monster[]) {
        this.app = app
        this.monsters = monsters
        this.currentMonsterIndex = 0
        this.currentMonster = this.monsters[this.currentMonsterIndex]

        const assets = this.monsters.map(monster => monster.textureUrl);

        PIXI.Assets.load(assets).then(resources => {
            this.setupUpNextList()
            this.spawnMonster(this.currentMonster)
        });
    }

    spawnMonster(monster: Monster) {
        monster.spawn().on('died', this.switchToNextMonster.bind(this))
    }

    switchToNextMonster() {
        this.currentMonsterIndex++
        console.log('Switching to next monster', this.currentMonsterIndex);

        if (this.currentMonsterIndex < this.monsters.length) {
            this.currentMonster = this.monsters[this.currentMonsterIndex]
            this.spawnMonster(this.currentMonster)
            this.updateUpNextList()
        }
    }

    setupUpNextList() {
        this.upNextContainer = new PIXI.Container()
        const upNextContainerTitle = new PIXI.Container()
        this.upNextContainer.y = this.app.screen.height - 100 // Position at the bottom of the screen
        this.upNextContainer.x = this.app.screen.width / 2 - (this.monsters.length * 60) / 2
        this.app.stage.addChild(this.upNextContainer, upNextContainerTitle)

        const upNextTitle = new PIXI.Text({
            text: 'Up next:',
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xFFFFFF,
                align: 'center',
            }
        })
        upNextTitle.anchor.set(0.5)
        upNextTitle.x = this.upNextContainer.x + (this.monsters.length * 60) / 2
        upNextTitle.y = this.upNextContainer.y - 30
        upNextContainerTitle.addChild(upNextTitle)

        this.monsters.forEach((monster, index) => {
            const boxContainer = new PIXI.Container();
            const box = new PIXI.Graphics()
            box.rect(0, 0, 50, 50)

            const sprite = new PIXI.Sprite(PIXI.Texture.from(monster.textureUrl))
            sprite.width = 50
            sprite.height = 50
            sprite.anchor.set(0.5)
            sprite.x = 25
            sprite.y = 25

            boxContainer.addChild(box, sprite)

            if (index <= this.currentMonsterIndex) {
                // Color the current and seen monsters
                sprite.tint = 0xFFFFFF // Reset any tint
            } else {
                // Set silhouette for upcoming monsters
                sprite.tint = 0x000000

                // Add a question mark for hidden next bosses
                const questionMark = new PIXI.Text({
                    text: '?',
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: 0xFFFFFF,
                        align: 'center',
                    }
                })
                questionMark.anchor.set(0.5)
                questionMark.x = sprite.x
                questionMark.y = sprite.y
                boxContainer.addChild(questionMark)
            }

            boxContainer.x = index * 60 // Spacing between boxes
            this.upNextContainer.addChild(boxContainer)
        })
    }



    updateUpNextList() {
        this.upNextContainer.removeChildren()
        this.monsters.forEach((monster, index) => {
            const boxContainer = new PIXI.Container();
            const box = new PIXI.Graphics()
            box.rect(0, 0, 50, 50)

            const sprite = new PIXI.Sprite(PIXI.Texture.from(monster.textureUrl))
            sprite.width = 50
            sprite.height = 50
            sprite.anchor.set(0.5)
            sprite.x = 25
            sprite.y = 25

            boxContainer.addChild(box, sprite)

            if (index < this.currentMonsterIndex) {
                // Color the seen monsters red
                sprite.tint = 0xA05252  // Red tint for current monster
                // Add a question mark for hidden next bosses
                const questionMark = new PIXI.Text({
                    text: '💀',
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 19,
                        fill: 0xFFFFFF,
                        align: 'center',
                    }
                })
                questionMark.anchor.set(0.5)
                questionMark.x = sprite.x
                questionMark.y = sprite.y
                boxContainer.addChild(questionMark)
            } else if (index === this.currentMonsterIndex) {
                // Highlight the current monster
                sprite.tint = 0xFFFFFF // Reset any tint
            } else {
                // Set silhouette for upcoming monsters
                sprite.tint = 0x000000

                // Add a question mark for hidden next bosses
                const questionMark = new PIXI.Text({
                    text: '?',
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: 0xFFFFFF,
                        align: 'center',
                    }
                })
                questionMark.anchor.set(0.5)
                questionMark.x = sprite.x
                questionMark.y = sprite.y
                boxContainer.addChild(questionMark)
            }

            boxContainer.x = index * 60 // Spacing between boxes
            this.upNextContainer.addChild(boxContainer)
        })
    }


}
