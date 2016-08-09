module.exports = {
  priority: 50,
  init: function (app, handlers) {
    handlers.push({
      handler: function * (next) {
        this.body.plugin = 'hello';
      }
    });
    return app;
  }
};