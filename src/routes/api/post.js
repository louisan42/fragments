//const { logger } = require('../../logger');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');
module.exports = async (req, res) => {
  const data = req.body;
  const type = req.headers['content-type'];
  const user = req.user;

  logger.debug(`type: ${type}\nuser: ${user}\ndata: ${data}`);
  if (!Fragment.isSupportedType(type)) {
    throw new Error(`Unsupported Content-Type: ${type}`);
  }
  try {
    const fragment = new Fragment({
      ownerId: req.user,
      type: type,
      size: Buffer.byteLength(data),
    });
    await fragment.save();
    await fragment.setData(data);
    res.status(201).send(createSuccessResponse({ fragment }));
  } catch (error) {
    logger.error(error);
  }
};
