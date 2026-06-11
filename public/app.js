/* Brannsikring i Gamle Skudeneshavn – klientskript.
   All lagring skjer lokalt i nettleseren (localStorage). */

(function () {
  "use strict";

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
})();
