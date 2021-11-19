import "phaser"
import Acwern from "../Acwern"
import AbstractOperator from "./AbstractOperator"

enum RecordKey {
    A,    // acorn type 1
    B,    // acorn type 2
    C,    // acorn type 3
    D,    // wood type 1
}

function randomEnum<T>(anEnum: T): T[keyof T] {
    const enumValues = Object.keys(anEnum)
        .map(n => Number.parseInt(n))
        .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
    // const randomIndex = Math.floor(Math.random() * enumValues.length)
    const randomIndex = Math.floor(Math.random() * 3)    // only choose from the acore types
    const randomEnumValue = enumValues[randomIndex]
    return randomEnumValue;
}

class Record extends Phaser.Physics.Arcade.Sprite {
    recordKey!: RecordKey;
    abstractOperator!: AbstractOperator;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
    }

    fire(angularVelocity: number, x: number, y: number, k: RecordKey, ao: AbstractOperator) {
        this.recordKey = k;
        this.abstractOperator = ao;

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
            case RecordKey.D:
                this.setFrame(0);
                break;
        }
        this.setActive(true);
        this.setVisible(true);
        this.setAngularVelocity(angularVelocity);
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
