module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    eslint: {
      options: {
        configFile: '.eslintrc'
      },
      target: ['Gruntfile.js', 'app/**/*.js', 'test_client/**/*.js']
    }
  });
  grunt.registerTask('default', ['eslint']);
};
