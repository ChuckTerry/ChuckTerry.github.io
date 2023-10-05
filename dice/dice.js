const π = Math.PI;
const τ = 2 * π;
const φ = 42 * π / 180;
const HALF_TURN = 30;
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
    this.x = coordinates.x;
    this.y = coordinates.y;
    this.z = coordinates.z;
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
   * @param  {...any} args - The coordinates.
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
    this.x = x;
    this.y = y;
    this.z = z;
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
   * Gets the normal base of the vertex.
   * @param {Vertex} vertex - The other vertex.
   * @returns {number} - The normal base.
   */
  getNormalBase(vertex) {
    return this.x * vertex.x + this.y * vertex.y + this.z * vertex.z;
  }

  skew(vertex) {
    const x = this.y * vertex.z - vertex.y * this.z;
    const y = this.z * vertex.x - vertex.z * this.x;
    const z = this.x * vertex.y - vertex.x * this.y;
    return new Vertex(x, y, z);
  }

  normal() {
    const base = Math.sqrt(this.getNormalBase(this));
    return new Vertex(this.x / base, this.y / base, this.z / base);
  }

  /**
   * Converts a vertex object to a string.
   * @returns {string} - A string representation of the vertex.
   */
  toString() {
    return `{Vertex:${this.x.toFixed(5)}, ${this.y.toFixed(5)}, ${this.z.toFixed(5)}}`;
  }

}

/***********************************************************************
 * Represents one face on a die.
 ***********************************************************************/
class Face {

  static normals = Vertex.generateArrayFrom([1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, -1], [0, -1, 0], [-1, 0, 0]);
  static radius = 0;

  constructor(dice, normalIndex, sms) {
    this.points = [];
    this.dice = dice;
    const normal = Face.normals[normalIndex];
    this.normal = new Point(normalIndex, normal, true);
    // Ellipse major axis angle
    this.angle = Math.atan2(normal.x, -normal.y);

    this.resetOrigins();
    for (const property in sms) {
      const object = dice.vertices[sms[property]];
      this.points.push(object);
      this.originX += object.x / 4;
      this.originY += object.y / 4;
      this.originZ += object.z;
    }

    if (Math.abs(normal.z) < Math.cos(φ)) {
      const normalX = new Vertex(-normal.y, normal.x, 0).normal().multiply(Face.radius);
      const normalY = normal.skew(normalX);
      const normalZ = normal.multiply(dstFce);
      const eps = normal.z <= 0 ? 1 : -1;
      // Turn counter clockwise to draw the contour
      let sns = eps;

      // A first test near the major axis end.
      let ro = normalX.multiply(Math.cos(-sns * Δ)).add(normalY.multiply(Math.sin(-sns * Δ)), normalZ);
      let rdo = ro.x ** 2 + ro.y ** 2;
      let rn = normalX.add(normalZ);
      let rdn = rn.x ** 2 + rn.y ** 2;
      let i = rdo <= rdn ? 0 : HALF_TURN; // to guide the search
      let j = i;
      let α = i;// The distance is maximum a the contact (Dice radius)
      while ((rn = normalX.multiply(Math.cos(i * Δ)).add(normalY.multiply(Math.sin(i * Δ)), normalZ)), rdo <= (rdn = rn.x ** 2 + rn.y ** 2)) {
        α = i;
        i += sns;
        ro = rn;
        rdo = rdn;
      }
      const fullTurn = HALF_TURN << 1;
      α = (fullTurn - eps * α) % fullTurn;
      this.γ = Math.atan2(ro.y, ro.x);
      if (this.γ < 0) this.γ += τ;
      if (τ <= this.γ < 0) this.γ -= τ;

      i = HALF_TURN - j;
      let beta = i;
      sns = -sns;

      ro = normalX.multiply(Math.cos((i - sns) * Δ)).add(normalY.multiply(Math.sin((i - sns) * Δ)), normalZ);
      rdo = ro.x * ro.x + ro.y * ro.y;
      rn = normalX.multiply(Math.cos(i * Δ)).add(normalY.multiply(Math.sin(i * Δ)), normalZ);
      rdn = rn.x * rn.x + rn.y * rn.y;

      while ((rn = normalX.multiply(Math.cos(i * Δ)).add(normalY.multiply(Math.sin(i * Δ)), normalZ)), rdo <= (rdn = rn.x ** 2 + rn.y ** 2)) {
        beta = i;
        i += sns;
        ro = rn;
        rdo = rdn;
      }
      beta = (fullTurn - eps * beta) % fullTurn;
      this.θ = Math.atan2(ro.y, ro.x);
      if (this.θ < 0) this.θ += τ;
      if (τ <= this.θ < 0) this.θ -= τ;

      this.α = α;
      this.beta = beta;
    }
  }

  draw() {
    // Fast Divide by 8
    const dmc = Dice.radius >> 3;
    // angle of the normal and the look direction to adjust color and Ellipse ratio rh/rw
    const viewAngle = Math.abs(this.normal.z);
    const colorBase = 192 + Math.floor(64 * viewAngle);
    const color = dieVariantObject.contour(colorBase);
    Display.instance.drawEllipse(this.originX, this.originY, Face.radius, Face.radius * viewAngle, this.angle, color);
    const rh = dmc * viewAngle;
    /* Die Face Markings */
    const faceValue = this.normal.face + 1;
    const dotColor = dieVariantObject.valueDotColor;
    if (faceValue % 2 === 1) {
      Display.instance.drawEllipse(this.originX, this.originY, dmc, rh, this.angle, dotColor);
    }
    if (faceValue > 1) {
      const [ox3, oy3] = [this.originX * 3, this.originY * 3];
      const [p1x, p1y] = [this.points[1].x, this.points[1].y];
      const [p3x, p3y] = [this.points[3].x, this.points[3].y];
      Display.instance.drawEllipse((ox3 + 2 * p1x) / 5, (oy3 + 2 * p1y) / 5, dmc, rh, this.angle, dotColor);
      Display.instance.drawEllipse((ox3 + 2 * p3x) / 5, (oy3 + 2 * p3y) / 5, dmc, rh, this.angle, dotColor);
      if (faceValue > 3) {
        const [p0x, p0y] = [this.points[0].x, this.points[0].y];
        const [p2x, p2y] = [this.points[2].x, this.points[2].y];
        Display.instance.drawEllipse((ox3 + 2 * p0x) / 5, (oy3 + 2 * p0y) / 5, dmc, rh, this.angle, dotColor);
        Display.instance.drawEllipse((ox3 + 2 * p2x) / 5, (oy3 + 2 * p2y) / 5, dmc, rh, this.angle, dotColor);
        if (faceValue === 6) {
          Display.instance.drawEllipse((ox3 + p0x + p3x) / 5, (oy3 + p0y + p3y) / 5, dmc, rh, this.angle, dotColor);
          Display.instance.drawEllipse((ox3 + p2x + p1x) / 5, (oy3 + p2y + p1y) / 5, dmc, rh, this.angle, dotColor);
        }
      }
    }
  }

  resetOrigins() {
    this.originX = this.originY = this.originZ = 0;
  }

}

/***********************************************************************
 * Represents a single die.
 ***********************************************************************/
class Dice {

  static faceVertices = [[0, 2, 6, 3], [0, 3, 5, 1], [0, 1, 4, 2], [7, 5, 3, 6], [7, 6, 2, 4], [7, 4, 1, 5]];
  static vertexFaces = [[0, 1, 2], [5, 2, 1], [0, 2, 4], [0, 3, 1], [5, 4, 2], [5, 1, 3], [0, 4, 3], [5, 3, 4]];
  static vertexEdges = [[1, 2, 3], [0, 5, 4], [0, 4, 6], [0, 6, 5], [7, 2, 1], [7, 1, 3], [7, 3, 2], [6, 4, 5]];

  static deltaAB = [0.005, 0.005];
  static α = (13 + Math.floor(Math.random() * 17)) * (1 - 2 * (Math.random() < 0.5));
  static beta = (13 + Math.floor(Math.random() * 17)) * (1 - 2 * (Math.random() < 0.5));
  static radius = 0;
  static instance = null;

  constructor() {
    this.recalculateComponentPositions();
    Dice.instance = this;
  }

  static resetVelocities() {
    Dice.α = Dice.beta = 0;
  }

  static updateVelocities(a, b, addToCurrentValue = false) {
    if (addToCurrentValue) {
      a += Dice.α;
      b += Dice.beta;
    }
    Dice.α = a;
    Dice.beta = b;
  }

  static calculateVelocities() {
    const aChance = Math.random();
    const bChance = Math.random();
    if (aChance < 0.15) Dice.deltaAB[0] += aChance * 0.01;
    if (bChance < 0.15) Dice.deltaAB[1] += bChance * 0.01;
    if (aChance > 0.9) Dice.deltaAB[0] -= (1 - aChance) * 0.009;
    if (bChance > 0.9) Dice.deltaAB[1] -= (1 - bChance) * 0.009;
    if (aChance > 0.989) Dice.deltaAB[0] -= aChance * 0.002;
    if (bChance > 0.989) Dice.deltaAB[1] -= bChance * 0.004;
    const a = Dice.α * Dice.deltaAB[0];
    const b = Dice.beta * Dice.deltaAB[1];
    Dice.α -= a;
    Dice.beta -= b;
    return [a, b];
  }

  calculateFaces() {
    for (let index = 0; index < 6; index++) {
      this.faces.push(new Face(this, index, Dice.faceVertices[index]));
    }
  }

  calculateVerticies() {
    for (let index = 0; index < 8; index++) {
      this.vertices.push(new Point(index, vertexNormals[index], false));
    }
  }

  recalculateComponentPositions() {
    this.vertices = [];
    this.faces = [];
    this.calculateVerticies();
    this.calculateFaces();
  }

  // a & b are angle of rotation on elliptical x & y axis
  rollDice(a, b) {
    const [cosA, cosB, sinA, sinB] = [Math.cos(a), Math.cos(b), Math.sin(a), Math.sin(b)];
    for (let index = 0; index < 3; index++) {
      const normal = Face.normals[index];
      const depthFactor = normal.y * sinA + normal.z * cosA;
      const x = depthFactor * sinB + normal.x * cosB;
      const y = normal.y * cosA - normal.z * sinA;
      const z = depthFactor * cosB - normal.x * sinB;
      Face.normals[index] = new Vertex(x, y, z);
      Face.normals[5 - index] = Face.normals[index].negate();
    }
    vertexNormals[0] = Face.normals[0].add(Face.normals[1], Face.normals[2]).multiply(dstFce);
    vertexNormals[1] = Face.normals[0].negate().add(Face.normals[1], Face.normals[2]).multiply(dstFce);
    vertexNormals[2] = Face.normals[1].negate().add(Face.normals[0], Face.normals[2]).multiply(dstFce);
    vertexNormals[3] = Face.normals[2].negate().add(Face.normals[0], Face.normals[1]).multiply(dstFce);
    vertexNormals[4] = vertexNormals[3].negate();
    vertexNormals[5] = vertexNormals[2].negate();
    vertexNormals[6] = vertexNormals[1].negate();
    vertexNormals[7] = vertexNormals[0].negate();
  }

  /**
   * Calculates and returns velocities for dice movement based on randomness.
   * @returns {number[]} Array of alpha and beta values.
   */
  drawDice() {
    const [a, b] = Dice.calculateVelocities();
    if (1e-5 < Math.abs(Dice.α) || 1e-5 < Math.abs(Dice.beta)) this.rollDice(a, b);

    this.recalculateComponentPositions();
    Display.instance.clear();
    const display = Display.instance;
    const context = display.context;

    // Dice background (contour)
    const facesWithVisibleCountor = [];
    const faceCount = this.faces.length;
    for (let faceIndex = 0; faceIndex < faceCount; faceIndex++) {
      const face = this.faces[faceIndex];
      if (-1 < face.α) facesWithVisibleCountor.push(face);
    }
    // Sort the faces to draw the contour counter close wise
    facesWithVisibleCountor.sort((a, b) => b.θ - a.θ);

    const length = facesWithVisibleCountor.length;
    // A circle without elliptic Arc
    if (length === 0) {
      context.arc(0, 0, Dice.radius, 0, τ);
      display.strokeFill();
    } else {
      const lineStops = [];
      context.fillStyle = dieVariantObject.bodyFill;
      context.beginPath();
      for (let index = 0; index < length; index++) {
        const face = facesWithVisibleCountor[index];
        const angleStop = facesWithVisibleCountor[(index + 1) % length].γ;
        Display.instance.drawEllipseFromTo(face.originX, face.originY, face.α, face.beta, Face.radius, Face.radius * face.normal.z, face.angle, dieVariantObject.bodyFill);
        context.arc(0, 0, Dice.radius, face.θ, angleStop, true);
        display.strokeFill();
        lineStops.push(Dice.radius * Math.cos(angleStop), Dice.radius * Math.sin(angleStop));
      }
      context.beginPath();
      context.moveTo(lineStops.at(-2), lineStops.at(-1));
      for (let index = 0; index < lineStops.length; index += 2) {
        context.lineTo(lineStops[index], lineStops[index + 1]);
      }
      display.strokeFill();
    }

    for (let faceIndex = 0; faceIndex < faceCount; faceIndex++) {
      const face = this.faces[faceIndex];
      if (face.normal.z < 0) face.draw();
    }
    window.requestAnimationFrame(() => this.drawDice());
  }

}

/***********************************************************************
 * Represents the display (canvas output).
 ***********************************************************************/
class Display {

  static instance = null;
  static clear() {
    return Display.instance?.clear();
  }

  /**
   * @param {string} [canvasSelector] - CSS selector for display canvas.
   */
  constructor(canvasSelector = '#display') {
    if (Display.instance instanceof Display) return Display.instance;
    this.canvas = document.querySelector(canvasSelector);
    this.canvas.width = this.width = document.body.clientWidth;
    this.canvas.height = this.height = document.body.clientHeight;
    this.context = this.canvas.getContext('2d');
    this.context.font = "16px Sans-Serif";
    this.context.lineWidth = this.context.miterLimit = 1;
    this.context.lineJoin = "miter";
    this.context.strokeStyle = dieVariantObject.bodyFill;
    window.addEventListener('resize', () => this.onResize());
    window.dispatchEvent(new Event('resize'));
    Display.instance = this;
  }

  clear() {
    this.context.clearRect(-(this.width >> 1), -(this.height >> 1), this.width, this.height);
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

  /**
   * Handles Updating values when the window is resized.
   */
  onResize() {
    const width = this.canvas.width = this.width = document.body.clientWidth;
    const height = this.canvas.height = this.height = document.body.clientHeight;
    const dieRadius = Dice.radius = Math.min(width >> 3, height >> 3);
    Face.radius = dieRadius * Math.sin(φ);
    globalThis.dstFce = dieRadius * Math.cos(φ);
    globalThis.dstObs = 10 * dieRadius;
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
   * @param {Display} display - The display object.
   * @param {boolean} [autoRegister] - Should we automatically register event listeners?
   */
  constructor(display, autoRegister = true) {
    this.display = display;
    if (autoRegister) this.registerListeners();
  }

  #selectEnd(event) {
    this.isDragging = false;
  }

  #selectMove(event) {
    this.nsx = event.clientX ?? event.touches[0].clientX;
    this.nsy = event.clientY ?? event.touches[0].clientY;
    this.srs = new Vertex(this.nsx - (this.display.width >> 1), this.nsy - (this.display.height >> 1), 0);
    if (!this.isDragging) return;
    Dice.updateVelocities(Math.atan((this.nsy - this.osy) / (dstObs >> 4)), -Math.atan((this.nsx - this.osx) / (dstObs >> 4)), true);
    this.osx = this.nsx;
    this.osy = this.nsy;
  }

  #selectStart(event) {
    if (event.target.nodeName !== 'CANVAS') return true;
    this.isx = this.osx = event.clientX ?? event.touches[0].clientX;
    this.isy = this.osy = event.clientY ?? event.touches[0].clientY;
    Dice.resetVelocities(true);
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

  globalThis.inputManager = new InputManager(new Display(), true);
  const w = Math.sqrt(3);
  globalThis.vertexNormals = Vertex.generateArrayFrom([w, w, w], [-w, w, w], [w, -w, w], [w, w, -w], [-w, -w, w], [-w, w, -w], [w, -w, -w], [-w, -w, -w]);
  new Dice().drawDice();
}

init();
