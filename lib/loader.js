const fs = require('fs');
const co = require('co');
const debug = require('debug')('bucanero:loader');
const path = require('path');
const root = require('app-root-path').toString();


const plugins = {
  load(options = {}){
    const {plugins, pluginsRoot, handlersRoot} = Object.assign({}, {
      pluginsRoot: './plugins',
      handlersRoot: './handlers',
      plugins: []
    }, options);

    debug('start loading plugins');

    const corePlugins = fs.readdirSync(path.join(__dirname, '../plugins'))
      .map(f=>require(path.join(__dirname, '../plugins', f)));

    const appPlugins = fs.readdirSync(path.join(root, pluginsRoot))
      .map(f=>require(path.join(root, pluginsRoot, f)));

    const modulePlugins = plugins.map(p=>require(p));

    this.plugins = [...corePlugins, ...appPlugins, ...modulePlugins];
    debug('loading plugins is finished');

    debug('start loading handlers');
    this.handlers = [];

    const handlerModules = fs.readdirSync(path.join(root, handlersRoot))
      .map(f=>require(path.join(root, handlersRoot, f)))

    for (const m of handlerModules) {
      this.handlers.push(...Object.keys(m).map(key => m[key]));
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
        yield Promise.resolve(plugin.init(app, handlers));
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