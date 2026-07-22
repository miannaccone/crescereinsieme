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

## Materiali pronti

- `conferma-iscrizione-brevo.html`: email con il pulsante double opt-in.
- `benvenuto-brevo.html`: email automatica inviata dopo la conferma.
- `01-prima-di-aiutare-aspetta-brevo.html`: prima campagna editoriale.
- `piano-prime-7-uscite.md`: ordine e fonti da verificare per la prima settimana.

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

## Collaudo prima del primo invio pubblico

Stato tecnico gia verificato:

- mittente `Crescere insieme <ciao@crescere-insieme.com>` verificato;
- dominio autenticato con DKIM e DMARC;
- modulo Brevo pubblicato in `newsletter.html`;
- pagine di attesa e conferma raggiungibili sul dominio;
- informativa privacy e contatti presenti sul sito.

Passaggi da completare nel pannello Brevo:

1. Impostare il reindirizzamento dopo l'invio del modulo su
   `https://crescere-insieme.com/newsletter-controlla-email.html`.
2. Attivare il double opt-in e importare `conferma-iscrizione-brevo.html` come
   messaggio di conferma.
3. Impostare il reindirizzamento successivo alla conferma su
   `https://crescere-insieme.com/newsletter-confermata.html`.
4. Importare `benvenuto-brevo.html` e attivarlo solo per i contatti confermati.
5. Provare iscrizione, conferma, benvenuto e cancellazione con un indirizzo di test.
6. Inviare `01-prima-di-aiutare-aspetta-brevo.html` come test a Gmail, Outlook e
   a uno smartphone prima della campagna pubblica.

Il test deve produrre un solo contatto confermato nella lista, mostrare correttamente
i link di conferma e cancellazione e non generare errori o pagine vuote.

## Misure iniziali

Per le prime uscite osservare pochi dati:

- iscrizioni confermate rispetto ai moduli inviati;
- consegna e rimbalzi;
- cancellazioni e segnalazioni spam;
- clic sull'unico approfondimento proposto nell'email.

Le aperture possono essere un segnale imperfetto per effetto delle protezioni privacy dei client di posta.
Non cambiare tono o frequenza sulla base di una sola uscita.

Non inserire password, chiavi API o credenziali nei file del repository.
