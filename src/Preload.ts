import 'phaser'

export default class Preload extends Phaser.Scene {
    
    constructor() {
        super("preload")
    }

    public preload() {
        this.load.spritesheet("tree", "assets/tree.png", {frameWidth: 64, frameHeight: 128});
        this.load.spritesheet("squirrel", "assets/squirrel.png", {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet("cave", "assets/cave.png", {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet("acorn", "assets/acorn.png", {frameWidth: 32, frameHeight: 32});
        this.load.image("tiles", "assets/tiles.png");
    }
    

    public create() {
        this.scene.start('acwern')
        console.log("bla")
    }
}