module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            demo: {
                files: [{
                    expand: true,
                    cwd: 'demo/',
                    src: ['**'],
                    dest: 'dist/'
                }]
            }
        },
        replace: {
            demo: {
                src: ["dist/**/*.html", "dist/**/*.htm"],
                overwrite: true,
                replacements: [{
                    from: "../src/",
                    to: "/Static/"
                }]
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-text-replace');


    grunt.registerTask('default', ['copy', 'replace']);

};