import "phaser"
import Acwern from "../acwern"
import {RecordKey, randomEnum} from "./record"

export default class Source {
    offset: number;
    operatorOffset: number;
    name: string;
    rate: number;

    object!: Phaser.Physics.Arcade.Image;
    text!: Phaser.GameObjects.Text;

    constructor(offset: number, name: string, rate: number, operatorOffset: number) {
        this.offset = offset
        this.name = name
        this.rate = rate
        this.operatorOffset = operatorOffset
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
                    400,
                    this.object.x,
                    this.object.y,
                    scene.operators[this.operatorOffset].object.x,
                    scene.operators[this.operatorOffset].object.y,
                    randomEnum(RecordKey)
                );
            },
            loop: true
        });
    }
}