module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.initConfig({
    jshint: {
      all: ['Gruntfile.js', 'app/**/*.js', 'test_client/**/*.js'],
      options: {jshintrc: '.jshintrc'}
    },
    eslint: {
      options: {
        configFile: '.eslintrc'
      },
      target: ['Gruntfile.js', 'app/**/*.js', 'test_client/**/*.js']
    }
  });
};
