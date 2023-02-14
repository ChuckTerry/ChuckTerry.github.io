let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
    deferredPrompt = event;
});

document.querySelector('#install-web-app').addEventListener('click', async () => {
  if (deferredPrompt !== null) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt = null;
    }
  }
});