import "phaser"
import { Scene } from "phaser";
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
        this.createOperatorConnections(scene);
        this.object = scene.physics.add.sprite(this.x, this.y, "tree", 0)
        this.text = scene.add.text(
            this.x - this.object.width / 2,
            this.y + this.object.height / 2,
            this.name,
            { color: 'black', align: 'center' }
        )

        //  The images will dispatch a 'clicked' event when they are clicked on
        this.object.setInteractive();
        this.object.on('clicked', ((obj) =>{
            // fire a wood
            for(let to of this.getTo()) {
                scene.time.addEvent({
                    delay: 0,
                    callback: _ => {
                        scene.records.fireWoodAt(
                            0,
                            this.object.x,
                            this.object.y,
                            to.getPosition().x,
                            to.getPosition().y,
                            RecordKey.D,
                            this
                        )
                    },
                    loop: false
                })
            }
        }), this);

        for(let to of this.getTo()) {
            let te: Phaser.Time.TimerEvent = scene.time.addEvent({
                delay: 2000 / this.rate,
                callback: _ => {
                    scene.records.fireAcornAt(
                        400,
                        this.object.x,
                        this.object.y,
                        to.getPosition().x,
                        to.getPosition().y,
                        randomEnum(RecordKey),
                        this
                    )
                },
                loop: true
            })

            scene.eventMap.set(this.getId(), te);
        }
    }
}