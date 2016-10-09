/* global module, require */

// var serveStatic = require("serve-static");

process.on('uncaughtException', function(error) {
	console.error("\033[31;1;m[ERROR] " + error + ( error.stack ? "\n" + error.stack : "" ) + "\033[0m");
});

process.on('unhandledRejection', function(error) {
	console.error("\033[31;1;m[ERROR] " + error + ( error.stack ? "\n" + error.stack : "" ) + "\033[0m");
});

module.exports = function (grunt) {
	"use strict";

	var debug = grunt.option("debug");

	var sServePort = '8080';
	if (grunt.option("port")) {
		sServePort = grunt.option("port");
	}

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		connect: {
			rte: {
				options: {
					port: sServePort,
					protocol: 'http',
					hostname: 'localhost',
					base: ['src', 'webapp'],
					keepalive: true,
					middleware: function(connect, options, middlewares) {
						middlewares.unshift(function(req, res, next) {
							var sPath;

							if (req.url.indexOf("/resources/sap/ui/custom/rte/themes") === 0 && req.url.substr(-4) === ".css") {
								// Build css
								var sTheme = req.url.substr(36);
								sTheme = sTheme.substr(0, sTheme.indexOf("/"));
								var less = require('less');

								debug && console.log("building theme " + sTheme);

								var sBaseFile = require("path").resolve("src/sap.ui.custom.rte/src/sap/ui/custom/rte/themes/" + sTheme + "/invalid.less");

								debug && console.log("basefile " + sBaseFile);

								less.render("@import \"grunt-standalone.less\";", { filename: sBaseFile })
								.then(function(mResult) {
									res.setHeader("Content-Type", "text/css");
									res.end(mResult.css);
								}).catch(function(oError) {
									console.error("Less ERROR: " + oError);
									res.status(500);
									res.setHeader("Content-Type", "text/plain");
									res.end("Less ERROR: " + oError);
								});
							} else {
								fnAnswer();
							}

							function fnAnswer() {
								if (req.url.indexOf("/resources/sap/ui/custom/rte") === 0) {
									sPath = req.url.substr(11);
									// console.log("FROM: " + req.url);
									req.url = "/sap.ui.custom.rte/src/" + sPath;
									// console.log("REQ: " + req.url);
									return next();
								} else {
									// console.log("REQ: " + req.url);
									return next();
								}
							}
						});
						return middlewares;
					}

				}
			}
		},

		eslint: {
			three: ['webapp/controls']
		}
	});

	// Load the plugin that provides the "uglify" task.
	// grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-eslint');

	// Default task(s).
	grunt.registerTask('serve', [ 'connect:rte' ]);

};
