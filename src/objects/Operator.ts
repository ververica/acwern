import "phaser"
import Record, { RecordKey, randomEnum } from "./record"
import Acwern from "../acwern"
import AbstractOperator from "./AbstractOperator";
import Source from "./source";

export default class Operator extends AbstractOperator {
    name: string;
    object!: Phaser.Physics.Arcade.Image;
    text!: Phaser.GameObjects.Text;
    barriersMap: Map<string, boolean>;

    constructor(id: string, name: string) {
        super(id)
        this.name = name;
        this.barriersMap = new Map();
    }

    create(scene: Acwern) {
        this.createOperatorConnections(scene);
        this.object = scene.physics.add.staticImage(this.x, this.y, "squirrel");
        this.text = scene.add.text(
            this.x - this.object.width / 2,
            this.y + this.object.height / 2,
            this.name,
            { color: 'black', align: 'center' }
        );

        scene.physics.add.collider(this.object, scene.records, (operator, object: Phaser.GameObjects.GameObject) => {
            let record:Record = object as Record;
            record.kill();

            if(record.recordKey == RecordKey.D) {
                if(this.isBarriersComplete(record.abstractOperator, this.getFrom())) {
                    console.log("resuming the event generator");
                    // all barriers arrive and resume the workflow
                    for (var from of this.getFrom()) {
                        if(from.getId() != record.abstractOperator.getId() && scene.eventMap.has(from.getId())) {
                            scene.time.addEvent({
                                delay: 2000 / (from as Source).rate,
                                callback: _ => {
                                    scene.records.fireAcornAt(
                                        400,
                                        from.getPosition().x,
                                        from.getPosition().y,
                                        this.object.x,
                                        this.object.y,
                                        randomEnum(RecordKey),
                                        this
                                    )
                                },
                                loop: true
                            });
                        }
                    }

                    for (var to of this.getTo()) {
                        scene.records.fireWoodAt(0, this.object.x + 48, this.object.y, to.getPosition().x, to.getPosition().y, record.recordKey, this);
                    }

                    this.resetBarriersMap();
                } else {
                    // block the current channel until other barriers arrived
                    console.log("blocking the source");
                    if(scene.eventMap.has(record.abstractOperator.getId())) {
                        let te:Phaser.Time.TimerEvent = scene.eventMap.get(record.abstractOperator.getId()) as Phaser.Time.TimerEvent;
                        scene.time.removeEvent(te);
                        console.log("removing the event generator");
                    }

                    this.addToBarriersMap(record.abstractOperator);
                }
            } else {
                // pass the acorn
                for (var to of this.getTo()) {
                    scene.records.fireAcornAt(0, this.object.x + 48, this.object.y, to.getPosition().x, to.getPosition().y, record.recordKey, this);
                }
            }
        });
    }

    isBarriersComplete(ao: AbstractOperator, from: AbstractOperator[]) {
        for (var f of from) {
            if(f.getId() == ao.getId()) {
                continue;
            }

            if(!this.barriersMap.has(f.getId())){
                return false;
            } 

            if(!this.barriersMap.get(f.getId())) {
                return false;
            }
        }

        return true;
    }

    addToBarriersMap(ao: AbstractOperator) {
        this.barriersMap.set(ao.getId(), true);
    }

    resetBarriersMap() {
        this.barriersMap.clear();
    }
}