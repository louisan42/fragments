// src/routes/api/get.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { convertType } = require('../../utils');

/**
 * Get a list of fragments for the current user
 */
module.exports.getAll = async (req, res) => {
  const user = req.user;
  // if expand is included in the query, we want to return the full fragment metadata
  const expand = req.query.expand || 0;

  //const fragments = expand == 1 ? await Fragment.byUser(user, true) : await Fragment.byUser(user);
  const fragments = await Fragment.byUser(user, expand);
  res.status(200).send(createSuccessResponse({ fragments: fragments }));
};

// Get a single fragment by id
// GET /v1/fragments/:id(.ext) optional extension
module.exports.getOne = async (req, res) => {
  try {
    const user = req.user;
    let id = req.params.id;
    const dotIndex = id.indexOf('.');
    if (dotIndex > 0) {
      var ext = id.split('.').pop();
      id = id.substring(0, dotIndex);
    }
    logger.debug(`id: ${id}\next: ${ext}\nuser: ${user}`);
    const fMetadata = await Fragment.byId(user, id);

    const fragment = new Fragment(fMetadata);

    //const type = fragment.mimeType;
    if (ext) {
      try {
        var { type, data } = await convertType(ext, fragment);
        res.setHeader('Content-Type', type);
        res.status(200).send(data);
      } catch (error) {
        logger.error(error);
        res.status(415).send(createErrorResponse(415, 'Unsupported extension type'));
      }
    } else {
      var fData = await fragment.getData();
      res.setHeader('Content-Type', fragment.type);
      res.status(200).send(fData);
    }

    logger.debug(`type: ${type ? type : fragment.type}\ndata: ${data ? data : fData}`);
  } catch (error) {
    logger.debug(error);
    res.status(404).send(createErrorResponse(404, 'Fragment not found'));
  }
};
