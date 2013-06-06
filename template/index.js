var FS = require('fs');
var PATH = require('path');
var GETOPT = new require('node-getopt');
var EXPRESS = require('express');
var HANDLEBARS = require('handlebars');
var BROWSERIFY = require('browserify');
var COLORS = require('colors');

var getopt = new GETOPT([
	['p', '='],
	['n', '=']
]).bindHelp();

var options = getopt.parse(process.argv.slice(2)).options;

var bundle = null;

// Creating config object.
var title = process.env.npm_package_name || 'game';
var port = options.p || process.env.npm_package_config_port || 8000;
var hostname = options.n || process.env.npm_package_config_hostname || undefined;

var template = HANDLEBARS.compile(FS.readFileSync(PATH.join(__dirname, 'index.html'), 'utf-8'));
var server = EXPRESS();

// Routing for game source.
server.get('/' + title + '.js', function(request, response) {

	if (bundle === null) {
		var browserify = BROWSERIFY();
		browserify.require('./src/index.js', {
			expose: title
		});
		browserify.bundle({}, function(error, source) {
            if (error) {
                console.log(error.message);
                response.send(500, {
                    error: error.message
                });
            } else {
                bundle = source;
                response.set('Content-Type', 'text/javascript');
                response.send(bundle);
			}
		});
	} else {
        response.set('Content-Type', 'text/javascript');
        response.send(bundle);
	}
});

// Routing for index.
server.get('/', function(request, response) {
	response.send(template({
		title: title
	}));
});

// Routing for assets.
server.use(EXPRESS.static(__dirname + '/asset'));

// Starting the server.
server.listen(port);

// Logging feedback.
console.log('---------------------------------------------------------------------------'.cyan);
console.log('Serving '.cyan + title + ' at '.cyan + 'http://' + (hostname || 'localhost') + (port !== 80 ? ':' + port : '') + '/');
console.log('---------------------------------------------------------------------------\n'.cyan);