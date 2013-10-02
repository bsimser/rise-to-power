require.config({
  baseUrl: 'js',
  paths: {
    jquery: 'jquery-2.0.3'
  }
});

require(['rtp/main'], function(realMain) {
  console.log('Done loading')
});
