const conf = require('conf-load')();

module.exports = {
  priority: 10,
  init: function (app) {
    app.context = app.context || {};
    app.context.conf = conf;
    return Promise.resolve(app);
  }
};