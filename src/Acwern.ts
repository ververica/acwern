import 'phaser'
import Source from "./objects/source"
import Sink from "./objects/Sink"
import Operator from "./objects/operator"
import { Record, RecordKey } from "./objects/record"
import RecordGroup from "./objects/RecordGroup"

export default class Acwern extends Phaser.Scene {
    sources: Source[];
    sinks: Sink[];
    operators: Operator[];
    tilemap: Array<Array<number>>;

    sourceRecordGroup!: RecordGroup
    operatorRecordGroup!: RecordGroup

    usecaseConfig!: Object

    constructor() {
        super("acwern");

        this.tilemap = [];
        this.sources = [];
        this.sinks = [];
        this.operators = [];
    }


    create() {
        this.buildUsecase(this.cache.json.get('usecase'));

        for(let i = 0; i < 512 / 32; i++) {
            this.tilemap[i] = [];
            for(let j = 0; j < 1024 / 32; j++) {
                this.tilemap[i][j] = Math.floor(Math.random() * 5);
            }
        }

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

    buildUsecase(data) {
        this.usecaseConfig = data.config;
        let job = data.job;
        
        for(let operator of job.operators) {
            this.operators.push(new Operator(this.operators.length, operator.id))
        }

        for(let source of job.sources) {
            this.sources.push(new Source(this.sources.length, source.id, 2, 0))
        }

        for(let sink of job.sinks) {
            this.sinks.push(new Sink(this.sinks.length, sink.id, new Set([RecordKey.A])));
        }
    }

    update() { }

    getSinksThatAccept(key: RecordKey) {
        return this.sinks.filter(sink => sink.accepts.has(key));
    }

}
