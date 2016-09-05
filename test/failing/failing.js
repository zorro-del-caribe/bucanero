module.exports = {
  priority: 200,
  init: function () {
    throw new Error('failing plugin');
  }
};