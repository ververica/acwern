import "phaser"
import Acwern from "../acwern"
import AbstractOperator from "./AbstractOperator";
import Record from "./record"

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
            }
        }
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
        
        if(this.getConfigValue("useBuffer", false)) this.createOutputBuffer(scene)

        scene.time.addEvent({
            delay: this.processDuration(),
            callback: _ => {
                this.spwan()
            },
            loop: true,
            startAt: Phaser.Math.Between(this.processDuration() / 2, this.processDuration())
        })
    }

    public process(record: Record): boolean { return false }
    public bufferInput(record: Record): boolean { return false }

    public spwan() {
        if(this.usingBuffer() && this.outputBuffer.length >= this.outputBufferSize()) return
        let record: Record = (this.object.scene as Acwern).records.create(this.x, this.y)
        if(this.usingBuffer())
            this.bufferOutput(record)
        else this.send(record)
    }
}