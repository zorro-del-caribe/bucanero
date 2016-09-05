const fs = require('fs');
const co = require('co');
const debug = require('debug')('bucanero:loader');
const path = require('path');
const root = require('app-root-path').toString();


const plugins = {
  load(options = {}){
    const {plugins:plgs, pluginsRoot, handlersRoot} = Object.assign({}, {
      pluginsRoot: './plugins',
      handlersRoot: './handlers',
      plugins: []
    }, options);

    debug('start loading plugins');

    const corePlugins = fs.readdirSync(path.join(__dirname, '../plugins'))
      .map(f=>require(path.join(__dirname, '../plugins', f)));

    debug(corePlugins.length + ' core plugin(s) loaded');

    const appPlugins = fs.readdirSync(path.join(root, pluginsRoot))
      .map(f=>require(path.join(root, pluginsRoot, f)));

    debug(appPlugins.length + ' application plugin(s) loaded');

    const modulePlugins = plgs.map(p=>require(p));

    debug(modulePlugins.length + ' module plugin(s) loaded');

    this.plugins = [...corePlugins, ...appPlugins, ...modulePlugins];
    debug('loading plugins is finished');

    debug('start loading handlers');
    this.handlers = [];

    const handlerModules = fs.readdirSync(path.join(root, handlersRoot))
      .filter(f=> {
        const [name,extension] = f.split('.');
        return extension === 'js';
      })
      .map(f=>f.split('.')[0])
      .map(f=> {
        return {
          namespace: f,
          handlers: require(path.join(root, handlersRoot, f))
        }
      });

    for (const m of handlerModules) {
      this.handlers.push(...Object.keys(m.handlers).map(key => Object.assign({
        namespace: m.namespace,
        title: key
      }, m.handlers[key])));
    }

    debug('loading handlers is finished');

    return this;
  },

  init: co.wrap(function * (app) {

    if (!this.plugins) {
      yield this.load({});
    }

    const {plugins, handlers} = this;

    const sortedPlugins = plugins.sort((a, b)=>a.priority < b.priority ? -1 : 1);

    for (const plugin of sortedPlugins) {
      if (plugin.init) {
        yield Promise.resolve()
          .then(() => {
            return plugin.init(app, handlers)
          });
      }
    }
    return this;
  }),

  stop: co.wrap(function * (app) {
    const {plugins} = this;
    const sortedPlugins = plugins.sort((a, b)=>a.priority < b.priority ? 1 : -1);

    for (const plugin of sortedPlugins) {
      if (plugin.stop) {
        yield Promise.resolve(plugin.stop(app));
      }
    }

    return this;
  })
};

module.exports = function () {
  return Object.create(plugins);
};