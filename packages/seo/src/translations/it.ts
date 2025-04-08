// Italian translations in Yoast's expected format
export default {
  '': {
    domain: 'wordpress-seo',
    lang: 'it_IT',
    plural_forms: 'nplurals=2; plural=(n != 1);',
  },
  // Basic vocabulary
  word: ['parola'],
  words: ['parole'],
  character: ['carattere'],
  characters: ['caratteri'],

  // Text length translations (from TextLengthAssessment)
  '%2$sText length%3$s: The text contains %1$d %4$s. Good job!': [
    '%2$sLunghezza del testo%3$s: Il testo contiene %1$d %4$s. Ben fatto!',
  ],
  '%2$sText length%4$s: The text contains %1$d %6$s. This is slightly below the recommended minimum of %5$d %6$s. %3$sAdd a bit more copy%4$s.':
    [
      "%2$sLunghezza del testo%4$s: Il testo contiene %1$d %6$s. È leggermente al di sotto del minimo consigliato di %5$d %6$s. %3$sAggiungi un po' più di contenuto%4$s.",
    ],
  '%2$sText length%4$s: The text contains %1$d %6$s. This is below the recommended minimum of %5$d %6$s. %3$sAdd more content%4$s.':
    [
      '%2$sLunghezza del testo%4$s: Il testo contiene %1$d %6$s. È al di sotto del minimo consigliato di %5$d %6$s. %3$sAggiungi più contenuto%4$s.',
    ],
  '%2$sText length%4$s: The text contains %1$d %6$s. This is far below the recommended minimum of %5$d %7$s. %3$sAdd more content%4$s.':
    [
      '%2$sLunghezza del testo%4$s: Il testo contiene %1$d %6$s. È molto al di sotto del minimo consigliato di %5$d %7$s. %3$sAggiungi più contenuto%4$s.',
      '%2$sLunghezza del testo%4$s: Il testo contiene %1$d %6$s. È molto al di sotto del minimo consigliato di %5$d %7$s. %3$sAggiungi più contenuto%4$s.',
    ],
  '%1$sText length%3$s: %2$sPlease add some content%3$s.': [
    '%1$sLunghezza del testo%3$s: %2$sAggiungi del contenuto%3$s.',
  ],

  // Image count translations (confirmed working)
  '%1$sImages%3$s: No images appear on this page. %2$sAdd some%3$s!': [
    '%1$sImmagini%3$s: Non ci sono immagini in questa pagina. %2$sAggiungine alcune%3$s!',
  ],
  '%1$sImages%2$s: Good job!': ['%1$sImmagini%2$s: Ben fatto!'],

  // SUBHEADING DISTRIBUTION TRANSLATIONS
  '%1$sSubheading distribution%2$s: Great job!': [
    '%1$sDistribuzione dei sottotitoli%2$s: Ottimo lavoro!',
  ],
  '%1$sSubheading distribution%2$s: You are not using any subheadings, although your text is rather long. %3$sTry and add some subheadings%2$s.':
    [
      '%1$sDistribuzione dei sottotitoli%2$s: Non stai utilizzando sottotitoli, anche se il tuo testo è piuttosto lungo. %3$sProva ad aggiungere alcuni sottotitoli%2$s.',
    ],
  "%1$sSubheading distribution%2$s: You are not using any subheadings, but your text is short enough and probably doesn't need them.":
    [
      '%1$sDistribuzione dei sottotitoli%2$s: Non stai utilizzando sottotitoli, ma il tuo testo è abbastanza breve e probabilmente non ne ha bisogno.',
    ],
  '%1$sSubheading distribution%2$s: The beginning of your text is longer than %4$s %5$s and is not separated by any subheadings. %3$sAdd subheadings to improve readability.%2$s':
    [
      "%1$sDistribuzione dei sottotitoli%2$s: L'inizio del tuo testo è più lungo di %4$s %5$s e non è separato da sottotitoli. %3$sAggiungi sottotitoli per migliorare la leggibilità.%2$s",
    ],
  '%1$sSubheading distribution%2$s: %3$d section of your text is longer than %4$d %6$s and is not separated by any subheadings. %5$sAdd subheadings to improve readability%2$s.':
    [
      '%1$sDistribuzione dei sottotitoli%2$s: %3$d sezione del tuo testo è più lunga di %4$d %6$s e non è separata da sottotitoli. %5$sAggiungi sottotitoli per migliorare la leggibilità%2$s.',
      '%1$sDistribuzione dei sottotitoli%2$s: %3$d sezioni del tuo testo sono più lunghe di %4$d %6$s e non sono separate da sottotitoli. %5$sAggiungi sottotitoli per migliorare la leggibilità%2$s.',
    ],

  // OUTBOUND LINKS TRANSLATIONS
  '%1$sOutbound links%3$s: No outbound links appear in this page. %2$sAdd some%3$s!':
    [
      '%1$sLink esterni%3$s: Non ci sono link esterni in questa pagina. %2$sAggiungine alcuni%3$s!',
    ],
  '%1$sOutbound links%3$s: All outbound links on this page are nofollowed. %2$sAdd some normal links%3$s.':
    [
      '%1$sLink esterni%3$s: Tutti i link esterni in questa pagina sono nofollow. %2$sAggiungi alcuni link normali%3$s.',
    ],
  '%1$sOutbound links%2$s: Good job!': ['%1$sLink esterni%2$s: Ben fatto!'],
  '%1$sOutbound links%2$s: There are both nofollowed and normal outbound links on this page. Good job!':
    [
      '%1$sLink esterni%2$s: Ci sono sia link nofollow che normali in questa pagina. Ben fatto!',
    ],

  // INTERNAL LINKS TRANSLATIONS
  '%1$sInternal links%3$s: No internal links appear in this page, %2$smake sure to add some%3$s!':
    [
      '%1$sLink interni%3$s: Non ci sono link interni in questa pagina, %2$sassicurati di aggiungerne alcuni%3$s!',
    ],
  '%1$sInternal links%3$s: The internal links in this page are all nofollowed. %2$sAdd some good internal links%3$s.':
    [
      '%1$sLink interni%3$s: I link interni in questa pagina sono tutti nofollow. %2$sAggiungi alcuni buoni link interni%3$s.',
    ],
  '%1$sInternal links%2$s: You have enough internal links. Good job!': [
    '%1$sLink interni%2$s: Hai abbastanza link interni. Ben fatto!',
  ],
  '%1$sInternal links%2$s: There are both nofollowed and normal internal links on this page. Good job!':
    [
      '%1$sLink interni%2$s: Ci sono sia link nofollow che normali in questa pagina. Ben fatto!',
    ],

  // META DESCRIPTION TRANSLATIONS
  'meta description': ['meta descrizione'],

  '%1$sMeta description length%3$s:  No meta description has been specified. Search engines will display copy from the page instead. %2$sMake sure to write one%3$s!':
    [
      '%1$sLunghezza meta descrizione%3$s: Non è stata specificata alcuna meta descrizione. I motori di ricerca mostreranno il testo della pagina. %2$sAssicurati di scriverne una%3$s!',
    ],

  '%1$sMeta description length%3$s: The meta description is too short (under %4$d characters). Up to %5$d characters are available. %2$sUse the space%3$s!':
    [
      '%1$sLunghezza meta descrizione%3$s: La meta descrizione è troppo breve (meno di %4$d caratteri). Sono disponibili fino a %5$d caratteri. %2$sUsa lo spazio%3$s!',
    ],

  '%1$sMeta description length%3$s: The meta description is over %4$d characters. To ensure the entire description will be visible, %2$syou should reduce the length%3$s!':
    [
      "%1$sLunghezza meta descrizione%3$s: La meta descrizione supera i %4$d caratteri. Per garantire che l'intera descrizione sia visibile, %2$sdovresti ridurne la lunghezza%3$s!",
    ],

  '%1$sMeta description length%2$s: Well done!': [
    '%1$sLunghezza meta descrizione%2$s: Ben fatto!',
  ],

  // SEO TITLE WIDTH TRANSLATIONS
  'SEO title': ['titolo SEO'],
  '%1$sSEO title width%3$s: %2$sPlease create an SEO title%3$s.': [
    '%1$sLarghezza titolo SEO%3$s: %2$sCrea un titolo SEO%3$s.',
  ],
  '%1$sSEO title width%3$s: The SEO title is too short. %2$sUse the space to add keyphrase variations or create compelling call-to-action copy%3$s.':
    [
      "%1$sLarghezza titolo SEO%3$s: Il titolo SEO è troppo breve. %2$sUsa lo spazio per aggiungere variazioni della parola chiave o creare un invito all'azione convincente%3$s.",
    ],
  '%1$sSEO title width%2$s: Good job!': [
    '%1$sLarghezza titolo SEO%2$s: Ben fatto!',
  ],
  '%1$sSEO title width%3$s: The SEO title is wider than the viewable limit. %2$sTry to make it shorter%3$s.':
    [
      '%1$sLarghezza titolo SEO%3$s: Il titolo SEO supera il limite visibile. %2$sProva ad accorciarlo%3$s.',
    ],

  // SINGLE H1
  "%1$sSingle title%3$s: H1s should only be used as your main title. Find all H1s in your text that aren't your main title and %2$schange them to a lower heading level%3$s!":
    [
      '%1$sTitolo singolo%3$s: Gli H1 dovrebbero essere usati solo come titolo principale. Trova tutti gli H1 nel tuo testo che non sono il titolo principale e %2$scambiali con un livello di intestazione inferiore%3$s!',
    ],
} as const;
