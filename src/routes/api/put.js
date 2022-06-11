const { createErrorResponse, createSuccessResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  const { id } = req.params;
  const type = req.headers['content-type'];
  const data = req.body;
  const user = req.user;
  try {
    const fMetadata = await Fragment.byId(user, id);
    const fragment = new Fragment(fMetadata);
    if (type == fragment.type) {
      await fragment.save();
      await fragment.setData(data);
      res.location(`${process.env.API_URL}/v1/fragments/${id}`);
      logger.debug(`saved fragment id: ${id}\ndata: ${data}`);
      res.status(200).send(createSuccessResponse({ fragment, formats: fragment.formats }));
    } else {
      res.status(400).send(createErrorResponse(415, 'Content-Type does not match fragment type'));
    }
  } catch (error) {
    logger.error(error);
    res.status(404).send(createErrorResponse(404, 'Fragment not found'));
  }
};
