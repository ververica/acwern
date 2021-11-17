import "phaser"
import Acwern from "./Acwern"
import Preload from "./Preload"

let usecase = window.location.hash ? window.location.hash.substring(1) : null


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
    }, data: {
        usecase: usecase
    }
}

const game = new Phaser.Game(config)
game.registry.set("usecase", usecase)

let request = new XMLHttpRequest()
request.onreadystatechange = (event) => {
    if(request.readyState == 4 && request.status == 200) {
        let html = ""
        let data = JSON.parse(request.response)
        for(let example of data) {
            html += `<li><a href='index.html#${example.file}'>${example.title}</a></li>`
        }
        (document.getElementById('menu') as HTMLElement).innerHTML = html
    }
}

request.open("get", "examples/examples.json");
request.send(null);

