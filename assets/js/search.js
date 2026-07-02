(function () {
  const root = document.querySelector("[data-search]");
  if (!root) {
    return;
  }

  const input = root.querySelector("[data-search-input]");
  const clearButton = root.querySelector("[data-search-clear]");
  const status = root.querySelector("[data-search-status]");
  const list = document.querySelector("[data-search-list]");
  const emptyState = document.querySelector("[data-search-empty]");
  const articles = list ? Array.from(list.querySelectorAll(".article-preview")) : [];
  const revealButton = document.createElement("button");

  if (!input || !list || !articles.length) {
    return;
  }

  revealButton.className = "button";
  revealButton.type = "submit";
  revealButton.textContent = "Mostra risultati";
  revealButton.hidden = true;
  clearButton?.before(revealButton);

  const normalize = (value) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const entries = articles.map((article) => {
    const title = article.querySelector("h2")?.textContent || "";
    const meta = article.querySelector("span")?.textContent || "";
    const description = article.querySelector("p")?.textContent || "";
    const href = article.getAttribute("href") || "";
    const slugWords = href.replace(/^articoli\//, "").replace(/[-.]/g, " ");

    return {
      article,
      haystack: normalize(`${title} ${meta} ${description} ${slugWords}`)
    };
  });

  const updateStatus = (visible, query) => {
    if (!status) {
      return;
    }

    if (!query) {
      status.textContent = "Mostro tutti gli articoli.";
    } else if (visible === 1) {
      status.textContent = "1 articolo trovato. Premi Mostra risultati per leggerlo.";
    } else if (visible === 0) {
      status.textContent = "Nessun articolo trovato.";
    } else {
      status.textContent = `${visible} articoli trovati. Premi Mostra risultati per vederli.`;
    }
  };

  const revealResults = () => {
    const firstVisible = entries.find(({ article }) => !article.hidden)?.article;
    const target = firstVisible || emptyState || list;

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    if (firstVisible) {
      firstVisible.focus({ preventScroll: true });
    }
  };

  const applySearch = ({ reveal = false } = {}) => {
    const query = normalize(input.value);
    const terms = query ? query.split(" ") : [];
    let visible = 0;

    entries.forEach(({ article, haystack }) => {
      const matches = terms.every((term) => haystack.includes(term));
      article.hidden = !matches;
      if (matches) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }

    if (clearButton) {
      clearButton.hidden = !query;
    }

    revealButton.hidden = !query || visible === 0;
    updateStatus(visible, query);

    if (reveal) {
      revealResults();
    }
  };

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q");
  if (initialQuery) {
    input.value = initialQuery;
  }

  input.addEventListener("input", applySearch);

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      input.value = "";
      input.focus();
      applySearch();
    });
  }

  root.querySelector("[data-search-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    applySearch({ reveal: true });
  });

  applySearch();
})();
