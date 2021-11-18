import "phaser"
import { Record, RecordKey } from "./record"
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
        this.object = scene.physics.add.staticImage(this.x, this.y, "cave");
        this.text = scene.add.text(
            this.x - this.object.width / 2,
            this.y + this.object.height / 2,
            this.name,
            { color: 'black', align: 'center' }
        )

        if(this.getConfigValue("useBuffer", false)) this.createInputBuffer(this.getConfigValue("bufferSize", 2), scene)

        scene.physics.add.collider(this.object, scene.records, (sink, acorn: Phaser.GameObjects.GameObject) => {
            (acorn as Record).kill();
        })
    }
}