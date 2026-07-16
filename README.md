# Crescere insieme

Sito editoriale statico pubblicato con GitHub Pages.

## Aggiornare metadati e sitemap

Dopo aver aggiunto o modificato articoli, eseguire:

```bash
node scripts/sync-site-foundations.mjs
```

Lo script uniforma navigazione, footer, metadati social, date ricavate dalla cronologia Git,
dati strutturati degli articoli e `sitemap.xml`. È idempotente: può essere eseguito più volte.

Sito statico del progetto **Crescere insieme**.

Tema: educazione, bambini e liberta. Piccole idee per crescere figli e figlie con cura, coraggio, logica, movimento e autonomia.

Firma editoriale: **Un papa che sta imparando**.

## Struttura

- `index.html` - home page
- `manifesto.html` - manifesto del progetto
- `articoli.html` - archivio articoli
- `newsletter.html` - pagina newsletter
- `fonti.html` - fonti e riferimenti
- `articoli/` - articoli lunghi
- `assets/css/styles.css` - stile del sito

## Pubblicazione

Il sito e statico e puo essere pubblicato con GitHub Pages dalla branch `main`, cartella root.
