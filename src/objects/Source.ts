import "phaser"
import Acwern from "../acwern"
import AbstractOperator from "./AbstractOperator";
import {RecordKey, randomEnum} from "./record"

export default class Source extends AbstractOperator {
    name: string
    rate: number

    object!: Phaser.Physics.Arcade.Image
    text!: Phaser.GameObjects.Text

    constructor(id: string, name: string, rate: number) {
        super(id)
        this.name = name
        this.rate = rate
    }

    create(scene: Acwern) {
        this.object = scene.physics.add.sprite(this.x, this.y, "tree", 0)
        this.text = scene.add.text(
            this.x - this.object.width / 2,
            this.y + this.object.height / 2,
            this.name,
            { color: 'black', align: 'center' }
        )

        for(let to of this.getTo()) {
            scene.time.addEvent({
                delay: 1000 / this.rate,
                callback: _ => {
                    scene.records.fireAcornAt(
                        400,
                        this.object.x,
                        this.object.y,
                        to.getPosition().x,
                        to.getPosition().y,
                        randomEnum(RecordKey)
                    )
                },
                loop: true
            })
        }
    }
}