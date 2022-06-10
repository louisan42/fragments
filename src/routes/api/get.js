// src/routes/api/get.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { logger } = require('../../logger');

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
module.exports.getOne = async (req, res, next) => {
  try {
    const user = req.user;
    let id = req.params.id;
    const dotIndex = id.indexOf('.');
    if (dotIndex > 0) {
      var ext = id.split('.').pop();
      id = id.substring(0, dotIndex);
    }
    logger.debug(`id: ${id}\next: ${ext}\nuser: ${user}`);
    const fragment = await Fragment.byId(user, id);
    const fragmentData = await new Fragment(fragment).getData();

    res.status(200).send(createSuccessResponse({ fragment: fragment }));
  } catch (error) {
    logger.debug(error);
    next(error);
  }
};
