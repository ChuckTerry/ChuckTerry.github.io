/*
 * This is the bootstrap file for the Invictus Logic Driver and styling.
 * It neither are present in the Moodle Page, this will remedy the issue.
 */
(async () => {
  const INVICTUS = globalThis?.invictus;
  if (invictus.logicDriver && INVICTUS.stylesheet) {
    return;
  }
  /* If The Driver's not present, we fetch it from my server */
  fetch('https://chuckterry.me/assets/invictus-logic-driver.js')
    .then(response => response.text())
    .then((text) => {
      /* First we're going to check if a driver element was spawned from
       * another instance during our fetch cycle, and if so, return
       */
      if (INVICTUS.logicDriver) {
        return;
      }
      /* We will take the response, put it inside a <script> element
       * And inject it into the head of the current document
       */
      const element = document.createElement('script');
      element.id = 'invictus-logic-driver';
      element.innerText = text;
      document.head.appendChild(element);
    });
  

  /* Next up is the same process for our styling */
  if (stylesheet instanceof HTMLStyleElement === false) {
    fetch('https://chuckterry.me/assets/invictus-styles.css')
      .then(response => response.text())
      .then((text) => {
        if (INVICTUS.stylesheet) {
          return;
        }
        const element = document.createElement('style');
        element.id = 'invictus-stylesheet';
        element.innerText = text;
        document.head.appendChild(element);
      });
  }
})();
