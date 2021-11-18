import Acwern from "~/Acwern"
import Record from "./record"

export default abstract class AbstractOperator {
    private id: string
    protected config!:Object

    private from!: AbstractOperator[]
    private to!: AbstractOperator[]

    protected x: number
    protected y: number

    protected outputBuffer!: Record[]
    protected inputBuffer!: Record[]

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

    protected getConfigValue(key: string, def : any): any {
        if(!this.config.hasOwnProperty(key)) return def
        return this.config[key]
    }

    protected createOutputBuffer(bufferSize: integer, scene: Acwern) {
        this.outputBuffer = []
        for(let i = 0; i < bufferSize; i++) scene.add.image(this.x + 32 + 16 + 32 * i, this.y, "buffer")
    }

    protected createInputBuffer(bufferSize: integer, scene: Acwern) {
        this.outputBuffer = []
        for(let i = 0; i < bufferSize; i++) scene.add.image(this.x - 32 - 16 - 32 * i, this.y, "buffer")
    }
}