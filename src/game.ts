import "phaser";
import { Complex } from "./complex";
import { Simple } from "./simple";

const config = {
    type: Phaser.AUTO,
    backgroundColor: "#FFFFFF",
    width: 1024,
    height: 512,
    scene: Complex,
    physics: {
        default: "arcade",
        arcade: { debug: false },
    },
};

const game = new Phaser.Game(config);
