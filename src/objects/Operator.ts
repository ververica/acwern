import "phaser"
import Record from "./record"
import Acwern from "../acwern"

export default class Operator {
    name: string;
    object: Phaser.Physics.Arcade.Image;
    text: Phaser.GameObjects.Text;

    constructor(name: string) {
        this.name = name;
    }

    create(scene: Acwern) {
        this.object = scene.physics.add.staticImage(512, 256, "squirrel");
        this.text = scene.add.text(
            500, this.object.height / 2 + 256, this.name,
            { color: 'black', align: 'center' }
        );

        scene.physics.add.collider(this.object, scene.sourceRecordGroup, (operator, record: Record) => {
            record.kill();

            for (var sink of scene.getSinksThatAccept(record.recordKey)) {
                scene.operatorRecordGroup.fireAcornAt(this.object.x, this.object.y, sink.object.x, sink.object.y, record.recordKey);
            }
        });
    }
}