'use strict';

module.exports = function (app) {
  const controller = require('./controller');

  app.route('/tasks')
    .get(controller.list_all_tasks)
    .post(controller.create_a_task);

  app.route('/tasks/:taskId')
    .get(controller.read_a_task);
};