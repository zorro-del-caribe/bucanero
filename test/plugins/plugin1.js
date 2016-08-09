module.exports = {
  priority: 100,
  description: 'mount handlers',
  init: function (app, handlers) {
    for (const handler of handlers) {
      app.use(handler.handler);
    }
    return app;
  }
};