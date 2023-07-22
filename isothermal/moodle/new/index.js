import { Toast } from './Toast.js';

const CARD_LIST = document.querySelector('#card-list');

const OUTPUT_MODAL = document.querySelector('#output-modal');
const OUTPUT_TEXTAREA = document.querySelector('#output-textarea');
const OUTPUT_COPY = document.querySelector('#output-modal-copy');

const TITLE_MODAL = document.querySelector('#title-edit-modal');
const TITLE_TEXTAREA = document.querySelector('#title-edit-textarea');
const CARD_SET_TITLE = document.querySelector('.card-set-title');

const EDIT_MODAL = document.querySelector('#card-edit-modal');
const EDIT_INDEX = document.querySelector('#card-edit-modal-target-index');
const EDIT_IS_NEW = document.querySelector('#card-edit-modal-target-new');
const TERM_TEXTAREA = document.querySelector('#card-edit-term-textarea');
const DEFINITION_TEXTAREA = document.querySelector('#card-edit-definition-textarea');



const VERSION = '1.0.0';

/** @todo Use with contenteditable to make ellipses safe */
function isOverflowing(htmlElement) {
  const { clientHeight, clientWidth, scrollHeight, scrollWidth } = htmlElement;
  return clientHeight < scrollHeight || clientWidth < scrollWidth;
}

function getEditString() {
  const searchString = window.location.search;
  const matchString = '?action=edit&content=';
  if (!searchString?.startsWith(matchString)) return null;
  return searchString.slice(matchString.length);
}

function quiteAddCard(json) {
  if (typeof json === 'string') json = JSON.parse(json);
  createCardListEntry(json.Term.Content, json.Definition.Content);
}

function openEditModal(cardWrapper = false) {
  EDIT_MODAL.classList.remove('hidden');
  if (cardWrapper === false) cardWrapper = createCardListEntry();
  const cardIndex = [...CARD_LIST.children].indexOf(cardWrapper);
  EDIT_INDEX.innerText = cardIndex;
  const term = cardWrapper.querySelector('.card-content-term').innerText;
  const definition = cardWrapper.querySelector('.card-content-definition').innerText;
  TERM_TEXTAREA.value = term;
  DEFINITION_TEXTAREA.value = definition;
}

function resetEditModal() {
  TERM_TEXTAREA.value = '';
  DEFINITION_TEXTAREA.value = '';
  EDIT_INDEX.innerText = CARD_LIST.children.length;
  EDIT_IS_NEW.innerText = '0';
  EDIT_MODAL.classList.add('hidden');
}

function saveEditModal() {
  const targetWrapperIndex = EDIT_INDEX.innerText;
  const targetWrapper = CARD_LIST.children[targetWrapperIndex];
  targetWrapper.querySelector('.card-content-term').innerText = TERM_TEXTAREA.value;
  targetWrapper.querySelector('.card-content-definition').innerText = DEFINITION_TEXTAREA.value;
  resetEditModal();
  Toast('Flash Card Saved');
}

function incrementCardPosition(event) {
  const cardWrapper = event.target.parentElement.parentElement.parentElement;
  if (cardWrapper.previousElementSibling === null) return;
  const previousSibling = cardWrapper.previousElementSibling;
  cardWrapper.parentElement.insertBefore(cardWrapper, previousSibling);
}

function decrementCardPosition(event) {
  const cardWrapper = event.target.parentElement.parentElement.parentElement;
  if (cardWrapper.nextElementSibling.classList.contains('card-list-new-card')) return;
  const nextNextSibling = cardWrapper.nextElementSibling.nextElementSibling;
  cardWrapper.parentElement.insertBefore(cardWrapper, nextNextSibling);
}

function editCard(event) {
  openEditModal(event.target.parentElement.parentElement);
}

function deleteCard(event) {
  event.target.parentElement.parentElement.remove();
  Toast('Flash Card Deleted');
}

function createCardListEntry(term = 'Term Text (Front)', definition = 'Definition Text (Back)') {
  const wrapper = document.createElement('div');
  wrapper.classList.add('card-list-entry-wrapper');
  /** @todo @security The following innerHTML is safe - Relies on static string */
  wrapper.innerHTML = '<div class="card-control-wrapper"><span class="card-control-edit" title="Edit Card">✎</span><span class="card-control-delete" title="Delete Card">🗙</span></div><div class="card-postion-control-wrapper"><div class="card-postion-control-inc"><span class="position-inc" title="Raise Card Position">⮝</span></div><div class="card-postion-control-dec"><span class="position-dec" title="Lower Card Position">⮟</span></div></div><div class="card-content-wrapper"><div class="card-content-term">Term</div><div class="card-content-definition">Definition</div></div>';
  wrapper.querySelector('.position-inc').addEventListener('click', incrementCardPosition);
  wrapper.querySelector('.position-dec').addEventListener('click', decrementCardPosition);
  wrapper.querySelector('.card-content-term').innerText = term;
  wrapper.querySelector('.card-content-definition').innerText = definition;
  wrapper.querySelector('.card-control-edit').addEventListener('click', editCard);
  wrapper.querySelector('.card-control-delete').addEventListener('click', deleteCard);
  CARD_LIST.insertBefore(wrapper, document.querySelector('.card-list-new-card'));
  return wrapper;
}

function openTitleModal() {
  TITLE_MODAL.classList.remove('hidden');
}

function resetTitleModal() {
  TITLE_MODAL.classList.add('hidden');
  TITLE_TEXTAREA.value = CARD_SET_TITLE.innerText;
}

function saveTitle() {
  CARD_SET_TITLE.innerText = TITLE_TEXTAREA.value;
  resetTitleModal();
  Toast('Title Updated');
}

function copyOutputJson() {
  OUTPUT_TEXTAREA.select();
  OUTPUT_TEXTAREA.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(OUTPUT_TEXTAREA.value);
  window.getSelection().removeAllRanges();
  Toast('Copied to Clipboard');
}

function generateOutputJson() {
  const jsonString = convertCardsToJsonString();
  OUTPUT_TEXTAREA.value = jsonString;
  OUTPUT_MODAL.classList.remove('hidden');
}

function resetOutputModal() {
  OUTPUT_TEXTAREA.innerText = '';
  OUTPUT_MODAL.classList.add('hidden');
}

function convertCardsToJsonString() {
  const json = {
    Title: CARD_SET_TITLE.innerText,
    Created: "",
    Modified: Date.now(),
    UUID: "",
    FlashCards: [],
    Version: VERSION
  };
  const cardArray = [...CARD_LIST.children];
  const count = cardArray.length;
  for (let index = 0; index < count; index++) {
    const card = cardArray[index];
    if (card.classList.contains('card-list-new-card')) continue;
    const cardJson = {
      Term: {
        Content: "",
        ContainsHTML: false,
        IsImage: false
      },
      Definition: {
        Content: "",
        ContainsHTML: false,
        IsImage: false
      },
      Created: "",
      Modified: ""
    }
    cardJson.Term.Content = card.querySelector('.card-content-term').innerText;
    cardJson.Definition.Content = card.querySelector('.card-content-definition').innerText;
    json.FlashCards.push(cardJson);
  }
  return JSON.stringify(json);
}

function onLoadFunction() {
  const editString = getEditString();
  if (!editString) return createCardListEntry();
  const json = JSON.parse(decodeURI(editString));
  const cardArray = json.FlashCards;
  const count = cardArray.length;
  for (let index = 0; index < count; index++) {
    quiteAddCard(cardArray[index]);
  }
}

if (document.readyState === 'complete') {
  onLoadFunction();
} else {
  window.addEventListener('load', onLoadFunction);
}

CARD_LIST.lastElementChild.addEventListener('click', () => {
  EDIT_IS_NEW.innerText = '1';
  openEditModal(createCardListEntry());
});

document.querySelector('#card-edit-modal-cancel').addEventListener('click', (event) => {
  if (EDIT_IS_NEW.innerText === "1") {
    const newCard = CARD_LIST.lastElementChild.previousElementSibling;
    newCard.remove();
  }
  return resetEditModal();
});

document.querySelector('#card-edit-modal-save').addEventListener('click', saveEditModal);
document.querySelector('#title-edit-modal-cancel').addEventListener('click', resetTitleModal);
document.querySelector('#title-edit-modal-save').addEventListener('click', saveTitle);
document.querySelector('.card-set-title-edit').addEventListener('click', openTitleModal);
document.querySelector('#button-generate-output').addEventListener('click', generateOutputJson);
document.querySelector('#output-modal-close').addEventListener('click', resetOutputModal);
OUTPUT_COPY.addEventListener('click', copyOutputJson);
