import "phaser";

enum AcornKey {
    A,
    B,
    C
}

function randomEnum<T>(anEnum: T): T[keyof T] {
    const enumValues = Object.keys(anEnum)
        .map(n => Number.parseInt(n))
        .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
    const randomIndex = Math.floor(Math.random() * enumValues.length)
    const randomEnumValue = enumValues[randomIndex]
    return randomEnumValue;
}

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
            callback: _ => {
                scene.sourceAcornGroup.fireAcornAt(
                    400,
                    this.object.x,
                    this.object.y,
                    scene.operators[this.offset].object.x,
                    scene.operators[this.offset].object.y,
                    randomEnum(AcornKey)
                );
            },
            loop: true
        });
    }
}

class Operator {
    name: string;
    offset: number;
    object: Phaser.Physics.Arcade.Image;
    text: Phaser.GameObjects.Text;

    constructor(offset: number, name: string) {
        this.offset = offset;
        this.name = name;
    }

    create(scene: Simple) {
        this.object = scene.physics.add.staticImage(300, 50 + this.offset * 200, "squirrel");
        this.text = scene.add.text(280, this.object.height / 2 + 50 + this.offset * 200, this.name);

        scene.physics.add.collider(this.object, scene.sourceAcornGroup, (operator, acorn: Acorn) => {
            acorn.kill();

            for (var sink of scene.getSinksThatAccept(acorn.acornKey)) {
                scene.operatorAcornGroup.fireAcornAt(0, this.object.x, this.object.y, sink.object.x, sink.object.y, acorn.acornKey);
            }
        });
    }
}

class Sink {
    name: string;
    offset: number;
    accepts: Set<AcornKey>;
    object: Phaser.Physics.Arcade.Image;
    text: Phaser.GameObjects.Text;

    constructor(offset: number, name: string, accepts: Set<AcornKey>) {
        this.offset = offset;
        this.name = name;
        this.accepts = accepts;
    }

    create(scene: Simple) {
        this.object = scene.physics.add.staticImage(550, 75 + (175 * this.offset), "cave");
        this.text = scene.add.text(
            525,
            75 + this.object.height / 2 + (this.object.height + 112) * this.offset,
            this.name
        );

        scene.physics.add.collider(this.object, scene.operatorAcornGroup, (sink, acorn: Acorn) => {
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

    fireAcornAt(angularVelocity, sx, sy, x, y, key: AcornKey) {
        const acorn = this.getFirstDead(false);
        if (acorn) {
            acorn.fire(angularVelocity, sx, sy, key);
            this.scene.physics.accelerateTo(acorn, x, y, 200);
        }
    }
}

class Acorn extends Phaser.Physics.Arcade.Sprite {
    acornKey: AcornKey;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'acorn');
    }

    fire(angularVelocity: number, x: number, y: number, k: AcornKey) {
        this.acornKey = k;

        this.body.reset(x, y);
        switch (+k) {
            case AcornKey.A:
                this.setTint(0xff0000);
                break;
            case AcornKey.B:
                this.setTint(0x00ff00);
                break;
            case AcornKey.C:
                this.setTint(0x0000ff);
                break;
        }
        this.setActive(true);
        this.setVisible(true);
        this.setAngularVelocity(angularVelocity);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.x >= 500) {
            this.kill();
        }
    }

    kill() {
        this.x = 0;
        this.y = 0;
        this.setActive(false);
        this.setVisible(false);
    }

}

export default class Simple extends Phaser.Scene {
    private sources: Source[];
    sinks: Sink[];
    operators: Operator[];

    sourceAcornGroup: AcornGroup;
    operatorAcornGroup: AcornGroup;

    constructor() {
        super("simple");

        let sources = [
            { name: "src 1", rate: 4 },
            { name: "src 2", rate: 3.4 },
            { name: "src 3", rate: 5.3 },
        ];
        this.sources = sources.map((x, idx) => new Source(idx, x.name, x.rate));

        let operators = [
            { name: "keyBy / unspin 1"},
            { name: "keyBy / unspin 2"},
            { name: "keyBy / unspin 3"},
        ]
        this.operators = operators.map((x, idx) => new Operator(idx, x.name));

        let sinks = [
            { name: "Red", accepts: [AcornKey.A] },
            { name: "Green", accepts: [AcornKey.B] },
            { name: "Blue", accepts: [AcornKey.C] },
        ];
        this.sinks = sinks.map((x, idx) => new Sink(idx, x.name, new Set(x.accepts)));

        this.sourceAcornGroup;
        this.operatorAcornGroup;
    }

    preload() {
        this.load.image("tree", "assets/tree.png");
        this.load.image("squirrel", "assets/squirrel.png");
        this.load.image("cave", "assets/cave.png");
        this.load.image("acorn", "assets/acorn.png");
    }

    create() {
        this.sourceAcornGroup = new AcornGroup(this);
        this.operatorAcornGroup = new AcornGroup(this);

        for (var source of this.sources) {
            source.create(this);
        }

        for (var operator of this.operators) {
            operator.create(this);
        }

        for (var sink of this.sinks) {
            sink.create(this);
        }
    }

    update() { }

    getSinksThatAccept(key: AcornKey) {
        return this.sinks.filter(sink => sink.accepts.has(key));
    }

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
