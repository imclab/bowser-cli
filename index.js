#!/usr/bin/env node

// Imports.
var HANDLEBARS = require('handlebars');
var READLINE = require('readline');
var COLORS = require('colors');
var PATH = require('path');
var NPM = require('npm');
var FS = require('fs');

var usage = '\nUsage:\n'.cyan;
usage += '    bowser [options] <command>';
usage += '\n\nCommands:\n'.cyan;
usage += '    create <game>';
usage += '\n';

// Declaring log level.
var LOG_LOW = 1;
var LOG_MED = 2;
var LOG_HIGH = 3;

function log(message, minLevel, toStderr) {
    level = 0;
    if (minLevel !== undefined) {
        if (minLevel.constructor === Number)
            level = minLevel;
        // If minLevel is omitted then arg is really toStderr
        else if (minLevel.constructor === Boolean)
            toStderr = minLevel;
    }
    if (config.debug >= level) {
        if (toStderr)
            console.error(message);
        else
            console.log(message);
    }
}

function Template(file, nicename) {
    this.file = PATH.resolve(file);
    this.name = nicename || PATH.basename(file);
    this.WHITELIST = ['.js', '.html', '.md', '.txt', '.json'];

    log('Creating template: [name: ' + this.name + '];', LOG_MED);

    // Constructor
    var stat = FS.statSync(PATH.resolve(this.file));
    if (stat && stat.isDirectory()) {
        this.type = 'dir';
        this.children = {};
        var files = FS.readdirSync(this.file);
        for (var i = 0; i < files.length; i++) {
            file = files[i];
            this.children[file] = new Template(this.file + PATH.sep + file);
        }
    } else {
        this.type = 'file';
        this.children = undefined;
    }

    this.render = function(data) {
        if (PATH.basename(this.file) === 'node_modules')
            return false;
        // Recurse and render! :D
        if (this.type === 'dir')
            for (var child in this.children)
                this.children[child].render(data);
        else {
            // Find file
            if (FS.existsSync(this.file) && this.WHITELIST.indexOf(PATH.extname(this.file)) !== -1) {
                // Read file contents
                var source = FS.readFileSync(this.file, 'utf8');
                // Create template
                console.log(typeof source);
                var template = HANDLEBARS.compile(source);
                // Render template
                this.rendered = template(data);
                return true;
            } else {
                return false;
            }
        }
    };

    this.write = function(name, data) {
        if (name === undefined)
            name = this.file;
        if (this.type === 'dir') {
            FS.mkdirSync(name);
            if (this.children !== undefined) {
                log("chdir( " + name + " );");
                process.chdir(name);
                for (var child in this.children)
                    this.children[child].write(PATH.basename(this.children[child].file), data);
                process.chdir('..');
            }
        } else {
            log(name, LOG_HIGH);
            log(this.render(data), LOG_HIGH);
            FS.writeFileSync(name, this.rendered);
        }
    };
    return this;
    }

if (process.argv[2] === 'create') {
    if (!process.argv[3]) {
        console.log('\nProvide a name for the game you want to create.\n'.cyan);
        process.exit(1);
    }

    // Creating the config object.
    var config = {
        author: 'John Doe',
        title: process.argv[3],
        description: '',
        license: 'GPL',
        port: 8000,
        separate: true,
        config: null,
        debug: 0
    };

    var readline = READLINE.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('');

    readline.question(("Author (" + config.author + "): "), function(answer) {

        if (answer) {
            config.author = answer;
        }

        readline.question(("Description: "), function(answer) {

            if (answer) {
                config.description = answer;
            }

            readline.question(("License (" + config.license + "): "), function(answer) {

                if (answer) {
                    config.license = answer;
                }

                readline.question(("Port (" + config.port + "): "), function(answer) {

                    if (parseInt(answer, 10)) {
                        config.port = parseInt(answer, 10);
                    }

                    readline.question("Happy (Yes): ", function(answer) {

                        log("'" + answer + "'", LOG_HIGH);

                        if (answer.toLowerCase() === 'yes' || answer === '') {

                            // Go through and render the templates.
                            console.log('\n');
                            var template = new Template(PATH.join(__dirname, 'template'));
                            template.write(config.title, config);
                            process.chdir(config.title);
                            NPM.load(function() {
                                NPM.install(function(){
                                    console.log('\nIssue '.cyan + 'cd ' + config.title + ' followed by '.cyan + 'npm start' + '.\n'.cyan);
                                });
                                readline.close();
                            });
                        } else {
                            console.log('');
                            process.exit(1);
                        }

                    });
                });
            });
        });
    });

} else {
    console.log(usage);
    process.exit(1);
}