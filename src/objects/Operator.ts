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
        this.createEntryPoint(scene)
        if(this.usingBuffer()) { 
            this.createOutputBuffer(scene)
            this.createInputBuffer(scene)
        }
    }
}