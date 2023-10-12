function sum(...args) {
  return args.flat(3).reduce((accumulator, value) => accumulator + value, 0);
}

function floor(...args) {
  const array = args.flat(3);
  return Math.min(...array);
}

function ceiling(...args) {
  const array = args.flat(3);
  return Math.max(...array);
}

function mean(...args) {
  const array = args.flat(3);
  const length = array.length;
  return sum(array) / length;
}

function range(...args) {
  const array = args.flat(3);
  return Math.max(...array) - Math.min(...array);
}

function variance(...args) {
  const array = args.flat(3);
  const length = array.length;
  const setMean = mean(...array);
  const sumOfSquares = array.flat(3).reduce((accumulator, value) => accumulator + Math.pow(value - setMean, 2), 0);
  return sumOfSquares / length;
}

function standardDeviation(...args) {
  return Math.sqrt(variance(...args));
}

function factorial(number) {
  if (number < 2) return 1;
  let value = number;
  while (number > 2) {
    value = value * (number - 1);
    number--;
  }
  return value;
}

function simplifyRadical(radicand, degree = 2) {
  const factorArray = getPrimeFactors(radicand);
  let outerValue = 1; let innerValue = 1;
  while (factorArray.length !== 0) {
    let count = 1;
    const currentFactor = factorArray.shift();
    while (factorArray[0] === currentFactor) {
      factorArray.shift();
      count++;
    }
    if (count % 2 !== 0) {
      innerValue = innerValue * currentFactor;
      count--;
    }
    if (count !== 0) outerValue = outerValue * ((count / 2) * currentFactor);
  }
  if (innerValue !== 1 && outerValue !== 1) return `${outerValue}${RADICAL_SQUARE}${innerValue}`;
  return innerValue === 1 ? outerValue : `${RADICAL_SQUARE}${innerValue}`;
}

function centerSplit(...args) {
  const array = args.flat(3);
  const mod = array.length / 2;
  return [array.slice(0, Math.floor(mod)), array.slice(Math.ceil(mod))];
}

function getMedianIndex(...args) {
  const length = args.flat(3).length;
  return length % 2 === 0 ? length / 2 : Math.floor(length / 2);
}

function median(...args) {
  const array = args.flat(3).sort((a, b) => a > b);
  const length = array.length;
  if (length % 2 === 0) {
    const midpoint = length / 2;
    return (array[midpoint - 1] + array[midpoint]) / 2;
  } else {
    const midpoint = Math.floor((length - 1) / 2);
    return array[midpoint];
  }
}

function mode(...args) {
  const array = args.flat(3);
  const frequencyArray = frequency(array);
  const frequencyCeiling = frequencyArray.reduce((accumulator, valueSet) => {
    const value = valueSet[1];
    return value > accumulator ? value : accumulator;
  }, 0);
  if (frequencyCeiling === 0) return null;
  const modes = frequencyArray.reduce((accumulator, valueSet) => {
    if (valueSet[1] === frequencyCeiling) accumulator.push(valueSet[0]);
    return accumulator;
  }, []);
  return modes.length === 1 ? modes[0] : modes;
}

function frequency(...args) {
  const array = args.flat(3);
  const length = array.length;
  const frequencyMap = array.reduce((map, value) => map.set(value, (map.has(value) ? map.get(value) : 0) + 1), new Map());
  return Array.from(frequencyMap);
}

function getQuartiles(...args) {
  const array = args.flat(3);
  const split = centerSplit(array);
  return [
    median(split[0]),
    median(array),
    median(split[1])
  ];
}

function uniqueCount(...args) {
  const array = args.flat(3);
  return Array.from(new Set(array)).length;
}





function setInput2Array() {
  return SET_INPUT.value.split('\n').join(',').split(/[^\d\.]/)
    .map(string => parseInt(string.trim(), 10))
    .filter(number => !Number.isNaN(number))
    .sort((a, b) => a - b);
}



function clearAll() {
  SET_INPUT.value = '';
  const outputCount = OUTPUT_ARRAY.length;
  for (let outputIndex = 0; outputIndex < outputCount; outputIndex++) {
    OUTPUT_ARRAY[outputIndex].value = '';
  }
}

function doStats() {
  const fixFunction = DECIMAL_PLACES.value === '0' ? Math.round : (number) => number.toFixed(DECIMAL_PLACES.value);
  const array = setInput2Array();
  SUM_OUTPUT.value = fixFunction(sum(...array));
  N_OUTPUT.value = array.length;
  UNIQUE_COUNT_OUTPUT.value = uniqueCount(...array);
  RANGE_OUTPUT.value = fixFunction(range(...array));
  FLOOR_OUTPUT.value = fixFunction(floor(...array));
  CEILING_OUTPUT.value = fixFunction(ceiling(...array));
  MEAN_OUTPUT.value = fixFunction(mean(...array));
  MEDIAN_OUTPUT.value = fixFunction(median(...array));
  MODE_OUTPUT.value = mode(...array);
  const quartiles = getQuartiles(...array);
  Q1_OUTPUT.value = quartiles[0];
  Q2_OUTPUT.value = quartiles[1];
  Q3_OUTPUT.value = quartiles[2];
  VARIANCE_OUTPUT.value = fixFunction(variance(...array));
  STD_DEV_OUTPUT.value = fixFunction(standardDeviation(...array));
  updateFrequencyTable(array);
}

window.addEventListener('load', () => {
  console.log('load');
  document.querySelector('#clear-my-statistics').addEventListener('click', clearAll);
  document.querySelector('#do-my-statistics').addEventListener('click', doStats);
  globalThis.SET_INPUT = document.querySelector('#input-number-set');
  globalThis.DECIMAL_PLACES = document.querySelector('#decimal-places');
  globalThis.DECIMAL_POINT_VALUE = document.querySelector('#decimal-point-value');
  globalThis.SUM_OUTPUT = document.querySelector('#stat-sum');
  globalThis.N_OUTPUT = document.querySelector('#stat-n');
  globalThis.UNIQUE_COUNT_OUTPUT = document.querySelector('#stat-unique-count');
  globalThis.RANGE_OUTPUT = document.querySelector('#stat-range');
  globalThis.FLOOR_OUTPUT = document.querySelector('#stat-floor');
  globalThis.CEILING_OUTPUT = document.querySelector('#stat-ceiling');
  globalThis.MEAN_OUTPUT = document.querySelector('#stat-mean');
  globalThis.MEDIAN_OUTPUT = document.querySelector('#stat-median');
  globalThis.MODE_OUTPUT = document.querySelector('#stat-mode');
  globalThis.Q1_OUTPUT = document.querySelector('#stat-q1');
  globalThis.Q2_OUTPUT = document.querySelector('#stat-q2');
  globalThis.Q3_OUTPUT = document.querySelector('#stat-q3');
  globalThis.VARIANCE_OUTPUT = document.querySelector('#stat-variance');
  globalThis.STD_DEV_OUTPUT = document.querySelector('#stat-std-dev');
  globalThis.OUTPUT_ARRAY = [SUM_OUTPUT, N_OUTPUT, UNIQUE_COUNT_OUTPUT, RANGE_OUTPUT, FLOOR_OUTPUT, CEILING_OUTPUT, MEAN_OUTPUT, MEDIAN_OUTPUT, MODE_OUTPUT, Q1_OUTPUT, Q2_OUTPUT, Q3_OUTPUT, VARIANCE_OUTPUT, STD_DEV_OUTPUT];

  DECIMAL_PLACES.addEventListener('change', () => DECIMAL_POINT_VALUE.innerText = DECIMAL_PLACES.value);
});

function makeFrequencyTableRow(number, freq, length) {
  const row = document.createElement('tr');
  const numberCell = document.createElement('td');
  numberCell.innerText = number;
  row.append(numberCell);
  const frequencyCell = document.createElement('td');
  frequencyCell.innerText = freq;
  row.append(frequencyCell);
  const relativeFrequencyCell = document.createElement('td');
  relativeFrequencyCell.innerText = `${((freq / length) * 100).toFixed(2)}%`;
  row.append(relativeFrequencyCell);
  return row;
}

function updateFrequencyTable(...args) {
  const array = args.flat(3);
  const frequencyArray = Array.from(array.reduce((map, value) => map.set(value, (map.has(value) ? map.get(value) : 0) + 1), new Map()));
  const uniqueCount = frequencyArray.length;
  const newTBody = document.createElement('tbody');
  const oldTBody = document.querySelector('#stat-freq-table');
  for (let i = 0; i < uniqueCount; i++) {
    const [number, numberFreq] = frequencyArray[i];
    newTBody.append(makeFrequencyTableRow(number, numberFreq, uniqueCount));
  }
  oldTBody.parentNode.replaceChild(newTBody, oldTBody);
  newTBody.id = 'stat-freq-table';
}
