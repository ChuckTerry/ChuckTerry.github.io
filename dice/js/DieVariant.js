/***********************************************************************
 * Represents a die variant.
 ***********************************************************************/
export class DieVariant {

  constructor() {
    /** @type {function (number): string} */
    this.contour = (x) => `rgb(${x - 150}, ${x - 16}, ${x + 16})`;

    /** @type {string} */
    this.valueDotColor = '#DDEEFF';

    /** @type {string} */
    this.bodyFill = 'rgb(46, 184, 208)';

    const urlParameters = new URLSearchParams(window.location.search);
    if (urlParameters.has('style')) {
      const variant = urlParameters.get('style').toUpperCase();
      if (variant === 'RED') {
        this.setRedStyle();
      } else if (variant === 'BLACK') {
        this.setRedStyle();
      }
    }

  }

  /**
   * Set the die variant to black.
   */
  setBlackStyle() {
    this.contour = (x) => `rgb(${x}, ${x - 3}, ${x - 7})`;
    this.valueDotColor = '#000000';
    this.bodyFill = '#FFFFFF';
  }

  /**
   * Set the die variant to red.
   */
  setRedStyle() {
    this.contour = (x) => `rgb(${x}, ${x - 166}, ${x - 149})`;
    this.valueDotColor = '#FFFEFE';
    this.bodyFill = 'rgb(208, 45, 47)';
  }

}
