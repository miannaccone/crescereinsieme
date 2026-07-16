import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TODAY = new Date().toISOString().slice(0, 10);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if ([".git", "bozze", "newsletter-templates", "scripts"].includes(entry.name)) return [];
      return walk(path);
    }
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

function gitDates(relPath) {
  try {
    const output = execFileSync(
      "git",
      ["log", "--follow", "--format=%cs", "--", relPath],
      { cwd: ROOT, encoding: "utf8" },
    ).trim();
    const dates = output.split("\n").filter(Boolean);
    return { published: dates.at(-1) || TODAY, modified: dates[0] || TODAY };
  } catch {
    return { published: TODAY, modified: TODAY };
  }
}

function headVersion(relPath) {
  try {
    return execFileSync("git", ["show", `HEAD:${relPath}`], { cwd: ROOT, encoding: "utf8" });
  } catch {
    return "";
  }
}

function metadataDate(html, property) {
  return html.match(new RegExp(`<meta property="${property}" content="([^"]+)">`))?.[1] || "";
}

function articleContent(html) {
  return (html.match(/<article class="article">([\s\S]*?)<\/article>/)?.[1] || "")
    .replace(/\s*<p class="article-dates">[\s\S]*?<\/p>/g, "")
    .trim();
}

function mainContent(html) {
  return (html.match(/<main(?:\s[^>]*)?>([\s\S]*?)<\/main>/)?.[1] || "")
    .replace(/\s*<p class="article-dates">[\s\S]*?<\/p>/g, "")
    .trim();
}

function sitemapLastmods(xml) {
  const values = new Map();
  for (const match of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)) {
    values.set(match[1], match[2]);
  }
  return values;
}

function decodeEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&nbsp;", " ")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function match(html, pattern, fallback = "") {
  return decodeEntities(html.match(pattern)?.[1] || fallback);
}

function italianDate(iso) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}

function prefixFor(relPath) {
  return relPath.includes("/") ? "../" : "";
}

function footer(prefix) {
  return `<nav class="footer-nav" aria-label="Link utili">
          <a href="${prefix}chi-sono.html">Chi sono</a>
          <a href="${prefix}manifesto.html">Manifesto</a>
          <a href="${prefix}articoli.html">Articoli</a>
          <a href="${prefix}newsletter.html">Newsletter</a>
          <a href="${prefix}fonti.html">Fonti</a>
          <a href="${prefix}contatti.html">Contatti</a>
          <a href="${prefix}privacy.html">Privacy</a>
        </nav>`;
}

function addCommonMetadata(html) {
  if (!html.includes('name="robots"')) {
    html = html.replace(
      /(<meta name="description"[^>]*>)/,
      '$1\n    <meta name="robots" content="index, follow, max-image-preview:large">',
    );
  }
  if (!html.includes('name="author"')) {
    html = html.replace(
      /(<meta name="robots"[^>]*>)/,
      '$1\n    <meta name="author" content="Un papà che sta imparando">',
    );
  } else {
    html = html.replace(
      /<meta name="author" content="[^"]*">/,
      '<meta name="author" content="Un papà che sta imparando">',
    );
  }

  html = html.replace(
    /<meta name="twitter:card" content="summary">/,
    '<meta name="twitter:card" content="summary_large_image">',
  );

  if (!html.includes('property="og:image"')) {
    html = html.replace(
      /(<meta name="twitter:card"[^>]*>)/,
      '<meta property="og:image" content="https://crescere-insieme.com/assets/social-card.png">\n    $1',
    );
  }
  if (!html.includes('property="og:image:width"')) {
    html = html.replace(
      /(<meta property="og:image"[^>]*>)/,
      '$1\n    <meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="630">\n    <meta property="og:image:alt" content="Crescere insieme - Educare senza restringere">',
    );
  }
  if (!html.includes('name="twitter:image"')) {
    html = html.replace(
      /(<meta name="twitter:card"[^>]*>)/,
      '$1\n    <meta name="twitter:image" content="https://crescere-insieme.com/assets/social-card.png">',
    );
  }
  return html;
}

function articleSchema({ canonical, description, modified, published, section, title }) {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${canonical}#article`,
        mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
        headline: title,
        description,
        image: "https://crescere-insieme.com/assets/social-card.png",
        inLanguage: "it-IT",
        datePublished: published,
        dateModified: modified,
        author: {
          "@type": "Person",
          name: "Un papà che sta imparando",
          url: "https://crescere-insieme.com/chi-sono.html",
        },
        publisher: {
          "@type": "Organization",
          name: "Crescere insieme",
          url: "https://crescere-insieme.com/",
          logo: {
            "@type": "ImageObject",
            url: "https://crescere-insieme.com/assets/logo-512.png",
            width: 512,
            height: 512,
          },
        },
        articleSection: section,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://crescere-insieme.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Articoli",
            item: "https://crescere-insieme.com/articoli.html",
          },
          { "@type": "ListItem", position: 3, name: title, item: canonical },
        ],
      },
    ],
  };
  return `    <script type="application/ld+json">\n${JSON.stringify(data, null, 2)
    .split("\n")
    .map((line) => `      ${line}`)
    .join("\n")}\n    </script>\n`;
}

function updateArticle(html, relPath) {
  const historyDates = gitDates(relPath);
  const committedHtml = headVersion(relPath);
  const contentChanged = committedHtml && articleContent(html) !== articleContent(committedHtml);
  const dates = {
    published:
      metadataDate(committedHtml, "article:published_time") ||
      metadataDate(html, "article:published_time") ||
      historyDates.published,
    modified: contentChanged
      ? TODAY
      : metadataDate(committedHtml, "article:modified_time") ||
        metadataDate(html, "article:modified_time") ||
        historyDates.modified,
  };
  const canonical = match(html, /<link rel="canonical" href="([^"]+)">/);
  const title = match(html, /<meta property="og:title" content="([^"]+)">/, match(html, /<h1>([\s\S]*?)<\/h1>/));
  const description = match(html, /<meta name="description" content="([^"]+)">/);
  const section = match(html, /<p class="eyebrow">([\s\S]*?)<\/p>/, "Educazione");

  html = html
    .replace(/\s*<meta property="article:published_time"[^>]*>/g, "")
    .replace(/\s*<meta property="article:modified_time"[^>]*>/g, "")
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "")
    .replace(/\s*<p class="article-dates">[\s\S]*?<\/p>/g, "");

  html = html.replace(
    /(<meta property="og:description"[^>]*>)/,
    `$1\n    <meta property="article:published_time" content="${dates.published}">\n    <meta property="article:modified_time" content="${dates.modified}">`,
  );

  const publishedText = italianDate(dates.published);
  const modifiedText = italianDate(dates.modified);
  const visibleDate = dates.published === dates.modified
    ? `Pubblicato il <time datetime="${dates.published}">${publishedText}</time>`
    : `Pubblicato il <time datetime="${dates.published}">${publishedText}</time> · Aggiornato il <time datetime="${dates.modified}">${modifiedText}</time>`;

  html = html.replace(
    /(<p class="article-meta">[\s\S]*?<\/p>)/,
    `$1\n        <p class="article-dates">${visibleDate}</p>`,
  );
  html = html.replace("  </head>", `${articleSchema({ canonical, description, modified: dates.modified, published: dates.published, section, title })}  </head>`);
  return html;
}

const files = walk(ROOT);
for (const file of files) {
  const relPath = relative(ROOT, file).replaceAll("\\", "/");
  const prefix = prefixFor(relPath);
  let html = readFileSync(file, "utf8");

  if (!html.includes(`${prefix}chi-sono.html`)) {
    html = html.replace(
      new RegExp(`(<a href="${prefix.replace("../", "\\.\\./")}newsletter\\.html"[^>]*>Newsletter<\\/a>)`),
      `$1\n        <a href="${prefix}chi-sono.html">Chi sono</a>`,
    );
  }
  html = html.replace(
    /<nav class="footer-nav" aria-label="Link utili">[\s\S]*?<\/nav>/,
    footer(prefix),
  );
  html = addCommonMetadata(html);
  if (relPath.startsWith("articoli/")) html = updateArticle(html, relPath);
  writeFileSync(file, html);
}

const publicFiles = files
  .map((file) => relative(ROOT, file).replaceAll("\\", "/"))
  .filter((path) => {
    const html = readFileSync(resolve(ROOT, path), "utf8");
    return !/<meta name="robots" content="[^"]*noindex/i.test(html);
  })
  .sort((a, b) => {
    const priority = ["index.html", "manifesto.html", "chi-sono.html", "articoli.html", "percorso.html", "newsletter.html", "fonti.html", "contatti.html", "privacy.html"];
    const ai = priority.indexOf(a);
    const bi = priority.indexOf(b);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    return a.localeCompare(b, "it");
  });

const committedLastmods = sitemapLastmods(headVersion("sitemap.xml"));

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...publicFiles.flatMap((path) => {
    const loc = path === "index.html" ? "https://crescere-insieme.com/" : `https://crescere-insieme.com/${path}`;
    const currentHtml = readFileSync(resolve(ROOT, path), "utf8");
    const committedHtml = headVersion(path);
    const contentChanged = !committedHtml || mainContent(currentHtml) !== mainContent(committedHtml);
    const modified = contentChanged
      ? TODAY
      : committedLastmods.get(loc) || gitDates(path).modified;
    return ["  <url>", `    <loc>${loc}</loc>`, `    <lastmod>${modified}</lastmod>`, "  </url>"];
  }),
  "</urlset>",
  "",
].join("\n");

writeFileSync(resolve(ROOT, "sitemap.xml"), sitemap);
console.log(`Aggiornate ${files.length} pagine HTML e sitemap.xml.`);
