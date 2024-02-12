(async () => {
  class Particle {
    static #particlesArray = [];

    static {
      this.clearAll = function() {
        this.#particlesArray.length = 0;
      }

      this.renderAll = function() {
        const count = this.#particlesArray.length;
        for (let index = 0; index < count; index++) {
          this.#particlesArray[index].render();
        }
      }
    }

    constructor(x, y) {
      this.x =  Math.random() * windowWidth;
      this.y =  Math.random() * windowHeight;
      this.home = { x: x, y: y };
      this.radius =  Math.random() * 3 + 3;
      this.sparkly = Math.random() > 0.3;
      this.sparkleMin = 1.4 + Math.random() * 0.6;
      this.sparkleMax = 4.8 + Math.random() * 0.8;
      this.sparkleAscend = true;
      this.vx = (Math.random() - 0.5) * 10;
      this.vy = (Math.random() - 0.5) * 10;
      this.accX = 0;
      this.accY = 0;
      this.friction = Math.random() * 0.2 + 0.88;
      this.color = colors[Math.floor(Math.random() * 6)];

      Particle.#particlesArray.push(this);
      Particle.totalCount++;
    }

    render() {
      this.accX = (this.home.x - this.x) / (1000 * (Math.random() + 1.55));
      this.accY = (this.home.y - this.y) / (1000 * (Math.random() + 1.3));

      this.vx += this.accX;
      this.vy += this.accY;
      this.vx *= this.friction;
      this.vy *= this.friction;

      this.x += this.vx;
      this.y +=  this.vy;

      if (this.sparkly) {
        let sparkleBase = Math.random() * 0.8;
        const sparkleAmount = this.radius - sparkleBase < this.sparkleMin ? 0.01 : sparkleBase;
        this.radius += (this.sparkleAscend ? sparkleAmount : -sparkleAmount);
        if (this.radius > this.sparkleMax) {
          this.sparkleAscend = false;
        } else if (this.radius < this.sparkleMin + 0.1) {
          this.sparkleAscend = true;
        }
      }

      context.fillStyle = this.color;
      context.beginPath();
      context.arc(this.x, this.y, this.radius * (0.3), 6.29, false);
      context.fill();

      const distance = mouse.distanceFrom(this.x, this.y);
      if(distance < (radius * 35)) {
        this.accX = (this.x - mouse.x) / 300 * Math.random() * 2;
        this.accY = (this.y - mouse.y) / 300 * Math.random() * 2;
        this.vx += this.accX;
        this.vy += this.accY;
      }
    }
  }

  class Mouse {
    constructor(x = 0, y = 0) {
      this.updatePosition(x, y);
    }

    updatePosition(x, y) {
      this.x = x;
      this.y = y;
    }

    distanceFrom(x, y) {
      return Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
    }
  }

  function refreshCanvas() {
    windowWidth = canvas.width = window.innerWidth;
    windowHeight = canvas.height = window.innerHeight;
    Particle.clearAll();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = `bold ${windowWidth / 12}px serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(' ❖ Chuck Terry ❖ ', windowWidth / 2, windowHeight / 2);

    const imageData  = context.getImageData(0, 0, windowWidth, windowHeight).data;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = 'screen';

    const widthMax = Math.round(windowWidth / 210);
    const heightMax = Math.round(windowHeight / 210);
    for(let x = 0; x < windowWidth; x += widthMax) {
      for(let y = 0; y < windowHeight; y += heightMax) {
        if(imageData[(x + y * windowWidth) * 4 + 3] > 220) {
          new Particle(x, y);
        }
      }
    }
  }

  const canvas = document.querySelector('#fluid-motion-logo');
  const context = canvas.getContext('2d', { willReadFrequently: false });
  const mouse = new Mouse(-9999, -9999);

  let windowHeight;
  let windowWidth;
  let radius = 2;

  const colors = [
    //'#EEEEFF',
    '#000022',
    '#00BBFF',
    '#3311EE',
    '#0044FF',
    '#1133AA'
  ];

  window.addEventListener('resize', refreshCanvas);
  window.addEventListener('mousemove', (event) => mouse.updatePosition(event.clientX, event.clientY));
  window.addEventListener('touchmove', (event) => {
    if (event.touches.length > 0) {
      mouse.updatePosition(event.touches[0].clientX, event.touches[0].clientX);
    }
  });
  window.addEventListener('click', () => radius = radius < 8 ? radius + 1 : 0);
  window.addEventListener('touchend', () => mouse.updatePosition(-9999, -9999));
  document.querySelector('.fluid-motion-wrapper').addEventListener('mouseleave', () => mouse.updatePosition(-9999, -9999));
  refreshCanvas();
  requestAnimationFrame(function render() {
    requestAnimationFrame(render);
    context.clearRect(0, 0, canvas.width, canvas.height);
    Particle.renderAll();
  });
})();


