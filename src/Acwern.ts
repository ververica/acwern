import 'phaser'
import Source from "./objects/source"
import Sink from "./objects/Sink"
import Operator from "./objects/operator"
import { Record, RecordKey } from "./objects/record"
import RecordGroup from "./objects/RecordGroup"

export default class Acwern extends Phaser.Scene {
    private sources: Source[];
    sinks: Sink[];
    operators: Operator[];
    tilemap: Array<Array<number>>;

    sourceRecordGroup!: RecordGroup
    operatorRecordGroup!: RecordGroup

    constructor() {
        super("acwern");

        let operators = [ 
            { name: "keyBy" },
            { name: "keyBy2" }
        ]
        this.operators = operators.map((x, idx) => new Operator(idx, x.name));

        let sources = [
            { name: "src 1", rate: 4 },
            { name: "src 2", rate: 3.4 },
            { name: "src 3", rate: 5.3 },
        ];
        this.sources = sources.map((x, idx) => new Source(idx, x.name, x.rate, Phaser.Math.Between(0, this.operators.length - 1)));

        let sinks = [
            { name: "Red", accepts: [RecordKey.A] },
            { name: "Green", accepts: [RecordKey.B] },
            { name: "Blue", accepts: [RecordKey.C] },
            { name: "Red & Green", accepts: [RecordKey.B, RecordKey.A] }
        ];
        this.sinks = sinks.map((x, idx) => new Sink(idx, x.name, new Set(x.accepts)));

        this.sourceRecordGroup;
        this.operatorRecordGroup;

        this.tilemap = [];
        for(let i = 0; i < 512 / 32; i++) {
            this.tilemap[i] = [];
            for(let j = 0; j < 1024 / 32; j++) {
                this.tilemap[i][j] = Math.floor(Math.random() * 5);
            }
        }
    }

    create() {

        let map = this.make.tilemap({data: this.tilemap, tileWidth: 32, tileHeight: 32});
        let tiles = map.addTilesetImage('tiles');
        let layer = map.createLayer(0, tiles, 0, 0);

        this.sourceRecordGroup = new RecordGroup(this);
        this.operatorRecordGroup = new RecordGroup(this);

        for (var source of this.sources) {
            source.create(this);
        }

        for(var operator of this.operators) {
            operator.create(this);
        }

        for (var sink of this.sinks) {
            sink.create(this);
        }
    }

    update() { }

    getSinksThatAccept(key: RecordKey) {
        return this.sinks.filter(sink => sink.accepts.has(key));
    }

}
