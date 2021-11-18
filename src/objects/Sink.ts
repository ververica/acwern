import "phaser"
import Record from "./record"
import Acwern from "../acwern"
import AbstractOperator from "./AbstractOperator";

export default class Sink extends AbstractOperator {
    name: string
    object!: Phaser.Physics.Arcade.Image
    text!: Phaser.GameObjects.Text

    constructor(id: string, name: string, config: Object) {
        super(id)
        this.name = name
        this.config = config
    }

    create(scene: Acwern) {
        this.createOperatorConnections(scene);
        this.object = scene.physics.add.staticImage(this.x, this.y, "cave");
        this.text = scene.add.text(
            this.x - this.object.width / 2,
            this.y + this.object.height / 2,
            this.name,
            { color: 'black', align: 'center' }
        )
        
        this.createEntryPoint(scene)
        if(this.getConfigValue("useBuffer", false)) this.createInputBuffer(scene)
    }

    public bufferOutput(record: Record): boolean {
        return this.send(record)
    }

    public send(record: Record): boolean {
        record.destroy()
        return true
    }
}