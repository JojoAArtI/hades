import gsap from "gsap";

const widgets = [
  { image: "/Blood_Post_01.png", name: "BloodPost" },
  { image: "/herc.png", name: "Hercules" },
  { image: "/hermes.png", name: "hermes" },
  { image: "/night_Post_01.jpg", name: "nyx" },
  { image: "/Hades_Post_Thanatos.png", name: "Thanatos" },

  { image: "/Hades_Post_Chaos01.jpg", name: "Chaos" },

  { image: "/Hades_Post_Alecto.png", name: "Alecto" },

  { image: "/Hades_Post_Dionysus01.jpg", name: "Dionysus" },
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
  if (!container) return;

  const sidebar = document.querySelector(".sidebar");
  let sidebarWidth = 0;
  if (window.innerWidth >= 768 && sidebar) {
    sidebarWidth = sidebar.getBoundingClientRect().width;
  }

  const availableWidth = window.innerWidth - sidebarWidth;
  const viewportSize = Math.min(availableWidth, window.innerHeight);
  outerRadius = viewportSize * 0.4;
  const innerRadius = viewportSize * 0.25;
  centerX = availableWidth / 2;
  centerY = window.innerHeight / 2;

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

    const titleEl = document.querySelector(".widget-title");
    if (titleEl) {
      titleEl.textContent = widgets[segmentIndex].name;
    }

    const previewContainer = document.querySelector(".widget-preview-img");
    if (previewContainer) {
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

  const indicatorEl = document.getElementById("widget-indicator");
  if (indicatorEl) {
    indicatorEl.setAttribute(
      "transform",
      `rotate(${currentIndicatorRotation % 360} ${centerX} ${centerY})`
    );
  }

  if (svg) {
    svg.querySelectorAll("[data-segment]").forEach((seg) => {
      seg.setAttribute(
        "transform",
        `rotate(${currentSpinnerRotation % 360} ${centerX} ${centerY})`
      );
    });
  }

  updateContent();

  requestAnimationFrame(animate);
};

const currentInnerRadius = outerRadius * 0.625;
const widgetIndicator = createSVG("line", {
  id: "widget-indicator",
  x1: centerX,
  y1: centerY - currentInnerRadius * 0.85,
  x2: centerX,
  y2: centerY - outerRadius * 1.05,
});
if (svg) {
  svg.appendChild(widgetIndicator);
}

animate();

window.addEventListener(
  "wheel",
  (e) => {
    const charPage = document.getElementById("page-characters");
    if (charPage && !charPage.classList.contains("hidden")) {
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

  const currentInnerRadius = outerRadius * 0.625;
  const widgetIndicator = createSVG("line", {
    id: "widget-indicator",
    x1: centerX,
    y1: centerY - currentInnerRadius * 0.85,
    x2: centerX,
    y2: centerY - outerRadius * 1.05,
  });
  if (svg) {
    svg.appendChild(widgetIndicator);
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
    });
  });
};

setupNavigation();
