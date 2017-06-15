module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
<<<<<<< Updated upstream
    jshint: {
      all: ['Gruntfile.js', 'app/**/*.js', 'test_client/**/*.js'],
      options: {jshintrc: '.jshintrc'}
    },
=======
>>>>>>> Stashed changes
    eslint: {
      options: {
        configFile: '.eslintrc'
      },
      target: ['Gruntfile.js', 'app/**/*.js', 'test_client/**/*.js']
    }
  });
  grunt.registerTask('default', ['eslint']);
};
