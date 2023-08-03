import { Toast } from './Toast.js';
import { makeUuid } from './uuidGenerator.js';

const CARD_LIST = document.querySelector('#card-list');
const NEW_CARD_BUTTON = CARD_LIST.lastElementChild;

const UPLOAD_MODAL = document.querySelector('#upload-file-modal');
const UPLOAD_INPUT = document.querySelector('#upload-file-picker');
const UPLOAD_PROGRESS = document.querySelector('#upload-file-progress-bar');
const UPLOAD_PROGRESS_FIELDSET = document.querySelector('#upload-file-progess-fieldset');

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
const SAVEFILE_VERSION = 1;
const DAWN_OF_TIME = {
  date: new Date(-62167201438000),
  epoch: '-62167201438000'
};

fetch('./output-template.html')
  .then(response => response.text())
  .then(string => globalThis.templateString = string);

/******************************************************************************/
/*                            File Writing Functions                          */
/******************************************************************************/
const file_WriteIdentifier = () => '1NV1CTUS\x00';
const file_WriteSavefileVersion = () => `\x11${SAVEFILE_VERSION}\x17`;
const file_WriteInvictusVersion = () => `\x12${VERSION.split('.').join('\x00')}\x00\x17`;
const file_WriteHeader = () => `\x01${file_WriteSavefileVersion}${file_WriteInvictusVersion}\r\n\x17`;
const file_WriteBody = (jsonString) => `\x02${btoa(jsonString)}\x03\x00\x17`;
const file_WriteDate = () => {
  const date = new Date();
  const year = date.getFullYear() - 2000;
  const month = date.getMonth().length === 1 ? '0' + date.getMonth() : date.getMonth();
  const day = date.getDate().length === 1 ? '0' + date.getDate() : date.getDate();
  return `\x13${year}\x00${month}\x00${day}\x00\x17`;
};
const file_WriteTime = () => {
  const date = new Date();
  const hour = date.getHours().length === 1 ? '0' + date.getHours() : date.getHours();
  const minute = date.getMinutes().length === 1 ? '0' + date.getMinutes() : date.getMinutes();
  const second = date.getSeconds().length === 1 ? '0' + date.getSeconds() : date.getSeconds();
  return `\x14${hour}\x00${minute}\x00${second}\x00\x17`;
};
const file_WriteFooter = () => `\x16${file_WriteDate()}\x00${file_WriteTime()}\x17\x04`;
const file_Encode = (jsonString) => {
  return file_WriteIdentifier() +
         file_WriteHeader() +
         file_WriteBody(jsonString) +
         file_WriteFooter();
};

/******************************************************************************/
/*                             Page Load Functions                            */
/******************************************************************************/
function getEditString() {
  const searchString = window.location.search;
  const matchString = '?action=edit&content=';
  if (!searchString?.startsWith(matchString)) {
    return null;
  }
  return searchString.slice(matchString.length);
}

function onLoadFunction() {
  const editString = getEditString();
  if (!editString) {
    return createCardListEntry();
  }
  const decodedString = decodeURI(editString);
  if (decodedString.contains('"__proto__"')) {
    throw new Error('Prototype Pollution Attempt Detected via Compromised URL Query String!  Aborting Load!');
  }
  const json = JSON.parse(decodedString);
  const cardArray = json.FlashCards;
  const count = cardArray.length;
  for (let index = 0; index < count; index++) {
    silentAddCard(cardArray[index]);
  }
  Toast('Flash Card Set Loaded from URL');
}

function loadCardsFromJson(json) {
  if (typeof json === 'string') {
    json = decodeURIComponent(json);
    if (json.contains('"__proto__"')) {
      throw new Error('Prototype Pollution Attempt Detected via Compromised JSON!  Aborting Load!');
    }
    json = JSON.parse(json);
  }
  const cardArray = Array.isArray(json) ? json : json.FlashCards;
  const count = cardArray.length;
  for (let index = 0; index < count; index++) {
    silentAddCard(cardArray[index]);
  }
}

/******************************************************************************/
/*                                File Handling                               */
/******************************************************************************/
function handleUpload() {
  unhideElements(UPLOAD_PROGRESS_FIELDSET);
  const file = this.files[0];
  const name = file.name;
  const reader = new FileReader();
  reader.addEventListener('error', () => {
    UPLOAD_INPUT.value = '';
    Toast('ERROR: File Uplaod Failed');
  });
  reader.addEventListener('progress', ([lengthComputable, loaded, total]) => {
    if (lengthComputable) {
      const percent = loaded / total * 100;
      const fixedPercent = percent.toFixed(1);
      UPLOAD_PROGRESS.value = fixedPercent;
      UPLOAD_PROGRESS.innerText = `${fixedPercent} %`;
    }
  });
  reader.addEventListener('load', (event) => {
    document.querySelector('#upload-file-name').value = name;
    document.querySelector('#upload-file-content').value = event.target.result;
  });
  reader.readAsText(file);
}

function parseFile() {
  const name = document.querySelector('#upload-file-name').value;
  const string = document.querySelector('#upload-file-content').value;
  if (string.contains('"__proto__"')) {
    throw new Error('Prototype Pollution Attempt Detected via Compromised File!  Aborting Load!');
  }
  const json = JSON.parse(string);
  const title = json.Title ? json.Title : name.slice(0, name.lastIndexOf('.'));
  saveTitle(title);
  const cardArray = json.FlashCards;
  const cardCount = cardArray.length;
  for (let index = 0; index < cardCount; index++) {
    const card = cardArray[index];
    silentAddCard(card);
  }
}

/******************************************************************************/
/*                           Card Creation & Loading                          */
/******************************************************************************/
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

function loadPlainTextCardSet(string, deleteCurrentSet = false) {
  if (deleteCurrentSet) {
    clearAllCards();
  }
  const EOL = string.indexOf('\r\n') === -1 ? '\n' : '\r\n';
  if (string.trim().startsWith('Title:')) {
    const firstLineBreak = string.indexOf(EOL);
    const title = string.slice(5, firstLineBreak).trim();
    CARD_SET_TITLE.innerText = title;
    string = string.slice(firstLineBreak + EOL.length);
    resetTitleModal();
  }
  const cards = string.split(EOL);
  const cardCount = cards.length;
  for (let index = 0; index < cardCount; index++) {
    const cardString = cards[index];
    const colon = cardString.indexOf(':');
    if (colon === -1) {
      continue;
    }
    const term = cardString.slice(0, colon);
    const definition = cardString.slice(colon + 1);
    silentAddCard([term, definition]);
  }
  Toast('Flash Cards Loaded');
}

function silentAddCard(jsonOrEntryArray) {
  if (Array.isArray(jsonOrEntryArray)) {
    return createCardListEntry(jsonOrEntryArray[0], jsonOrEntryArray[1]);
  }
  if (typeof jsonOrEntryArray === 'string') {
    if (jsonOrEntryArray.contains('"__proto__"')) {
      throw new Error('Prototype Pollution Attempt Detected While Adding Card!  Aborting Add Card!');
    }
    jsonOrEntryArray = JSON.parse(jsonOrEntryArray);
  }
  return createCardListEntry(jsonOrEntryArray.Term.Content, jsonOrEntryArray.Definition.Content);
}

function createCard() {
  EDIT_IS_NEW.innerText = '1';
  openEditModal(createCardListEntry());
}

/******************************************************************************/
/*                              File Upload Modal                             */
/******************************************************************************/
function resetUploadModal() {
  hideElements(UPLOAD_MODAL, UPLOAD_PROGRESS_FIELDSET);
  UPLOAD_INPUT.value = '';
  UPLOAD_PROGRESS.value = 0;
  UPLOAD_PROGRESS.innerText = '0.0 %';
}

function submitFileUploadModal() {
  parseFile();
  resetUploadModal();
}

function openUploadModal() {
  unhideElements(UPLOAD_MODAL);
}

/******************************************************************************/
/*                                 Edit Modal                                 */
/******************************************************************************/
function openEditModal(cardWrapper = createCardListEntry()) {
  unhideElements(EDIT_MODAL);
  const cardIndex = [...CARD_LIST.children].indexOf(cardWrapper);
  EDIT_INDEX.innerText = cardIndex;
  const term = cardWrapper.querySelector('.card-content-term').innerText;
  const definition = cardWrapper.querySelector('.card-content-definition').innerText;
  TERM_TEXTAREA.value = term;
  DEFINITION_TEXTAREA.value = definition;
  TERM_TEXTAREA.focus();
}

function resetEditModal() {
  TERM_TEXTAREA.value = '';
  DEFINITION_TEXTAREA.value = '';
  EDIT_INDEX.innerText = CARD_LIST.children.length;
  EDIT_IS_NEW.innerText = '0';
  hideElements(EDIT_MODAL);
}

function cancelEditModal() {
  if (EDIT_IS_NEW.innerText === "1") {
    NEW_CARD_BUTTON.previousElementSibling.remove();
    Toast('New Card Discarded');
  } else {
    Toast('Flash Card Changes Discarded');
  }
  return resetEditModal();
}

function saveEditModal() {
  const targetWrapperIndex = EDIT_INDEX.innerText;
  const targetWrapper = CARD_LIST.children[targetWrapperIndex];
  targetWrapper.querySelector('.card-content-term').innerText = TERM_TEXTAREA.value;
  targetWrapper.querySelector('.card-content-definition').innerText = DEFINITION_TEXTAREA.value;
  resetEditModal();
  Toast('Flash Card Saved');
}

function editCard(event) {
  openEditModal(event.target.parentElement.parentElement);
}

/******************************************************************************/
/*                                 Title Modal                                */
/******************************************************************************/
function openTitleModal() {
  unhideElements(TITLE_MODAL);
}

function resetTitleModal() {
  hideElements(TITLE_MODAL);
  TITLE_TEXTAREA.value = CARD_SET_TITLE.innerText;
}

function saveTitle(title = TITLE_TEXTAREA.value) {
  CARD_SET_TITLE.innerText = title instanceof PointerEvent ? TITLE_TEXTAREA.value : title;
  resetTitleModal();
  Toast('Title Updated');
}

/******************************************************************************/
/*                                Output Modal                                */
/******************************************************************************/
function copyOutputJson() {
  OUTPUT_TEXTAREA.select();
  OUTPUT_TEXTAREA.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(OUTPUT_TEXTAREA.value);
  window.getSelection().removeAllRanges();
  Toast('Copied to Clipboard');
}

function generateOutput() {
  const uuid = makeUuid();
  const json = convertCardsToJsonString(uuid);
  let string = globalThis.templateString;
  string = string.replaceAll(/\{\{\{UUID\}\}\}/g, uuid);
  string = string.replaceAll(/\{\{\{JSON_CONTENT\}\}\}/g, json);
  OUTPUT_TEXTAREA.value = string;
  unhideElements(OUTPUT_MODAL);
}

function resetOutputModal() {
  OUTPUT_TEXTAREA.innerText = '';
  hideElements(OUTPUT_MODAL);
}

function convertCardsToJsonString(uuid = makeUuid()) {
  const json = {
    "Title": CARD_SET_TITLE.innerText,
    "Created": "",
    "Modified": getTimeStamp(),
    "UUID": uuid,
    "FlashCards": [],
    "Version": VERSION
  };
  const cardArray = [...CARD_LIST.children];
  const count = cardArray.length;
  for (let index = 0; index < count; index++) {
    const card = cardArray[index];
    if (card.classList.contains('card-list-new-card')) {
      continue;
    }
    const cardJson = {
      "Term": {
        "Content": "",
        "ContainsHTML": false,
        "IsImage": false
      },
      "Definition": {
        "Content": "",
        "ContainsHTML": false,
        "IsImage": false
      },
      "Created": "",
      "Modified": ""
    };
    cardJson.Term.Content = card.querySelector('.card-content-term').innerText;
    cardJson.Definition.Content = card.querySelector('.card-content-definition').innerText;
    json.FlashCards.push(cardJson);
  }
  return JSON.stringify(json);
}

/******************************************************************************/
/*                           Card Position Functions                          */
/******************************************************************************/
function incrementCardPosition(event) {
  const cardWrapper = event.target.parentElement.parentElement.parentElement;
  if (cardWrapper.previousElementSibling === null) {
    return;
  }
  const previousSibling = cardWrapper.previousElementSibling;
  cardWrapper.parentElement.insertBefore(cardWrapper, previousSibling);
}

function decrementCardPosition(event) {
  const cardWrapper = event.target.parentElement.parentElement.parentElement;
  if (cardWrapper.nextElementSibling.classList.contains('card-list-new-card')) {
    return;
  }
  const nextNextSibling = cardWrapper.nextElementSibling.nextElementSibling;
  cardWrapper.parentElement.insertBefore(cardWrapper, nextNextSibling);
}

/******************************************************************************/
/*                           Card Removal Functions                           */
/******************************************************************************/
function deleteCard(event) {
  event.target.parentElement.parentElement.remove();
  Toast('Flash Card Deleted');
}

function clearAllCards() {
  const cardArray = [...CARD_LIST.children];
  const cardCount = cardArray.length;
  for (let index = 0; index < cardCount; index++) {
    cardArray[index].remove();
  }
}

/******************************************************************************/
/*                                   Utility                                  */
/******************************************************************************/
function getTimeStamp(anonymous = false) {
  return globalThis.anonymous || anonymous ? DAWN_OF_TIME.epoch : Date.now();
}

function abstract_multiElementClassModify(elements, addClasses = [], removeClasses = []) {
 const elementCount = elements.length;
  for (let index = 0; index < elementCount; index++) {
    const addCount = addClasses.length;
    for (let addIndex = 0; addIndex < addCount; addIndex++) {
      elements[index].classList.add(addClasses[addIndex]);
    }
    const removeCount = removeClasses.length;
    for (let removeIndex = 0; removeIndex < removeCount; removeIndex++) {
      elements[index].classList.remove(removeClasses[removeIndex]);
    }
  }
  return elements;
}

function hideElements(...args) {
const elements = [...args];
  abstract_multiElementClassModify(elements, ['hidden']);
  return elements;
}

function unhideElements(...args) {
  const elements = [...args];
  abstract_multiElementClassModify(elements, [], ['hidden']);
  return elements;
}

/** @todo Use with contenteditable to make ellipses safe */
function isOverflowing(htmlElement) {
  const { clientHeight, clientWidth, scrollHeight, scrollWidth } = htmlElement;
  return clientHeight < scrollHeight || clientWidth < scrollWidth;
}

function escapeBackTicks(string) {
  return string.replaceAll(/`/g, '\\`');
}

/******************************************************************************/
/*                               Initialization                               */
/******************************************************************************/
if (document.readyState === 'complete') {
  onLoadFunction();
} else {
  window.addEventListener('load', onLoadFunction);
}

document.querySelector('#card-edit-modal-cancel').addEventListener('click', cancelEditModal);
document.querySelector('#card-edit-modal-save').addEventListener('click', saveEditModal);
document.querySelector('#title-edit-modal-cancel').addEventListener('click', resetTitleModal);
document.querySelector('#title-edit-modal-save').addEventListener('click', saveTitle);
document.querySelector('.card-set-title-edit').addEventListener('click', openTitleModal);
document.querySelector('#button-generate-output').addEventListener('click', generateOutput);
document.querySelector('#output-modal-close').addEventListener('click', resetOutputModal);
document.querySelector('#button-upload-file').addEventListener('click', openUploadModal);
document.querySelector('#upload-file-modal-cancel').addEventListener('click', resetUploadModal);
document.querySelector('#upload-file-modal-submit').addEventListener('click', submitFileUploadModal);
NEW_CARD_BUTTON.addEventListener('click', createCard);
OUTPUT_COPY.addEventListener('click', copyOutputJson);
UPLOAD_INPUT.addEventListener("change", handleUpload);
