import Record from "./record"
import Acwern from  "../acwern"

export default class RecordGroup extends Phaser.Physics.Arcade.Group {

    scene!: Acwern;
    private count: number = 0

    constructor(scene: Acwern) {
        super(scene.physics.world, scene)
        this.classType = Record
    }

    public create(x: number, y: number) {
        let record: Record =  super.create(x, y, "acorn")
        record.iteration = this.count++
        record.setFrame(Phaser.Math.Between(0, 3))
        return record
    }
}