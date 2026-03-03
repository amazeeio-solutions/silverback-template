export default {
  '': {
    domain: 'wordpress-seo',
    lang: 'de_DE',
    plural_forms: 'nplurals=2; plural=(n != 1);',
  },
  // Basic vocabulary
  word: ['Wort'],
  words: ['Wörter'],
  character: ['Zeichen'],
  characters: ['Zeichen'],

  // Text length translations (from TextLengthAssessment)
  '%2$sText length%3$s: The text contains %1$d %4$s. Good job!': [
    '%2$sTextlänge%3$s: Der Text enthält %1$d %4$s. Gut gemacht!',
  ],
  '%2$sText length%4$s: The text contains %1$d %6$s. This is slightly below the recommended minimum of %5$d %6$s. %3$sAdd a bit more copy%4$s.':
    [
      '%2$sTextlänge%4$s: Der Text enthält %1$d %6$s. Dies liegt etwas unter dem empfohlenen Minimum von %5$d %6$s. %3$sFügen Sie etwas mehr Text hinzu%4$s.',
    ],
  '%2$sText length%4$s: The text contains %1$d %6$s. This is below the recommended minimum of %5$d %6$s. %3$sAdd more content%4$s.':
    [
      '%2$sTextlänge%4$s: Der Text enthält %1$d %6$s. Dies liegt unter dem empfohlenen Minimum von %5$d %6$s. %3$sFügen Sie mehr Inhalt hinzu%4$s.',
    ],
  '%2$sText length%4$s: The text contains %1$d %6$s. This is far below the recommended minimum of %5$d %7$s. %3$sAdd more content%4$s.':
    [
      '%2$sTextlänge%4$s: Der Text enthält %1$d %6$s. Dies liegt weit unter dem empfohlenen Minimum von %5$d %7$s. %3$sFügen Sie mehr Inhalt hinzu%4$s.',
      '%2$sTextlänge%4$s: Der Text enthält %1$d %6$s. Dies liegt weit unter dem empfohlenen Minimum von %5$d %7$s. %3$sFügen Sie mehr Inhalt hinzu%4$s.',
    ],
  '%1$sText length%3$s: %2$sPlease add some content%3$s.': [
    '%1$sTextlänge%3$s: %2$sBitte fügen Sie Inhalt hinzu%3$s.',
  ],

  // Image count translations (confirmed working)
  '%1$sImages%3$s: No images appear on this page. %2$sAdd some%3$s!': [
    '%1$sBilder%3$s: Auf dieser Seite erscheinen keine Bilder. %2$sFügen Sie welche hinzu%3$s!',
  ],
  '%1$sImages%2$s: Good job!': ['%1$sBilder%2$s: Gut gemacht!'],

  // SUBHEADING DISTRIBUTION TRANSLATIONS
  '%1$sSubheading distribution%2$s: Great job!': [
    '%1$sVerteilung der Zwischenüberschriften%2$s: Sehr gut!',
  ],
  '%1$sSubheading distribution%2$s: You are not using any subheadings, although your text is rather long. %3$sTry and add some subheadings%2$s.':
    [
      '%1$sVerteilung der Zwischenüberschriften%2$s: Sie verwenden keine Zwischenüberschriften, obwohl Ihr Text ziemlich lang ist. %3$sVersuchen Sie, einige Zwischenüberschriften hinzuzufügen%2$s.',
    ],
  "%1$sSubheading distribution%2$s: You are not using any subheadings, but your text is short enough and probably doesn't need them.":
    [
      '%1$sVerteilung der Zwischenüberschriften%2$s: Sie verwenden keine Zwischenüberschriften, aber Ihr Text ist kurz genug und braucht wahrscheinlich keine.',
    ],
  '%1$sSubheading distribution%2$s: The beginning of your text is longer than %4$s %5$s and is not separated by any subheadings. %3$sAdd subheadings to improve readability.%2$s':
    [
      '%1$sVerteilung der Zwischenüberschriften%2$s: Der Anfang Ihres Textes ist länger als %4$s %5$s und wird nicht durch Zwischenüberschriften gegliedert. %3$sFügen Sie Zwischenüberschriften hinzu, um die Lesbarkeit zu verbessern.%2$s',
    ],
  '%1$sSubheading distribution%2$s: %3$d section of your text is longer than %4$d %6$s and is not separated by any subheadings. %5$sAdd subheadings to improve readability%2$s.':
    [
      '%1$sVerteilung der Zwischenüberschriften%2$s: %3$d Abschnitt Ihres Textes ist länger als %4$d %6$s und wird nicht durch Zwischenüberschriften gegliedert. %5$sFügen Sie Zwischenüberschriften hinzu, um die Lesbarkeit zu verbessern%2$s.',
      '%1$sVerteilung der Zwischenüberschriften%2$s: %3$d Abschnitte Ihres Textes sind länger als %4$d %6$s und werden nicht durch Zwischenüberschriften gegliedert. %5$sFügen Sie Zwischenüberschriften hinzu, um die Lesbarkeit zu verbessern%2$s.',
    ],

  // OUTBOUND LINKS TRANSLATIONS
  '%1$sOutbound links%3$s: No outbound links appear in this page. %2$sAdd some%3$s!':
    [
      '%1$sExterne Links%3$s: Auf dieser Seite erscheinen keine externen Links. %2$sFügen Sie einige hinzu%3$s!',
    ],
  '%1$sOutbound links%3$s: All outbound links on this page are nofollowed. %2$sAdd some normal links%3$s.':
    [
      '%1$sExterne Links%3$s: Alle externen Links auf dieser Seite sind mit Nofollow versehen. %2$sFügen Sie einige normale Links hinzu%3$s.',
    ],
  '%1$sOutbound links%2$s: Good job!': ['%1$sExterne Links%2$s: Gut gemacht!'],
  '%1$sOutbound links%2$s: There are both nofollowed and normal outbound links on this page. Good job!':
    [
      '%1$sExterne Links%2$s: Es gibt sowohl Nofollow als auch normale externe Links auf dieser Seite. Gut gemacht!',
    ],

  // INTERNAL LINKS TRANSLATIONS
  '%1$sInternal links%3$s: No internal links appear in this page, %2$smake sure to add some%3$s!':
    [
      '%1$sInterne Links%3$s: Auf dieser Seite erscheinen keine internen Links, %2$sstellen Sie sicher, dass Sie einige hinzufügen%3$s!',
    ],
  '%1$sInternal links%3$s: The internal links in this page are all nofollowed. %2$sAdd some good internal links%3$s.':
    [
      '%1$sInterne Links%3$s: Die internen Links auf dieser Seite sind alle mit Nofollow versehen. %2$sFügen Sie einige gute interne Links hinzu%3$s.',
    ],
  '%1$sInternal links%2$s: You have enough internal links. Good job!': [
    '%1$sInterne Links%2$s: Sie haben genügend interne Links. Gut gemacht!',
  ],
  '%1$sInternal links%2$s: There are both nofollowed and normal internal links on this page. Good job!':
    [
      '%1$sInterne Links%2$s: Es gibt sowohl Nofollow als auch normale interne Links auf dieser Seite. Gut gemacht!',
    ],

  // META DESCRIPTION TRANSLATIONS
  'meta description': ['Meta-Beschreibung'],

  '%1$sMeta description length%3$s:  No meta description has been specified. Search engines will display copy from the page instead. %2$sMake sure to write one%3$s!':
    [
      '%1$sLänge der Meta-Beschreibung%3$s:  Es wurde keine Meta-Beschreibung angegeben. Suchmaschinen werden stattdessen Text von der Seite anzeigen. %2$sAchten Sie darauf, eine zu schreiben%3$s!',
    ],

  '%1$sMeta description length%3$s: The meta description is too short (under %4$d characters). Up to %5$d characters are available. %2$sUse the space%3$s!':
    [
      '%1$sLänge der Meta-Beschreibung%3$s: Die Meta-Beschreibung ist zu kurz (unter %4$d Zeichen). Bis zu %5$d Zeichen sind verfügbar. %2$sNutzen Sie den Platz%3$s!',
    ],

  '%1$sMeta description length%3$s: The meta description is over %4$d characters. To ensure the entire description will be visible, %2$syou should reduce the length%3$s!':
    [
      '%1$sLänge der Meta-Beschreibung%3$s: Die Meta-Beschreibung ist länger als %4$d Zeichen. Damit die gesamte Beschreibung sichtbar ist, %2$ssollten Sie die Länge reduzieren%3$s!',
    ],

  '%1$sMeta description length%2$s: Well done!': [
    '%1$sLänge der Meta-Beschreibung%2$s: Gut gemacht!',
  ],

  // SEO TITLE WIDTH TRANSLATIONS
  'SEO title': ['SEO-Titel'],
  '%1$sSEO title width%3$s: %2$sPlease create an SEO title%3$s.': [
    '%1$sSEO-Titelbreite%3$s: %2$sBitte erstellen Sie einen SEO-Titel%3$s.',
  ],
  '%1$sSEO title width%3$s: The SEO title is too short. %2$sUse the space to add keyphrase variations or create compelling call-to-action copy%3$s.':
    [
      '%1$sSEO-Titelbreite%3$s: Der SEO-Titel ist zu kurz. %2$sNutzen Sie den Platz, um Keyword-Variationen hinzuzufügen oder einen überzeugenden Call-to-Action zu erstellen%3$s.',
    ],
  '%1$sSEO title width%2$s: Good job!': [
    '%1$sSEO-Titelbreite%2$s: Gut gemacht!',
  ],
  '%1$sSEO title width%3$s: The SEO title is wider than the viewable limit. %2$sTry to make it shorter%3$s.':
    [
      '%1$sSEO-Titelbreite%3$s: Der SEO-Titel ist breiter als die sichtbare Grenze. %2$sVersuchen Sie, ihn kürzer zu machen%3$s.',
    ],

  // SINGLE H1
  "%1$sSingle title%3$s: H1s should only be used as your main title. Find all H1s in your text that aren't your main title and %2$schange them to a lower heading level%3$s!":
    [
      '%1$sEinziger Titel%3$s: H1 sollte nur als Haupttitel verwendet werden. Finden Sie alle H1-Überschriften in Ihrem Text, die nicht Ihr Haupttitel sind, und %2$sändern Sie sie in eine niedrigere Überschriftenebene%3$s!',
    ],
} as const;
