const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;
    try {
      await Fragment.byId(user, id);
      res.status(200).send(createSuccessResponse());
    } catch (error) {
      logger.error(error);
      res.status(404).send(createErrorResponse(404, error.message));
    }
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
