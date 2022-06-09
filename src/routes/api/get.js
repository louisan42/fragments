// src/routes/api/get.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports.getAll = async (req, res) => {
  const user = req.user;
  // if expand is included in the query, we want to return the full fragment metadata
  const expand = req.query.expand || 0;

  const fragments = expand == 1 ? await Fragment.byUser(user, true) : await Fragment.byUser(user);
  res.status(200).send(createSuccessResponse({ fragments: fragments }));
};
