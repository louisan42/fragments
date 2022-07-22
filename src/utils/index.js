const logger = require('../logger');
// eslint-disable-next-line no-unused-vars
const { Fragment } = require('../model/fragment');
//const { createErrorResponse } = require('../response');
const md = require('markdown-it')('default');

const validTypes = [
  `text/plain`,
  `text/plain; charset=utf-8`,
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
  logger.debug(`ext recieved: ${ext}\n id: ${fragment.id}`);
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
  } else if (ext === 'md' || fragment.type == 'text/markdown') {
    type = 'text/markdown';
    if (fragment.formats.includes(type)) {
      data = md.render(fragmentData.toString());
      logger.debug(`converted data: ${data}`);
    } else {
      logger.debug(`no conversion for ${type}`);
      throw new Error('Unsupported extension type');
    }
  }
  logger.info(`type from fnc: ${type}`);
  return { type, data };
};

module.exports.validTypes = validTypes;
module.exports.convertType = convertType;
