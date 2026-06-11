# Brannsikring i Gamle Skudeneshavn

Nettside basert på informasjonspermen «Brannsikring Gamle Skudeneshavn» fra Karmøy kommune.

**Versjon 1:** statisk side uten CMS, klar for Cloudflare Pages.
**Versjon 2 (planlagt):** innhold redigerbart via Sanity.

## Innhold i prosjektet

```
public/
  index.html    – hele siden (norsk bokmål, semantisk HTML)
  styles.css    – mobil-først, WCAG-fokusert stilark
  app.js        – meny, sjekkliste og kontrollogg (lagres i localStorage)
  _headers      – sikkerhetsheadere for Cloudflare Pages
```

Ingen byggesteg, ingen avhengigheter. Alt kjører rett fra `public/`.

## Universell utforming

- Semantisk struktur: landemerker (`header`/`nav`/`main`/`footer`), riktig overskriftshierarki, hopp-til-innhold-lenke.
- Alle diagrammer er SVG med `role="img"`, `<title>` og `<desc>` (full tekstbeskrivelse for skjermlesere); dekorativ grafikk er `aria-hidden`.
- Tastaturnavigasjon med synlig fokusmarkering (`:focus-visible`), mobilmeny med `aria-expanded`.
- Fargekontraster i AA-nivå eller bedre; informasjon formidles aldri med farge alene.
- `prefers-reduced-motion` respekteres, tekst kan zoomes (rem-baserte størrelser), og siden har egne utskriftsstiler.
- Skjemafelt har eksplisitte `label`-koblinger; fremdrift i sjekklisten annonseres via `role="status"`.

Test gjerne med [axe DevTools](https://www.deque.com/axe/) eller Lighthouse før lansering – og aller helst med en ekte skjermleser (VoiceOver/NVDA).

## Publisere på Cloudflare Pages

### Alternativ A: dra-og-slipp (raskest)

1. Logg inn på [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
2. Last opp innholdet i `public/`-mappen.
3. Ferdig – siden får en `*.pages.dev`-adresse. Eget domene kan kobles til under **Custom domains**.

### Alternativ B: Git-integrasjon (anbefalt for videre arbeid)

1. Legg prosjektet i et Git-repo (GitHub/GitLab).
2. I Cloudflare: **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Innstillinger:
   - **Build command:** (tom)
   - **Build output directory:** `public`
4. Hver push til hovedgrenen publiserer automatisk, og hver pull request får en forhåndsvisnings-URL.

### Alternativ C: Wrangler (kommandolinje)

```bash
npm install -g wrangler
wrangler pages deploy public --project-name brannsikring-skudeneshavn
```

## Veikart: redigerbart innhold med Sanity

Anbefalt arkitektur for versjon 2:

```
Sanity Studio (innholdsredigering)
        │  publisering → webhook
        ▼
Cloudflare Pages (bygg + hosting)
  Astro/Eleventy henter innhold fra Sanity ved bygg
```

1. **Sanity-prosjekt:** `npm create sanity@latest`. Studio kan hostes gratis på `*.sanity.studio` eller som egen rute på samme Pages-prosjekt.
2. **Skjema:** modeller innholdet slik seksjonene på siden allerede er delt opp – f.eks. dokumenttypene `seksjon` (tittel, overlinje, brødtekst som Portable Text, valgfri illustrasjon), `regelkort` (tall/etikett, tittel, tekst — driver «Kort fortalt»), `tidslinjepunkt` (år, tekst) og `sjekkpunkt` (tekst, rekkefølge). Da kan kommunen redigere alt tekstinnhold uten å røre kode.
3. **Rammeverk:** flytt HTML-en inn i [Astro](https://astro.build) (statisk output, fungerer utmerket på Pages). Dagens CSS og JS gjenbrukes nesten uendret; HTML-seksjonene blir komponenter som mates med data fra `@sanity/client`.
4. **Automatisk publisering:** legg inn en Sanity-webhook («on publish») som kaller Cloudflare Pages sin *Deploy Hook*. Da bygges siden på nytt hver gang en redaktør trykker «Publish» – innen et par minutter er endringen live.
5. **Forhåndsvisning (valgfritt):** bruk Sanitys Presentation/Preview mot en egen forhåndsvisningsgren på Pages.

Denne modellen gir CMS-redigering uten servere å drifte: Sanity tar innholdet, Cloudflare tar byggingen og leveringen.

## Innholdsmerknad

Brosjyren siden bygger på er fra 1990-tallet. Faktainnholdet er beholdt, men siden oppfordrer leseren til å sjekke gjeldende forskrifter hos DSB og Karmøy kommune. Gå gjerne gjennom teksten med brannvesenet før lansering.
