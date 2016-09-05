const test = require('tape');
const bucanero = require('../index');
const request = require('supertest');

test('start application on requested port', t=> {
  const app = bucanero()
    .use(function * () {
      this.body = {foo: 'bar'};
    });
  app.start()
    .then(function () {
      request(app.server)
        .get('/')
        .expect(200)
        .end(function (err, res) {
          t.error(err);
          t.equal(res.body.foo, 'bar');
          app.stop()
            .then(()=>t.end());
        });
    })
    .catch(e=>t.end(e))
});

test('run plugin in sequence to modify handlers', t=> {
  const app = bucanero({
    pluginsRoot: './test/plugins',
    handlersRoot: './test/handlers'
  });
  app.start()
    .then(function () {
      request(app.server)
        .get('/')
        .expect(200)
        .end(function (err, res) {
          t.error(err);
          t.equal(res.body.handler, 'handler');
          t.equal(res.body.plugin, 'hello');
          app.stop()
            .then(()=>t.end());
        });
    })
    .catch(e=>t.end(e))
});

test('failing initializer should end the process', t=> {
  const app = bucanero({
    pluginsRoot: './test/failing',
    handlersRoot: './test/handlers'
  });
  app.start()
    .then(function () {
      t.fail('should not reach here');
    })
    .catch(e=> {
      t.equal(e.message, 'failing plugin');
      t.end();
    });
});
