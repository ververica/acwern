export default abstract class AbstractOperator {
    private from!: AbstractOperator[]
    private to!: AbstractOperator[]
    private id: string

    protected x: number
    protected y: number

    constructor(id: string) {
        this.id = id
        this.from = []
        this.to = []
        this.x = 0, this.y =0
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
}