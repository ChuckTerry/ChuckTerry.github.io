import { Point } from './Point';
import { Vertex } from './Vertex';
import { Face } from './Face';
import './globals.js';

/***********************************************************************
 * Represents a single die.
 ***********************************************************************/
class Dice {

  static deltaAB = [0.005, 0.005];

  /**
   * @param {InstanceController} instanceController - The instance controller.
   */
  constructor(instanceController) {
    const { width, height } = instanceController.display;

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

    /** @type {Vertex[]} */
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
      this.faces.push(new Face(this.instanceController, this, this.radius * Math.sin(φ), index, faceVertices[index]));
    }
  }

  /**
   * Calculates the rotation angles.
   * @returns {number[]} The rotation angles.
   */
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
        display.drawEllipseFromTo(face.originX, face.originY, face.α, face.beta, face.radius, face.radius * face.normal.z, face.angle, dieVariantObject.bodyFill);
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
