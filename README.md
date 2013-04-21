# BOWSER-CLI
============

### Enquiring

Bowser-cli is a command line interface made to simplify the creation of games based on [bowser-engine](https://github.com/bowserjs/bowser-engine). You will need to install node.js before anything else. This can be achieved using your [favorite](http://www.macports.org/) package manager or, alternatively, through [nodejs.org](http://nodejs.org). Once you have node installed, just issue the following commands from the terminal.

### Installing

```
npm install -g bowser-cli
```

Now you have installed all you need you will want to use the bowser-cli to create a game, this is very easy.

### Creating

```
bowser create <gamename>
```

This will create a folder "gamename" in your current terminal working directory.
Only a single step left before all the fun.

### Launching

```
npm start
```

Make sure to be inside the "gamename" folder when you run this. It will start the game server and by default will server at the following [address](http://localhost:8000). You are now ready to develop your game.

### Developing

All you code will be living in the "src" folder and all you assets will be served statically from the "assets" folder. The only mandatory thing is to have a index.js file in the "src" folder that exports an instance of your game. The rest of the organisation is up to you.

### Deploying

Ultimately the game is just a little node http server, therefore you can deploy your game pretty much however you like. In the future we might provide a terminal one liner allowing you to upload your game on our servers against a few dineros.

