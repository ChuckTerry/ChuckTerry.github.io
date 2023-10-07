const π = Math.PI;
const τ = 2 * π;
const φ = 42 * π / 180;
const HALF_TURN = 30;
const FULL_TURN = HALF_TURN << 1;
const Δ = π / HALF_TURN;
const dieVariantObject = {};

/***********************************************************************
 * Represents a point in 3D space.
 ***********************************************************************/
class Point {

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

/***********************************************************************
 * Represents a vertex in 3D space.
 ***********************************************************************/
class Vertex {

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
   * @param  {...Vertex} vertices - The vertices to be added.
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

class Matrix {

  constructor(twoDimensionalArray = [[]], major='row') {
    this.matrix = twoDimensionalArray;
    this.major = major;
    this.width = major === 'row' ? twoDimensionalArray[0].length : twoDimensionalArray.length;
    this.height = major === 'row' ? twoDimensionalArray.length : twoDimensionalArray[0].length;
  }

  transpose() {
    const twoDimensionalArray = [];
    let rowIndex = this.width;
    let colIndex = this.height;
    while (rowIndex--) {
      const row = [];
      while (colIndex--) {
        row.push(this.matrix[colIndex][rowIndex]);
      }
      twoDimensionalArray.push(row);
    }
    return new Matrix(twoDimensionalArray, this.major === 'row' ? 'column' : 'row');
  }
}

/***********************************************************************
 * Represents one face on a die.
 ***********************************************************************/
class Face {

  static normals = Vertex.generateArrayFrom([1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, -1], [0, -1, 0], [-1, 0, 0]);
  static radius = 0;

  /**
   * Face Constructor
   * @param {InstanceController} instanceController - The instance controller.
   * @param {Dice} dice - The dice object.
   * @param {number} normalIndex - The index of the normal.
   * @param {number[]} verticies - The verticies of the face.
   */
  constructor(instanceController, dice, normalIndex, verticies) {

    /** @type {InstanceController} */
    this.instanceController = instanceController;

    /** @type {Point[]} */
    this.points = [];

    /** @type {Dice} */
    this.dice = dice;

    const normal = dice.faceNormals[normalIndex];

    /** @type {Point} */
    this.normal = new Point(normalIndex, normal, true);

    /**
     * Angle of Ellipse Major Axis
     * @type {Number}
     */
    this.angle = Math.atan2(normal.x, -normal.y);

    this.resetOrigins();

    verticies.map((faceVertexIndex) => {
      const vertex = dice.vertices[faceVertexIndex];
      this.points.push(vertex);
      this.originX += vertex.x / 4;
      this.originY += vertex.y / 4;
      this.originZ += vertex.z;
    });

    if (Math.abs(normal.z) < Math.cos(φ)) {
      const normalX = new Vertex(-normal.y, normal.x, 0).normalize().multiply(Face.radius);
      const normalY = normal.crossProduct(normalX);
      const normalZ = normal.multiply(Face.obverse);
      const rotationStep = normal.z <= 0 ? 1 : -1;

      // A first test near the major axis end.
      let ro = normalX.multiply(Math.cos(-rotationStep * Δ)).add(normalY.multiply(Math.sin(-rotationStep * Δ)), normalZ);
      let rdo = ro.x ** 2 + ro.y ** 2;
      let rn = normalX.add(normalZ);
      let rdn = rn.x ** 2 + rn.y ** 2;
      let i = rdo <= rdn ? 0 : HALF_TURN; // to guide the search
      let j = i;
      let α = i;// The distance is maximum a the contact (Dice radius)
      while ((rn = normalX.multiply(Math.cos(i * Δ)).add(normalY.multiply(Math.sin(i * Δ)), normalZ)), rdo <= (rdn = rn.x ** 2 + rn.y ** 2)) {
        α = i;
        i += rotationStep;
        ro = rn;
        rdo = rdn;
      }
      this.α = (FULL_TURN - rotationStep * α) % FULL_TURN;
      this.γ = Math.atan2(ro.y, ro.x);
      if (this.γ < 0) this.γ += τ;
      if (τ <= this.γ < 0) this.γ -= τ;

      i = HALF_TURN - j;
      let beta = i;

      ro = normalX.multiply(Math.cos((i + rotationStep) * Δ)).add(normalY.multiply(Math.sin((i + rotationStep) * Δ)), normalZ);
      rdo = ro.x ** 2 + ro.y ** 2;
      rn = normalX.multiply(Math.cos(i * Δ)).add(normalY.multiply(Math.sin(i * Δ)), normalZ);
      rdn = rn.x ** 2 + rn.y ** 2;

    
      while (rdo <= rdn) {
        beta = i;
        i -= rotationStep;
        ro = rn;
        rn = normalX.multiply(Math.cos(i * Δ)).add(normalY.multiply(Math.sin(i * Δ)), normalZ);
        rdo = rdn;
        rdn = rn.x ** 2 + rn.y ** 2;
      }

      this.beta = (FULL_TURN - rotationStep * beta) % FULL_TURN;
      this.θ = Math.atan2(ro.y, ro.x);
      // Add a full turn if the angle is negative
      if (this.θ < 0) this.θ += τ;
    }
  }

  draw() {
    if (this.normal.z >= 0) return;
    const display = this.instanceController.display;
    // Fast Divide by 8
    const dmc = this.dice.radius >> 3;
    // angle of the normal and the look direction to adjust color and Ellipse ratio rh/rw
    const viewAngle = Math.abs(this.normal.z);
    const colorBase = 192 + Math.floor(64 * viewAngle);
    const color = dieVariantObject.contour(colorBase);
    display.drawEllipse(this.originX, this.originY, Face.radius, Face.radius * viewAngle, this.angle, color);
    const rh = dmc * viewAngle;
    /* Die Face Markings */
    const faceValue = this.normal.face + 1;
    const dotColor = dieVariantObject.valueDotColor;
    if (faceValue % 2 === 1) {
      display.drawEllipse(this.originX, this.originY, dmc, rh, this.angle, dotColor);
    }
    if (faceValue > 1) {
      const [ox3, oy3] = [this.originX * 3, this.originY * 3];
      const [p1x, p1y] = [this.points[1].x, this.points[1].y];
      const [p3x, p3y] = [this.points[3].x, this.points[3].y];
      display.drawEllipse((ox3 + 2 * p1x) / 5, (oy3 + 2 * p1y) / 5, dmc, rh, this.angle, dotColor);
      display.drawEllipse((ox3 + 2 * p3x) / 5, (oy3 + 2 * p3y) / 5, dmc, rh, this.angle, dotColor);
      if (faceValue > 3) {
        const [p0x, p0y] = [this.points[0].x, this.points[0].y];
        const [p2x, p2y] = [this.points[2].x, this.points[2].y];
        display.drawEllipse((ox3 + 2 * p0x) / 5, (oy3 + 2 * p0y) / 5, dmc, rh, this.angle, dotColor);
        display.drawEllipse((ox3 + 2 * p2x) / 5, (oy3 + 2 * p2y) / 5, dmc, rh, this.angle, dotColor);
        if (faceValue === 6) {
          display.drawEllipse((ox3 + p0x + p3x) / 5, (oy3 + p0y + p3y) / 5, dmc, rh, this.angle, dotColor);
          display.drawEllipse((ox3 + p2x + p1x) / 5, (oy3 + p2y + p1y) / 5, dmc, rh, this.angle, dotColor);
        }
      }
    }
  }

  /**
   * Resets the origins of the face.
   */
  resetOrigins() {
    /** @type {number} */
    this.originX = this.originY = this.originZ = 0;
  }

}

/***********************************************************************
 * Represents a single die.
 ***********************************************************************/
class Dice {

  static faceVertices = [[0, 2, 6, 3], [0, 3, 5, 1], [0, 1, 4, 2], [7, 5, 3, 6], [7, 6, 2, 4], [7, 4, 1, 5]];

  static deltaAB = [0.005, 0.005];

  /**
   * @param {InstanceController} instanceController - The instance controller.
   */
  constructor(instanceController) {
    const {width, height} = instanceController.display;

    /** @type {InstanceController} */
    this.instanceController = instanceController;

    /** @type {Point[]} */
    this.vertexNormals = Vertex.generateArrayFrom([1, 1, 1], [-1, 1, 1], [1, -1, 1], [1, 1, -1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1], [-1, -1, -1]);

    /** @type {number} */
    this.rotationAngleX = (13 + Math.floor(Math.random() * 17)) * (1 - 2 * (Math.random() < 0.5));
    
    /** @type {number} */
    this.rotationAngleY = (13 + Math.floor(Math.random() * 17)) * (1 - 2 * (Math.random() < 0.5));

    /** @type {number} */
    this.radius = Math.min(width >> 3, height >> 3);

    this.faceNormals = Vertex.generateArrayFrom([1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, -1], [0, -1, 0], [-1, 0, 0]);


    this.recalculateComponentPositions();
  } 

  /**
   * Adds rotation to the dice.
   * @param {number} x - The x rotation.
   * @param {number} y - The y rotation.
   */
  addRotation(x, y) {
    this.rotationAngleX += x;
    this.rotationAngleY += y;
  }

  /**
   * Calculates the faces of the dice.
   */
  calculateFaces() {
    const faceVertices = [[0, 2, 6, 3], [0, 3, 5, 1], [0, 1, 4, 2], [7, 5, 3, 6], [7, 6, 2, 4], [7, 4, 1, 5]];
    for (let index = 0; index < 6; index++) {
      this.faces.push(new Face(this.instanceController, this, index, faceVertices[index]));
    }
  }

  calculateRotation() {
    const aChance = Math.random();
    const bChance = Math.random();
    if (aChance < 0.15) Dice.deltaAB[0] += aChance * 0.01;
    if (bChance < 0.15) Dice.deltaAB[1] += bChance * 0.01;
    if (aChance > 0.9) Dice.deltaAB[0] -= (1 - aChance) * 0.009;
    if (bChance > 0.9) Dice.deltaAB[1] -= (1 - bChance) * 0.009;
    if (aChance > 0.989) Dice.deltaAB[0] -= aChance * 0.002;
    if (bChance > 0.989) Dice.deltaAB[1] -= bChance * 0.004;
    const a = this.rotationAngleX * Dice.deltaAB[0];
    const b = this.rotationAngleY * Dice.deltaAB[1];
    this.rotationAngleX -= a;
    this.rotationAngleY -= b;
    return [a, b];
  }

  /**
   * Calculates the verticies of the dice.
   */
  calculateVerticies() {
    for (let index = 0; index < 8; index++) {
      this.vertices.push(new Point(index, this.vertexNormals[index], false));
    }
  }

  /**
   * Checks if the dice is rolling.
   * @returns {boolean} Whether the dice is rolling.
   */
  isRolling() {
    return Math.abs(this.rotationAngleX) > 1e-5 || Math.abs(this.rotationAngleY) > 1e-5;
  }

  /**
   * Recalculates the positions of the faces and verticies.
   */
  recalculateComponentPositions() {
    /** @type {Point[]} */
    this.vertices = [];
    /** @type {Face[]} */
    this.faces = [];
    this.calculateVerticies();
    this.calculateFaces();
  }

  /**
   * Stops the rotation of the dice.
   */
  stopRotation() {
    this.rotationAngleX = this.rotationAngleY = 0;
  }

  /**
   * Caluculates the Dice Position for the next frame.
   * @param {number} a - Angle of rotation on elliptical x axis.
   * @param {number} b - Angle of rotation on elliptical y axis.
   */
  rollDice(a, b) {
    const [cosA, cosB, sinA, sinB] = [Math.cos(a), Math.cos(b), Math.sin(a), Math.sin(b)];
    for (let index = 0; index < 3; index++) {
      const normal = this.faceNormals[index];
      const depthFactor = normal.y * sinA + normal.z * cosA;
      const x = depthFactor * sinB + normal.x * cosB;
      const y = normal.y * cosA - normal.z * sinA;
      const z = depthFactor * cosB - normal.x * sinB;
      this.faceNormals[index] = new Vertex(x, y, z);
      this.faceNormals[5 - index] = this.faceNormals[index].negate();
    }
    this.vertexNormals[0] = this.faceNormals[0].add(this.faceNormals[1], this.faceNormals[2]).multiply(Face.obverse);
    this.vertexNormals[1] = this.faceNormals[0].negate().add(this.faceNormals[1], this.faceNormals[2]).multiply(Face.obverse);
    this.vertexNormals[2] = this.faceNormals[1].negate().add(this.faceNormals[0], this.faceNormals[2]).multiply(Face.obverse);
    this.vertexNormals[3] = this.faceNormals[2].negate().add(this.faceNormals[0], this.faceNormals[1]).multiply(Face.obverse);
    this.vertexNormals[4] = this.vertexNormals[3].negate();
    this.vertexNormals[5] = this.vertexNormals[2].negate();
    this.vertexNormals[6] = this.vertexNormals[1].negate();
    this.vertexNormals[7] = this.vertexNormals[0].negate();
  }

  /**
   * Calculates and returns velocities for dice movement based on randomness.
   * @returns {number[]} Array of alpha and beta values.
   */
  drawDice() {
    const [a, b] = this.calculateRotation();
    if (this.isRolling()) this.rollDice(a, b);

    this.recalculateComponentPositions();
    const display = this.instanceController.display;
    display.clear();

    // Dice background (contour)
    const contours = this.faces.filter(face => face.α > -1).sort((a, b) => b.θ - a.θ);
    const length = contours.length;
    // A circle without elliptic Arc
    if (length === 0) {
      display.drawArc(0, 0, this.dice.radius, 0, τ);
    } else {
      const lineStops = [];
      display.beginPath(dieVariantObject.bodyFill);
      for (let index = 0; index < length; index++) {
        const face = contours[index];
        const angleStop = contours[(index + 1) % length].γ;
        display.drawEllipseFromTo(face.originX, face.originY, face.α, face.beta, Face.radius, Face.radius * face.normal.z, face.angle, dieVariantObject.bodyFill);
        display.drawArc(0, 0, this.radius, face.θ, angleStop, true);
        lineStops.push(this.radius * Math.cos(angleStop), this.radius * Math.sin(angleStop));
      }
      display.beginPath();
      display.moveTo(lineStops.at(-2), lineStops.at(-1));
      for (let index = 0; index < lineStops.length; index += 2) {
        display.lineTo(lineStops[index], lineStops[index + 1]);
      }
      display.strokeFill();
    }

    this.faces.map(face => face.draw());
    window.requestAnimationFrame(() => this.drawDice());
  }

}

/***********************************************************************
 * Represents the display (canvas output).
 ***********************************************************************/
class Display {

  /**
   * @param {InstanceController} [instanceController] - The instance controller.
   * @param {string} [canvasSelector] - CSS selector for display canvas.
   */
  constructor(instanceController, canvasSelector = '#display') {
    /** @type {InstanceController} */
    this.instanceController = instanceController;
    /** @type {HTMLCanvasElement} */
    this.canvas = document.querySelector(canvasSelector);
    this.canvas.width = this.width = document.body.clientWidth;
    this.canvas.height = this.height = document.body.clientHeight;
    /** @type {CanvasRenderingContext2D} */
    this.context = this.canvas.getContext('2d');
    this.context.font = "16px Sans-Serif";
    this.context.lineWidth = this.context.miterLimit = 1;
    this.context.lineJoin = "miter";
    this.context.strokeStyle = dieVariantObject.bodyFill;
    window.addEventListener('resize', () => this.onResize());
    window.dispatchEvent(new Event('resize'));
  }

  beginPath(fillStyle = null) {
    if (fillStyle) this.context.fillStyle = fillStyle;
    this.context.beginPath();
  }

  /**
   * Clears the canvas.
   */
  clear() {
    this.context.clearRect(-(this.width >> 1), -(this.height >> 1), this.width, this.height);
  }

  /**
   * Draws an arc on the canvas.
   * @param {number} x - X coordinate of the center.
   * @param {number} y - Y coordinate of the center.
   * @param {number} radius - Radius of the arc.
   * @param {number} startAngle - Start angle of the arc.
   * @param {number} endAngle - End angle of the arc.
   * @param {boolean} counterClockwise - Whether to draw counter-clockwise.
   */
  drawArc(x, y, radius, startAngle, endAngle, counterClockwise = false) {
    this.context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
    this.strokeFill();
  }

  /**
   * Draws a partial ellipse on the canvas.
   * @param {number} x - X coordinate of the center.
   * @param {number} y - Y coordinate of the center.
   * @param {number} a - start angle.
   * @param {number} b - stop angle.
   * @param {number} rw - Ellipse horizontal radius.
   * @param {number} rh - Ellipse vertical radius.
   * @param {number} angle - Angle of rotation.
   * @param {string} color - Color of the ellipse.
   * @param {boolean} counterClockwise - Whether to draw counter-clockwise.
   */
  #drawEllipse(x, y, a, b, rw, rh, angle, color, counterClockwise = false) {
    this.context.save();
    this.context.translate(x, y);
    this.context.rotate(angle);
    this.context.scale(1, rh / rw);
    this.context.beginPath();
    this.context.arc(0, 0, rw, a, b, counterClockwise);
    this.context.restore();
    this.context.fillStyle = color;
    this.context.fill();
  }

  /**
   * Draws an ellipse on the canvas.
   * @param {number} x - X coordinate of the center.
   * @param {number} y - Y coordinate of the center.
   * @param {number} rw - Ellipse horizontal radius.
   * @param {number} rh - Ellipse vertical radius.
   * @param {number} angle - Angle of rotation.
   * @param {string} color - Color of the ellipse.
   */
  drawEllipse(x, y, rw, rh, angle, color) {
    this.#drawEllipse(x, y, 0, τ, rw, rh, angle, color);
  }

  /**
   * Draws a partial ellipse on the canvas.
   * @param {number} x - X coordinate of the center.
   * @param {number} y - Y coordinate of the center.
   * @param {number} a - start angle.
   * @param {number} b - stop angle.
   * @param {number} rw - Ellipse horizontal radius.
   * @param {number} rh - Ellipse vertical radius.
   * @param {number} angle - Angle of rotation.
   * @param {string} color - Color of the ellipse.
   * @param {boolean} counterClockwise - Whether to draw counter-clockwise.
   */
  drawEllipseFromTo(x, y, a, b, rw, rh, angle, color) {
    this.#drawEllipse(x, y, a * Δ, b * Δ, rw, rh, angle, color, true);
  }

  lineTo(x = 0, y = 0) {
    this.context.lineTo(x, y);
  }

  /**
   * Moves the context to the given coordinates.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   */
  moveTo(x = 0, y = 0) {
    this.context.moveTo(x, y);
  }

  /**
   * Handles Updating values when the window is resized.
   */
  onResize() {
    const width = this.canvas.width = this.width = document.body.clientWidth;
    const height = this.canvas.height = this.height = document.body.clientHeight;
    const dieRadius = Math.min(width >> 3, height >> 3);
    if (this.instanceController.dice) this.instanceController.dice.radius = dieRadius;
    document.querySelector('#dice-radius').value = dieRadius;
    Face.radius = dieRadius * Math.sin(φ);
    Face.obverse = dieRadius * Math.cos(φ);
    Display.bounds = 10 * dieRadius;
    this.context.translate(width >> 1, height >> 1);
    this.context.strokeStyle = dieVariantObject.bodyFill;
  }

  /**
   * Strokes and Fills the active context path.
   */
  strokeFill() {
    this.context.stroke();
    this.context.fill();
  }
}

/***********************************************************************
 * Manages User Input.
 ***********************************************************************/
class InputManager {

  /**
   * 
   * @param {InstanceController} instanceController - The display object.
   * @param {boolean} [autoRegister] - Should we automatically register event listeners?
   */
  constructor(instanceController, autoRegister = true) {
    /** @type {InstanceController} */
    this.instanceController = instanceController;
    /** @type {Display} */
    this.display = instanceController.display;
    if (autoRegister) this.registerListeners();
  }

  /**
   * Handles end of cursor activation.
   * @param {MouseEvent | TouchEvent} event 
   */
  #selectEnd(event) {
    this.isDragging = false;
  }

  /**
   * Handles cursor movement.
   * @param {MouseEvent | TouchEvent} event 
   */
  #selectMove(event) {
    this.nsx = event.clientX ?? event.touches[0].clientX;
    this.nsy = event.clientY ?? event.touches[0].clientY;
    this.srs = new Vertex(this.nsx - (this.display.width >> 1), this.nsy - (this.display.height >> 1), 0);
    if (!this.isDragging) return;
    const divisor = Display.bounds >> 4;
    this.instanceController.dice.addRotation(Math.atan((this.nsy - this.osy) / divisor), -Math.atan((this.nsx - this.osx) / divisor));
    this.osx = this.nsx;
    this.osy = this.nsy;
  }

  /**
   * Handles start of cursor activation.
   * @param {MouseEvent | TouchEvent} event 
   */
  #selectStart(event) {
    if (event.target.nodeName !== 'CANVAS') return true;
    this.isx = this.osx = event.clientX ?? event.touches[0].clientX;
    this.isy = this.osy = event.clientY ?? event.touches[0].clientY;
    this.instanceController.dice.stopRotation();
    this.isDragging = true;
  }

  onMousedown(event) { return this.#selectStart(event); }
  onMousemove(event) { return this.#selectMove(event); }
  onMouseup(event) { return this.#selectEnd(event); }
  onTouchend(event) { return this.#selectEnd(event); }
  onTouchmove(event) { return this.#selectMove(event); }
  onTouchstart(event) { return this.#selectStart(event); }

  registerListeners() {
    const eventNames = ['touchstart', 'mousedown', 'touchmove', 'mousemove', 'touchend', 'mouseup'];
    const eventCount = eventNames.length;
    for (let index = 0; index < eventCount; index++) {
      const eventName = eventNames[index];
      const onName = `on${eventName.charAt(0).toUpperCase()}${eventName.substring(1)}`;
      window.addEventListener(eventName, (event) => {
        event.preventDefault();
        return this[onName](event) ?? false;
      });
    }
  }
}

/***********************************************************************
 * Represents the instance controller.
 ***********************************************************************/ 
class InstanceController {
  static instances = [];

  constructor() {
    /** @type {Display} */
    this.display = new Display(this);
    /** @type {InputManager} */
    this.inputManager = new InputManager(this, true);
    /** @type {Dice} */
    this.dice = new Dice(this);
    this.dice.drawDice();
    InstanceController.instances.push(this);
  }
}

/**
 * Initialization Logic
 */
function init() {
  if (document.readyState !== 'complete') return window.addEventListener('load', init);

  const urlParameters = new URLSearchParams(window.location.search);
  if (urlParameters.has('style')) {
    const variant = urlParameters.get('style').toUpperCase();
    if (variant === 'RED') {
      dieVariantObject.contour = (x) => `rgb(${x}, ${x - 166}, ${x - 149})`;
      dieVariantObject.valueDotColor = '#FFFEFE';
      dieVariantObject.bodyFill = 'rgb(208, 45, 47)';
    } else if (variant === 'BLACK') {
      dieVariantObject.contour = (x) => `rgb(${x}, ${x - 3}, ${x - 7})`;
      dieVariantObject.valueDotColor = '#000000';
      dieVariantObject.bodyFill = '#FFFFFF';
    }
  }

  if (Object.keys(dieVariantObject).length === 0) {
    dieVariantObject.contour = (x) => `rgb(${x - 150}, ${x - 16}, ${x + 16})`;
    dieVariantObject.valueDotColor = '#DDEEFF';
    dieVariantObject.bodyFill = 'rgb(46, 184, 208)';
  }
  
  globalThis.instanceController = new InstanceController();
}

init();
