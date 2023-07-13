export const enum_TOAST_THEME = {
  DEFUALT: null,
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning'
};


export function Toast(message, time, theme) {
  return new (class Toast {
    constructor(message, time = 4000, theme = enum_TOAST_THEME.DEFAULT) {
      this.time = time;
      this.message = message;
      this.element = this.buildToastElement();
      if (theme !== null) {
        this.element.classList.add(theme);
      }
      document.querySelector('#toaster').appendChild(this.element);
      this.updateTime(time);
      this.element.classList.add('visible');
    }

    buildToastElement() {
      const element = document.createElement('div');
      element.classList.add('toast');
      const icon = document.createElement('span');
      icon.classList.add('toast-close-icon');
      const closeButton = document.createElement('div');
      closeButton.classList.add('toast-close');
      closeButton.appendChild(icon);
      closeButton.addEventListener('click', () => this.destroy(true));
      element.append(closeButton);
      const message = document.createElement('div');
      message.classList.add('toast-message');
      message.innerText = this.message;
      element.appendChild(message);
      return element;
    }

    updateTime(time = this.time) {
      window.clearTimeout(this.timeout);
      this.time = time;
      this.timeout = window.setTimeout(() => this.destroy(), time);
    }

    destroy(immediate = false) {
      if (immediate === true) {
        return this.element.remove();
      }
      window.clearTimeout(this.timeout);
      this.element.classList.remove('visible');
      this.timeout = window.setTimeout(() => this.element.remove(true), 2000);
    }

  })(message, time, theme);
}
