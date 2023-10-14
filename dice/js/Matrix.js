import './globals.js';

/***********************************************************************'
 * Represents a Matrix.
 ***********************************************************************/
export class Matrix {

  constructor(twoDimensionalArray = [[]], major = 'row') {
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
