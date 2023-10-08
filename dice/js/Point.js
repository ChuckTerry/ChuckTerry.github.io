/***********************************************************************
 * Represents a point in 3D space.
 ***********************************************************************/
export class Point {

  /**
   * @param {number} idNumber - The id of the point.
   * @param {Object} coordinates - The coordinates of the point.
   */
  constructor(idNumber, coordinates) {

    /** @type {number} */
    this.x = coordinates.x;

    /** @type {number} */
    this.y = coordinates.y;

    /** @type {number} */
    this.z = coordinates.z;

    /** @type {number} */
    this.face = idNumber;
  }

  /**
   * Converts a point object to a string.
   * @returns {string} - A string representation of the point.
   */
  toString() {
    return `{Point[${this.face}]:${this.x.toFixed(5)}, ${this.y.toFixed(5)}, ${this.z.toFixed(5)}}`;
  }

}
