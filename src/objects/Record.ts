import "phaser"
import Acwern from "../Acwern"

enum RecordKey {
    A,
    B,
    C
}

function randomEnum<T>(anEnum: T): T[keyof T] {
    const enumValues = Object.keys(anEnum)
        .map(n => Number.parseInt(n))
        .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
    const randomIndex = Math.floor(Math.random() * enumValues.length)
    const randomEnumValue = enumValues[randomIndex]
    return randomEnumValue;
}

class Record extends Phaser.Physics.Arcade.Sprite {
    recordKey: RecordKey;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'acorn');
    }

    fire(x: number, y: number, k: RecordKey) {
        this.recordKey = k;

        this.body.reset(x, y);
        switch (+k) {
            case RecordKey.A:
                this.setFrame(0);
                break;
            case RecordKey.B:
                this.setFrame(1);
                break;
            case RecordKey.C:
                this.setFrame(2);
                break;
        }
        this.setActive(true);
        this.setVisible(true);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.x >= 1000) {
            this.kill();
        }
    }

    kill() {
        this.x = 0;
        this.y = 0;
        this.setActive(false);
        this.setVisible(false);
    }

}

export default Record;
export {Record, RecordKey, randomEnum}
