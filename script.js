const HER_NAME = "Regine";

const CONFIG = {

  name: HER_NAME,

  birthday: "2008-09-25",

  celebratingAge: 18,

  openerKicker: "For you, today",
  openerMessage: "Making memories with you is the best gift.",

  openerLines: [
    "Eighteen years of you. Ridiculous, in the best way.",
    "Officially an adult. Nobody tell the authorities.",
    "Nineteen is going to have to work hard to beat this.",
    "Same time next year, but louder.",
  ],

  numbersLead:
    "Nobody is counting. Except this page. This page is definitely counting.",

  photos: [{ src: "ourpic.jpg", caption: "Us — my favourite place to be" }],

  letter: [
    `Happy 18th birthday, ${HER_NAME}.`,
    "Eighteen. A whole adult, legally speaking, which honestly reads like a clerical error.",
    "Here is what I actually want you to know: you are the best part of my ordinary days. Not the loud, memorable ones — the boring Tuesday ones, where nothing happens and everything is fine because you are in them.",
    "I made you a page instead of buying a card, mostly because a card cannot throw confetti at you. Keep scrolling. There is cake.",
    "New country, new decade, new you. I cannot wait to watch all of it.",
  ].join("\n\n"),

  signoff: `— happy 18th, ${HER_NAME} 💖`,

  wish: "Wish made. Now go be 18. 🎉",

  typedSpeed: 16,
};

const MS_PER_DAY = 86400000;
const HEARTBEATS_PER_MINUTE = 72;
const MAX_CONFETTI_NODES = 260;

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function prefersReducedMotion() {
  return motionQuery.matches;
}

function required(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`[birthday] Required element #${id} is missing from index.html`);
  }
  return element;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function formatNumber(value) {
  return Math.round(value).toLocaleString();
}

function ordinal(value) {
  const withinHundred = value % 100;
  if (withinHundred >= 11 && withinHundred <= 13) return `${value}th`;

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

const els = {};

function collectElements() {
  els.main = required("main");
  els.gate = required("gate");
  els.openBtn = required("openBtn");
  els.confettiLayer = required("confettiLayer");
  els.progressBar = required("progressBar");

  els.heroPhoto = required("heroPhoto");
  els.photoFrame = required("photoFrame");
  els.openerKicker = required("openerKicker");
  els.openerMessage = required("openerMessage");
  els.enterBtn = required("enterBtn");
  els.numbersLead = required("numbersLead");
  els.stats = required("stats");
  els.galleryGrid = required("galleryGrid");

  els.letterText = required("letterText");
  els.letterFull = required("letterFull");
  els.letterSignoff = required("letterSignoff");
  els.letterReplay = required("letterReplay");

  els.cakeCandles = required("cakeCandles");
  els.blowBtn = required("blowBtn");
  els.wishMessage = required("wishMessage");

  els.lightbox = document.getElementById("lightbox");
  els.lightboxImg = document.getElementById("lightboxImg");
  els.lightboxCaption = document.getElementById("lightboxCaption");
  els.lightboxClose = document.getElementById("lightboxClose");
  els.lightboxPrev = document.getElementById("lightboxPrev");
  els.lightboxNext = document.getElementById("lightboxNext");
  els.petalsLayer = document.getElementById("petalsLayer");
  els.gateKicker = document.getElementById("gateKicker");
  els.gateCountdown = document.getElementById("gateCountdown");
}

function parseBirthday(value) {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    console.error(
      `[birthday] CONFIG.birthday is not a valid date: "${value}". Counters will be skipped.`
    );
    return null;
  }
  return parsed;
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function ageOn(birth, now) {
  let age = now.getFullYear() - birth.getFullYear();
  const hadBirthday =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;
  return Math.max(age, 0);
}

function isBirthdayToday(birth, now) {
  return now.getMonth() === birth.getMonth() && now.getDate() === birth.getDate();
}

function daysUntilNextBirthday(birth, now) {
  const today = startOfDay(now);
  const next = startOfDay(
    new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
  );
  if (next.getTime() < today.getTime()) next.setFullYear(next.getFullYear() + 1);
  return Math.round((next.getTime() - today.getTime()) / MS_PER_DAY);
}

function buildStats(birth, now) {
  const daysAlive = Math.max(
    0,
    Math.floor((now.getTime() - birth.getTime()) / MS_PER_DAY)
  );

  const stats = [
    { value: ageOn(birth, now), label: "years young" },
    { value: daysAlive, label: "days of you" },
    { value: daysAlive * 24, label: "hours of you" },
    {
      value: daysAlive * 24 * 60 * HEARTBEATS_PER_MINUTE,
      label: "heartbeats, roughly",
    },
  ];

  if (isBirthdayToday(birth, now)) {
    stats.push({ text: "Today 🎂", label: "and it is your day", highlight: true });
  } else {
    stats.push({
      value: daysUntilNextBirthday(birth, now),
      label: "days until the next one",
    });
  }

  return stats;
}

function animateNumber(output, target) {
  if (prefersReducedMotion()) {
    output.textContent = formatNumber(target);
    return;
  }

  const duration = 1200;
  const startedAt = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    output.textContent = formatNumber(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function countUpWhenVisible(card, output, target) {
  if (!("IntersectionObserver" in window)) {
    output.textContent = formatNumber(target);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        animateNumber(output, target);
      });
    },
    { threshold: 0.4 }
  );

  observer.observe(card);
}

function renderStats(stats) {
  els.stats.textContent = "";

  stats.forEach((stat, index) => {
    const card = document.createElement("div");
    card.className = stat.highlight ? "stat stat--today reveal" : "stat reveal";
    card.style.setProperty("--i", String(Math.min(index, 5)));

    const value = document.createElement("span");
    value.className = "stat__value";
    value.textContent = typeof stat.text === "string" ? stat.text : "0";

    const label = document.createElement("span");
    label.className = "stat__label";
    label.textContent = stat.label;

    card.append(value, label);
    els.stats.appendChild(card);

    if (typeof stat.value === "number") {
      countUpWhenVisible(card, value, stat.value);
    }
  });
}

let lightboxIndex = 0;

function galleryPhotos() {
  return Array.isArray(CONFIG.photos) ? CONFIG.photos : [];
}

function renderGallery() {
  const photos = galleryPhotos();
  els.galleryGrid.textContent = "";

  if (!photos.length) {
    console.warn("[birthday] CONFIG.photos is empty — the gallery is hidden.");
    const section = els.galleryGrid.closest(".section");
    if (section) section.hidden = true;
    return;
  }

  els.galleryGrid.classList.toggle("gallery__grid--single", photos.length === 1);

  photos.forEach((photo, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "gallery__item reveal";
    item.style.setProperty("--i", String(Math.min(index, 5)));
    item.setAttribute("aria-label", `Open photo ${index + 1} of ${photos.length}`);

    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = photo.caption || `Photo ${index + 1}`;
    image.loading = index === 0 ? "eager" : "lazy";
    image.addEventListener("error", () => {
      item.classList.add("is-missing");
      console.error(
        `[birthday] Could not load "${photo.src}" — falling back to a placeholder card.`
      );
    });

    const caption = document.createElement("span");
    caption.className = "gallery__caption";
    caption.textContent = photo.caption || "";

    item.append(image, caption);
    item.addEventListener("click", () => openLightbox(index));
    els.galleryGrid.appendChild(item);
  });
}

function syncLightbox() {
  const photos = galleryPhotos();
  const photo = photos[lightboxIndex];
  if (!photo) return;

  els.lightboxImg.src = photo.src;
  els.lightboxImg.alt = photo.caption || `Photo ${lightboxIndex + 1}`;
  els.lightboxCaption.textContent = photo.caption || "";

  const multiple = photos.length > 1;
  els.lightboxPrev.hidden = !multiple;
  els.lightboxNext.hidden = !multiple;
}

function openLightbox(index) {
  if (!els.lightbox || typeof els.lightbox.showModal !== "function") {
    console.warn("[birthday] <dialog> is unavailable — the photo viewer is skipped.");
    return;
  }
  if (els.lightbox.open) return;

  lightboxIndex = index;
  syncLightbox();
  els.lightbox.showModal();
}

function stepLightbox(direction) {
  const photos = galleryPhotos();
  if (photos.length < 2) return;
  lightboxIndex = (lightboxIndex + direction + photos.length) % photos.length;
  syncLightbox();
}

function setupLightbox() {
  const hasControls =
    els.lightbox && els.lightboxClose && els.lightboxPrev && els.lightboxNext;
  if (!hasControls) return;

  els.lightboxClose.addEventListener("click", () => els.lightbox.close());
  els.lightboxPrev.addEventListener("click", () => stepLightbox(-1));
  els.lightboxNext.addEventListener("click", () => stepLightbox(1));

  els.lightbox.addEventListener("click", (event) => {
    if (event.target === els.lightbox) els.lightbox.close();
  });

  els.lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") stepLightbox(-1);
    if (event.key === "ArrowRight") stepLightbox(1);
  });
}

let typeTimer = 0;

function stopTyping() {
  if (typeTimer) {
    clearTimeout(typeTimer);
    typeTimer = 0;
  }
}

function typeLetter() {
  stopTyping();

  els.letterFull.textContent = CONFIG.letter;
  els.letterSignoff.classList.remove("is-visible");
  els.letterText.classList.remove("is-typing");

  if (prefersReducedMotion()) {
    els.letterText.textContent = CONFIG.letter;
    els.letterSignoff.classList.add("is-visible");
    return;
  }

  const characters = [...CONFIG.letter];
  els.letterText.textContent = "";
  els.letterText.classList.add("is-typing");

  let index = 0;
  const step = () => {
    index += 1;
    els.letterText.textContent = characters.slice(0, index).join("");

    if (index >= characters.length) {
      typeTimer = 0;
      els.letterText.classList.remove("is-typing");
      els.letterSignoff.classList.add("is-visible");
      return;
    }

    typeTimer = window.setTimeout(step, CONFIG.typedSpeed);
  };

  step();
}

const CONFETTI_COLORS = [
  "#ff9ec7",
  "#ffc2dd",
  "#ffd9ea",
  "#ffffff",
  "#f45b9d",
  "#ffb0d0",
  "#fff5f9",
];

const CONFETTI_SHAPES = [
  "confetti--circle",
  "confetti--square",
  "confetti--ribbon",
];

function removeWhenDone(node) {
  node.addEventListener("animationend", () => node.remove(), { once: true });
}

function spawnConfetti(count = 90) {
  if (prefersReducedMotion()) return;

  if (els.confettiLayer.childElementCount > MAX_CONFETTI_NODES) {
    console.warn("[birthday] Confetti layer is saturated — skipping this burst.");
    return;
  }

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("span");
    piece.className = `confetti ${pick(CONFETTI_SHAPES)}`;
    piece.style.setProperty("--x", `${randomBetween(-3, 100).toFixed(2)}%`);
    piece.style.setProperty("--size", `${randomBetween(6, 15).toFixed(1)}px`);
    piece.style.setProperty("--color", pick(CONFETTI_COLORS));
    piece.style.setProperty("--delay", `${randomBetween(0, 0.6).toFixed(2)}s`);
    piece.style.setProperty("--dur", `${randomBetween(2.2, 4.4).toFixed(2)}s`);
    piece.style.setProperty("--drift", `${randomBetween(-14, 14).toFixed(1)}vw`);
    piece.style.setProperty("--spin", `${Math.round(randomBetween(360, 1080))}deg`);
    removeWhenDone(piece);
    fragment.appendChild(piece);
  }

  els.confettiLayer.appendChild(fragment);
}

function spawnSparkles(x, y) {
  if (prefersReducedMotion()) return;

  const total = 8;

  for (let i = 0; i < total; i += 1) {
    const sparkle = document.createElement("span");
    const angle = (Math.PI * 2 * i) / total + Math.random() * 0.5;
    const distance = randomBetween(22, 58);

    sparkle.className = "sparkle";
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    sparkle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    removeWhenDone(sparkle);
    document.body.appendChild(sparkle);
  }
}

function sparkleFromElement(element) {
  const rect = element.getBoundingClientRect();
  spawnSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

const PETAL_COLORS = [
  { color: "#ffc2dd", deep: "#f45b9d" },
  { color: "#ffd9ea", deep: "#ff7fb5" },
  { color: "#fff5f9", deep: "#ffb0d0" },
  { color: "#ffffff", deep: "#ffc2dd" },
  { color: "#ff9ec7", deep: "#e8468a" },
];
const MAX_PETAL_NODES = 32;

let petalTimer = 0;

function spawnPetal(options = {}) {
  const palette = pick(PETAL_COLORS);
  const petal = document.createElement("span");
  petal.className = "petal";

  if (typeof options.x === "number") {
    petal.style.setProperty("--x", `${options.x.toFixed(2)}%`);
  } else {
    petal.style.setProperty("--x", `${randomBetween(-4, 100).toFixed(2)}%`);
  }

  petal.style.setProperty("--size", `${randomBetween(9, 20).toFixed(1)}px`);
  petal.style.setProperty(
    "--dur",
    `${(options.short ? randomBetween(5, 7) : randomBetween(9, 17)).toFixed(2)}s`
  );
  petal.style.setProperty(
    "--delay",
    `${(Math.random() < 0.3 ? randomBetween(0, 7) : 0).toFixed(2)}s`
  );
  petal.style.setProperty("--sway", `${randomBetween(-14, 14).toFixed(1)}vw`);
  petal.style.setProperty(
    "--peak",
    (options.short ? randomBetween(0.85, 1) : randomBetween(0.55, 0.95)).toFixed(
      2
    )
  );
  petal.style.setProperty("--petal-color", palette.color);
  petal.style.setProperty("--petal-deep", palette.deep);
  removeWhenDone(petal);
  els.petalsLayer.appendChild(petal);
}

const petalDodges = new WeakMap();
let petalPointerFrame = 0;
let petalPointerPos = null;

function dodgePetal(petal, clientX, clientY) {
  const rect = petal.getBoundingClientRect();
  const dx = rect.left + rect.width / 2 - clientX;
  const dy = rect.top + rect.height / 2 - clientY;
  const distance = Math.hypot(dx, dy);

  if (distance > 90 || distance === 0) return;

  petal.classList.add("is-dodging");
  petal.style.setProperty(
    "--dodge-x",
    `${((dx / distance) * 52).toFixed(1)}px`
  );
  petal.style.setProperty(
    "--dodge-y",
    `${((dy / distance) * 40 - 12).toFixed(1)}px`
  );

  if (petalDodges.has(petal)) clearTimeout(petalDodges.get(petal));
  petalDodges.set(
    petal,
    window.setTimeout(() => {
      petal.classList.remove("is-dodging");
      petal.style.removeProperty("--dodge-x");
      petal.style.removeProperty("--dodge-y");
      petalDodges.delete(petal);
    }, 420)
  );
}

function petalBurstAt(clientX, clientY) {
  if (prefersReducedMotion()) return;
  if (!els.petalsLayer) return;
  if (els.gate && !els.gate.hidden) return;
  if (els.lightbox && els.lightbox.open) return;

  for (let i = 0; i < 5; i += 1) {
    const angle = (Math.PI * 2 * i) / 5 + Math.random() * 0.8;
    const distanceVW = randomBetween(2.5, 7) * Math.cos(angle);
    const petal = spawnPetal({
      x: (clientX / window.innerWidth) * 100 + distanceVW,
      short: true,
    });
    petal.style.top = `${clientY}px`;
  }
}

function setupReactivePetals() {
  if (prefersReducedMotion() || !els.petalsLayer) return;

  document.addEventListener(
    "pointermove",
    (event) => {
      petalPointerPos = { x: event.clientX, y: event.clientY };
      if (petalPointerFrame) return;
      petalPointerFrame = requestAnimationFrame(() => {
        petalPointerFrame = 0;
        if (!petalPointerPos) return;
        if (els.gate && !els.gate.hidden) return;
        if (els.lightbox && els.lightbox.open) return;

        els.petalsLayer
          .querySelectorAll(".petal:not(.is-dodging)")
          .forEach((petal) =>
            dodgePetal(petal, petalPointerPos.x, petalPointerPos.y)
          );
      });
    },
    { passive: true }
  );

  window.addEventListener(
    "pointerdown",
    (event) => {
      if (event.target.closest("button, a, input, dialog")) return;
      petalBurstAt(event.clientX, event.clientY);
    },
    { passive: true }
  );
}

function startPetalRain() {
  if (prefersReducedMotion()) return;

  if (!els.petalsLayer) {
    console.warn(
      "[birthday] #petalsLayer is missing from index.html — petal rain is skipped."
    );
    return;
  }

  for (let i = 0; i < 6; i += 1) spawnPetal();

  const loop = () => {
    if (els.petalsLayer.childElementCount < MAX_PETAL_NODES) {
      spawnPetal();
    }
    petalTimer = window.setTimeout(loop, randomBetween(500, 1100));
  };

  loop();
}

let candlesBlown = false;
let blowBusy = false;
let blowTimers = [];

function renderCandles(age) {
  const total = Math.min(Math.max(age, 1), 24);
  els.cakeCandles.textContent = "";

  for (let i = 0; i < total; i += 1) {
    const candle = document.createElement("span");
    candle.className = "candle";

    const wick = document.createElement("span");
    wick.className = "candle__wick";

    const flame = document.createElement("span");
    flame.className = "candle__flame";
    flame.style.animationDuration = `${randomBetween(0.85, 1.35).toFixed(2)}s`;
    flame.style.animationDelay = `-${randomBetween(0, 1.35).toFixed(2)}s`;

    candle.append(wick, flame);
    els.cakeCandles.appendChild(candle);
  }
}

function clearBlowTimers() {
  blowTimers.forEach((timer) => clearTimeout(timer));
  blowTimers = [];
}

function setWish(text) {
  els.wishMessage.textContent = text;
}

function blowOutCandles() {
  clearBlowTimers();
  candlesBlown = true;
  blowBusy = true;

  const candles = Array.from(els.cakeCandles.children);
  const stagger = prefersReducedMotion() ? 0 : 60;

  candles.forEach((candle, index) => {
    blowTimers.push(
      window.setTimeout(() => candle.classList.add("is-out"), index * stagger)
    );
  });

  blowTimers.push(
    window.setTimeout(() => {
      blowBusy = false;
      spawnConfetti(130);
      setWish(CONFIG.wish);
      els.blowBtn.textContent = "Light them again 🔥";
    }, candles.length * stagger + 260)
  );
}

function lightCandles() {
  clearBlowTimers();
  candlesBlown = false;
  blowBusy = false;

  Array.from(els.cakeCandles.children).forEach((candle) =>
    candle.classList.remove("is-out")
  );

  setWish("");
  els.blowBtn.textContent = "Blow out the candles 🎂";
}

function toggleCandles() {
  if (blowBusy) return;
  if (candlesBlown) {
    lightCandles();
    return;
  }
  blowOutCandles();
}

function setMainInert(isInert) {
  const main = els.main;
  if ("inert" in main) main.inert = isInert;

  if (isInert) {
    main.setAttribute("aria-hidden", "true");
  } else {
    main.removeAttribute("aria-hidden");
  }
}

let celebrateTimer = 0;

function cycleOpenerMessage() {
  const lines =
    Array.isArray(CONFIG.openerLines) && CONFIG.openerLines.length
      ? CONFIG.openerLines
      : [CONFIG.openerMessage];

  clearTimeout(celebrateTimer);
  els.openerMessage.classList.add("is-celebrating");
  els.openerMessage.textContent = pick(lines);

  celebrateTimer = window.setTimeout(() => {
    els.openerMessage.classList.remove("is-celebrating");
    els.openerMessage.textContent = CONFIG.openerMessage;
  }, 3800);
}

function celebrate() {
  spawnConfetti(window.innerWidth < 600 ? 70 : 120);
  cycleOpenerMessage();
}

function openGate() {
  if (els.gate.classList.contains("is-closing")) return;

  sparkleFromElement(els.openBtn);
  els.gate.classList.add("is-closing");
  setMainInert(false);
  window.scrollTo({ top: 0, behavior: "auto" });

  window.setTimeout(
    () => {
      els.gate.hidden = true;
      const opener = document.getElementById("opener");
      if (opener) opener.hidden = false;
      els.enterBtn.hidden = false;
      els.enterBtn.focus({ preventScroll: true });
    },
    prefersReducedMotion() ? 0 : 900
  );

  celebrate();

  if (birthdayToday) {
    window.setTimeout(
      () => spawnConfetti(160),
      prefersReducedMotion() ? 0 : 600
    );
  }
}

function hideSection(element, label) {
  const section = element.closest(".section");
  if (!section) {
    console.warn(`[birthday] Could not find the ${label} section to hide.`);
    return;
  }
  section.hidden = true;
}

function revealAndScroll(section) {
  if (!section) {
    console.warn("[birthday] Continue button target section not found.");
    return;
  }

  section.hidden = false;

  const offset = prefersReducedMotion() ? 0 : 260;
  window.setTimeout(() => {
    section.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
    const focusTarget = section.querySelector(
      "[data-focus], button[data-next]:not([hidden]), button:not([hidden])"
    );
    if (focusTarget && !prefersReducedMotion()) {
      focusTarget.focus({ preventScroll: true });
    }
  }, offset);
}

function hideAllSections() {
  document
    .querySelectorAll(".main .section")
    .forEach((section) => (section.hidden = true));
}

let birthdayToday = false;

function applyDayContext(birth, now) {
  if (!birth) return;

  birthdayToday = isBirthdayToday(birth, now);

  if (birthdayToday) {
    if (els.gateKicker) els.gateKicker.textContent = "Today's the day 🎉";
    if (els.gateCountdown) els.gateCountdown.textContent = "";
    return;
  }

  const days = daysUntilNextBirthday(birth, now);
  if (days > 0 && els.gateCountdown) {
    els.gateCountdown.textContent = `${days} day${
      days === 1 ? "" : "s"
    } to go… 🌸`;
  }
}

function celebrationAge(currentAge) {
  if (Number.isInteger(CONFIG.celebratingAge) && CONFIG.celebratingAge > 0) {
    return CONFIG.celebratingAge;
  }

  if (typeof currentAge === "number" && currentAge > 0) {
    console.warn(
      "[birthday] CONFIG.celebratingAge is missing or not a positive whole number — using the age derived from CONFIG.birthday."
    );
    return currentAge;
  }

  console.warn(
    "[birthday] Neither CONFIG.celebratingAge nor CONFIG.birthday produced a usable age — falling back to 18."
  );
  return 18;
}

function applyContent(celebratingAge) {
  if (typeof celebratingAge === "number" && celebratingAge > 0) {
    document.querySelectorAll("[data-age]").forEach((node) => {
      node.textContent = String(celebratingAge);
    });
    document.querySelectorAll("[data-age-ordinal]").forEach((node) => {
      node.textContent = ordinal(celebratingAge);
    });
    document.title = CONFIG.name
      ? `Happy ${ordinal(celebratingAge)} Birthday, ${CONFIG.name} 🎂`
      : `Happy ${ordinal(celebratingAge)} Birthday 🎂`;
  }

  if (CONFIG.name) {
    document.querySelectorAll("[data-name]").forEach((node) => {
      node.textContent = CONFIG.name;
    });
  }

  els.openerKicker.textContent = CONFIG.openerKicker;
  els.openerMessage.textContent = CONFIG.openerMessage;
  els.numbersLead.textContent = CONFIG.numbersLead;
  els.letterFull.textContent = CONFIG.letter;
  els.letterSignoff.textContent = CONFIG.signoff;
}

function setupRevealObserver() {
  const targets = Array.from(document.querySelectorAll(".reveal"));

  if (!("IntersectionObserver" in window)) {
    console.warn(
      "[birthday] IntersectionObserver is unavailable — showing everything at once."
    );
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);

        if (entry.target.contains(els.letterText)) typeLetter();
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );

  targets.forEach((target) => observer.observe(target));
}

function setupProgressBar() {
  let queued = false;

  const update = () => {
    queued = false;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    els.progressBar.style.width = `${(ratio * 100).toFixed(2)}%`;
  };

  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue, { passive: true });
  update();
}

function init() {
  collectElements();

  const birth = parseBirthday(CONFIG.birthday);
  const now = new Date();
  const age = birth ? ageOn(birth, now) : null;
  const celebrating = celebrationAge(age);

  applyContent(celebrating);
  applyDayContext(birth, now);
  renderGallery();
  renderCandles(celebrating);
  hideAllSections();

  if (birth) {
    renderStats(buildStats(birth, now));
  } else {
    hideSection(els.stats, "numbers");
  }

  els.openBtn.addEventListener("click", openGate);
  els.enterBtn.addEventListener("click", () => {
    sparkleFromElement(els.enterBtn);
    celebrate();
    revealAndScroll(document.querySelector("#numbers"));
  });

  document.querySelectorAll("[data-next]").forEach((button) => {
    button.addEventListener("click", () => {
      sparkleFromElement(button);
      const target = document.querySelector(button.dataset.next);
      if (target) revealAndScroll(target);
    });
  });
  els.blowBtn.addEventListener("click", toggleCandles);
  els.letterReplay.addEventListener("click", typeLetter);

  els.heroPhoto.addEventListener("error", () => {
    els.photoFrame.classList.add("is-missing");
    console.error(
      '[birthday] Could not load "ourpic.jpg" — showing a placeholder instead.'
    );
  });

  setupLightbox();
  setupProgressBar();
  setupRevealObserver();
  startPetalRain();
  setupReactivePetals();

  setMainInert(true);
  els.openBtn.focus({ preventScroll: true });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    if (!els.gate || els.gate.hidden) return;
    if (document.activeElement === els.openBtn) return;
    event.preventDefault();
    openGate();
  });

  try {
    history.scrollRestoration = "manual";
  } catch (error) {
    console.warn("[birthday] Could not take over scroll restoration.", error);
  }
}

function failOpen() {
  const gate = document.getElementById("gate");
  if (gate) gate.hidden = true;

  const main = document.getElementById("main");
  if (main) {
    main.removeAttribute("aria-hidden");
    if ("inert" in main) main.inert = false;
  }

  const openerMessage = document.getElementById("openerMessage");
  if (openerMessage && !openerMessage.textContent) {
    openerMessage.textContent = CONFIG.openerMessage;
  }

  if (CONFIG.name) {
    document.querySelectorAll("[data-name]").forEach((node) => {
      node.textContent = CONFIG.name;
    });
  }

  const numbersLead = document.getElementById("numbersLead");
  if (numbersLead && !numbersLead.textContent) {
    numbersLead.textContent = CONFIG.numbersLead;
  }

  const letterText = document.getElementById("letterText");
  if (letterText && !letterText.textContent) letterText.textContent = CONFIG.letter;

  const stats = document.getElementById("stats");
  if (stats && !stats.childElementCount) {
    const section = stats.closest(".section");
    if (section) section.hidden = true;
  }

  document
    .querySelectorAll(".main .section")
    .forEach((section) => (section.hidden = false));

  const opener = document.getElementById("opener");
  if (opener) opener.hidden = false;

  document
    .querySelectorAll(".reveal")
    .forEach((element) => element.classList.add("is-visible"));
}

function start() {
  try {
    init();
  } catch (error) {
    console.error(
      "[birthday] Setup failed, showing the page without the intro:",
      error
    );
    failOpen();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
