// Globaalit muuttujat piirtotyökalun tilan hallintaan (väri, numero, ym.)
const svgNS = "http://www.w3.org/2000/svg";
let previewType = null;
let previewEl = null;
let startPoint = null;
// Oletusväri maroon punaisen sijaan
let currentColor = "#800000";
let currentNumber = null;
let filterCounter = 0;
let lineCounter = 0;
let selectedEl = null;

/* Valitsee annetun SVG-elementin (lisää "selected"-luokan korostukseksi) */
function selectElement(el) {
  if (selectedEl) deselectElement();
  selectedEl = el;
  selectedEl.classList.add("selected");
}

/* Poistaa nykyisen valinnan (poistaa "selected"-luokan) */
function deselectElement() {
  if (!selectedEl) return;
  selectedEl.classList.remove("selected");
  selectedEl = null;
}

/* Asettaa aktiivisen työkalun tyypin sekä valinnaisesti numeron ja värin */
function setTool(type, number, color) {
  if (previewEl) {
    previewEl.remove();
    previewEl = null;
    startPoint = null;
  }
  previewType = type;
  if (number != null) currentNumber = number;
  if (color) currentColor = color;
}

/* Nollaa valitun työkalun (poistaa esikatselun ja tyhjentää valinnat) */
function clearTool() {
  if (previewEl) {
    previewEl.remove();
    previewEl = null;
    startPoint = null;
  }
  previewType = null;
  currentNumber = null;
  document.getElementById("number-picker").value = "";
  document
    .querySelectorAll(".tool-btn, .color-btn")
    .forEach((b) => b.classList.remove("active"));
  deselectElement();
}

/* Tyhjentää kentän: poistaa kaikki piirretyt elementit (paitsi taustan) ja nollaa työkalun */
function clearField() {
  const svg = document.getElementById("svg-field");
  Array.from(svg.children).forEach((ch) => {
    if (!["defs", "rect"].includes(ch.tagName)) ch.remove();
  });
  clearTool();
}

/* Muuntaa hiiren klikkauksen sijainnin SVG:n sisäisiksi koordinaateiksi */
function toSVGCoords(svg, evt) {
  const p = svg.createSVGPoint();
  p.x = evt.clientX;
  p.y = evt.clientY;
  return p.matrixTransform(svg.getScreenCTM().inverse());
}

/* Luo uuden SVG-filtterin elementin sävyttämiseksi halutulla värillä */
function createTintFilter(color) {
  const svg = document.getElementById("svg-field");
  const defs = svg.querySelector("defs");
  const id = `tint-${filterCounter++}`;
  const filter = document.createElementNS(svgNS, "filter");
  filter.setAttribute("id", id);
  const flood = document.createElementNS(svgNS, "feFlood");
  flood.setAttribute("flood-color", color);
  flood.setAttribute("result", "flood");
  const comp = document.createElementNS(svgNS, "feComposite");
  comp.setAttribute("in", "flood");
  comp.setAttribute("in2", "SourceGraphic");
  comp.setAttribute("operator", "in");
  filter.appendChild(flood);
  filter.appendChild(comp);
  defs.appendChild(filter);
  return id;
}

/* Luo esikatseluelementin valitun työkalun mukaisesti hiiren osoittamaan kohtaan */
function createPreview(pt) {
  const svg = document.getElementById("svg-field");
  const lt = document.getElementById("line-type").value;
  switch (previewType) {
    case "player":
      previewEl = makeImage("svg/circle-svgrepo-com.svg", 40, 40);
      previewEl.setAttribute(
        "filter",
        `url(#${createTintFilter(currentColor)})`
      );
      break;
    case "ball":
      previewEl = makeImage("svg/ball-football-svgrepo-com.svg", 30, 30);
      break;
    case "cone":
      previewEl = makeImage("svg/cone-svgrepo-com.svg", 30, 30);
      previewEl.setAttribute(
        "filter",
        `url(#${createTintFilter(currentColor)})`
      );
      break;
    case "number":
      previewEl = document.createElementNS(svgNS, "image");

      const isTen = currentNumber === "10";
      const href = isTen
        ? "svg/number-10-alt-svgrepo-com.svg"
        : `svg/number-${currentNumber}-alt-svgrepo-com.svg`;

      previewEl.setAttributeNS("http://www.w3.org/1999/xlink", "href", href);
      previewEl.setAttribute("width", isTen ? 48 : 24);
      previewEl.setAttribute("height", isTen ? 48 : 24);
      previewEl.setAttribute("opacity", 0.5);
      previewEl.setAttribute("class", "draggable");
      previewEl.setAttribute("data-draggable", "true");

      previewEl.setAttribute(
        "filter",
        `url(#${createTintFilter(currentColor)})`
      );
      break;

    case "line":
      if (lt === "zigzag") {
        previewEl = document.createElementNS(svgNS, "path");
        previewEl.setAttribute("fill", "none");
      } else {
        previewEl = document.createElementNS(svgNS, "line");
        if (lt === "dashed") previewEl.setAttribute("stroke-dasharray", "5,5");
      }
      previewEl.setAttribute("stroke", currentColor);
      previewEl.setAttribute("stroke-width", "2");
      previewEl.setAttribute("marker-end", "url(#arrowhead)");
      break;
  }
  previewEl.setAttribute("opacity", "0.5");
  svg.appendChild(previewEl);
  updatePreview(pt);
}

/* Päivittää esikatseluelementin sijainnin/muodon hiiren liikkeen mukaan */
function updatePreview(pt) {
  const lt = document.getElementById("line-type").value;
  if (previewType === "line" && startPoint) {
    if (lt === "zigzag") {
      previewEl.setAttribute("d", sinePath(startPoint, pt));
    } else {
      previewEl.setAttribute("x1", startPoint.x);
      previewEl.setAttribute("y1", startPoint.y);
      previewEl.setAttribute("x2", pt.x);
      previewEl.setAttribute("y2", pt.y);
    }
  } else if (["player", "ball", "cone", "number"].includes(previewType)) {
    if (previewEl.tagName === "g") {
      previewEl.childNodes.forEach((img, i) => {
        img.setAttribute("x", pt.x + i * 24 - 12);
        img.setAttribute("y", pt.y - 12);
      });
    } else {
      const w = parseFloat(previewEl.getAttribute("width"));
      const h = parseFloat(previewEl.getAttribute("height"));
      previewEl.setAttribute("x", pt.x - w / 2);
      previewEl.setAttribute("y", pt.y - h / 2);
    }
  }
}

/* Luo aaltoviivan polun (zigzag-viiva) kahden pisteen välille */
function sinePath(p1, p2, wavesCount = 7) {
  const seg = 60,
    amp = 10;
  const dx = (p2.x - p1.x) / seg,
    dy = (p2.y - p1.y) / seg;
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const perp = { x: -Math.sin(angle), y: Math.cos(angle) };
  const pts = [{ x: p1.x, y: p1.y }];
  for (let i = 1; i < seg; i++) {
    const t = i / seg;
    const bx = p1.x + dx * i,
      by = p1.y + dy * i;
    const off = Math.sin(t * Math.PI * 2 * wavesCount) * amp;
    pts.push({ x: bx + perp.x * off, y: by + perp.y * off });
  }
  pts.push({ x: p2.x, y: p2.y });
  return pts.reduce(
    (d, pt, i) => (i === 0 ? `M${pt.x},${pt.y}` : `${d} L${pt.x},${pt.y}`),
    ""
  );
}

/* Luo uusi SVG-kuvaelementti annetuilla lähteellä ja mitoilla */
function makeImage(href, w, h) {
  const img = document.createElementNS(svgNS, "image");
  img.setAttribute("href", href);
  img.setAttribute("width", w);
  img.setAttribute("height", h);
  return img;
}

/* Tekee annetusta SVG-elementistä raahattavan hiirellä */
function makeDraggable(el) {
  el.classList.add("draggable");
  el.setAttribute("data-draggable", "true");

  el.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    selectElement(el);

    const svg = el.ownerSVGElement;
    const start = toSVGCoords(svg, e);
    const orig = {};
    const tag = el.tagName.toLowerCase();

    if (tag === "line") {
      ["x1", "y1", "x2", "y2"].forEach((a) => {
        orig[a] = parseFloat(el.getAttribute(a));
      });
    } else if (tag === "path") {
      const tf = el.getAttribute("transform") || "translate(0,0)";
      const m = tf.match(/translate\(([\d.-]+)[ ,]([\d.-]+)\)/);
      orig.x = m ? parseFloat(m[1]) : 0;
      orig.y = m ? parseFloat(m[2]) : 0;
    } else if (tag === "g") {
      // Ryhmässä: selvitä transform ryhmän tasolta
      const tf = el.getAttribute("transform") || "translate(0,0)";
      const m = tf.match(/translate\(([\d.-]+)[ ,]([\d.-]+)\)/);
      orig.x = m ? parseFloat(m[1]) : 0;
      orig.y = m ? parseFloat(m[2]) : 0;
    } else {
      orig.x = parseFloat(el.getAttribute("x") || 0);
      orig.y = parseFloat(el.getAttribute("y") || 0);
    }

    function mm(evt) {
      const cur = toSVGCoords(svg, evt);
      const dx = cur.x - start.x;
      const dy = cur.y - start.y;

      if (tag === "line") {
        el.setAttribute("x1", orig.x1 + dx);
        el.setAttribute("y1", orig.y1 + dy);
        el.setAttribute("x2", orig.x2 + dx);
        el.setAttribute("y2", orig.y2 + dy);
      } else if (tag === "path") {
        el.setAttribute("transform", `translate(${dx},${dy})`);
      } else if (tag === "g") {
        el.setAttribute(
          "transform",
          `translate(${orig.x + dx},${orig.y + dy})`
        );
      } else {
        el.setAttribute("x", orig.x + dx);
        el.setAttribute("y", orig.y + dy);
      }
    }

    function mu() {
      document.removeEventListener("mousemove", mm);
      document.removeEventListener("mouseup", mu);
    }

    document.addEventListener("mousemove", mm);
    document.addEventListener("mouseup", mu);
  });
}

/* Merkitsee työkalun tai värin painikkeen aktiiviseksi (CSS-luokka) */
function activateButton(btn) {
  document
    .querySelectorAll(".tool-btn, .color-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}

window.addEventListener("DOMContentLoaded", () => {
  const svg = document.getElementById("svg-field");
  const lineTypeSelect = document.getElementById("line-type");
  const numberPicker = document.getElementById("number-picker");
  const toolButtons = document.querySelectorAll(".tool-btn");
  const colorButtons = document.querySelectorAll(".color-btn");
  const clearBtn = document.getElementById("delete-all");
  const clearToolBtn = document.getElementById("clear-tool");
  const deleteSelectedBtn = document.getElementById("delete-selected");

  // Väripainikkeiden asettelu: asetetaan taustaväri ja lisätään tapahtuma värin valintaan
  colorButtons.forEach((btn) => {
    const color = btn.dataset.color;
    btn.style.background = color;
    btn.style.color = "#ffffff";
    btn.textContent = "";
    btn.addEventListener("click", () => {
      setTool(previewType, currentNumber, color);
      activateButton(btn);
    });
  });

  // Työkalupainikkeet: aseta valittu työkalu klikkaamalla
  toolButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      setTool(btn.dataset.action, null, null);
      activateButton(btn);
    })
  );

  // Viivatyypin muuttaminen (asettaa viivatyökalun aktiiviseksi)
  lineTypeSelect.addEventListener("change", () => {
    setTool("line", null, null);
    activateButton(document.querySelector('.tool-btn[data-action="line"]'));
  });

  // Numerotyökalu: asetetaan valittu numero työkaluksi
  numberPicker.addEventListener("change", () => {
    setTool("number", numberPicker.value, null);
    activateButton(document.querySelector('.tool-btn[data-action="number"]'));
  });

  // Tyhjennä kenttä
  clearBtn?.addEventListener("click", clearField);
  // Työkalun nollaus -painikkeen toiminto (poistaa valitun työkalun)
  clearToolBtn?.addEventListener("click", clearTool);

  // Poista valittu elementti -painikkeen toiminto (poistaa valitun elementin kentältä)
  deleteSelectedBtn?.addEventListener("click", () => {
    if (selectedEl) {
      selectedEl.remove();
      selectedEl = null;
    }
  });

  // Hiiren liike kentällä: päivittää esikatseluelementin (jos työkalu aktiivinen)
  svg.addEventListener("mousemove", (e) => {
    const pt = toSVGCoords(svg, e);
    if (previewType === "line" && startPoint)
      previewEl ? updatePreview(pt) : createPreview(pt);
    else if (previewType && previewType != "line" && previewType != "delete")
      previewEl ? updatePreview(pt) : createPreview(pt);
  });

  // Hiiren klikkaus kentällä: lisää/piirtää tai poistaa elementtejä valitun työkalun perusteella
  svg.addEventListener("mousedown", (e) => {
    const target = e.target;
    const pt = toSVGCoords(svg, e);
    if (previewType === "delete") {
      // Poistotyökalu aktiivisena: poistetaan klikattu piirretty elementti (jos ei tausta/viivoitus)
      if (
        target !== svg &&
        target.tagName != "defs" &&
        target.tagName != "rect"
      ) {
        const toDel = e.target.closest('[data-draggable="true"]');
        if (toDel) toDel.remove();
      }
      return;
    }
    if (previewType === "line") {
      // Viivatyökalu aktiivinen: ensimmäisellä klikkauksella asetetaan aloituspiste, toisella piirretään viiva valmiiksi
      if (!startPoint) {
        startPoint = pt;
      } else {
        const vis = previewEl;
        vis.setAttribute("opacity", "1");

        const grp = document.createElementNS(svgNS, "g");
        grp.id = `line-group-${++lineCounter}`;
        grp.setAttribute("data-draggable", "true");

        // Lisää varsinainen näkyvä viiva/path ryhmään
        grp.appendChild(vis);

        // Luo näkymätön "osumaviiva", jotta viivaa on helpompi klikata/raahata
        const hit = document.createElementNS(svgNS, vis.tagName);
        if (vis.tagName === "line") {
          ["x1", "y1", "x2", "y2"].forEach((a) => {
            hit.setAttribute(a, vis.getAttribute(a));
          });
        } else if (vis.tagName === "path") {
          hit.setAttribute("d", vis.getAttribute("d"));
          hit.setAttribute("fill", "none");
        }
        hit.setAttribute("stroke", "transparent");
        hit.setAttribute("stroke-width", "20");
        hit.setAttribute("pointer-events", "stroke");

        grp.appendChild(hit);
        svg.appendChild(grp);
        makeDraggable(grp);

        grp.addEventListener("mousedown", (e2) => {
          e2.stopPropagation();
          selectElement(grp);
        });

        previewEl = null;
        startPoint = null;
      }
    } else if (previewType) {
      // Muu työkalu: lisätään esikatseluelementti lopullisena kenttään ja tehdään siitä raahattava
      previewEl.setAttribute("opacity", "1");
      makeDraggable(previewEl);
      previewEl = null;
    }
  });
});

// Hakee lomakkeesta valitun kentän ID:n (oletus 1)
function getCurrentFieldId() {
  return parseInt(document.getElementById("field-id")?.value || "1", 10);
}

// Tallentaa nykyisen kentän tiedot tietokantaan (POST-pyyntö palvelimelle)
function saveToDatabase() {
  const fieldId = getCurrentFieldId();
  const data = collectFieldData(fieldId);

  fetch(`http://localhost:3000/api/field/${fieldId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Virhe tallennuksessa");
      alert("Kenttä tallennettu!");
    })
    .catch((err) => {
      console.error(err);
      alert("Virhe tallennettaessa");
    });
}

// Lataa kentän tiedot tietokannasta (GET-pyyntö) ja piirtää ne kentälle
function loadFromDatabase() {
  const id = getCurrentFieldId();
  fetch(`http://localhost:3000/api/field/${id}`)
    .then((res) => res.json())
    .then((data) => {
      clearSvgField();
      document.getElementById("field-name").value = data.field?.name || "";
      document.getElementById("field-description").value =
        data.field?.description || "";
      renderFieldObjects(data);
    })
    .catch((err) => {
      alert("Kentän lataus epäonnistui");
      console.error(err);
    });
}

// Luo uuden kentän: pyytää uutta ID:tä ja alustaa kentän tiedot
function newField() {
  const newId = prompt("Uuden kentän ID:", "");
  if (!newId) return;
  document.getElementById("field-id").value = newId;
  document.getElementById("field-name").value = "";
  document.getElementById("field-description").value = "";
  clearSvgField();
}

// Poistaa kaikki elementit SVG-kentästä (pelaajat, viivat, ym.)
function clearSvgField() {
  const svg = document.getElementById("svg-field");
  [...svg.querySelectorAll("image, g")].forEach((el) => el.remove());
}

// Hakee kaikki kentät palvelimelta ja täyttää kenttävalikon
function loadFieldList() {
  fetch("http://localhost:3000/api/field/")
    .then((res) => res.json())
    .then((fields) => {
      const select = document.getElementById("field-list");
      if (!select) return;
      select.innerHTML = "";
      fields.forEach((f) => {
        const opt = document.createElement("option");
        opt.value = f.id;
        opt.textContent = `#${f.id}: ${f.name}`;
        select.appendChild(opt);
      });
    });
}

// Käsittelee valikon valinnan: lataa valittu kenttä
function selectFieldFromList() {
  const id = document.getElementById("field-list")?.value;
  document.getElementById("field-id").value = id;
  loadFromDatabase();
}

// Mahdollistaa olemassa olevien elementtien raahaamisen (yleiset kuuntelijat)
function enableDragging() {
  let selectedElement = null;
  let offset = { x: 0, y: 0 };
  const svg = document.getElementById("svg-field");

  svg.addEventListener("mousedown", function (e) {
    const target = e.target.closest(".draggable");
    if (!target) return;

    selectedElement = target;

    // Haetaan elementin nykyiset koordinaatit
    if (selectedElement.tagName === "image") {
      offset.x = e.offsetX - parseFloat(selectedElement.getAttribute("x"));
      offset.y = e.offsetY - parseFloat(selectedElement.getAttribute("y"));
    } else if (selectedElement.tagName === "g") {
      const line = selectedElement.querySelector(
        'line:not([stroke="transparent"])'
      );
      if (line) {
        offset.x = e.offsetX - parseFloat(line.getAttribute("x1"));
        offset.y = e.offsetY - parseFloat(line.getAttribute("y1"));
      }
    }

    clearSelection();
    selectedElement.classList.add("selected");
    // Tyhjää edellinen valinta ja korosta valittu elementti
  });

  // Raahaus: siirtää valittua elementtiä hiiren mukana
  svg.addEventListener("mousemove", function (e) {
    if (!selectedElement) return;

    const x = e.offsetX - offset.x;
    const y = e.offsetY - offset.y;

    if (selectedElement.tagName === "image") {
      selectedElement.setAttribute("x", x);
      selectedElement.setAttribute("y", y);
    } else if (selectedElement.tagName === "g") {
      const line = selectedElement.querySelector(
        'line:not([stroke="transparent"])'
      );
      const shadow = selectedElement.querySelector(
        'line[stroke="transparent"]'
      );
      if (line) {
        const dx = x - parseFloat(line.getAttribute("x1"));
        const dy = y - parseFloat(line.getAttribute("y1"));

        const x1 = parseFloat(line.getAttribute("x1")) + dx;
        const y1 = parseFloat(line.getAttribute("y1")) + dy;
        const x2 = parseFloat(line.getAttribute("x2")) + dx;
        const y2 = parseFloat(line.getAttribute("y2")) + dy;

        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);

        if (shadow) {
          shadow.setAttribute("x1", x1);
          shadow.setAttribute("y1", y1);
          shadow.setAttribute("x2", x2);
          shadow.setAttribute("y2", y2);
          shadow.setAttribute("fill", "none");
        }
      }
    }
  });

  // Lopetetaan raahaus, kun hiiri vapautetaan
  svg.addEventListener("mouseup", () => (selectedElement = null));
  // Keskeytetään raahaus, jos hiiri poistuu kentän alueelta
  svg.addEventListener("mouseleave", () => (selectedElement = null));
}

/* Poistaa "selected"-luokan kaikilta elementeiltä (tyhjentää valinnan) */
function clearSelection() {
  document
    .querySelectorAll(".selected")
    .forEach((el) => el.classList.remove("selected"));
}

window.onload = function () {
  enableDragging();
  loadFieldList();
  loadFromDatabase();
};

// Piirtää tietokannasta ladatut kenttäobjektit SVG-kentälle
function renderFieldObjects(data) {
  const svg = document.getElementById("svg-field");

  // Aputoiminto: lisää kuvake (pelaaja/pallo/kartio) annettuun kohtaan kentälle
  const addImage = (x, y, href, color, size = 40) => {
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    image.setAttribute("href", href);
    image.setAttribute("x", x);
    image.setAttribute("y", y);
    image.setAttribute("width", size);
    image.setAttribute("height", size);
    image.setAttribute("opacity", "1");
    image.setAttribute("filter", createColorFilter(color));
    image.setAttribute("class", "draggable");
    image.setAttribute("data-draggable", "true");
    svg.appendChild(image);
    makeDraggable(image);
  };

  // Aputoiminto: lisää viiva (suora/katkoviiva) kenttään ja asettaa osuma-alueen
  const addLine = (x1, y1, x2, y2, color, type) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "draggable");
    group.setAttribute("data-draggable", "true");

    let line;
    if (type === "zigzag") {
      // Волнообразная линия — path
      if (type === "zigzag") {
        line = document.createElementNS("http://www.w3.org/2000/svg", "path");
        line.setAttribute("d", sinePath({ x: x1, y: y1 }, { x: x2, y: y2 }));
        line.setAttribute("fill", "none");
      }
    } else {
      // Обычная линия — line
      line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      if (type === "dashed") line.setAttribute("stroke-dasharray", "5,5");
    }

    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "2");
    line.setAttribute("opacity", "1");
    line.setAttribute("marker-end", "url(#arrowhead)");

    // Невидимая линия для захвата мышкой
    let shadow;
    if (type !== "zigzag") {
      shadow = document.createElementNS("http://www.w3.org/2000/svg", "line");
      shadow.setAttribute("x1", x1);
      shadow.setAttribute("y1", y1);
      shadow.setAttribute("x2", x2);
      shadow.setAttribute("y2", y2);
    } else {
      shadow = document.createElementNS("http://www.w3.org/2000/svg", "path");
      shadow.setAttribute("d", sinePath({ x: x1, y: y1 }, { x: x2, y: y2 }));
      shadow.setAttribute("fill", "none");
    }

    shadow.setAttribute("stroke", "transparent");
    shadow.setAttribute("stroke-width", "20");
    shadow.setAttribute("pointer-events", "stroke");

    group.appendChild(line);
    group.appendChild(shadow);
    group.setAttribute("transform", "translate(0,0)");
    svg.appendChild(group);
    makeDraggable(group);
  };

  // Aputoiminto: lisää numero kuvakkeena annettuihin koordinaatteihin
  const addNumber = (x, y, number, color) => {
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    image.setAttribute("href", `svg/number-${number}-alt-svgrepo-com.svg`);
    image.setAttribute("x", x);
    image.setAttribute("y", y);
    image.setAttribute("width", "24");
    image.setAttribute("height", "24");
    image.setAttribute("opacity", "1");
    image.setAttribute("filter", createColorFilter(color));
    image.setAttribute("class", "draggable");
    image.setAttribute("data-draggable", "true");
    svg.appendChild(image);
    makeDraggable(image);
  };

  /* Luo (tai hakee olemassaolevan) värifiltterin annetulle värille */
  function createColorFilter(color) {
    const id =
      "tint-" +
      btoa(color)
        .replace(/[^a-z0-9]/gi, "")
        .slice(0, 10);
    if (!document.getElementById(id)) {
      const defs = svg.querySelector("defs");
      const filter = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "filter"
      );
      filter.setAttribute("id", id);
      const flood = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feFlood"
      );
      flood.setAttribute("flood-color", color);
      flood.setAttribute("result", "flood");
      const comp = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "feComposite"
      );
      comp.setAttribute("in", "flood");
      comp.setAttribute("in2", "SourceGraphic");
      comp.setAttribute("operator", "in");
      filter.appendChild(flood);
      filter.appendChild(comp);
      defs.appendChild(filter);
    }
    return `url(#${id})`;
  }

  /* Parsii annetun koordinaatin [x, y] -muotoon (merkkijono "(x,y)" tai olio -> taulukko) */
  function parseCoords(coord) {
    if (typeof coord === "string") {
      const parts = coord.replace(/[()]/g, "").split(",");
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      if (!isNaN(x) && !isNaN(y)) return [x, y];
    }

    if (
      typeof coord === "object" &&
      coord !== null &&
      "x" in coord &&
      "y" in coord
    ) {
      return [coord.x, coord.y];
    }

    return [0, 0]; // fallback
  }
  // Lisää kaikki pelaaja-objektit (pelaajahahmot) kentälle
  data.player.forEach((obj) => {
    const [x, y] = parseCoords(obj.coordinates);
    addImage(x, y, "svg/circle-svgrepo-com.svg", obj.color);
  });

  // Lisää kaikki pallo-objektit kentälle
  data.ball.forEach((obj) => {
    const [x, y] = parseCoords(obj.coordinates);
    addImage(x, y, "svg/ball-football-svgrepo-com.svg", "#ffffff", 30);
  });

  // Lisää kaikki kartio-objektit kentälle
  data.cone.forEach((obj) => {
    const [x, y] = parseCoords(obj.coordinates);
    addImage(x, y, "svg/cone-svgrepo-com.svg", obj.color, 30);
  });

  // Lisää kaikki viiva-objektit kentälle
  data.line.forEach((obj) => {
    const [x1, y1] = parseCoords(obj.coordinates_start);
    const [x2, y2] = parseCoords(obj.coordinates_end);
    addLine(x1, y1, x2, y2, obj.color, obj.type_line);
  });

  // Lisää kaikki numero-objektit kentälle
  data.number.forEach((obj) => {
    const [x, y] = parseCoords(obj.coordinates);
    addNumber(x, y, obj.number, obj.color);
  });
}

/* Kerää SVG-kentän objektien tiedot JSON-muotoon tallennusta varten */
function collectFieldData(fieldId = 1) {
  const svg = document.getElementById("svg-field");
  const data = {
    field: {
      id: fieldId,
      name: document.getElementById("field-name")?.value || "Nimetön kenttä",
      description:
        document.getElementById("field-description")?.value || "Ei kuvausta",
    },
    player: [],
    ball: [],
    cone: [],
    line: [],
    number: [],
  };

  //  Käy läpi kaikki kuvat (pelaajat, pallot, kartiot, numerot)
  const images = svg.querySelectorAll("image");
  images.forEach((img) => {
    const href = img.getAttribute("href");
    const x = parseFloat(img.getAttribute("x"));
    const y = parseFloat(img.getAttribute("y"));
    const filter = img.getAttribute("filter");
    const color = getColorFromFilter(filter);

    if (href.includes("circle")) {
      data.player.push({
        id_field: fieldId,
        coordinates: `(${x},${y})`,
        color,
      });
    } else if (href.includes("ball")) {
      data.ball.push({
        id_field: fieldId,
        coordinates: `(${x},${y})`,
        color: "#ffffff",
      });
    } else if (href.includes("cone")) {
      data.cone.push({ id_field: fieldId, coordinates: `(${x},${y})`, color });
    } else if (href.includes("number")) {
      const numMatch = href.match(/number-(\d+)/);
      const number = numMatch ? parseInt(numMatch[1], 10) : 0;
      data.number.push({
        id_field: fieldId,
        coordinates: `(${x},${y})`,
        color,
        number,
      });
    }
  });

  // ⬇️ Käy läpi viivaryhmät (g) ja lisää ne
  const groups = svg.querySelectorAll("g");
  groups.forEach((g) => {
    const el = g.querySelector('line:not([stroke="transparent"]), path');
    if (!el) return;

    let x1, y1, x2, y2, type_line;
    const stroke = el.getAttribute("stroke") || "#000000";

    if (el.tagName === "line") {
      x1 = +el.getAttribute("x1");
      y1 = +el.getAttribute("y1");
      x2 = +el.getAttribute("x2");
      y2 = +el.getAttribute("y2");
      type_line = el.getAttribute("stroke-dasharray") ? "dashed" : "straight";
    } else if (el.tagName === "path") {
      const d = el.getAttribute("d");
      if (!d) return;

      const allCoords = Array.from(d.matchAll(/[\sML]*([\d.]+),([\d.]+)/g));
      if (allCoords.length < 2) return;

      const first = allCoords[0];
      const last = allCoords[allCoords.length - 1];

      x1 = +first[1];
      y1 = +first[2];
      x2 = +last[1];
      y2 = +last[2];
      type_line = "zigzag";
    }

    if (x1 != null && x2 != null) {
      data.line.push({
        id_field: fieldId,
        coordinates_start: `(${x1},${y1})`,
        coordinates_end: `(${x2},${y2})`,
        color: stroke,
        type_line,
      });
    }
  });

  return data;
}

/* Palauttaa värikoodin annettuun filtteri-URL:iin liittyen (oletus musta) */
function getColorFromFilter(filterUrl) {
  if (!filterUrl) return "#000000";
  const filterId = filterUrl.replace("url(#", "").replace(")", "");
  const filterElement = document.getElementById(filterId);
  if (!filterElement) return "#000000";

  const feFlood = filterElement.querySelector("feFlood");
  return feFlood?.getAttribute("flood-color") || "#000000";
}
