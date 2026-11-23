// Powernux — interactions du site (JavaScript pur, sans dépendance).
document.documentElement.classList.remove("no-js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ------------------------------------------------------------ Navigation mobile */
const nav = $(".nav");
$(".nav-toggle")?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  $(".nav-toggle").setAttribute("aria-expanded", String(open));
});

/* ------------------------------------------------------------ Barre de progression */
const progress = $(".progress");
if (progress) {
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ------------------------------------------------------------ Apparition au défilement */
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);
$$(".reveal").forEach((el) => io.observe(el));

/* ------------------------------------------------------------ Cartes inclinables (3D) */
if (!reduceMotion && matchMedia("(hover: hover)").matches) {
  $$("[data-tilt]").forEach((card) => {
    const glare = document.createElement("span");
    glare.className = "glare";
    card.appendChild(glare);
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateY(-4px)`;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
    });
    card.addEventListener("pointerleave", () => (card.style.transform = ""));
  });

  // Boutons « magnétiques »
  $$("[data-magnetic]").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
    });
    btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
  });
}

/* ------------------------------------------------------------ Copier */
async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = Object.assign(document.createElement("textarea"), { value: text });
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  const label = button.querySelector("span");
  const old = label?.textContent;
  button.classList.add("done");
  if (label) label.textContent = "Copied!";
  setTimeout(() => {
    button.classList.remove("done");
    if (label) label.textContent = old;
  }, 1600);
}

/* ------------------------------------------------------------ Terminaux animés
   <div class="terminal" data-terminal>
     <script type="application/json">{"Ubuntu": [{"cmd": "…"}, {"out": "…"}], …}</script>
*/
$$("[data-terminal]").forEach((term) => {
  const data = JSON.parse(term.querySelector("script[type='application/json']").textContent);
  const body = term.querySelector(".term-body");
  const tabs = term.querySelector(".term-tabs");
  const copyBtn = term.querySelector(".term-copy");
  const names = Object.keys(data);
  let current = names[0];
  let token = 0;

  const commandsOf = (name) => data[name].filter((l) => l.cmd).map((l) => l.cmd).join("\n");

  function renderStatic(name) {
    body.innerHTML = "";
    for (const l of data[name]) body.appendChild(lineEl(l, l.cmd ?? l.out ?? l.comment ?? ""));
  }

  function lineEl(l, text) {
    const span = document.createElement("span");
    span.className = "line";
    if (l.cmd !== undefined) {
      span.innerHTML = `<span class="prompt">$ </span><span class="cmd"></span>`;
      span.querySelector(".cmd").textContent = text;
    } else {
      span.className = `line ${l.ok ? "ok" : l.comment !== undefined ? "comment" : "out"}`;
      span.textContent = text;
    }
    return span;
  }

  async function play(name) {
    const my = ++token;
    if (reduceMotion) return renderStatic(name);
    body.innerHTML = "";
    const cursor = Object.assign(document.createElement("span"), { className: "cursor" });
    for (const l of data[name]) {
      if (my !== token) return;
      const full = l.cmd ?? l.out ?? l.comment ?? "";
      const el = lineEl(l, "");
      body.appendChild(el);
      const target = el.querySelector(".cmd") ?? el;
      target.after?.(cursor);
      if (l.cmd !== undefined) {
        for (let i = 1; i <= full.length; i++) {
          if (my !== token) return;
          target.textContent = full.slice(0, i);
          await new Promise((r) => setTimeout(r, 18 + Math.random() * 30));
        }
        await new Promise((r) => setTimeout(r, 350));
      } else {
        target.textContent = full;
        await new Promise((r) => setTimeout(r, 160));
      }
    }
    body.appendChild(cursor);
  }

  names.forEach((name, i) => {
    if (!tabs) return;
    const b = document.createElement("button");
    b.type = "button";
    b.role = "tab";
    b.textContent = name;
    b.setAttribute("aria-selected", String(i === 0));
    b.addEventListener("click", () => {
      $$("button", tabs).forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      current = name;
      play(name);
    });
    tabs.appendChild(b);
  });

  copyBtn?.addEventListener("click", () => copyText(commandsOf(current), copyBtn));

  // Lecture quand le terminal devient visible.
  const seen = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      play(current);
      seen.disconnect();
    }
  }, { threshold: 0.3 });
  renderStatic(current);
  seen.observe(term);
});

/* ------------------------------------------------------------ Galerie de captures */
const shots = $("[data-shots]");
if (shots) {
  const img = $(".frame img", shots);
  const caption = $(".shot-caption", shots);
  $$(".shot-tabs button", shots).forEach((b) => {
    b.addEventListener("click", () => {
      $$(".shot-tabs button", shots).forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      img.classList.add("fading");
      setTimeout(() => {
        img.src = b.dataset.src;
        img.alt = b.dataset.alt;
        img.width = Number(b.dataset.w);
        img.height = Number(b.dataset.h);
        img.classList.toggle("small", b.dataset.small === "1");
        caption.textContent = b.dataset.caption;
        img.onload = () => img.classList.remove("fading");
      }, 220);
    });
  });
}

/* ------------------------------------------------------------ Sommaire actif (docs) */
const tocLinks = $$(".toc a[href^='#']");
if (tocLinks.length) {
  const sections = tocLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) tocLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
      });
    },
    { rootMargin: "-20% 0px -70% 0px" },
  );
  sections.forEach((s) => spy.observe(s));
}

/* ------------------------------------------------------------ Processeur de l'utilisateur (téléchargement) */
(async () => {
  const cards = $$("[data-arch]");
  if (!cards.length) return;
  let arch = "x86_64";
  try {
    const ua = await navigator.userAgentData?.getHighEntropyValues?.(["architecture"]);
    if (ua?.architecture === "arm") arch = "aarch64";
  } catch {
    /* non disponible */
  }
  if (/aarch64|arm64/i.test(navigator.userAgent)) arch = "aarch64";
  const fedora = /fedora|red hat|suse/i.test(navigator.userAgent);
  const pick = cards.find((c) => c.dataset.arch === arch && c.dataset.fmt === (fedora ? "rpm" : "deb"));
  pick?.classList.add("recommended");
  const label = $("[data-arch-label]");
  if (label) label.textContent = arch === "aarch64" ? "ARM64" : "x86-64 (Intel / AMD)";
})();

/* ------------------------------------------------------------ Année */
$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* ------------------------------------------------------------ Scène 3D (chargée après la page) */
const stage = $("[data-stage]");
if (stage && !reduceMotion) {
  const start = () => import("./hero3d.js").then((m) => m.mount(stage)).catch(() => {});
  if ("requestIdleCallback" in window) requestIdleCallback(start, { timeout: 1500 });
  else setTimeout(start, 400);
}
