# Best Practice per lo Sviluppo del Sito Web

## Struttura del Progetto

- Organizza i file in cartelle chiare: `css/`, `js/`, `images/`, `fonts/`
- Usa nomi file in minuscolo con trattini (es. `hero-section.css`, non `HeroSection.css`)
- Separa HTML, CSS e JavaScript in file distinti

## HTML

- Usa sempre il doctype: `<!DOCTYPE html>`
- Includi sempre `<meta charset="UTF-8">` e `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- Usa tag semantici: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Ogni immagine deve avere l'attributo `alt` per accessibilità
- Un solo `<h1>` per pagina; rispetta la gerarchia dei titoli (h1 → h2 → h3)
- Usa `<button>` per azioni, `<a>` per navigazione

## CSS

- Mobile-first: scrivi prima gli stili per mobile, poi usa `@media (min-width: ...)` per schermi più grandi
- Usa variabili CSS per colori, font e spaziature:
  ```css
  :root {
    --color-primary: #...;
    --font-base: 'NomeFonte', sans-serif;
    --spacing-md: 1rem;
  }
  ```
- Evita `!important` — se ti serve, c'è un problema di specificità
- Usa Flexbox o Grid per i layout, evita float
- Mantieni la specificità bassa: preferisci classi a ID nei selettori

## JavaScript

- Usa `const` e `let`, mai `var`
- Aggiungi gli event listener tramite JS, non attributi `onclick` inline nell'HTML
- Carica gli script con `defer` o in fondo al `<body>`
- Evita di inquinare il namespace globale — usa moduli o IIFE se necessario

## Immagini e Performance

- Comprimi le immagini prima di caricarle (usa WebP dove possibile)
- Usa dimensioni esplicite (`width` e `height`) sulle immagini per evitare layout shift
- Carica le immagini "sotto la piega" con `loading="lazy"`
- Usa font di sistema o carica solo i pesi/stili necessari dei webfont

## Accessibilità (a11y)

- Contrasto testo/sfondo minimo 4.5:1 (WCAG AA)
- Tutti gli elementi interattivi devono essere raggiungibili da tastiera
- Usa `aria-label` o `aria-labelledby` dove il testo visibile non è sufficiente
- Non usare mai il colore come unico mezzo per trasmettere informazioni

## SEO Base

- Ogni pagina ha un `<title>` unico e descrittivo
- Includi `<meta name="description">` con un riassunto della pagina
- Usa URL leggibili e descrittivi
- Aggiungi `rel="canonical"` se necessario

## Convenzioni di Codice

- Indentazione: 2 spazi
- Nomi classi CSS in kebab-case (es. `card-title`)
- Commenta solo dove la logica non è ovvia, non commentare codice ovvio
- Testa su Chrome, Firefox e Safari prima di consegnare
