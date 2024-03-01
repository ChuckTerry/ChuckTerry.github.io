function validateEmail() {
  const element = document.querySelector('#email-input');
  const value = element.value;
  const regex = /^.*?@.+\.[A-Za-z]{2,20}$/;
  element.className = value === '' ? '' : regex.exec(value) ? 'valid' : 'invalid';
  return false;
}

function validateSsn() {
  const element = document.querySelector('#ssn-input');
  const value = element.value;
  const regex = /^\d{3}\-?\d{2}\-?\d{4}$/;
  element.className = value === '' ? '' : regex.exec(value) ? 'valid' : 'invalid';
  return false;
}

function validatePhone() {
  const element = document.querySelector('#phone-input');
  const value = element.value;
  const regex = /^(\+1|1)?\s?\(?\d{3}\)?\s?\-?\d{3}\-?\d{4}$/;
  element.className = value === '' ? '' : regex.exec(value) ? 'valid' : 'invalid';
  return false;
}

function validateAge() {
  const element = document.querySelector('#age-input');
  const value = element.value;
  const number = Number.parseInt(value, 10);
  element.className = value === '' ? '' : number > 0 && number < 120 ? 'valid' : 'invalid';
  return false;
}

function validatePassword() {
  const element = document.querySelector('#password-input');
  const value = element.value;
  let valid = true;
  if (!/[A-Z]/.exec(value)) valid = false;
  if (!/[a-z]/.exec(value)) valid = false;
  if (!/\d/.exec(value)) valid = false;
  if (!/[\`\~\!\@\#\$\%\^\&\*\(\)\-\_\=\+\[\{\]\}\;\:\'\"\,\<\.\>\/\?\\\|]/.exec(value)) valid = false;
  if (value.length < 8) valid = false;
  element.className = value === '' ? '' : valid ? 'valid' : 'invalid';
  return false;
}

function checkValid() {
  const elements = document.querySelectorAll('input');
  let valid = true;
  const length = elements.length;
  for (let index = 0; index < length; index++) {
    const element = elements[index];
    if (element.className === 'invalid') valid = false;
  }
  document.querySelector('#valid-fields').style.display === valid ? '' : 'none';
  document.querySelector('#invalid-fields').style.display === valid ? 'none' : '';
}
