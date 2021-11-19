import "phaser"
import Acwern from "../Acwern"

interface Ownership {
    operatorId: string
    state: "incoming" | "inputBuffer" | "processing" | "outputBuffer"
}

class Record extends Phaser.Physics.Arcade.Sprite {
    iteration: number = 0
    ownership!: Ownership

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'acorn');
    }

    public tweenTo(x: number, y: number, cb: Function = () => {} ) {
        if(!this.active) return

        this.scene.tweens.add({
            targets: this,
            x: x,
            y: y,
            ease: "Sine.easeInOut",
            duration: Phaser.Math.Distance.Between(this.x, this.y, x, y) / 500 * 2000,
            onComplete: cb
        })
    }

    public shake(duration : number, cb: Function = () => {}) {
        if(!this.active) return

        this.scene.tweens.add({
            targets: this,
            x: this.x + 5,
            y: this.y + 5,
            yoyo: true,
            repeat: Math.floor(duration/50),
            duration: 50,
            onComplete: cb
        })
    }

    setOwnership(ownership: Ownership) {
        this.ownership = ownership
    }
}

export default Record;
export {Ownership, Record}