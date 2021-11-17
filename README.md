![Acwern Logo](gfx/logo.png)

# Acwern

[Phaser 3](https://phaser.io) based [Apache Flink](https://flink.apache.org) concept visualization library.

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Getting started

Install all dependencies
```bash
npm install
```

Run a development server
```
npm run start
```

Build a dist
```
npm run build
```

Publish on Github page (you need to have access to the ververica/acwern repo)

```
npm run publish
```

## Documentation

### Use case description

A Flink use case is defined through a json file. This can look something like this:

```json
{

"config": {

},

"job": {

    "sources": [
        {
            "id": "source-1",
            "type": "simple",
            "config": {

            }
        }, ...
    ],

    "sinks": [
        {
            "id": "sink-1",
            "type": "simple",
            "config": {
                
            }
        }, ...
    ],

    "operators": [
        {
            "id": "operator-1",
            "type": "simple",
            "config": {
                
            }
        }, ...
    ],

    "vertices": [
        {
            "from": "source-1",
            "to": "operator-1",
            "type": "simple",
            "config": {
                
            }
        }
    ]

}
}
```


### `config`

The config object contains general options for the modelled use case as well es visual options.


### `operators`

A list of operators.


### `sources`

A list of sources. Like in Flink sources are a special case of operators. 


### `sinks`

A list of sinks. Like in Flink sinks are a special case of operators.


### `vertices`

A list of vertices that connect operators with each other.