import { Point } from './Point.js';
import { Vertex } from './Vertex.js';
import './globals.js';

/***********************************************************************
 * Represents one face on a die.
 ***********************************************************************/
export class Face {

  /**
   * Face Constructor
   * @param {InstanceController} instanceController - The instance controller.
   * @param {Dice} dice - The dice object.
   * @param {number} radius - The radius of the face.
   * @param {number} normalIndex - The index of the normal.
   * @param {number[]} verticies - The verticies of the face.
   */
  constructor(instanceController, dice, radius, normalIndex, verticies) {

    /** @type {InstanceController} */
    this.instanceController = instanceController;

    /** @type {Point[]} */
    this.points = [];

    /** @type {Dice} */
    this.dice = dice;

    const normal = dice.faceNormals[normalIndex];

    /** @type {number} */
    this.radius = radius;

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

    // If the cosine of the angle between the normal and the z axis is less than
    // the cosine of the latitude, then the point is visible from the latitude.
    if (Math.abs(normal.z) < Math.cos(φ)) {
      const normalX = new Vertex(-normal.y, normal.x, 0).normalize().multiply(this.radius);
      const normalY = normal.crossProduct(normalX);
      const normalZ = normal.multiply(Face.obverse);
      const rotationStep = normal.z <= 0 ? 1 : -1;

      let ro = normalX.multiply(Math.cos(-rotationStep * Δ)).add(normalY.multiply(Math.sin(-rotationStep * Δ)), normalZ);
      let rdo = ro.x ** 2 + ro.y ** 2;
      let rn = normalX.add(normalZ);
      let rdn = rn.x ** 2 + rn.y ** 2;
      let i = rdo <= rdn ? 0 : HALF_TURN;
      let j = i;
      let α = i;
      while ((rn = normalX.multiply(Math.cos(i * Δ)).add(normalY.multiply(Math.sin(i * Δ)), normalZ)), rdo <= (rdn = rn.x ** 2 + rn.y ** 2)) {
        α = i;
        i += rotationStep;
        ro = rn;
        rdo = rdn;
      }

      /** @type {number} */
      this.α = (FULL_TURN - rotationStep * α) % FULL_TURN;

      /** @type {number} */
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

      /** @type {number} */
      this.beta = (FULL_TURN - rotationStep * beta) % FULL_TURN;

      /** @type {number} */
      this.θ = Math.atan2(ro.y, ro.x);
      
      // Add a full turn if the angle is negative
      if (this.θ < 0) this.θ += τ;
    }
  }

  /**
   * draws the face.
   */
  draw() {
    if (this.normal.z >= 0) return;
    const display = this.instanceController.display;
    // angle of the normal and the look direction to adjust color and Ellipse ratio rh/rw
    const viewAngle = Math.abs(this.normal.z);
    const colorBase = 192 + Math.floor(64 * viewAngle);
    const color = dieVariantObject.contour(colorBase);
    display.drawEllipse(this.originX, this.originY, this.radius, this.radius * viewAngle, this.angle, color);
    this.drawDots(viewAngle);
  }

  drawDots(viewAngle) {
    const display = this.instanceController.display;
    // Fast Divide by 8
    const dotRadiusWidth = this.dice.radius >> 3;
    const dotRadiusHeight = dotRadiusWidth * viewAngle;
    const faceValue = this.normal.face + 1;
    const dotColor = dieVariantObject.valueDotColor;
    if (faceValue % 2 === 1) {
      display.drawEllipse(this.originX, this.originY, dotRadiusWidth, dotRadiusHeight, this.angle, dotColor);
    }
    if (faceValue > 1) {
      const [ox3, oy3] = [this.originX * 3, this.originY * 3];
      const [p1x, p1y] = [this.points[1].x, this.points[1].y];
      const [p3x, p3y] = [this.points[3].x, this.points[3].y];
      display.drawEllipse((ox3 + 2 * p1x) / 5, (oy3 + 2 * p1y) / 5, dotRadiusWidth, dotRadiusHeight, this.angle, dotColor);
      display.drawEllipse((ox3 + 2 * p3x) / 5, (oy3 + 2 * p3y) / 5, dotRadiusWidth, dotRadiusHeight, this.angle, dotColor);
      if (faceValue > 3) {
        const [p0x, p0y] = [this.points[0].x, this.points[0].y];
        const [p2x, p2y] = [this.points[2].x, this.points[2].y];
        display.drawEllipse((ox3 + 2 * p0x) / 5, (oy3 + 2 * p0y) / 5, dotRadiusWidth, dotRadiusHeight, this.angle, dotColor);
        display.drawEllipse((ox3 + 2 * p2x) / 5, (oy3 + 2 * p2y) / 5, dotRadiusWidth, dotRadiusHeight, this.angle, dotColor);
        if (faceValue === 6) {
          display.drawEllipse((ox3 + p0x + p3x) / 5, (oy3 + p0y + p3y) / 5, dotRadiusWidth, dotRadiusHeight, this.angle, dotColor);
          display.drawEllipse((ox3 + p2x + p1x) / 5, (oy3 + p2y + p1y) / 5, dotRadiusWidth, dotRadiusHeight, this.angle, dotColor);
        }
      }
    }
  }

  /**
   * Resets the x, y, and z origins of the face to 0.
   */
  resetOrigins() {
    /** @type {number} */
    this.originX = this.originY = this.originZ = 0;
  }

}
