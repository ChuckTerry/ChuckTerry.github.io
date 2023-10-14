import { Vertex } from './Vertex.js';
import { Display } from './Display.js';
import './globals.js';

/***********************************************************************
 * Manages User Input.
 ***********************************************************************/
export class InputManager {

  /**
   * @param {InstanceController} instanceController - The display object.
   * @param {boolean} [autoRegister] - Should we automatically register event listeners?
   */
  constructor(instanceController, autoRegister = true) {

    /** @type {InstanceController} */
    this.instanceController = instanceController;

    /** @type {Display} */
    this.display = instanceController.display;

    if (autoRegister) {
      this.registerListeners();
    }
  }

  /**
   * Redirector for mouseDown Event
   * @param {MouseEvent} event 
   */
  onMousedown(event) {
    return this.#selectStart(event);
  }

  /**
   * Redirector for mouseMove Event
   * @param {MouseEvent} event 
   */
  onMousemove(event) {
    return this.#selectMove(event);
  }

  /**
   * Redirector for mouseUp Event
   * @param {MouseEvent} event 
   */
  onMouseup(event) {
    return this.#selectEnd(event);
  }

  /**
   * Redirector for touchEnd Event
   * @param {TouchEvent} event 
   */
  onTouchend(event) {
    return this.#selectEnd(event);
  }

  /**
   * Redirector for touchMove Event
   * @param {TouchEvent} event 
   */
  onTouchmove(event) {
    return this.#selectMove(event);
  }

  /**
   * Redirector for touchStart Event
   * @param {TouchEvent} event 
   */
  onTouchstart(event) {
    return this.#selectStart(event);
  }

  /**
   * Registers event listeners.
   */
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
    if (!this.isDragging) {
      return;
    }
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
    if (event.target.nodeName !== 'CANVAS') {
      return true;
    }
    this.isx = this.osx = event.clientX ?? event.touches[0].clientX;
    this.isy = this.osy = event.clientY ?? event.touches[0].clientY;
    this.instanceController.dice.stopRotation();
    this.isDragging = true;
  }

}
