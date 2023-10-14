import './globals.js';

/***********************************************************************
 * Represents the display (canvas output).
 ***********************************************************************/
export class Display {

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
    this.context.strokeStyle = globalThis.dieVariantObject.bodyFill;
    window.addEventListener('resize', () => this.onResize());
    window.dispatchEvent(new Event('resize'));
  }

  /**
   * Begins a new path on the canvas.
   * @param {string | undefined} [fillStyle] - The fill style.
   */
  beginPath(fillStyle) {
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

  /**
   * Draws a line on the canvas.
   * @param {number} x - X coordinate of the center.
   * @param {number} y - Y coordinate of the center.
   */
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
    Face.obverse = dieRadius * Math.cos(φ);
    Display.bounds = 10 * dieRadius;
    this.context.translate(width >> 1, height >> 1);
    this.context.strokeStyle = globalThis.dieVariantObject.bodyFill;
  }

  /**
   * Strokes and Fills the active context path.
   */
  strokeFill() {
    this.context.stroke();
    this.context.fill();
  }
}
