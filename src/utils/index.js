const logger = require('../logger');
// eslint-disable-next-line no-unused-vars
const { Fragment } = require('../model/fragment');
//const { createErrorResponse } = require('../response');
const md = require('markdown-it')('default');
const sharp = require('sharp');

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
    data = fragmentData.toString();
    logger.debug(`converted data: ${data}`);
  } else if (ext === 'json') {
    type = 'application/json';
    data = fragmentData.toString();
    logger.debug(`converted data: ${data}`);
  } else if (ext === 'md' || ext === 'html') {
    type = 'text/html';
    data = md.render(fragmentData.toString());
    logger.debug(`converted data: ${data}`);
  } else if (ext === 'png') {
    type = 'image/png';
    data = await sharp(fragmentData).png().toBuffer();
    logger.debug(`image converted to png`);
  } else if (ext === 'jpg' || ext === 'jpeg') {
    type = 'image/jpeg';
    data = await sharp(fragmentData).jpeg().toBuffer();
    logger.debug(`image converted to jpeg`);
  } else if (ext === 'webp') {
    type = 'image/webp';
    data = await sharp(fragmentData).webp().toBuffer();
    logger.debug(`image converted to webp`);
  } else if (ext === 'gif') {
    type = 'image/gif';
    data = await sharp(fragmentData).gif().toBuffer();
    logger.debug(`image converted to gif`);
  } else {
    logger.debug(`no conversion for ${type}`);
    throw new Error('Unsupported extension type');
  }
  logger.info(`type from fnc: ${type}`);
  return { type, data };
};

module.exports.validTypes = validTypes;
module.exports.convertType = convertType;
