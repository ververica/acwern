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

  create(scene: Simple) {
    this.object = scene.physics.add.image(50, 75, "tree");
    this.object.setPosition(50, 75 + (this.object.height + 30) * this.offset);
    this.text = scene.add.text(
      25,
      this.object.height + 10 + (this.object.height + 30) * this.offset,
      this.name
    );

    scene.time.addEvent({
      delay: 1000 / this.rate,
      callback: _ => { scene.acornGroup.fireAcornAt(
        this.object.x,
        this.object.y,
        scene.operator.object.x,
        scene.operator.object.y);
      },
      loop: true
    });
  }
}

class Operator {
  name: string;
  object: Phaser.Physics.Arcade.Image;
  text: Phaser.GameObjects.Text;

  constructor(name: string) {
    this.name = name;
  }

  create(scene: Simple) {
    this.object = scene.physics.add.staticImage(300, 200, "squirrel");
    this.text = scene.add.text(280, this.object.height / 2 + 200, this.name);

    scene.physics.add.collider(this.object, scene.acornGroup, (operator, acorn: Acorn) => {
      acorn.kill();

      for (var sink of scene.sinks) {
        scene.acornGroup.fireAcornAt(this.object.x, this.object.y, sink.object.x, sink.object.y);
      }
    });
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

  create(scene: Simple) {
    this.object = scene.physics.add.staticImage(550, 75 + (95 * this.offset), "cave");
    this.text = scene.add.text(
      525,
      75 + this.object.height / 2 + (this.object.height + 30) * this.offset,
      this.name
    );

    scene.physics.add.collider(this.object, scene.acornGroup, (sink, acorn: Acorn) => {
      acorn.kill();
    });
  }
}

class AcornGroup extends Phaser.Physics.Arcade.Group {

  scene: Simple;

  constructor(scene: Simple) {
    super(scene.physics.world, scene);

    this.createMultiple({
      classType: Acorn,
      frameQuantity: 300,
      active: false,
      visible: false,
      key: 'acorn'
    })
  }

  fireAcornAt(sx, sy, x, y) {
    const acorn = this.getFirstDead(false);
    if (acorn) {
      acorn.fire(sx, sy);
      this.scene.physics.accelerateTo(acorn, x, y, 200);
    }
  }
}

class Acorn extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'acorn');
  }

  fire(x: number, y: number) {
    this.body.reset(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setAngularVelocity(400);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.x >= 500) {
      this.kill();
    }
  }

  kill() {
    this.setActive(false);
    this.setVisible(false);
  }
}

export default class Simple extends Phaser.Scene {
  private sources: Source[];
  sinks: Sink[];
  operator: Operator;

  acornGroup: AcornGroup;

  constructor() {
    super("simple");

    let sources = [
      { name: "src 1", rate: 1 },
      { name: "src 2", rate: 2 },
      { name: "src 3", rate: 3 },
    ];
    this.sources = sources.map((x, idx) => new Source(idx, x.name, x.rate));

    this.operator = new Operator("map()");

    let sinks = [
        { name: "snk 1" },
        { name: "snk 2" }
    ];
    this.sinks = sinks.map((x, idx) => new Sink(idx, x.name));

    this.acornGroup;
  }

  preload() {
    this.load.image("tree", "assets/tree.png");
    this.load.image("squirrel", "assets/squirrel.png");
    this.load.image("cave", "assets/cave.png");
    this.load.image("acorn", "assets/acorn.png");
  }

  create() {
    this.acornGroup = new AcornGroup(this);

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
    arcade: { debug: false },
  },
};

const game = new Phaser.Game(config);
