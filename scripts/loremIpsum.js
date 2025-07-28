const loremIpsumDictionary = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'In', 'ut', 'scelerisque', 'velit', 'Integer', 'cursus', 'urna', 'sed', 'sagittis', 'venenatis', 'felis', 'libero', 'hendrerit', 'odio', 'et', 'mollis', 'mi', 'eu', 'orci', 'Nunc', 'metus', 'efficitur', 'non', 'eros', 'a', 'feugiat', 'interdum', 'justo', 'Donec', 'ullamcorper', 'quam', 'sem', 'nec', 'luctus', 'est', 'pulvinar', 'eget', 'Vestibulum', 'ante', 'primis', 'in', 'faucibus', 'ultrices', 'posuere', 'cubilia', 'curae;', 'Fusce', 'bibendum', 'dictum', 'Ut', 'suscipit', 'lacus', 'turpis', 'maximus', 'Quisque', 'vitae', 'Nullam', 'nisi', 'Sed', 'leo', 'purus', 'rutrum', 'vel', 'volutpat', 'viverra', 'id', 'ac', 'arcu', 'varius', 'mauris', 'imperdiet', 'condimentum', 'at', 'elementum', 'dapibus', 'facilisis', 'malesuada', 'Nulla', 'nisl', 'porta', 'facilisi', 'aliquam', 'euismod', 'risus', 'mattis', 'massa', 'lobortis', 'tellus', 'pellentesque', 'quis', 'blandit', 'nunc', 'magna', 'tortor', 'Suspendisse', 'potenti', 'Etiam', 'vestibulum', 'tincidunt', 'erat', 'tristique', 'diam', 'molestie', 'nibh', 'nulla', 'Aliquam', 'fringilla', 'laoreet', 'ornare', 'congue', 'Pellentesque', 'habitant', 'morbi', 'senectus', 'netus', 'fames', 'egestas', 'hac', 'habitasse', 'platea', 'dictumst', 'Proin', 'eleifend', 'Praesent', 'dui', 'finibus', 'Mauris', 'commodo', 'aliquet', 'sollicitudin', 'rhoncus', 'tempus', 'pretium', 'Phasellus', 'Cras', 'placerat', 'dignissim', 'neque', 'vulputate', 'gravida', 'Duis', 'lacinia', 'sapien', 'tempor', 'ultricies', 'accumsan', 'ligula', 'porttitor', 'lorem', 'auctor', 'Vivamus', 'vehicula', 'Nam', 'convallis', 'Morbi', 'Curabitur', 'sodales', 'fermentum', 'consequat', 'enim', 'ex', 'Aenean', 'iaculis', 'lectus', 'Interdum', 'augue', 'semper', 'Maecenas', 'pharetra', 'Class', 'aptent', 'taciti', 'sociosqu', 'ad', 'litora', 'torquent', 'per', 'conubia', 'nostra', 'inceptos', 'himenaeos', 'Orci', 'natoque', 'penatibus', 'magnis', 'dis', 'parturient', 'montes', 'nascetur', 'ridiculus', 'mus'];

function getRandomWord(dictionary = loremIpsumDictionary) {
  const length = dictionary.length;
  const index = Math.floor(Math.random() * length);
  return dictionary[index];
}

function generateParagraph(length = 200 + Math.floor(Math.random() * 700), dictionary) {
  const array = [];
  while (array.length < length) {
    array.push(getRandomWord());
  }
  return `${array.join(' ')}.`;
}

function generateText(minimumWordCount = 12000, minimumParagraphCount = 8) {
  const array = [];
  while (minimumWordCount > 0 || minimumParagraphCount > 0) {
    const length = 200 + Math.floor(Math.random() * 1000);
    array.push(generateParagraph());
    minimumWordCount -= length;
    minimumParagraphCount--;
  }
  return `${array.join('\n\n')}.`;
}

function fillAll() {
  const allFrTextareas = [...document.querySelectorAll('div[id^="question-"] textarea')];
  const frCount = allFrTextareas.length;
  
  async function injectText(self, boundFunction, eventFactory, string, existingString = '') {
  	const eventObject = eventFactory(string)
  	boundFunction(eventObject);
  	await new Promise((resolve) => setTimeout(resolve, 500));
  	return true;
  }

  function instrumentReactInputComponent(element, factory, controller, ...args) {
  	const key = Object.keys(element).filter((prop) => {
  		return prop.startsWith('__reactProps');
  	})[0];
  	const boundFunction = element[key].onChange.bind(element);
  	controller(controller, boundFunction, factory, ...args);
  }

  const minimalEventFactory = (value) => {
  	return { currentTarget: { value: value }, target: { value: value } };
  };

  for (let index = 0; index < frCount; index++) {
    const element = allFrTextareas[index];
    instrumentReactInputComponent(element, minimalEventFactory, injectText, generateText())
  }
}

function initDemo() {
  const agreeButton = document.querySelector('#code-agree');
  const runButton = document.querySelector('#code-run');

  if (agreeButton && runButton) {
    agreeButton.addEventListener('click', () => {
      if (!agreeButton.disabled) {
        agreeButton.disabled = true;
        runButton.style = '';
        runButton.removeAttribute('disabled');
        runButton.addEventListener('click', () => {
          fillAll();
        });
      }
    });
  } else {
    window.setTimeout(initDemo, 500);
  }
}

// Because one will do nothing based on Document State
document.addEventListener('DOMContentLoaded', initDemo);
initDemo();


