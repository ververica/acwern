import "phaser"
import Record from "./record"
import Acwern from "../acwern"

export default class Operator {
    name: string;
    offset: number;
    object!: Phaser.Physics.Arcade.Image;
    text!: Phaser.GameObjects.Text;

    constructor(offset: number, name: string) {
        this.name = name;
        this.offset = offset;
    }

    create(scene: Acwern) {
        this.object = scene.physics.add.staticImage(512, 50 + this.offset * 200, "squirrel");
        this.text = scene.add.text(
            500,
            this.object.height / 2 + 50 + this.offset * 200,
            this.name,
            { color: 'black', align: 'center' }
        );

        scene.physics.add.collider(this.object, scene.sourceRecordGroup, (operator, object: Phaser.GameObjects.GameObject) => {
            let record:Record = object as Record;
            record.kill();

            for (var sink of scene.getSinksThatAccept(record.recordKey)) {
                scene.operatorRecordGroup.fireAcornAt(0, this.object.x, this.object.y, sink.object.x, sink.object.y, record.recordKey);
            }
        });
    }
}