window.addEventListener('load', () => {
  navigator?.serviceWorker?.register('../sw-pwa.js');
});

const installButton = document.querySelector('#install-web-app');
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();

  installButton.disabled = false;

  installButton.addEventListener("click", async e => {
    installButton.disabled = true;

    const { userChoice } = await event.prompt();
    console.info(`user choice was: ${userChoice}`);
  });
});


