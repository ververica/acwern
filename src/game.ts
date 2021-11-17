import "phaser"
import Acwern from "./Acwern"
import Preload from "./Preload"

const config = {
    type: Phaser.AUTO,
    backgroundColor: "#FFFFFF",
    width: 1024,
    height: 512,
    parent: 'akwern',
    scene: [Preload, Acwern],
    physics: {
        default: "arcade",
        arcade: { debug: false },
    },
};

const game = new Phaser.Game(config);