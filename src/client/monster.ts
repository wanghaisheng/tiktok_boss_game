export class Monster {
    name: string
    hp: number
    textureUrl: string
    damageTaken: number
    killed: boolean

    constructor(name: string, hp: number, textureUrl: string) {
        this.name = name
        this.hp = hp
        this.textureUrl = textureUrl
        this.damageTaken = 0
        this.killed = false
    }

    damage(amount: number): number {
        const damageWillKill = this.damageTaken + amount >= this.hp

        if (damageWillKill) {
            this.damageTaken = this.hp
            this.killed = true
        } else {
            this.damageTaken += amount
        }

        return this.hp - this.damageTaken
    }

    getHealthPercentage(): number {
        return (this.hp - this.damageTaken) / this.hp
    }

    isKilled(): boolean {
        return this.killed
    }
}