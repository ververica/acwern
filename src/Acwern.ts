import 'phaser'
import Source from "./objects/source"
import Sink from "./objects/Sink"
import Operator from "./objects/operator"
import RecordGroup from "./objects/RecordGroup"
import AbstractOperator from './objects/AbstractOperator'
import Record from './objects/record'

export default class Acwern extends Phaser.Scene {
    sources: Source[];
    sinks: Sink[];
    operators: Operator[];
    tilemap: Array<Array<number>>;

    records!: RecordGroup

    usecaseConfig!: Object
    operatorRegistry: Map<string, AbstractOperator>
    pausePlay!: Phaser.GameObjects.Image
    checkpointTitle!: Phaser.GameObjects.Text
    recoverButton!: Phaser.GameObjects.Image

    playing: boolean = true

    checkpoints: RecordGroup[] = []

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

        this.createControls()

        this.records = new RecordGroup(this);

        this.checkpointTitle = this.add.text(this.scale.width / 2, this.scale.height - 16, "checkpoint", { color: "black" })
        this.recoverButton = this.add.image(this.scale.width / 2 - 32, this.scale.height - 32, "controls", 0)
        this.recoverButton.setInteractive({cursor: "pointer"})
        this.recoverButton.on("pointerup", () => this.recover())

        this.checkpointTitle.visible = false, this.recoverButton.visible = false

        for (var source of this.sources) source.create(this);
        for(var operator of this.operators) operator.create(this);
        for (var sink of this.sinks) sink.create(this);
    }

    pause() {
        this.tweens.pauseAll()
        this.operatorRegistry.forEach((operator: AbstractOperator) => operator.pause())
        this.pausePlay.setFrame(2)
        this.playing = false
    }

    play() {
        this.tweens.resumeAll()
        this.operatorRegistry.forEach((operator: AbstractOperator) => operator.play())
        this.pausePlay.setFrame(1)
        this.playing = true
    }

    reset(restart: boolean = true) {
        this.pause()
        this.operatorRegistry.forEach((operator: AbstractOperator) => operator.reset())
        this.records.reset()
        this.tweens.killAll()
        if(restart) this.play()
    }

    createControls() {
        let reset = this.add.image(this.scale.width - 32, this.scale.height - 32, "controls", 0)
        reset.setInteractive({cursor: "pointer"})
        reset.on("pointerup", () => this.reset())
        this.pausePlay = this.add.image(this.scale.width - 64, this.scale.height - 32, "controls", 1)
        this.pausePlay.setInteractive({cursor: "pointer"})
        this.pausePlay.on("pointerup", () => this.playing ? this.pause() : this.play())
        let checkpoint = this.add.image(this.scale.width - 96, this.scale.height - 32, "controls", 3)
        checkpoint.setInteractive({cursor: "pointer"})
        checkpoint.on("pointerup", () => this.takeCheckpoint())
    }

    takeCheckpoint() {
        this.pause()
        //currently allow only one checkpoint
        if(this.checkpoints.length) {
            this.checkpoints.pop()?.destroy(true, true)
        }
        let checkpoint = new RecordGroup(this)
        this.records.getChildren().forEach((child: Phaser.GameObjects.GameObject) => {
            let newChild: Record = checkpoint.create((child as Record).x, (child as Record).y) as Record
            newChild.setOwnership((child as Record).ownership)
            newChild.iteration = (child as Record).iteration
        })
        checkpoint.getChildren().forEach((child: Phaser.GameObjects.GameObject, index: number) => {
            this.tweens.add({
                targets: child,
                x: this.scale.width / 2 + (index % 5) * 32,
                y: this.scale.height - Math.floor(index / 5) * 32 - 32,
                duration: 1000,
                ease: "Sine.easeInOut"
            })
        })
        this.checkpoints.push(checkpoint)
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.play()
                this.checkpointTitle.visible = true, this.recoverButton.visible = true
            }
        })
    }

    recover() {
        this.reset()
        let toRecover = this.checkpoints.pop()
        if(!toRecover) return

        toRecover?.getChildren().forEach((child: Phaser.GameObjects.GameObject) => {
            this.records.add(child)
            this.operatorRegistry.get((child as Record).ownership.operatorId)?.recover(child as Record)
        })
        toRecover.clear(false, false)
        this.checkpointTitle.visible = false, this.recoverButton.visible = false
    }

    buildUsecase(data) {
        this.usecaseConfig = data.config;
        this.data.set("debug.config", { ...{
            singleSpawn: false,
            logJourney: false
            }, ...data.config.debug, 
        })
        let job = data.job;

        let defaultOperatorConfig = {
            useBuffer: false,
            bufferSize: 0,
            bufferDebloating: false,
            processDuration: 2000
        }

        let operatorConfig = {
            ...defaultOperatorConfig,
            ...(this.usecaseConfig["operator"] || {}),
            ...this.data.get("debug.config")
        }

        // Create the operators
        for(let operator of job.operators) this.operators.push(new Operator(operator.id, operator.id, { ...operatorConfig, ...operator["config"] || {} }))
        for(let source of job.sources) this.sources.push(new Source(source.id, source.id, { ...operatorConfig, ...source["config"] || {} }))
        for(let sink of job.sinks) this.sinks.push(new Sink(sink.id, sink.id, { ...operatorConfig, ...sink["config"] || {}}));

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
                (maxX == minX ? 0.5 : ((finalPositions.get(id)?.x || 0) - minX) / (maxX - minX)) * (this.scale.width - 128) + 64,
                (maxY == minY ? 0.5 : ((finalPositions.get(id)?.y || 0) - minY) / (maxY - minY)) * (this.scale.height - 128) + 64
            )
        })

        //Debloat them buffers
        if(operatorConfig["bufferDebloating"]) {
            let minTime = 100000, maxTime = 0;
            this.operatorRegistry.forEach((operator: AbstractOperator, id: string) => {
                minTime = Math.min(minTime, operator.processDuration())
                maxTime = Math.max(maxTime, operator.processDuration())
            })
            this.operatorRegistry.forEach((operator: AbstractOperator, id: string) => {
                operator.setInputBufferSize(
                    Math.round((operator.processDuration() - minTime) / (maxTime - minTime) * (operatorConfig["bufferSize"] - 1) + 1)
                    , true
                )
            })
        }
    }

    update() { }
}
