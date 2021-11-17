import 'phaser'
import Source from "./objects/source"
import Sink from "./objects/Sink"
import Operator from "./objects/operator"
import { Record, RecordKey } from "./objects/record"
import RecordGroup from "./objects/RecordGroup"
import AbstractOperator from './objects/AbstractOperator'

export default class Acwern extends Phaser.Scene {
    sources: Source[];
    sinks: Sink[];
    operators: Operator[];
    tilemap: Array<Array<number>>;

    records!: RecordGroup

    usecaseConfig!: Object
    operatorRegistry: Map<string, AbstractOperator>

    constructor() {
        super("acwern");

        this.tilemap = [];
        this.sources = [];
        this.sinks = [];
        this.operators = [];
        this.operatorRegistry = new Map();
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

        this.records = new RecordGroup(this);

        for (var source of this.sources) source.create(this);
        for(var operator of this.operators) operator.create(this);
        for (var sink of this.sinks) sink.create(this);
    }

    buildUsecase(data) {
        this.usecaseConfig = data.config;
        let job = data.job;

        // Create the operators
        for(let operator of job.operators)
            this.operators.push(new Operator(operator.id, operator.id))
        for(let source of job.sources)
            this.sources.push(new Source(source.id, source.id, 2))
        for(let sink of job.sinks)
            this.sinks.push(new Sink(sink.id, sink.id, new Set([RecordKey.A])));

        // Create an operator registry
        for(let operator of this.operators) this.operatorRegistry.set(operator.getId(), operator)
        for(let source of this.sources) this.operatorRegistry.set(source.getId(), source)
        for(let sink of this.sinks) this.operatorRegistry.set(sink.getId(), sink)

        // Connect them
        for(let vertex of job.vertices) {
            if(!this.operatorRegistry.has(vertex.from) || !this.operatorRegistry.has(vertex.to)) continue
            this.operatorRegistry.get(vertex.from)?.addTo(this.operatorRegistry.get(vertex.to) as AbstractOperator)
            this.operatorRegistry.get(vertex.to)?.addFrom(this.operatorRegistry.get(vertex.from) as AbstractOperator)
        }

        // Build up the path
        let paths: AbstractOperator[][] = []
        function buildPath(operator: AbstractOperator): AbstractOperator[][] {
            let paths: AbstractOperator[][] = []
            for(let to of operator.getTo()) {
                paths = paths.concat(buildPath(to))
            }
            for(let i in paths) paths[i].unshift(operator)
            if(!paths.length) paths.push([operator])
            return paths;
        }
        for(let source of this.sources) paths = paths.concat(buildPath(source));

        // Collect all positions
        let positions: Map<string, { x: number[], y: number[] }> = new Map();
        for(let y: number = 0; y < paths.length; y++) {
            for(let x: number = 0; x < paths[y].length; x++) {
                let id:string = paths[y][x].getId()
                if(!positions.has(id)) positions.set(id, { x: [], y: []})
                positions.get(id)?.x.push(x)
                positions.get(id)?.y.push(y)
            }
        }

        // Calculate average position
        let minX: number = 1000, maxX: number = 0;
        let minY: number = 1000, maxY: number = 0;
        let finalPositions: Map<string, { x: number, y: number }> = new Map();
        this.operatorRegistry.forEach((operator: AbstractOperator, id: string) => {
            if(!positions.has(id)) return
            let avgX = (positions.get(id) as { x: number[], y: number[] }).x.reduce((a, b) => a+ b, 0) 
                / (positions.get(id) as { x: number[], y: number[] }).x.length || 0
            let avgY = (positions.get(id) as { x: number[], y: number[] }).y.reduce((a, b) => a+ b, 0) 
                / (positions.get(id) as { x: number[], y: number[] }).y.length || 0
            finalPositions.set(id, { x: avgX, y: avgY })
            minX = Math.min(minX, avgX), maxX = Math.max(maxX, avgX)
            minY = Math.min(minY, avgY), maxY = Math.max(maxY, avgY)
        })

        // Finally set the operator positions
        this.operatorRegistry.forEach((operator: AbstractOperator, id: string) => {
            if(!finalPositions.has(id)) return
            operator.setPosition(
                ((finalPositions.get(id)?.x || 0) - minX) / (maxX - minX) * (this.scale.width - 128) + 64,
                ((finalPositions.get(id)?.y || 0) - minY) / (maxY - minY) * (this.scale.height - 128) + 64
            )
        })
    }

    update() { }
}
