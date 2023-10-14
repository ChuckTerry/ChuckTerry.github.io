/***********************************************************************
 * Represents a vertex in 3D space.
 ***********************************************************************/
export class Vertex {

  /**
   * Generates an array of Vertex objects from the given arguments.
   * @param  {number[][]} args - The coordinates.
   * @returns {Vertex[]} - The array of Vertex objects.
   */
  static generateArrayFrom(...args) {
    return args.map(vertex => new Vertex(...vertex));
  }

  /**
   * @param {number} x - The x position of the vertex.
   * @param {number} y - The y position of the vertex.
   * @param {number} z - The z position of the vertex.
   */
  constructor(x, y, z) {

    /** @type {number} */
    this.x = x;

    /** @type {number} */
    this.y = y;

    /** @type {number} */
    this.z = z;
  }

  /**
   * Gets the length of the vertex.
   * @type {number}
   */
  get length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  /**
   * Gets the length of the vertex.
   * @type {number}
   */
  get magnitude() {
    return this.length;
  }

  /**
   * Clones the vertex.
   * @returns {Vertex} - The cloned vertex.
   */
  clone() {
    return new Vertex(this.x, this.y, this.z);
  }

  /**
   * Multiplies the vertex by a factor.
   * @param {number} factor - The multiplication factor.
   * @returns {Vertex} - The multiplied vertex.
   */
  multiply(factor) {
    return new Vertex(factor * this.x, factor * this.y, factor * this.z);
  }

  /**
   * Negates the vertex.
   * @returns {Vertex} - The negated vertex.
   */
  negate() {
    return new Vertex(-this.x, -this.y, -this.z);
  }

  /**
   * Adds the vertices.
   * @param  {Vertex[]} vertices - The vertices to be added.
   * @returns {Vertex} - The vertex resulting from the addition of the given vertices.
   */
  add(...vertices) {
    const [x, y, z] = vertices.reduce(([accX, accY, accZ], vertex) => [accX + vertex.x, accY + vertex.y, accZ + vertex.z], [this.x, this.y, this.z]);
    return new Vertex(x, y, z);
  }

  /**
   * Returns the cross product this and another Vertex.
   * @param {Vertex} vertex - The other vertex.
   * @returns {Vertex} - The cross product.
   */
  crossProduct(vertex) {
    const x = this.y * vertex.z - vertex.y * this.z;
    const y = this.z * vertex.x - vertex.z * this.x;
    const z = this.x * vertex.y - vertex.x * this.y;
    return new Vertex(x, y, z);
  }

  /**
   * Returns the normalized vertex.
   * @returns {Vertex} - The normalized vertex.
   */
  normalize() {
    const length = this.length;
    return new Vertex(this.x / length, this.y / length, this.z / length);
  }

  /**
   * Converts a vertex object to a string.
   * @returns {string} - A string representation of the vertex.
   */
  toString() {
    return `{Vertex:${this.x.toFixed(5)}, ${this.y.toFixed(5)}, ${this.z.toFixed(5)}}`;
  }

}
