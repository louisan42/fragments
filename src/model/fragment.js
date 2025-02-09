// Use https://www.npmjs.com/package/nanoid to create unique IDs
//const { nanoid } = require('nanoid');
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const { validTypes } = require('../utils');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    // TODO

    if (type == undefined) {
      throw new Error('type is required');
    } else if (!Fragment.isSupportedType(type)) {
      throw new Error('type is not supported');
    } else {
      this.type = type;
    }
    if (ownerId == undefined) {
      throw new Error('ownerId is required');
    } else {
      this.ownerId = ownerId;
    }
    this.id = id || randomUUID();
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    if (typeof size === 'number') {
      if (size >= 0) {
        this.size = size || 0;
      } else {
        throw new Error('size cannot be negative');
      }
    } else {
      throw new Error('size must be a number');
    }
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    try {
      return await listFragments(ownerId, expand);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    // TODO
    try {
      const f = await readFragment(ownerId, id);
      if (!f) {
        throw new Error('Fragment not found');
      }
      return f;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static delete(ownerId, id) {
    try {
      return deleteFragment(ownerId, id);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  save() {
    // TODO
    try {
      this.updated = new Date().toISOString();
      return writeFragment(this);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    // TODO
    try {
      const data = readFragmentData(this.ownerId, this.id);

      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('data must be a Buffer');
    }
    try {
      this.size = data.byteLength;
      this.updated = new Date().toISOString();
      return await writeFragmentData(this.ownerId, this.id, data);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    const regexPattern = /^text\//gim;
    return regexPattern.test(this.mimeType);
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    let formatsList = [];
    validTypes.forEach((type) => {
      if (this.mimeType.startsWith(type)) {
        formatsList.push(type);
      }
    });
    return formatsList;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    return validTypes.includes(type);
  }
}

module.exports.Fragment = Fragment;
