import {Record, RecordKey} from "./record"
import Acwern from  "../acwern"

export default class RecordGroup extends Phaser.Physics.Arcade.Group {

    scene: Acwern;

    constructor(scene: Acwern) {
        super(scene.physics.world, scene);

        this.createMultiple({
            classType: Record,
            frameQuantity: 300,
            active: false,
            visible: false,
            key: 'acorn'
        })
    }

    fireAcornAt(sx, sy, x, y, key: RecordKey) {
        const record = this.getFirstDead(false);
        if (record) {
            record.fire(sx, sy, key);
            this.scene.physics.moveTo(record, x, y, 200);
        }
    }
}