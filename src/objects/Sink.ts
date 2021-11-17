import "phaser"
import { Record, RecordKey } from "./record"
import Acwern from "../acwern"

export default class Sink {
    name: string;
    offset: number;
    accepts: Set<RecordKey>;
    object!: Phaser.Physics.Arcade.Image;
    text!: Phaser.GameObjects.Text;

    constructor(offset: number, name: string, accepts: Set<RecordKey>) {
        this.offset = offset;
        this.name = name;
        this.accepts = accepts;
    }

    create(scene: Acwern) {
        this.object = scene.physics.add.staticImage(1024 - 50, 75 + (95 * this.offset), "cave");
        this.text = scene.add.text(
            1024-80,
            75 + this.object.height / 2 + (this.object.height + 30) * this.offset,
            this.name,
            { color: 'black', align: 'center' }
        );

        scene.physics.add.collider(this.object, scene.operatorRecordGroup, (sink, acorn: Phaser.GameObjects.GameObject) => {
            (acorn as Record).kill();
        });
    }
}