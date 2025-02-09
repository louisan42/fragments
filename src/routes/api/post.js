//const { logger } = require('../../logger');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
module.exports = async (req, res, next) => {
  const data = req.body;
  const type = req.headers['content-type'];
  const user = req.user;

  logger.debug(`type: ${type}\nuser: ${user}`);
  if (!Fragment.isSupportedType(type)) {
    res.status(415).send(createErrorResponse(415, 'Unsupported content type'));
    logger.info(`Unsupported content type: ${type}`);
  } else {
    try {
      const fragment = new Fragment({
        ownerId: req.user,
        type: type,
        size: Buffer.byteLength(data),
      });

      // if (type == 'text/markdown') {
      //   fragment.id = `${fragment.id}.md`;
      // }
      await fragment.save();
      await fragment.setData(data);
      const location = `${process.env.API_URL}/v1/fragments/${fragment.id}`;
      logger.debug(`POST location: ${location}`);
      res
        .location(location)
        .status(201)
        .send(createSuccessResponse({ fragment: fragment }));
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }
};
