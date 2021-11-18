import "phaser"
import Record from "./record"
import Acwern from "../acwern"
import AbstractOperator from "./AbstractOperator";

export default class Operator extends AbstractOperator {
    name: string;
    object!: Phaser.Physics.Arcade.Image;
    text!: Phaser.GameObjects.Text;

    constructor(id: string, name: string, config: Object) {
        super(id)
        this.name = name;
        this.config = config
    }

    create(scene: Acwern) {
        this.object = scene.physics.add.staticImage(this.x, this.y, "squirrel");
        this.text = scene.add.text(
            this.x - this.object.width / 2,
            this.y + this.object.height / 2,
            this.name,
            { color: 'black', align: 'center' }
        );

        if(this.getConfigValue("useBuffer", false)) { 
            this.createOutputBuffer(this.getConfigValue("bufferSize", 2), scene)
            this.createInputBuffer(this.getConfigValue("bufferSize", 2), scene)
        }

        scene.physics.add.collider(this.object, scene.records, (operator, object: Phaser.GameObjects.GameObject) => {
            let record:Record = object as Record;
            record.kill();

            for (var to of this.getTo()) {
                scene.records.fireAcornAt(0, this.object.x + 48, this.object.y, to.getPosition().x, to.getPosition().y, record.recordKey);
            }
        });
    }
}