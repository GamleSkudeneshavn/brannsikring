/* Brannsikring i Gamle Skudeneshavn – klientskript.
   All lagring skjer lokalt i nettleseren (localStorage). */

(function () {
  "use strict";

  /* ---------- Brannslangeskap (kartdata) ----------
     Plasseringer kartfestet ut fra kjente beskrivelser (gate-/husnummer),
     med koordinater hentet fra OpenStreetMap. Posisjonene er fortsatt
     omtrentlige – nettleserkonsollen logger koordinatene der du klikker i
     kartet, så det er lett å finjustere.
     Hvert skap: { navn: "...", lat: <breddegrad>, lng: <lengdegrad> } */
  var BRANNSLANGESKAP = [
    { navn: "Gangvei Veibelsbakken–Gunnarsbakken", lat: 59.14916, lng: 5.26005 },
    { navn: "Nordnes 1–3–5 (åpen plass)",          lat: 59.14881, lng: 5.25879 },
    { navn: "Bådebakken (midt)",                   lat: 59.14871, lng: 5.26007 },
    { navn: "Nordnes 12 / Søragadå 15 (åpen plass)", lat: 59.14844, lng: 5.25955 },
    { navn: "Hjørnet Halvorsbakken / Søragadå",    lat: 59.14823, lng: 5.26054 },
    { navn: "Mælandsgården (tunet)",               lat: 59.14787, lng: 5.26055 },
    { navn: "Søragadå 29–37 (langs gata)",         lat: 59.14789, lng: 5.26146 },
    { navn: "Søragadå 53–57",                      lat: 59.14762, lng: 5.26274 },
    { navn: "Søragadå 68–70",                      lat: 59.14735, lng: 5.26394 }
  ];

  /* ---------- Mobilmeny ---------- */
  var menyKnapp = document.getElementById("menyKnapp");
  var meny = document.getElementById("hovedmeny");

  if (menyKnapp && meny) {
    menyKnapp.addEventListener("click", function () {
      var apen = meny.classList.toggle("apen");
      menyKnapp.setAttribute("aria-expanded", apen ? "true" : "false");
    });
    // Lukk menyen når en lenke velges (mobil)
    meny.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && meny.classList.contains("apen")) {
        meny.classList.remove("apen");
        menyKnapp.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Trygg localStorage ---------- */
  function lagre(nokkel, verdi) {
    try { localStorage.setItem(nokkel, JSON.stringify(verdi)); } catch (e) { /* privat modus o.l. */ }
  }
  function hent(nokkel, standard) {
    try {
      var raa = localStorage.getItem(nokkel);
      return raa ? JSON.parse(raa) : standard;
    } catch (e) { return standard; }
  }

  /* ---------- Sjekkliste ---------- */
  var SJEKK_NOKKEL = "gs-brann-sjekkliste";
  var sjekkListe = document.getElementById("sjekkListe");
  var fyll = document.getElementById("fremdriftFyll");
  var status = document.getElementById("fremdriftStatus");
  var nullstill = document.getElementById("nullstillSjekk");

  function oppdaterFremdrift() {
    if (!sjekkListe) return;
    var bokser = sjekkListe.querySelectorAll("input[type=checkbox]");
    var antall = bokser.length;
    var ferdig = 0;
    bokser.forEach(function (b) { if (b.checked) ferdig++; });
    var prosent = antall ? Math.round((ferdig / antall) * 100) : 0;
    if (fyll) fyll.style.width = prosent + "%";
    if (status) {
      status.textContent = ferdig === antall && antall > 0
        ? "Alle " + antall + " punkter fullført – godt jobbet!"
        : ferdig + " av " + antall + " punkter fullført";
    }
  }

  if (sjekkListe) {
    var lagret = hent(SJEKK_NOKKEL, {});
    sjekkListe.querySelectorAll("input[type=checkbox]").forEach(function (boks) {
      var id = boks.getAttribute("data-sjekk");
      if (lagret[id]) boks.checked = true;
      boks.addEventListener("change", function () {
        var tilstand = hent(SJEKK_NOKKEL, {});
        tilstand[id] = boks.checked;
        lagre(SJEKK_NOKKEL, tilstand);
        oppdaterFremdrift();
      });
    });
    oppdaterFremdrift();
  }

  if (nullstill) {
    nullstill.addEventListener("click", function () {
      lagre(SJEKK_NOKKEL, {});
      if (sjekkListe) {
        sjekkListe.querySelectorAll("input[type=checkbox]").forEach(function (b) { b.checked = false; });
      }
      oppdaterFremdrift();
    });
  }

  /* ---------- Kontrollogg ---------- */
  var LOGG_NOKKEL = "gs-brann-logg";
  var loggForm = document.getElementById("loggForm");
  var loggKropp = document.getElementById("loggKropp");
  var loggTom = document.getElementById("loggTom");

  function formaterDato(iso) {
    var deler = (iso || "").split("-");
    if (deler.length !== 3) return iso;
    return deler[2] + "." + deler[1] + "." + deler[0];
  }

  function tegnLogg() {
    if (!loggKropp) return;
    var rader = hent(LOGG_NOKKEL, []);
    loggKropp.innerHTML = "";
    if (loggTom) loggTom.hidden = rader.length > 0;

    rader.forEach(function (rad, indeks) {
      var tr = document.createElement("tr");

      var tdDato = document.createElement("td");
      tdDato.textContent = formaterDato(rad.dato);

      var tdType = document.createElement("td");
      tdType.textContent = rad.type;

      var tdNotat = document.createElement("td");
      tdNotat.textContent = rad.notat || "–";

      var tdHandling = document.createElement("td");
      var slett = document.createElement("button");
      slett.type = "button";
      slett.className = "logg-slett";
      slett.textContent = "Slett";
      slett.setAttribute("aria-label", "Slett oppføring: " + rad.type + " " + formaterDato(rad.dato));
      slett.addEventListener("click", function () {
        var naa = hent(LOGG_NOKKEL, []);
        naa.splice(indeks, 1);
        lagre(LOGG_NOKKEL, naa);
        tegnLogg();
      });
      tdHandling.appendChild(slett);

      tr.appendChild(tdDato);
      tr.appendChild(tdType);
      tr.appendChild(tdNotat);
      tr.appendChild(tdHandling);
      loggKropp.appendChild(tr);
    });
  }

  if (loggForm) {
    loggForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var type = document.getElementById("loggType").value;
      var dato = document.getElementById("loggDato").value;
      var notat = document.getElementById("loggNotat").value.trim();
      if (!type || !dato) return;

      var rader = hent(LOGG_NOKKEL, []);
      rader.push({ type: type, dato: dato, notat: notat });
      // Nyeste først
      rader.sort(function (a, b) { return a.dato < b.dato ? 1 : -1; });
      lagre(LOGG_NOKKEL, rader);
      loggForm.reset();
      tegnLogg();
    });
    tegnLogg();
  }

  /* ---------- Skriv ut ---------- */
  var skrivUt = document.getElementById("skrivUt");
  if (skrivUt) {
    skrivUt.addEventListener("click", function () { window.print(); });
  }

  /* ---------- Brannslangeskap: tekstliste + kart ---------- */
  // Tekstlisten bygges alltid – den er tilgjengelig alternativ til kartet
  // og fungerer også uten JavaScript-kartet (skjermlesere, utskrift).
  var skapListe = document.getElementById("skapListe");
  if (skapListe) {
    BRANNSLANGESKAP.forEach(function (skap) {
      var li = document.createElement("li");
      li.textContent = skap.navn;
      var koord = document.createElement("span");
      koord.className = "skap-koord";
      koord.textContent = " (" + skap.lat.toFixed(5) + ", " + skap.lng.toFixed(5) + ")";
      li.appendChild(koord);
      skapListe.appendChild(li);
    });
  }

  // Kartet krever Leaflet (vendor/leaflet). Faller stille tilbake til
  // tekstlisten hvis biblioteket ikke er lastet.
  var kartEl = document.getElementById("brannkart");
  if (kartEl && typeof L !== "undefined" && BRANNSLANGESKAP.length) {
    var ikon = L.icon({
      iconUrl: "vendor/leaflet/images/marker-icon.png",
      iconRetinaUrl: "vendor/leaflet/images/marker-icon-2x.png",
      shadowUrl: "vendor/leaflet/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    var kart = L.map(kartEl, { scrollWheelZoom: false, zoomSnap: 0 });
    window.brannkart = kart; // tilgjengelig i konsollen for finjustering

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>-bidragsytere"
    }).addTo(kart);

    var punkter = [];
    BRANNSLANGESKAP.forEach(function (skap) {
      var m = L.marker([skap.lat, skap.lng], { icon: ikon, title: skap.navn }).addTo(kart);
      m.bindPopup("<strong>Brannslangeskap</strong><br>" + skap.navn);
      punkter.push([skap.lat, skap.lng]);
    });

    kart.fitBounds(punkter, { padding: [30, 30], maxZoom: 17 });

    // Knip-zoom (pinch) på styreflate/skjerm sender wheel-hendelser med
    // ctrlKey satt. Da zoomer vi kartet i stedet for hele nettsiden, mens
    // vanlig rulling fortsatt ruller siden forbi kartet.
    kartEl.addEventListener("wheel", function (e) {
      if (!e.ctrlKey) return;
      e.preventDefault();
      var punkt = kart.mouseEventToContainerPoint(e);
      var senter = kart.containerPointToLatLng(punkt);
      kart.setZoomAround(senter, kart.getZoom() - e.deltaY * 0.1);
    }, { passive: false });

    // Klikk i kartet logger koordinatene til konsollen – nyttig når
    // plasseringene skal rettes opp mot virkeligheten.
    kart.on("click", function (e) {
      if (window.console) {
        console.log("Kartklikk: " + e.latlng.lat.toFixed(5) + ", " + e.latlng.lng.toFixed(5));
      }
    });
  }
})();
