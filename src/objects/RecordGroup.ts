import {Record, RecordKey} from "./record"
import Acwern from  "../acwern"
import AbstractOperator from "./AbstractOperator";

export default class RecordGroup extends Phaser.Physics.Arcade.Group {

    scene!: Acwern;

    constructor(scene: Acwern) {
        super(scene.physics.world, scene)
        this.classType = Record
    }

    fireAcornAt(angularVelocity: number, sx: number, sy: number, x: number, y: number, key: RecordKey, ao: AbstractOperator) {
        const record:Record = this.create(sx, sy, "acorn")
        if (record) {
            record.fire(angularVelocity, sx, sy, key, ao)
            this.scene.physics.moveTo(record, x, y, 100)
        }
    }

    fireWoodAt(angularVelocity: number, sx: number, sy: number, x: number, y: number, key: RecordKey, ao: AbstractOperator) {
        const record:Record = this.create(sx, sy, "wood")
        if (record) {
            record.fire(angularVelocity, sx, sy, key, ao)
            this.scene.physics.moveTo(record, x, y, 100)
        }
    }
}