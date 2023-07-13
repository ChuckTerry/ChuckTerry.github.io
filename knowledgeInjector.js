globalThis.INJECTED_CONTENT = {
  base: 'content injected successfully'
};

const scriptTag = document.createElement('script');
scriptTag.textContent = 'globalThis.INJECTED_CONTENT.eval = \'content injected successfully\'';
document.head.appendChild(scriptTag);

const p = document.createElement('p');
document.body.appendChild(p);
const text = 'done';
