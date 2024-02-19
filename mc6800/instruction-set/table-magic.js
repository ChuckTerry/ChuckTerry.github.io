const HEX_ARRAY = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

function mouseEnter(event) {
  const element = event.target;
  element.classList.add('active');
  const currentRow = element.parentElement;
  const tbody = currentRow.parentElement;
  const rows = [...tbody.children];
  const rowIndex = rows.indexOf(currentRow);
  const rowCells = [...currentRow.children];
  const position = rowCells.indexOf(element);
  const msbRow = document.querySelector('.msb');
  const msbHead = [...msbRow.children][position + 1];
  msbHead.classList.add('active');
  rowCells[0].classList.add('active');
  highlightColumn(position, rowIndex);
  highlightRow(currentRow, position);
  const msb = HEX_ARRAY[position - 1];
  const lsb = HEX_ARRAY[rowIndex - 1];
  document.querySelector('#opcode-cell').innerText = `${msb}${lsb}`;
  return false;
}

function mouseLeave() {
  const allCells = [...document.querySelectorAll('.active')];
  const activeColumns = [...document.querySelectorAll('.column-active')];
  const activeRows = [...document.querySelectorAll('.row-active')];
  const allActive = [...allCells, ...activeColumns, ...activeRows];
  const cellCount = allActive.length;
  for (let index = 0; index < cellCount; index++) {
    const cell = allActive[index];
    cell.classList.remove('active', 'column-active', 'row-active');
  }
  return false;
}

function registerMouseEnter() {
  const allCells = [...document.querySelectorAll('td')];
  const cellCount = allCells.length;
  for (let index = 0; index < cellCount; index++) {
    const cell = allCells[index];
    cell.addEventListener('mouseenter', mouseEnter);
  }
}

function highlightColumn(columnIndex, rowStop = 18) {
  const rows = [...document.querySelectorAll('tbody tr')];
  const rowCount = Math.min(rows.length, rowStop);
  for (let index = 1; index < rowCount; index++) {
    const row = rows[index];
    const cells = [...row.children];
    const cell = cells[columnIndex];
    cell.classList.add('column-active');
  }
}


function highlightRow(row, columnStop = 18) {
  const columns = [...row.children];
  const columnCount = Math.min(columns.length, columnStop);
  for (let index = 1; index < columnCount; index++) {
    const cell = columns[index];
    cell.classList.add('row-active');
  }
}

function headerEnter() {
  const element = event.target;
  const currentRow = element.parentElement;
  const rowCells = [...currentRow.children];
  const position = rowCells.indexOf(element);
  if (currentRow.classList.contains('msb')) {
    const rows = document.querySelectorAll('tbody tr:not(.msb)');
  }
  const msbHead = [...msbRow.children][position + 1];
  msbHead.classList.add('active');
  return false;
}

function registerMouseEnterTh() {
  const primaryHeaders = [...document.querySelectorAll('th:not(.byte), th:not(.blank)')];
  const headerCount = primaryHeaders.length;
  for (let index = 0; index < headerCount; index++) {
    const header = primaryHeaders[index];
    header.addEventListener('mouseenter', headerEnter);
  }
}


function registerMouseLeave() {
  const allCells = [...document.querySelectorAll('td')];
  const cellCount = allCells.length;
  for (let index = 0; index < cellCount; index++) {
    const cell = allCells[index];
    cell.addEventListener('mouseleave', mouseLeave);
  }
}

window.addEventListener('load', () => {
  registerMouseEnter();
  registerMouseLeave();
});
