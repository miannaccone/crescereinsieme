(function () {
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    return;
  }

  const article = document.querySelector(".article");
  const player = article ? article.querySelector("[data-tts]") : null;
  if (!article || !player) {
    return;
  }

  const toggleBtn = player.querySelector("[data-tts-toggle]");
  const icon = player.querySelector("[data-tts-icon]");
  const label = player.querySelector("[data-tts-label]");

  const nodes = article.querySelectorAll("h1, p, blockquote, .callout h2, .callout p, .source-note");
  const parts = [];
  nodes.forEach((node) => {
    if (node.closest("[data-tts]") || node.classList.contains("article-meta")) {
      return;
    }
    const text = node.textContent.replace(/\s+/g, " ").trim();
    if (text) {
      parts.push(text);
    }
  });
  const fullText = parts.join(". ");
  if (!fullText) {
    return;
  }

  let state = "idle";

  const pickItalianVoice = () => {
    const voices = speechSynthesis.getVoices();
    return voices.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith("it")) || null;
  };

  const setState = (next) => {
    state = next;
    if (state === "playing") {
      icon.textContent = "⏸";
      label.textContent = "Metti in pausa";
    } else if (state === "paused") {
      icon.textContent = "▶";
      label.textContent = "Riprendi l'ascolto";
    } else {
      icon.textContent = "▶";
      label.textContent = "Ascolta l'articolo";
    }
  };

  const start = () => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = "it-IT";
    const voice = pickItalianVoice();
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = 0.98;
    utterance.onend = () => setState("idle");
    utterance.onerror = () => setState("idle");
    speechSynthesis.speak(utterance);
    setState("playing");
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

  window.addEventListener("pagehide", () => {
    speechSynthesis.cancel();
  });

  player.hidden = false;
})();
