import Phaser from "phaser";
import { Complex } from "./complex";
import { Simple } from "./simple";


let scene : Class = Simple;

switch(window.location.href.substr(window.location.href.indexOf('?')+1).toLowerCase()) {
    case 'complex':
        scene = Complex;
    break;
}


const config = {
    type: Phaser.AUTO,
    backgroundColor: "#FFFFFF",
    width: 1024,
    height: 512,
    parent: 'akwern',
    scene: scene,
    physics: {
        default: "arcade",
        arcade: { debug: false },
    },
};

const game = new Phaser.Game(config);
