import "phaser"
import Acwern from "../acwern"
import Record from "./record"

export default abstract class AbstractOperator {
    private id: string
    protected config!:Object

    private from!: AbstractOperator[]
    private to!: AbstractOperator[]

    protected x: number
    protected y: number

    protected outputBuffer: Record[] = []
    protected inputBuffer: Record[] = []
    protected incoming: Record[] = []
    protected processing?:Record = undefined

    constructor(id: string) {
        this.id = id
        this.from = []
        this.to = []
        this.x = 0, this.y =0
        this.config = {}
    }

    public getId(): string {
        return this.id
    }

    public getFrom(): AbstractOperator[] {
        return this.from
    }

    public addFrom(from: AbstractOperator) {
        this.from.push(from)
    }

    public removeFrom(from: AbstractOperator) {
        const index = this.from.indexOf(from, 0);
        if (index > -1) this.from.splice(index, 1);   
    }

    public getTo(): AbstractOperator[] {
        return this.to
    }

    public addTo(to: AbstractOperator) {
        this.to.push(to)
    }

    public removeTo(to: AbstractOperator) {
        const index = this.to.indexOf(to, 0);
        if (index > -1) this.to.splice(index, 1);   
    }

    public setPosition(x: number, y: number) {
        this.x = x, this.y = y
    }

    public getPosition(): {x: number, y: number} {
        return {
            x: this.x,
            y: this.y
        }
    }

    protected createOperatorConnections(scene: Acwern) {
        var graphics = scene.add.graphics();
        graphics.lineStyle(10, 0x00ffff, 1);
        graphics.fillStyle(0x00ffff, 1);

        for (let toOperator of this.getTo()) {
            let toX = toOperator.getPosition().x;
            let toY = toOperator.getPosition().y;

            let angle = Phaser.Math.Angle.Between(this.x, this.y, toX, toY);
            let yOffset = toY - 40 * angle;
            let xOffset = toX - 20 - 10 * Math.abs(angle);

            graphics.lineBetween(this.x, this.y, toX, toY);
            graphics.fillCircle(xOffset, yOffset, 20);
        }
    }

    protected getConfigValue(key: string, def : any): any {
        if(!this.config.hasOwnProperty(key)) return def
        return this.config[key]
    }

    protected setConfigValue(key: string, val: any) {
        this.config[key] = val
    }

    public processDuration() {
        return this.getConfigValue("processDuration", 2000)
    }

    public bufferSize(): integer {
        return this.getConfigValue("bufferSize", 0)
    }

    public outputBufferSize(): integer {
        return this.getConfigValue("outputBufferSize", this.bufferSize())
    }

    public inputBufferSize(): integer {
        return this.getConfigValue("inputBufferSize", this.bufferSize())
    }

    public setBufferSize(value: integer) {
        this.setConfigValue("bufferSize", value)
        this.setConfigValue("inputBufferSize", value)
        this.setConfigValue("outputBufferSize", value)
    }

    public setInputBufferSize(size: integer, includingFromOutput: boolean = false) {
        this.setConfigValue("inputBufferSize", size)
        if(includingFromOutput) {
            this.from.forEach((operator: AbstractOperator, index: number) => {
                operator.setOutputBufferSize(size)
            })
        }
    }

    public setOutputBufferSize(size: integer) {
        this.setConfigValue("outputBufferSize", size)
    }

    protected createEntryPoint(scene: Acwern) {
        scene.add.image(this.entryPoint().x, this.entryPoint().y, "network")
    }

    protected createOutputBuffer(scene: Acwern) {
        this.outputBuffer = []
        for(let i = 0; i < this.outputBufferSize(); i++) scene.add.image(this.x + 32 + 16 + 32 * i, this.y, "buffer")
    }

    protected createInputBuffer(scene: Acwern) {
        this.inputBuffer = []
        this.incoming = []
        for(let i = 0; i < this.inputBufferSize(); i++) scene.add.image(this.x - 32 - 16 - 32 * i, this.y, "buffer")
    }

    public usingBuffer(): boolean {
        return this.getConfigValue("useBuffer", false)
    }

    public canReceive() : boolean {
        if(this.usingBuffer() && this.incoming.length + this.inputBuffer.length >= this.inputBufferSize()) return false
        if(!this.usingBuffer() && (this.incoming.length || this.processing)) return false
        return true
    }

    public announce(record: Record): boolean {
        if(!this.canReceive()) return false
        this.incoming.push(record)
        return true
    }

    public receive(record: Record) : boolean {
        this.incoming.splice(this.incoming.indexOf(record), 1)
        return this.usingBuffer() ? this.bufferInput(record) : this.process(record);
    }

    public bufferInput(record: Record): boolean {
        this.processNext()
        if(this.inputBuffer.length >= this.inputBufferSize())
            return false
        this.inputBuffer.push(record)
        this.updateInputBuffer()
        this.processNext()
        return true
    }

    protected updateInputBuffer() {
        for(let i = 0; i < this.inputBuffer.length; i++) {
            this.inputBuffer[i].tweenTo(this.x - 32 - 16 - 32 * i, this.y)
        }
    }
    
    public bufferOutput(record: Record): boolean {
        this.sendNext()
        if(this.outputBuffer.length >= this.outputBufferSize())
            return false
        this.outputBuffer.push(record)
        this.updateOutputBuffer()
        this.sendNext()
        return true
    }

    protected updateOutputBuffer() {
        for(let i = this.outputBuffer.length - 1; i >= 0; i--) {
            this.outputBuffer[i].tweenTo(this.x + 32 + 16 + 32 * (this.outputBuffer.length - i - 1), this.y)
        }
    }

    public processNext() {
        if(this.inputBuffer.length) this.process(this.inputBuffer[0])
    }

    public process(record: Record): boolean {
        if(this.processing) return false
        this.inputBuffer.splice(this.inputBuffer.indexOf(record), 1)
        record.tweenTo(this.x, this.y, () => {
            record.shake(this.getConfigValue("processDuration", 2000), () => {
                this.closeProcess(record)
            })
        })
        this.processing = record
        this.updateInputBuffer()
        this.from[Phaser.Math.Between(0, this.from.length - 1)].sendNext()
        return true;
    }

    public closeProcess(record) {
        if(this.usingBuffer()) this.bufferOutput(record)
        else this.send(record)
        delete this.processing
        this.processNext()
    }

    public sendNext() {
        if(this.outputBuffer.length) this.send(this.outputBuffer[0])
    }

    public send(record: Record, to?: AbstractOperator): boolean {
        if(!to && !this.to.length) return false
        if(!to) to = this.to[Phaser.Math.Between(0, this.to.length - 1)]

        if(!to.announce(record)) {
            if(!this.usingBuffer()) record.destroy()
            return false
        }

        record.tweenTo(to.entryPoint().x, to.entryPoint().y, () => to?.receive(record))
        
        this.outputBuffer.splice(this.outputBuffer.indexOf(record), 1)
        this.updateOutputBuffer()

        return true;
    }

    public entryPoint():{x:number, y: number} {
        return {
            x: this.x - 32 - 16 - 32 * this.inputBufferSize(),
            y: this.y
        }
    }
}