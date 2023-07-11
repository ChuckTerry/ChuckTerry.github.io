function multiAddEventListener(selector, event, callback) {
  const elementArray = [...document.querySelectorAll(selector)];
  const count = elementArray.length;
  for (let index = 0; index < count; index++) {
    elementArray[index].addEventListener(callback);
  }
}

function openEditModal(cardWrapper = false) {
  const modal = document.querySelector('#card-edit-modal')
  modal.classList.remove('hidden');
  if (cardWrapper === false) {
    cardWrapper = createCardListEntry();
  }
  
  const cardIndex = [...document.querySelector('#card-list').children].indexOf(cardWrapper);
  
  document.querySelector('#card-edit-modal-target-index').innerText = cardIndex;
  const term = cardWrapper.querySelector('.card-content-term').innerText;
  const definition = cardWrapper.querySelector('.card-content-definition').innerText;
  modal.querySelector('#card-edit-term-textarea').value = term;
  modal.querySelector('#card-edit-definition-textarea').value = definition;
}

function resetEditModal() {
  document.querySelector('#card-edit-term-textarea').value = '';
  document.querySelector('#card-edit-definition-textarea').value = '';
  document.querySelector('#card-edit-modal-target-index').innerText = document.querySelector('#card-list').children.length;
  document.querySelector('#card-edit-modal-target-new').innerText = '0';
  
  document.querySelector('#card-edit-modal').classList.add('hidden');
}

function updateCardDetails() {
  const targetWrapperIndex = document.querySelector('#card-edit-modal-target-index').innerText;
  const targetWrapper = document.querySelector('#card-list').children[targetWrapperIndex];
  const term = document.querySelector('#card-edit-term-textarea').value;
  const definition = document.querySelector('#card-edit-definition-textarea').value;
  targetWrapper.querySelector('.card-content-term').innerText = term;
  targetWrapper.querySelector('.card-content-definition').innerText = definition;
  resetEditModal();
}

function incrementCardPosition(event) {
  const cardWrapper = event.target.parentElement.parentElement.parentElement;
  if (cardWrapper.previousElementSibling === null) return;
  const cardList = cardWrapper.parentElement;
  const previousSibling = cardWrapper.previousElementSibling;
  cardList.insertBefore(cardWrapper, previousSibling);
}

function decrementCardPosition(event) {
  const cardWrapper = event.target.parentElement.parentElement.parentElement;
  if (cardWrapper.nextElementSibling.classList.contains('card-list-new-card')) return;
  const cardList = cardWrapper.parentElement;
  const nextNextSibling = cardWrapper.nextElementSibling.nextElementSibling;
  cardList.insertBefore(cardWrapper, nextNextSibling);
}

function editCard(event) {
  openEditModal(event.target.parentElement.parentElement);
}

function deleteCard(event) {
  event.target.parentElement.parentElement.remove();
}


function createCardListEntry(term = 'Term Text (Front)', definition = 'Definition Text (Back)') {
  const wrapper = document.createElement('div');
  wrapper.classList.add('card-list-entry-wrapper');
  wrapper.innerHTML = '<div class="card-control-wrapper"><span class="card-control-edit" title="Edit Card">✎</span><span class="card-control-delete" title="Delete Card">🗙</span></div><div class="card-postion-control-wrapper"><div class="card-postion-control-inc"><span class="position-inc" title="Raise Card Position">⮝</span></div><div class="card-postion-control-dec"><span class="position-dec" title="Lower Card Position">⮟</span></div></div><div class="card-content-wrapper"><div class="card-content-term">Term</div><div class="card-content-definition">Definition</div></div>';
  console.dir(wrapper);
  wrapper.querySelector('.position-inc').addEventListener('click', incrementCardPosition);
  wrapper.querySelector('.position-dec').addEventListener('click', decrementCardPosition);
  wrapper.querySelector('.card-content-term').innerText = term;
  wrapper.querySelector('.card-content-definition').innerText = definition;
  wrapper.querySelector('.card-control-edit').addEventListener('click', editCard);
  wrapper.querySelector('.card-control-delete').addEventListener('click', deleteCard);
  
  const cardList = document.querySelector('#card-list');
  const addCardButton = document.querySelector('.card-list-new-card');
  cardList.insertBefore(wrapper, addCardButton);
  return wrapper;
}

document.querySelector('#card-list').lastElementChild.addEventListener('click', () => {
  const newCard = createCardListEntry();
  document.querySelector('#card-edit-modal-target-new').innerText = '1';
  openEditModal(newCard);
});

document.querySelector('#card-edit-modal-cancel').addEventListener('click', (event) => {
  const removeCard = document.querySelector('#card-edit-modal-target-new').innerText === "1"
  resetEditModal();
  if (removeCard) {
    const newCard = document.querySelector('#card-list').lastElementChild.previousElementSibling;
    newCard.remove();
  }
  
});
document.querySelector('#card-edit-modal-save').addEventListener('click', updateCardDetails);
document.querySelector('#title-edit-modal-cancel').addEventListener('click', resetTitleModal);
document.querySelector('#title-edit-modal-save').addEventListener('click', saveTitle);
document.querySelector('.card-set-title-edit').addEventListener('click', openTitleModal);
document.querySelector('#button-generate-output').addEventListener('click', generateOutputHtml);
document.querySelector('#output-modal-close').addEventListener('click', resetOutputModal);
document.querySelector('#output-modal-copy').addEventListener('click', copyOutputHtml);



function openTitleModal() {
  document.querySelector('#title-edit-modal').classList.remove('hidden');
}

function resetTitleModal() {
  document.querySelector('#title-edit-modal').classList.add('hidden');
  document.querySelector('#title-edit-textarea').value = document.querySelector('.card-set-title').innerText;
  
}

function saveTitle() {
  document.querySelector('.card-set-title').innerText = document.querySelector('#title-edit-textarea').value;
  resetTitleModal();
}


function generateOutputHtml() {
  const htmlString = convertCardsToHtml();
  document.querySelector('#output-textarea').value = htmlString;
  document.querySelector('#output-modal').classList.remove('hidden');
}


function copyOutputHtml() {
  const textareaElement = document.querySelector('#output-textarea');
  textareaElement.select();
  textareaElement.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(textareaElement.value);
  document.querySelector('#output-modal-copy').innerText = 'Copied!'
  window.setTimeout(() => document.querySelector('#output-modal-copy').innerText = 'Copy', 2500);
}

function resetOutputModal() {
  document.querySelector('#output-textarea').innerText = 'Copy';
  document.querySelector('#output-modal').classList.add('hidden');
  
}


function convertCardsToHtml() {
  const title = document.querySelector('.card-set-title').innerText;
  
  let htmlOutput = `<div class="invictus placeholder"><span class="card-set-name">${title}</span>`;
  const cardArray = [...document.querySelector('#card-list').children];
  const count = cardArray.length;
  for (let index = 0; index < count; index++) {
    const card = cardArray[index];
    if (card.classList.contains('card-list-new-card')) continue;
    const term = card.querySelector('.card-content-term').innerText;
    const definition = card.querySelector('.card-content-definition').innerText;
    const html = `<div><div>${term}</div><div>${definition}</div></div>`;
    htmlOutput += html;
  }
  htmlOutput += '</div>';
  return htmlOutput;
}

window.addEventListener('load', () => createCardListEntry());
