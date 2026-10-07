# TAKT – web-stranica

Statična stranica (HTML, CSS, JavaScript, bez frameworka) spremna za GitHub Pages.

## Objava na GitHub Pages

1. Na GitHubu napravi novi repozitorij (npr. `takt`).
2. Učitaj **sve datoteke iz ove mape** u korijen repozitorija (Add file → Upload files), uključujući `.nojekyll`.
3. Settings → Pages → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)` → Save.
4. Nakon minute-dvije stranica je dostupna na `https://KORISNIK.github.io/takt/`.
5. Vlastita domena (npr. `takt.hr`): Settings → Pages → Custom domain.

## Prije objave – popuni

Potraži `[UPISATI` u svim datotekama:

- `index.html` – cijena, e-mail (na dva mjesta: tekst i `mailto:`)
- `impressum.html`, `politika-privatnosti.html`, `kolacici.html` – podaci o obrtu
- `index.html` – zamijeni `https://www.example.com/` stvarnom adresom (canonical, og:url, og:image)

## Fotografije

1. Spremi fotografije u mapu `images/` (JPG ili WebP, širine oko 1000 px, do ~200 KB).
2. U `index.html` pronađi komentare `FOTOGRAFIJA:` i zamijeni `<div class="photo-placeholder">…</div>` naznačenim `<img>` retkom.

## Struktura

```
index.html                 naslovnica (sve sekcije)
politika-privatnosti.html  predložak
kolacici.html              predložak
impressum.html             predložak
404.html
css/style.css              boje i fontovi su na vrhu u :root
js/main.js                 izbornik, animacije
images/og-image.png        slika za dijeljenje na društvenim mrežama
favicon.svg / .ico / .png
```
