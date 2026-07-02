(function () {
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    return;
  }

  const pickItalianVoice = () => {
    const voices = speechSynthesis.getVoices();
    return voices.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith("it")) || null;
  };

  const cleanText = (text) => text.replace(/\s+/g, " ").trim();

  const collectArticleText = (article, options) => {
    const includeSources = options && options.includeSources;
    const selector = includeSources
      ? "h1, p, blockquote, .callout h2, .callout p, .source-note"
      : "h1, p, blockquote, .callout h2, .callout p";
    const nodes = article.querySelectorAll(selector);
    const parts = [];
    nodes.forEach((node) => {
      if (node.closest("[data-tts]") || node.classList.contains("article-meta") || node.classList.contains("back-link")) {
        return;
      }
      const text = cleanText(node.textContent);
      if (text) {
        parts.push(text);
      }
    });
    return parts.join(". ");
  };

  const splitIntoChunks = (text) => {
    const maxLength = 850;
    const sentences = cleanText(text).split(/(?<=[.!?])\s+/);
    const chunks = [];
    let current = "";

    sentences.forEach((sentence) => {
      if (!sentence) {
        return;
      }
      if ((current + " " + sentence).trim().length > maxLength && current) {
        chunks.push(current);
        current = sentence;
      } else {
        current = (current + " " + sentence).trim();
      }
    });

    if (current) {
      chunks.push(current);
    }
    return chunks;
  };

  const createReader = (config) => {
    const player = config.player;
    const toggleBtn = player.querySelector("[data-tts-toggle]");
    const stopBtn = player.querySelector("[data-tts-stop]");
    const icon = player.querySelector("[data-tts-icon]");
    const label = player.querySelector("[data-tts-label]");
    const status = player.querySelector("[data-tts-status]");
    let state = "idle";
    let queue = [];
    let queueIndex = 0;
    let sessionId = 0;

    const setStatus = (text) => {
      if (status) {
        status.textContent = text || "";
      }
    };

    const setState = (next) => {
      state = next;
      if (state === "loading") {
        icon.textContent = "…";
        label.textContent = config.loadingLabel || "Preparo la lettura";
      } else if (state === "playing") {
        icon.textContent = "⏸";
        label.textContent = "Metti in pausa";
      } else if (state === "paused") {
        icon.textContent = "▶";
        label.textContent = "Riprendi l'ascolto";
      } else {
        icon.textContent = "▶";
        label.textContent = config.idleLabel;
      }

      if (stopBtn) {
        stopBtn.hidden = state === "idle" || state === "loading";
      }
    };

    const finish = (message) => {
      sessionId += 1;
      speechSynthesis.cancel();
      queue = [];
      queueIndex = 0;
      setState("idle");
      setStatus(message || "");
    };

    const speakNext = () => {
      const currentSession = sessionId;
      if (queueIndex >= queue.length) {
        finish(config.doneLabel || "");
        return;
      }

      const item = queue[queueIndex];
      queueIndex += 1;
      setStatus(item.status || "");

      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = "it-IT";
      const voice = pickItalianVoice();
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = 0.98;
      utterance.onend = () => {
        if (currentSession === sessionId) {
          speakNext();
        }
      };
      utterance.onerror = () => {
        if (currentSession === sessionId) {
          finish("Lettura interrotta.");
        }
      };
      speechSynthesis.speak(utterance);
      setState("playing");
    };

    const start = async () => {
      sessionId += 1;
      speechSynthesis.cancel();
      setState("loading");
      setStatus(config.loadingStatus || "");

      try {
        queue = await config.getQueue();
      } catch (error) {
        finish("Non riesco a preparare la lettura.");
        return;
      }

      queueIndex = 0;
      if (!queue.length) {
        finish("Nessun testo da leggere.");
        return;
      }
      speakNext();
    };

    toggleBtn.addEventListener("click", () => {
      if (state === "idle") {
        start();
      } else if (state === "playing") {
        speechSynthesis.pause();
        setState("paused");
      } else if (state === "paused") {
        speechSynthesis.resume();
        setState("playing");
      }
    });

    if (stopBtn) {
      stopBtn.addEventListener("click", () => finish("Lettura fermata."));
    }

    player.hidden = false;
  };

  const article = document.querySelector(".article");
  const articlePlayer = article ? article.querySelector("[data-tts]") : null;
  if (article && articlePlayer) {
    const fullText = collectArticleText(article, { includeSources: true });
    if (fullText) {
      createReader({
        player: articlePlayer,
        idleLabel: "Ascolta l'articolo",
        doneLabel: "",
        getQueue: async () => splitIntoChunks(fullText).map((text) => ({ text, status: "" }))
      });
    }
  }

  const archivePlayer = document.querySelector("[data-tts-archive]");
  if (archivePlayer) {
    createReader({
      player: archivePlayer,
      idleLabel: "Leggi tutti gli articoli",
      loadingLabel: "Preparo gli articoli",
      loadingStatus: "Carico gli articoli in ordine dal più recente.",
      doneLabel: "Lettura completata.",
      getQueue: async () => {
        const links = Array.from(document.querySelectorAll(".article-category .article-list .article-preview[href^='articoli/']"));
        const parser = new DOMParser();
        const queue = [];

        for (let index = 0; index < links.length; index += 1) {
          const link = links[index];
          const response = await fetch(link.href);
          if (!response.ok) {
            continue;
          }
          const html = await response.text();
          const doc = parser.parseFromString(html, "text/html");
          const fetchedArticle = doc.querySelector(".article");
          if (!fetchedArticle) {
            continue;
          }
          const title = cleanText(fetchedArticle.querySelector("h1")?.textContent || link.textContent);
          const text = collectArticleText(fetchedArticle, { includeSources: false });
          splitIntoChunks(text).forEach((chunk) => {
            queue.push({
              text: chunk,
              status: `Sto leggendo: ${title} (${index + 1}/${links.length})`
            });
          });
        }

        return queue;
      }
    });
  }

  window.addEventListener("pagehide", () => {
    speechSynthesis.cancel();
  });

  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
      pickItalianVoice();
    };
  }
})();
