exports.test = {
  handler: function * (next) {
    this.body = {
      handler: 'handler'
    };
    yield *next;
  }
};