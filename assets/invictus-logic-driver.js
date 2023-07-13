/* -===========================================================================- */
/**
  IIFE / Program Architecture
    onload(
      f(f():object, class) Handles Initialization by finding all placeholder divs and creating managers for their content
        f():object{} creates and returns the global Invictus Object, Handles references and config
        class{} The Invictus class, instantiated for each div that contains flip cards
    )
*/
/* -===========================================================================- */
window.addEventListener('load', ((globalObject, Invictus) => {
  /* Will hold all instances of Invictus, the Flip Card Set Manager Class */
  const invictusCardManagerArray = new Map();

  const placeholderElements = [...document.querySelectorAll('div.invictus.placeholder')];

  placeholderElements.forEach((element) => {
    const mapId = element.querySelector('.card-set-name').innerText;
    const elementId = Invictus.makeUniqueElementId(mapId);
    element.id = elementId;
    invictusCardManagerArray.set(mapId, new Invictus(element));
  });

})((function () {

  if (globalThis.invictus === undefined) globalThis.invictus = {};
  const _ = globalThis.invictus;

  const baseConfig = {
    allowHighlighting: true,    // Allow User to highlight card text
    consistentCardOrder: false, // Will shuffle card order on page load when false
    allowTextDownload: true,    // Display a download button, allowing user's to download a text file containing the text of each Card Set
    forceNoDarkMode: false,     // Ignore User preference for dark mode !!! NOTE: This is considered bad practice and goes against A11Y standards.
    hideShuffleButton: false    // Hide the Shuffle button to prevent user from randomizing the order of cards
  };

  if (_.config ?? true) Object.assign(baseConfig, _.config);
  _.config = baseConfig;
  _.cardSets = new Set();

  return _;

})(), class Invictus {

  static makeUniqueElementId(id) {
    const ascii = btoa(id).replace('=', '');
    let suffix = 0;
    if (this.#elementIds.has(ascii)) {
      const mapArray = this.#elementIds.get(ascii);
      suffix = mapArray.length;
      mapArray.push(ascii + '-' + suffix);
    } else {
      this.#elementIds.set(ascii, [ascii + '-' + suffix]);
    }
    return id;
  }

  static #elementIds = new Map();

  constructor(element) {
    this.title = element.querySelector('.card-set-name').innerText;
    this.cardSet = [];
    this.outerWrapper = null;
    this.showButton = null;
    this.closeButton = null;
    this.shuffleButton = null;
    this.nextCardButton = null;
    this.previousCardButton = null;
    this.cardArea = null;
    this.cardAreaWrapper = null;
    this.activeCard = null;
    this.activeCardSetIndex = 0;
    globalThis.invictus.cardSets.add(this);

    /**
      Expects:
        <div>
          <div>Term Text for Front of Card goes here (Initial Card State)</div>
          <div>Definition Text for Back of Card goes here (Flipped Card State)</div>
        </div>
    */
    [...element.children].forEach((cardProto) => {
      if (cardProto instanceof HTMLSpanElement) return cardProto.remove();
      const term = cardProto.firstElementChild.innerText;
      const definition = cardProto.lastElementChild.innerText;
      const card = this.createCard(term, definition);
      this.cardSet.push(card);
      cardProto.remove();
    });

    this.invictusBlock = this.makeInvictusBlock();
    element.appendChild(this.invictusBlock);

    this.shuffleAndPlaceCards();

    this.cardSet[0].classList.add('active');
    this.activeCard = this.cardSet[0];
    element.classList.remove('placeholder');
    element.parentElement.classList.remove('no-overflow');

    this.makeControlsReactive();
  }

  makeControlsReactive() {
    /* Show Button Click Event */
    this.showButton.addEventListener('click', () => {
      this.showButton.classList.add('hidden');
      this.closeButton.classList.remove('hidden');
      this.shuffleButton.classList.remove('hidden');
      this.cardAreaWrapper.classList.remove('hidden');
      this.outerWrapper.classList.add('expanded');
    });
    /* Close Button Click Event */
    this.closeButton.addEventListener('click', () => {
      this.closeButton.classList.add('hidden');
      this.shuffleButton.classList.add('hidden');
      this.showButton.classList.remove('hidden');
      this.cardAreaWrapper.classList.add('hidden');
      this.outerWrapper.classList.remove('expanded');
    });
    /* Shuffle Button Click Event */
    this.shuffleButton.addEventListener('click', () => {
      this.shuffle();
    });
    /* Previous Card Button Click Event */
    this.previousCardButton.addEventListener('click', () => {
     this.activeCard.classList.toggle('active');
     this.activeCard.classList.remove('selected');
     this.activeCardSetIndex = this.activeCardSetIndex === 0 ? this.cardSet.length - 1 : this.activeCardSetIndex - 1;
     this.activeCard = this.cardSet[this.activeCardSetIndex];
     this.activeCard.classList.toggle('hidden');
     this.activeCard.classList.toggle('active');
   });
    /* Next Card Button Click Event */
    this.nextCardButton.addEventListener('click', () => {
      this.activeCard.classList.toggle('active');
      this.activeCard.classList.remove('selected');
      this.activeCardSetIndex = this.activeCardSetIndex === this.cardSet.length - 1 ? 0 : this.activeCardSetIndex + 1;
      this.activeCard = this.cardSet[this.activeCardSetIndex];
      this.activeCard.classList.toggle('hidden');
      this.activeCard.classList.toggle('active');
    });
  }

  makeInvictusElement(classNames, type = 'div', childrenArray = [], innerText) {
    const element = document.createElement(type);
    element.classList.add('invictus');
    if (typeof classNames === 'string') {
      classNames = classNames.includes(' ') ? classNames.split(' ') : [classNames];
    } else if (Array.isArray(classNames)) {
      const count = classNames.length;
      for (let index = 0; index < count; index++) {
        element.classList.add(classNames[index]);
      }
    }
    if (childrenArray instanceof HTMLElement) {
      childrenArray = [childrenArray];
    } else if (Array.isArray(childrenArray)) {
      const count = childrenArray.length;
      for (let index = 0; index < count; index++) {
        element.appendChild(childrenArray[index]);
      }
    }
    if (type === 'button') {
      element.type = 'button';
    }
    if (innerText) {
      element.innerText = innerText;
    }
    return element;
  }

  createCard(term, definition) {
    /* Term Elements */
    const termText = this.makeInvictusElement('term-text', 'p', undefined, term);
    const cardTerm = this.makeInvictusElement('card-term', 'div', termText);
    const front = this.makeInvictusElement('card-front', 'div', cardTerm);
    /* Definition Elements */
    const definitionText = this.makeInvictusElement('definition-text', 'p', undefined, definition);
    const cardDefinition = this.makeInvictusElement('card-definition', 'div', definitionText);
    const back = this.makeInvictusElement('card-back', 'div', cardDefinition);
    /* Element Assembly */
    const inner = this.makeInvictusElement('card-inner', 'div', [front, back]);
    const outerCardWrapper = this.makeInvictusElement('card-wrapper', 'div', inner);
    return outerCardWrapper;
  }

  shuffle() {
    const cardAreaCards = this.cardArea.children;
    if (cardAreaCards.length > 0) cardAreaCards.forEach(card => card.remove());
    if (this.activeCard !== null) {
      this.activeCard?.classList.remove('selected');
      this.activeCard?.classList.remove('active');
    }
    let currentIndex = this.cardSet.length; let randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [this.cardSet[currentIndex], this.cardSet[randomIndex]] = [this.cardSet[randomIndex], this.cardSet[currentIndex]];
    }
    this.cardSet[0].classList.add('active');
    this.activeCard = this.cardSet[0];
    this.activeCardSetIndex = 0;
    this.cardSet.forEach(card => {
      this.cardArea.appendChild(card);
    });
  }

  shuffleAndPlaceCards() {
    if (globalThis?.invictus?.consistentCardOrder === false) {
      let currentIndex = this.cardSet.length; let randomIndex;
      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [this.cardSet[currentIndex], this.cardSet[randomIndex]] = [this.cardSet[randomIndex], this.cardSet[currentIndex]];
      }
    }
    this.cardSet.forEach(card => {
      card.firstChild.addEventListener('click', this.flipCard);
      this.cardArea.appendChild(card);
    });
  }

  makeInvictusBlock() {
    /* Menu Bar */
    const titleBar = this.makeInvictusElement(['title-bar'], 'span', undefined, this.title);
    this.showButton = this.makeInvictusElement(['show-flip-cards', 'right'], 'button', undefined, 'Show Flip Cards');
    this.closeButton = this.makeInvictusElement(['close-flip-cards', 'right', 'hidden'], 'button', undefined, '✕');
    this.closeButton.title = 'Hide Flip Cards';
    this.shuffleButton = this.makeInvictusElement(['shuffle-flip-cards', 'right', 'hidden'], 'button', undefined, 'Shuffle');
    this.shuffleButton.title = 'Randomize Flip Cards Order';
    const menuBar = this.makeInvictusElement(['menu-bar'], 'div', [titleBar, this.showButton, this.closeButton, this.shuffleButton]);
    /* Card Area */
    this.previousCardButton = this.makeInvictusElement(['previous-card'], 'div', undefined, '🞀');
    this.cardArea = this.makeInvictusElement(['card-area'], 'div');
    this.nextCardButton = this.makeInvictusElement(['next-card'], 'div', undefined, '🞂');
    this.cardAreaWrapper = this.makeInvictusElement(['card-area-wrapper', 'hidden'], 'div', [this.previousCardButton, this.cardArea, this.nextCardButton]);
    this.outerWrapper = this.makeInvictusElement(['flip-container'], 'div', [menuBar, this.cardAreaWrapper]);
    return this.outerWrapper;
  }

  flipCard(eventOrHtmlElement) {
    const cardElement = eventOrHtmlElement instanceof HTMLElement ? eventOrHtmlElement : eventOrHtmlElement.currentTarget;
    cardElement.parentElement.classList.toggle('selected');
  }

}));


















