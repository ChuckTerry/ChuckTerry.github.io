import Dice from "./Dice.js";
import Display from "./Display.js";
import InputManager from "./InputManager.js";
import './globals.js';

/***********************************************************************
 * Represents the instance controller.
 ***********************************************************************/
export class InstanceController {
  /** @type {InstanceController[]} */
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
