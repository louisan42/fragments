const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    await Fragment.delete(user, id);
    res.status(200).send(createSuccessResponse(200, 'Fragment deleted'));
  } catch (error) {
    res.status(404).send(createErrorResponse(404, error.message));
    logger.error(error);
  }
};
