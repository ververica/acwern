import "phaser"
import Acwern from "../acwern"
import {RecordKey, randomEnum} from "./record"

export default class Source {
    offset: number;
    name: string;
    rate: number;
    object: Phaser.Physics.Arcade.Image;
    text: Phaser.GameObjects.Text;

    constructor(offset: number, name: string, rate: number) {
        this.offset = offset;
        this.name = name;
        this.rate = rate;
    }

    create(scene: Acwern) {
        this.object = scene.physics.add.sprite(50, 75, "tree", 0);
        this.object.setPosition(50, 75 + (this.object.height + 30) * this.offset);
        this.text = scene.add.text(
            25,
            this.object.height + 10 + (this.object.height + 30) * this.offset,
            this.name,
            { color: 'black', align: 'center' }
        );

        scene.time.addEvent({
            delay: 1000 / this.rate,
            callback: _ => {
                scene.sourceRecordGroup.fireAcornAt(
                    this.object.x,
                    this.object.y,
                    scene.operator.object.x,
                    scene.operator.object.y,
                    randomEnum(RecordKey)
                );
            },
            loop: true
        });
    }
}