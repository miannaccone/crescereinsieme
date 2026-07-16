# Configurazione newsletter Brevo

Questa cartella contiene i modelli HTML da importare in Brevo. Non collegare queste
pagine dalla navigazione del sito: sono file tecnici, esclusi dalla sitemap.

## Impostazioni consigliate

- Mittente: `Crescere insieme`
- Indirizzo mittente: `ciao@crescere-insieme.com`
- Rispondi a: `ciao@crescere-insieme.com`
- Lista: `Newsletter Crescere insieme`
- Modulo: solo campo email obbligatorio
- Conferma: double opt-in
- Frequenza iniziale: una email al giorno, con possibilita di ridurla in seguito

Non chiedere nome, data di nascita dei figli o altre informazioni non necessarie.

## Flusso double opt-in

1. Dopo l'invio del modulo, reindirizzare a:
   `https://crescere-insieme.com/newsletter-controlla-email.html`
2. Come email di conferma usare `conferma-iscrizione-brevo.html`.
3. Il pulsante contiene il segnaposto Brevo `{{ doubleoptin }}`: non sostituirlo con
   un URL fisso.
4. Dopo il clic di conferma, reindirizzare a:
   `https://crescere-insieme.com/newsletter-confermata.html`
5. Come email finale o automazione di benvenuto usare `benvenuto-brevo.html`.
6. Mantenere il segnaposto `{{ unsubscribe }}` in ogni newsletter inviata.

## Testo consenso nel modulo

> Desidero ricevere via email la newsletter Crescere insieme. Posso annullare
> l'iscrizione in qualsiasi momento. Ho letto l'informativa privacy.

Collegare `informativa privacy` a:
`https://crescere-insieme.com/privacy.html`.

## Prima dell'apertura

1. Creare e verificare la casella pubblica sul dominio.
2. Autenticare il dominio in Brevo aggiungendo al DNS solo i record forniti da
   Brevo (codice Brevo, DKIM e DMARC). Non modificare i record A/CNAME di GitHub
   Pages e non sostituire i record MX della posta esistente.
3. Inviare test a Gmail, Outlook e a uno smartphone.
4. Provare iscrizione, conferma, benvenuto e cancellazione con un indirizzo di test.
5. Aggiornare `privacy.html`, `contatti.html` e il blocco
   `NEWSLETTER_FORM` in `newsletter.html` prima di raccogliere indirizzi reali.

Non inserire password, chiavi API o credenziali nei file del repository.
