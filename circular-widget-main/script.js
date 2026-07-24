import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const widgets = [
  { image: "/Blood_Post_01.png", name: "BloodPost" },
  { image: "/herc.png", name: "Hercules" },
  { image: "/hermes.png", name: "hermes" },
  { image: "/night_Post_01.jpg", name: "nyx" },
  { image: "/Hades_Post_Chaos01.jpg", name: "Chaos" },
  { image: "/Hades_Post_Dionysus01.jpg", name: "Dionysus" },
  { image: "/Hades_Post_Alecto.png", name: "Alecto" },
  { image: "/Hades_Post_Thanatos.png", name: "Thanatos" },
  { image: "/Sisyphus.png", name: "Sisyphus" },
  { image: "/Hades_Superstar_WP1.png", name: "Superstar" },
];

const lerp = (a, b, t) => a + (b - a) * t;

const createSVG = (type, attrs = {}) => {
  const svgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    type
  );
  Object.entries(attrs).forEach(([k, v]) => svgElement.setAttribute(k, v));
  return svgElement;
};

let svg, centerX, centerY, outerRadius;
let currentIndicatorRotation = 0;
let targetIndicatorRotation = 0;
let currentSpinnerRotation = 0;
let targetSpinnerRotation = 0;
let lastTime = performance.now();
let lastSegmentIndex = -1;

const createWidgetSpinner = () => {
  const container = document.querySelector(".widgets");
  const viewportSize = Math.min(container.clientWidth, container.clientHeight);
  outerRadius = viewportSize * 0.4;
  const innerRadius = viewportSize * 0.25;
  centerX = container.clientWidth / 2;
  centerY = container.clientHeight / 2;

  svg = createSVG("svg", { id: "widget-svg" });
  const defs = createSVG("defs");
  svg.appendChild(defs);

  const anglePerSegment = (2 * Math.PI) / widgets.length;

  for (let i = 0; i < widgets.length; i++) {
    const startAngle = i * anglePerSegment - Math.PI / 2;
    const endAngle = (i + 1) * anglePerSegment - Math.PI / 2;
    const midAngle = (startAngle + endAngle) / 2;

    const clipPath = createSVG("clipPath", { id: `clip-${i}` });
    const path = `M ${centerX + outerRadius * Math.cos(startAngle)} ${centerY + outerRadius * Math.sin(startAngle)
      } A ${outerRadius} ${outerRadius} 0 0 1 ${centerX + outerRadius * Math.cos(endAngle)
      } ${centerY + outerRadius * Math.sin(endAngle)} L ${centerX + innerRadius * Math.cos(endAngle)
      } ${centerY + innerRadius * Math.sin(endAngle)
      } A ${innerRadius} ${innerRadius} 0 0 0 ${centerX + innerRadius * Math.cos(startAngle)
      } ${centerY + innerRadius * Math.sin(startAngle)} Z`;

    clipPath.appendChild(createSVG("path", { d: path }));
    defs.appendChild(clipPath);

    const g = createSVG("g", {
      "clip-path": `url(#clip-${i})`,
      "data-segment": i,
    });

    const segmentRadius = (innerRadius + outerRadius) / 2;
    const segmentX = centerX + Math.cos(midAngle) * segmentRadius;
    const segmentY = centerY + Math.sin(midAngle) * segmentRadius;

    const arcLength = outerRadius * anglePerSegment;
    const imgWidth = arcLength * 1.25;
    const imgHeight = (outerRadius - innerRadius) * 1.25;
    const rotation = (midAngle * 180) / Math.PI + 90;

    const image = createSVG("image", {
      href: widgets[i].image,
      width: imgWidth,
      height: imgHeight,
      x: segmentX - imgWidth / 2,
      y: segmentY - imgHeight / 2,
      preserveAspectRatio: "xMidYMid slice",
      transform: `rotate(${rotation} ${segmentX} ${segmentY})`,
    });

    g.appendChild(image);
    svg.appendChild(g);
  }

  container.appendChild(svg);
};

createWidgetSpinner();

const updateContent = () => {
  const relativeRotation =
    (((currentIndicatorRotation - currentSpinnerRotation) % 360) + 360) % 360;
  const segmentIndex = Math.floor(relativeRotation / 36) % widgets.length;

  if (segmentIndex !== lastSegmentIndex) {
    lastSegmentIndex = segmentIndex;

    document.querySelector(".widget-title").textContent =
      widgets[segmentIndex].name;

    const previewContainer = document.querySelector(".widget-preview-img");
    const img = document.createElement("img");
    img.src = widgets[segmentIndex].image;
    img.alt = widgets[segmentIndex].name;

    gsap.set(img, { opacity: 0 });
    previewContainer.appendChild(img);
    gsap.to(img, { opacity: 1, duration: 0.1, ease: "power2.out" });

    const allImages = previewContainer.querySelectorAll("img");
    if (allImages.length > 3) {
      for (let i = 0; i < allImages.length - 3; i++) {
        previewContainer.removeChild(allImages[i]);
      }
    }
  }
};

const animate = () => {
  const currentTime = performance.now();
  let deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  deltaTime = Math.min(deltaTime, 0.1);

  targetIndicatorRotation += 18 * deltaTime;
  targetSpinnerRotation -= 18 * 0.25 * deltaTime;

  currentIndicatorRotation = lerp(
    currentIndicatorRotation,
    targetIndicatorRotation,
    0.1
  );
  currentSpinnerRotation = lerp(
    currentSpinnerRotation,
    targetSpinnerRotation,
    0.1
  );

  document
    .getElementById("widget-indicator")
    .setAttribute(
      "transform",
      `rotate(${currentIndicatorRotation % 360} ${centerX} ${centerY})`
    );

  svg.querySelectorAll("[data-segment]").forEach((seg) => {
    seg.setAttribute(
      "transform",
      `rotate(${currentSpinnerRotation % 360} ${centerX} ${centerY})`
    );
  });

  updateContent();

  requestAnimationFrame(animate);
};

const createFancierIndicator = () => {
  const currentInnerRadius = outerRadius * 0.625;
  const indicatorGroup = createSVG("g", { id: "widget-indicator" });

  const line = createSVG("line", {
    x1: centerX,
    y1: centerY - currentInnerRadius * 0.85,
    x2: centerX,
    y2: centerY - outerRadius * 1.05,
    stroke: "red",
    "stroke-width": "3",
    "stroke-linecap": "round",
    style: "filter: drop-shadow(0px 0px 6px red);"
  });

  const tip = createSVG("polygon", {
    points: `${centerX},${centerY - outerRadius * 1.08} ${centerX - 7},${centerY - outerRadius * 1.02} ${centerX + 7},${centerY - outerRadius * 1.02}`,
    fill: "red",
    style: "filter: drop-shadow(0px 0px 8px red);"
  });

  const baseDiamond = createSVG("polygon", {
    points: `${centerX},${centerY - currentInnerRadius * 0.85 - 8} ${centerX + 6},${centerY - currentInnerRadius * 0.85} ${centerX},${centerY - currentInnerRadius * 0.85 + 8} ${centerX - 6},${centerY - currentInnerRadius * 0.85}`,
    fill: "#111",
    stroke: "red",
    "stroke-width": "2",
    style: "filter: drop-shadow(0px 0px 5px red);"
  });

  indicatorGroup.appendChild(line);
  indicatorGroup.appendChild(tip);
  indicatorGroup.appendChild(baseDiamond);
  
  return indicatorGroup;
};

svg.appendChild(createFancierIndicator());

animate();

window.addEventListener(
  "wheel",
  (e) => {
    // Only prevent default and rotate widget if characters page is active
    const activeBtn = document.querySelector(".nav-btn.active");
    const activePage = activeBtn ? activeBtn.getAttribute("data-page") : "";

    if (activePage === "characters") {
      e.preventDefault();
      const delta = e.deltaY * 0.05;
      targetIndicatorRotation += delta;
      targetSpinnerRotation -= delta;
    }
  },
  { passive: false }
);

const handleResize = () => {
  if (svg) svg.remove();
  createWidgetSpinner();

  if (svg) {
    svg.appendChild(createFancierIndicator());
  }
};

window.addEventListener("resize", handleResize);

// Navigation system
const setupNavigation = () => {
  const navBtns = document.querySelectorAll(".nav-btn");
  const pages = document.querySelectorAll(".page-section");

  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetPage = btn.getAttribute("data-page");

      navBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      pages.forEach((page) => {
        if (page.id === `page-${targetPage}`) {
          page.classList.remove("hidden");
        } else {
          page.classList.add("hidden");
        }
      });

      if (targetPage === "characters") {
        handleResize();
      }

      // Refresh ScrollTrigger calculations when tabs toggle
      ScrollTrigger.refresh();
    });
  });
};

// Scroll Animations for Story Page
const initScrollAnimations = () => {
  // Animate text reveal (clip-path reveal on scroll)
  document.querySelectorAll('#page-story .animate-text').forEach(textElement => {
    textElement.setAttribute('data-text', textElement.textContent.trim());

    ScrollTrigger.create({
      trigger: textElement,
      scroller: "#page-story",
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: 1,
      onUpdate: self => {
        const clipValue = Math.max(0, 100 - self.progress * 100);
        textElement.style.setProperty('--clip-value', `${clipValue}%`);
      },
    });
  });

  // Realms slide-in from sides (Tartarus, Asphodel, Elysium, Styx)
  ScrollTrigger.create({
    trigger: '.realms-section',
    scroller: '#page-story',
    start: 'top bottom',
    end: 'top top',
    scrub: 1,
    onUpdate: self => {
      const panels = document.querySelectorAll('.realm-panel');
      panels.forEach((panel, idx) => {
        const direction = idx % 2 === 0 ? 1 : -1;
        gsap.set(panel, { x: `${direction * (100 - self.progress * 100)}%` });
      });
    },
  });

  // Realms pin and scale down on scroll
  ScrollTrigger.create({
    trigger: '.realms-section',
    scroller: '#page-story',
    start: 'top top',
    end: () => `+=${window.innerHeight * 2.0}`,
    pin: true,
    scrub: 1,
    pinSpacing: true,
    onUpdate: self => {
      const panels = document.querySelectorAll('.realm-panel');
      if (panels.length >= 4) {
        if (self.progress <= 0.5) {
          const yProgress = self.progress / 0.5;
          gsap.set(panels[0], { y: `${yProgress * 150}%` });
          gsap.set(panels[1], { y: `${yProgress * 50}%` });
          gsap.set(panels[2], { y: `${yProgress * -50}%` });
          gsap.set(panels[3], { y: `${yProgress * -150}%` });
          panels.forEach(panel => gsap.set(panel, { scale: 1 }));
        } else {
          gsap.set(panels[0], { y: '150%' });
          gsap.set(panels[1], { y: '50%' });
          gsap.set(panels[2], { y: '-50%' });
          gsap.set(panels[3], { y: '-150%' });

          const scaleProgress = (self.progress - 0.5) / 0.5;
          const minScale = window.innerWidth <= 1000 ? 0.4 : 0.22;
          const scale = 1 - scaleProgress * (1 - minScale);

          panels.forEach(panel => gsap.set(panel, { scale }));
        }
      }
    },
  });

  // Animate story images (fade in and parallax slide)
  document.querySelectorAll('#page-story .story-img-wrapper').forEach(imgWrapper => {
    gsap.fromTo(imgWrapper, 
      { 
        opacity: 0, 
        y: 60,
      },
      {
        opacity: 1,
        y: 0,
        scrollTrigger: {
          trigger: imgWrapper,
          scroller: "#page-story",
          start: "top 90%",
          end: "bottom 30%",
          scrub: true,
        }
      }
    );
  });
};

setupNavigation();
initScrollAnimations();
