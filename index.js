const koa = require('koa');
const loader = require('./lib/loader');
const http = require('http');
const debug = require('debug')('bucanero');

module.exports = function (options = {}) {
  const app = koa();

  const loaderInstance = loader()
    .load(options);

  app.start = function (startOptions = {}) {
    return loaderInstance.init(app, startOptions)
      .then(()=> {
        let port;
        const server = http.createServer(app.callback());
        Object.defineProperty(app, 'server', {value: server});

        app.stop = function () {
          return loaderInstance.stop(app)
            .then(()=>server.close());
        };

        try {
          port = app.context.conf.value('server.port');
        } catch (e) {
          debug(e);
          port = 3000;
        }

        return new Promise(function (resolve, reject) {
          server.listen(port, function () {
            debug('Bucanero app listening on port %s', port);
            resolve(app);
          });
        });
      });
  };

  return app;
};