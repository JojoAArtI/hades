import gsap from "gsap";

const widgets = [
  { image: "https://images.ctfassets.net/5owu3y35gzlg/3m6R8B2VKMGaUMcScu/76b7cc05349b20feb08798d2742e8fe9/Hades_Wallpaper_01.jpg?w=1920&q=80", name: "Hades" },
  { image: "https://images.ctfassets.net/5owu3y35gzlg/8uJUGhLg0DuryCmwfpNxn/464c0a5a8c92e7ec832a5cbab006a204/OlympianMontage_Ares.png?w=1920&q=80", name: "Ares" },
  { image: "https://images.ctfassets.net/5owu3y35gzlg/3fLSb2zxHUTbkYZGFYTNPG/533d81c59e6b50e42d6061b794f358c6/OlympianMontage_Aphrodite.png?w=1920&q=80", name: "Aphrodite" },
  { image: "https://images.ctfassets.net/5owu3y35gzlg/7HIIJhnHi3687DxlBSJCBG/66ea7dbdella6fca00b67fb4f34ee6c9/OlympianMontage_Poseidon.png?w=1920&q=80", name: "Poseidon" },
  { image: "https://images.ctfassets.net/5owu3y35gzlg/2CMty6efAYQv7ZeZLFjwrm/44664a67eb0275d5ac7db82502dcc992/Hades_Post_Chaos01.jpg?w=1920&q=80", name: "Chaos" },
  { image: "https://images.ctfassets.net/5owu3y35gzlg/5anCg0MZftCrB2UFJFWdH3/c47fb130b5195c35dac221aa4027f04f/Hades_Post_Dionysus01.jpg?w=1920&q=80", name: "Dionysus" },
  { image: "https://images.ctfassets.net/5owu3y35gzlg/3sh018m9CmTFNXgIM6aAR1/11aae8931cc2a433c707d92d41fd6026/Hades_Post_Alecto.png?w=1920&q=80", name: "Alecto" },
  { image: "https://images.ctfassets.net/5owu3y35gzlg/1Y5EEF9f6zuXp3M4gdgPLE/4b97d0940ab5025ff0905ea7af0c4d51/Hades_Post_Thanatos.png?w=1920&q=80", name: "Thanatos" },
  { image: "https://images.ctfassets.net/5owu3y35gzlg/40vUf2b1xp2NFYvnE5lDSk/07f3295d761ad2671de98f531a0c75cc/Hades_Post_Tisiphone.png?w=1920&q=80", name: "Tisiphone" },
  { image: "https://images.ctfassets.net/5owu3y35gzlg/6P0styYvRwT6b978Vg0E0k/b5e4f307763c9c021dd7dc5326c6450f/Wallpaper_3.png?w=1920&q=80", name: "Wallpaper 3" },
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
  const viewportSize = Math.min(window.innerWidth, window.innerHeight);
  outerRadius = viewportSize * 0.4;
  const innerRadius = viewportSize * 0.25;
  centerX = window.innerWidth / 2;
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
    const path = `M ${centerX + outerRadius * Math.cos(startAngle)} ${
      centerY + outerRadius * Math.sin(startAngle)
    } A ${outerRadius} ${outerRadius} 0 0 1 ${
      centerX + outerRadius * Math.cos(endAngle)
    } ${centerY + outerRadius * Math.sin(endAngle)} L ${
      centerX + innerRadius * Math.cos(endAngle)
    } ${
      centerY + innerRadius * Math.sin(endAngle)
    } A ${innerRadius} ${innerRadius} 0 0 0 ${
      centerX + innerRadius * Math.cos(startAngle)
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

const innerRadius = outerRadius * 0.625;
const widgetIndicator = createSVG("line", {
  id: "widget-indicator",
  x1: centerX,
  y1: centerY - innerRadius * 0.85,
  x2: centerX,
  y2: centerY - outerRadius * 1.05,
});
svg.appendChild(widgetIndicator);

animate();

window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const delta = e.deltaY * 0.05;
    targetIndicatorRotation += delta;
    targetSpinnerRotation -= delta;
  },
  { passive: false }
);

window.addEventListener("resize", () => {
  if (svg) svg.remove();
  createWidgetSpinner();

  const innerRadius = outerRadius * 0.625;
  const widgetIndicator = createSVG("line", {
    id: "widget-indicator",
    x1: centerX,
    y1: centerY - innerRadius * 0.85,
    x2: centerX,
    y2: centerY - outerRadius * 1.05,
  });
  svg.appendChild(widgetIndicator);
});
