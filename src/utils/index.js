const logger = require('../logger');
// eslint-disable-next-line no-unused-vars
const { Fragment } = require('../model/fragment');

const validTypes = [
  `text/plain`,
  `text/markdown`,
  `text/html`,
  `application/json`,
  `image/png`,
  `image/jpeg`,
  `image/webp`,
  `image/gif`,
];

const convertType = async (ext, /**@type {Fragment} */ fragment) => {
  let type;
  let data;
  const fragmentData = await fragment.getData();
  if (ext === 'txt') {
    type = 'text/plain';
    if (fragment.formats.includes(type)) {
      data = fragmentData.toString();
      logger.debug(`converted data: ${data}`);
    } else {
      logger.debug(`no conversion for ${type}`);
      throw new Error(`no conversion for ${type}`);
    }
  }
  return { type, data };
};

module.exports.validTypes = validTypes;
module.exports.convertType = convertType;
