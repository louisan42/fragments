// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  // res.status(200).json({
  //   status: 'ok',
  //   fragments: [],
  // });
  res.status(200).send(createSuccessResponse({ fragments: [] }));
};
