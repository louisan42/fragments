const logger = require('../logger');
// eslint-disable-next-line no-unused-vars
const { Fragment } = require('../model/fragment');
//const { createErrorResponse } = require('../response');
const md = require('markdown-it')();

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
      throw new Error('Unsupported extension type');
    }
  } else if (ext === 'md') {
    type = 'text/markdown';
    if (fragment.formats.includes(type)) {
      data = md.render(fragmentData.toString());
      logger.debug(`converted data: ${data}`);
    } else {
      logger.debug(`no conversion for ${type}`);
      throw new Error('Unsupported extension type');
    }
  }
  return { type, data };
};

module.exports.validTypes = validTypes;
module.exports.convertType = convertType;
