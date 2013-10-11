"use strict";

module.exports = function(grunt) {
    // Load plugins
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-release");

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            all: [
                "Gruntfile.js",
                "index.js",
                "lib/**/*.js",
                "<%= mochaTest.test.src %>",
            ],
            options: {
                // .jshintrc used to allow compatibility with editors without
                // grunt
                jshintrc: ".jshintrc"
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: "spec"
                },
                src: [ "test/**/*.js" ]
            },
        },
        release: {
            options: {
                tagName: "v<%= version %>",
            }
        }
    });

    // define tasks
    grunt.registerTask("default", [ "test" ]);
    grunt.registerTask("test", [ "jshint", "mochaTest:test" ]);
};
