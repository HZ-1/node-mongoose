module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	grunt.initConfig({
		watch : {
			jade : {
				files : ['views/**'],
				options: {
					reload: true
				}
			},
			scripts: {
				files : ['public/js/**','models/**/*.js','schemas/**/*.js'],
				//tasks: ['jshint'],
				options: {
					relod: true
				}
			}
		},

		nodemon: {
			dev: {
		    script: 'app.js',
		    options: {
		      args: [],
		      nodeArgs: ['--debug'],
		      /*callback: function (nodemon) {
		        nodemon.on('log', function (event) {
		          console.log(event.colour);
		        });
		      },*/
		      env: {
		        PORT: '3000'
		      },
		      cwd: __dirname,
		      ignore: ['node_modules/**','README.md'],
		      ext: 'js',
		      watch: ['./'],
		      delay: 1000
		    }
		  },
		},
		mochaTest : {
			test: {
        options: {
          reporter: 'spec',
          captureFile: 'results.txt', // Optionally capture the reporter output to a file 
        },
        src : ['test/**/*.js']
      }
		},
		concurrent: {
        target: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        }
    }
	});
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.option('force', true);
	grunt.registerTask('default', ['concurrent:target']);
	grunt.registerTask('test', ['mochaTest']);

	//grunt

};