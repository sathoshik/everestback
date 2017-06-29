module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.initConfig({
    eslint: {
      options: {
        configFile: '.eslintrc'
      },
      target: ['Gruntfile.js', 'app/**/*.js', 'test_client/**/*.js']
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'results.txt',
          quiet: false,
          clearRequireCache: false,
          noFail: false
        },
        src: ['test/**/*.js']
      }
    }
  });
  grunt.registerTask('default', ['eslint']);
};
