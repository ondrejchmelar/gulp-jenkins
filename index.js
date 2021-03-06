(function(){
	'use strict';

  var through = require('through2');
  var assign = require('object-assign');
  var jenkinsAPI = require('jenkins-api');
  var gutil = require('gulp-util');

	var PluginError = gutil.PluginError;

  var AUTH;
  var PLUGIN_NAME = 'gulp-jenkins';

  var gulpJenkins = function() {
    return through.obj(function(file, enc, cb) {
      if (file.isNull()) {
        cb(null, file);
        return;
      }

      if (file.isStream()) {
        cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
        return;
      }

      return cb(null, file);
    });
  };

  // {c} => credentials are optional
  function jenkinsService(c) {
    // Auth or no auth provided?
    if(typeof c !== 'undefined') {
      if(typeof c.username !== 'undefined' && typeof c.password !== 'undefined') {
        return jenkinsAPI.init('http://'+c.username+':'+c.password+'@'+c.url, c);
      } else { return new PluginError(PLUGIN_NAME, 'the provided credentials are missing a username and password'); }
    } else { return jenkinsAPI.init('http://'+c.url, c); }
  }

  function callback(err, data) {
    if(err) { return new PluginError(PLUGIN_NAME, 'failed to build with params :: ' + err.message); }
    gutil.log('Jenkins: '+gutil.colors.green(data.message));
    gutil.log('Location: \''+gutil.colors.cyan(data.location)+'\'');
  }

  function hasInitialized() {
    if(typeof AUTH === 'undefined') {
      return false;
    } else {
      return true;
    }
  }

  gulpJenkins.init = function(credentials) {
    if(typeof credentials.url === 'undefined') {
      return new PluginError(PLUGIN_NAME, 'the jenkins url was not provided');
    }
    AUTH = credentials;
  };

  gulpJenkins.all_jobs = function(cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been intialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).all_jobs(callback);
    return gulpJenkins();
  };

  gulpJenkins.job_info = function(job_name, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).job_info(job_name, callback);
    return gulpJenkins();
  };

  gulpJenkins.enable_job = function(job_name, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).enable_job(job_name, callback);
    return gulpJenkins();
  };

  gulpJenkins.disable_job = function(job_name, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).disable_job(job_name, callback);
    return gulpJenkins();
  };

  gulpJenkins.build = function(job_name, params, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    if(typeof params !== 'undefined') {
      // Building with parameters
      var opts = assign({}, params);

      if(!job_name) { return new PluginError(PLUGIN_NAME, 'job_name must be provided for publishing builds'); }
      if(!opts.tag_name) { return new PluginError(PLUGIN_NAME, 'tag_name must be provided for publishing builds'); }
      if(!opts.target_env) { return new PluginError(PLUGIN_NAME, 'target_env must be provided for publishing builds'); }

      gutil.log('Building \''+gutil.colors.cyan(job_name+'@'+AUTH.url+'\' with params ...'));

      jenkinsService(AUTH)
      .build(job_name, {
        target_env: opts.target_env,
        tag_name: opts.tag_name
      }, callback);

      return gulpJenkins();
    } else {
      // Build with no parameters
      gutil.log('Building \''+gutil.colors.cyan(job_name+'@'+AUTH.url+'\' ...'));
      jenkinsService.build(job_name, callback);
      return gulpJenkins();
    }
  };

  gulpJenkins.stop_build = function(job_name, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).stop_build(job_name, callback);
    return gulpJenkins();
  };

  gulpJenkins.build_info = function(job_name, build_number, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).build_info(job_name, build_number, callback);
    return gulpJenkins();
  };

  gulpJenkins.last_build_info = function(job_name, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).last_build_info(job_name, callback);
    return gulpJenkins();
  };

  gulpJenkins.last_build_report = function(job_name, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).last_build_report(job_name, callback);
    return gulpJenkins();
  };

  gulpJenkins.get_config_xml = function(job_name, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).get_config_xml(job_name, callback);
    return gulpJenkins();
  };

  gulpJenkins.copy_job = function(job_to_copy, new_job_title, config_fn, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).copy_job(job_to_copy, new_job_title, config_fn, callback);
    return gulpJenkins();
  };

  gulpJenkins.create_job = function(job_name, config, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).create_job(job_name, config, callback);
    return gulpJenkins();
  };

  gulpJenkins.update_job = function(job_name, config, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).update_job(job_name, function(old_config) { return config; }, callback);
    return gulpJenkins();
  };

  gulpJenkins.delete_job = function(job_name, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).delete_job(job_name, callback);
    return gulpJenkins();
  };

  gulpJenkins.last_success = function(job_name, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).last_success(job_name, callback);
    return gulpJenkins();
  };

  gulpJenkins.last_result = function(job_name, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).last_result(job_name, callback);
    return gulpJenkins();
  };

  gulpJenkins.job_output = function(job_name, build_name, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).job_output(job_name, callback);
    return gulpJenkins();
  };

  gulpJenkins.queue = function(cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).queue(callback);
    return gulpJenkins();
  };

  gulpJenkins.computers = function(cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).computers(callback);
    return gulpJenkins();
  };

  gulpJenkins.create_folder = function(folder_name, cb) {
    if(!hasInitialized()) { return new PluginError(PLUGIN_NAME, 'gulp-jenkins has not been initialized'); }
    callback = cb || callback;
    jenkinsService(AUTH).create_folder(folder_name, callback);
    return gulpJenkins();
  };

	module.exports = gulpJenkins;

})();
