import "phaser"
import Acwern from "../acwern"
import AbstractOperator from "./AbstractOperator";
import {RecordKey, randomEnum} from "./record"

export default class Source extends AbstractOperator {
    name: string

    object!: Phaser.Physics.Arcade.Image
    text!: Phaser.GameObjects.Text

    constructor(id: string, name: string, config: object) {
        super(id)
        this.name = name
        this.config = { 
            ...config,
            ...{
                rate: 2
            }
        }
    }

    create(scene: Acwern) {
        this.object = scene.physics.add.sprite(this.x, this.y, "tree", 0)
        this.text = scene.add.text(
            this.x - this.object.width / 2,
            this.y + this.object.height / 2,
            this.name,
            { color: 'black', align: 'center' }
        )
        
        if(this.getConfigValue("useBuffer", false)) this.createOutputBuffer(this.getConfigValue("bufferSize", 2), scene)

        for(let to of this.getTo()) {
            scene.time.addEvent({
                delay: 1000 / this.getConfigValue("rate", 2) as number,
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