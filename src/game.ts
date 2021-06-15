import "phaser";

class Source {
  offset: number;
  name: string;
  rate: number;
  object: Phaser.Physics.Arcade.Image;
  text: Phaser.GameObjects.Text;

  constructor(offset: number, name: string, rate: number) {
    this.offset = offset;
    this.name = name;
    this.rate = rate;
  }

  create(scene: Phaser.Scene) {
    this.object = scene.physics.add.image(50, 75, "tree");
    this.object.setPosition(50, 75 + (this.object.height + 30) * this.offset);
    this.text = scene.add.text(
      25,
      this.object.height + 10 + (this.object.height + 30) * this.offset,
      this.name
    );
  }
}

class Operator {
  name: string;
  object: Phaser.Physics.Arcade.Image;
  text: Phaser.GameObjects.Text;

  constructor(name: string) {
    this.name = name;
  }

  create(scene: Phaser.Scene) {
    this.object = scene.physics.add.image(300, 200, "squirrel");
    this.text = scene.add.text(280, this.object.height / 2 + 200, this.name);
  }
}

class Sink {
  name: string;
  offset: number;
  object: Phaser.Physics.Arcade.Image;
  text: Phaser.GameObjects.Text;

  constructor(offset: number, name: string) {
    this.offset = offset;
    this.name = name;
  }

  create(scene: Phaser.Scene) {
    this.object = scene.physics.add.image(550, 50, "cave");
    this.object.setPosition(550, 75 + (this.object.height + 30) * this.offset);
    this.text = scene.add.text(
      525,
      75 + this.object.height / 2 + (this.object.height + 30) * this.offset,
      this.name
    );
  }
}

export default class Simple extends Phaser.Scene {
  private sources: Source[];
  private sinks: Sink[];
  private operator: Operator;

  constructor() {
    super("simple");

    let sources = [
      { name: "src 1", rate: 1 },
      { name: "src 2", rate: 1 },
      { name: "src 3", rate: 1 },
    ];
    this.sources = sources.map((x, idx) => new Source(idx, x.name, x.rate));

    this.operator = new Operator("map()");

    let sinks = [
        { name: "snk 1" },
        { name: "snk 2" }
    ];
    this.sinks = sinks.map((x, idx) => new Sink(idx, x.name));
  }

  preload() {
    this.load.image("tree", "assets/tree.png");
    this.load.image("squirrel", "assets/squirrel.png");
    this.load.image("cave", "assets/cave.png");
  }

  create() {
    for (var source of this.sources) {
      source.create(this);
    }

    this.operator.create(this);

    for (var sink of this.sinks) {
      sink.create(this);
    }
  }

  update() {}
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#125555",
  width: 800,
  height: 600,
  scene: Simple,
  physics: {
    default: "arcade",
    arcade: { debug: true },
  },
};

const game = new Phaser.Game(config);
