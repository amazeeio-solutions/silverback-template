// French translations in Yoast's expected format
export default {
  '': {
    domain: 'wordpress-seo',
    lang: 'fr_FR',
    plural_forms: 'nplurals=2; plural=(n > 1);',
  },

  // Basic vocabulary
  word: ['mot'],
  words: ['mots'],
  character: ['caractère'],
  characters: ['caractères'],

  // Text length translations
  '%2$sText length%3$s: The text contains %1$d %4$s. Good job!': [
    '%2$sLongueur du texte%3$s: Le texte contient %1$d %4$s. Bon travail !',
  ],
  '%2$sText length%4$s: The text contains %1$d %6$s. This is slightly below the recommended minimum of %5$d %6$s. %3$sAdd a bit more copy%4$s.':
    [
      "%2$sLongueur du texte%4$s: Le texte contient %1$d %6$s. C'est légèrement en dessous du minimum recommandé de %5$d %6$s. %3$sAjoutez un peu plus de contenu%4$s.",
    ],
  '%2$sText length%4$s: The text contains %1$d %6$s. This is below the recommended minimum of %5$d %6$s. %3$sAdd more content%4$s.':
    [
      "%2$sLongueur du texte%4$s: Le texte contient %1$d %6$s. C'est en dessous du minimum recommandé de %5$d %6$s. %3$sAjoutez plus de contenu%4$s.",
    ],
  '%2$sText length%4$s: The text contains %1$d %6$s. This is far below the recommended minimum of %5$d %7$s. %3$sAdd more content%4$s.':
    [
      `%2$sLongueur du texte%4$s: Le texte contient %1$d %6$s. C'est bien en dessous du minimum recommandé de %5$d %7$s. %3$sAjoutez plus de contenu%4$s.`,
      `%2$sLongueur du texte%4$s: Le texte contient %1$d %6$s. C'est bien en dessous du minimum recommandé de %5$d %7$s. %3$sAjoutez plus de contenu%4$s.`,
    ],
  '%1$sText length%3$s: %2$sPlease add some content%3$s.': [
    '%1$sLongueur du texte%3$s: %2$sVeuillez ajouter du contenu%3$s.',
  ],

  // Image count translations
  '%1$sImages%3$s: No images appear on this page. %2$sAdd some%3$s!': [
    "%1$sImages%3$s: Aucune image n'apparaît sur cette page. %2$sAjoutez-en%3$s !",
  ],
  '%1$sImages%2$s: Good job!': ['%1$sImages%2$s: Bon travail !'],

  // SUBHEADING DISTRIBUTION TRANSLATIONS
  '%1$sSubheading distribution%2$s: Great job!': [
    '%1$sDistribution des sous-titres%2$s: Excellent !',
  ],
  '%1$sSubheading distribution%2$s: You are not using any subheadings, although your text is rather long. %3$sTry and add some subheadings%2$s.':
    [
      "%1$sDistribution des sous-titres%2$s: Vous n'utilisez pas de sous-titres, bien que votre texte soit assez long. %3$sEssayez d'ajouter quelques sous-titres%2$s.",
    ],
  "%1$sSubheading distribution%2$s: You are not using any subheadings, but your text is short enough and probably doesn't need them.":
    [
      "%1$sDistribution des sous-titres%2$s: Vous n'utilisez pas de sous-titres, mais votre texte est assez court et n'en a probablement pas besoin.",
    ],
  '%1$sSubheading distribution%2$s: The beginning of your text is longer than %4$s %5$s and is not separated by any subheadings. %3$sAdd subheadings to improve readability.%2$s':
    [
      "%1$sDistribution des sous-titres%2$s: Le début de votre texte est plus long que %4$s %5$s et n'est pas séparé par des sous-titres. %3$sAjoutez des sous-titres pour améliorer la lisibilité.%2$s",
    ],
  '%1$sSubheading distribution%2$s: %3$d section of your text is longer than %4$d %6$s and is not separated by any subheadings. %5$sAdd subheadings to improve readability%2$s.':
    [
      "%1$sDistribution des sous-titres%2$s: %3$d section de votre texte est plus longue que %4$d %6$s et n'est pas séparée par des sous-titres. %5$sAjoutez des sous-titres pour améliorer la lisibilité%2$s.",
      '%1$sDistribution des sous-titres%2$s: %3$d sections de votre texte sont plus longues que %4$d %6$s et ne sont pas séparées par des sous-titres. %5$sAjoutez des sous-titres pour améliorer la lisibilité%2$s.',
    ],

  // OUTBOUND LINKS TRANSLATIONS
  '%1$sOutbound links%3$s: No outbound links appear in this page. %2$sAdd some%3$s!':
    [
      "%1$sLiens sortants%3$s: Aucun lien sortant n'apparaît sur cette page. %2$sAjoutez-en%3$s !",
    ],
  '%1$sOutbound links%3$s: All outbound links on this page are nofollowed. %2$sAdd some normal links%3$s.':
    [
      '%1$sLiens sortants%3$s: Tous les liens sortants de cette page sont en nofollow. %2$sAjoutez des liens normaux%3$s.',
    ],
  '%1$sOutbound links%2$s: Good job!': [
    '%1$sLiens sortants%2$s: Bon travail !',
  ],
  '%1$sOutbound links%2$s: There are both nofollowed and normal outbound links on this page. Good job!':
    [
      '%1$sLiens sortants%2$s: Il y a à la fois des liens nofollow et normaux sur cette page. Bon travail !',
    ],

  // INTERNAL LINKS TRANSLATIONS
  '%1$sInternal links%3$s: No internal links appear in this page, %2$smake sure to add some%3$s!':
    [
      "%1$sLiens internes%3$s: Aucun lien interne n'apparaît sur cette page, %2$sn'oubliez pas d'en ajouter%3$s !",
    ],
  '%1$sInternal links%3$s: The internal links in this page are all nofollowed. %2$sAdd some good internal links%3$s.':
    [
      '%1$sLiens internes%3$s: Les liens internes de cette page sont tous en nofollow. %2$sAjoutez de bons liens internes%3$s.',
    ],
  '%1$sInternal links%2$s: You have enough internal links. Good job!': [
    '%1$sLiens internes%2$s: Vous avez suffisamment de liens internes. Bon travail !',
  ],
  '%1$sInternal links%2$s: There are both nofollowed and normal internal links on this page. Good job!':
    [
      '%1$sLiens internes%2$s: Il y a à la fois des liens nofollow et normaux sur cette page. Bon travail !',
    ],

  // META DESCRIPTION TRANSLATIONS
  'meta description': ['méta-description'],

  '%1$sMeta description length%3$s:  No meta description has been specified. Search engines will display copy from the page instead. %2$sMake sure to write one%3$s!':
    [
      "%1$sLongueur de la méta-description%3$s: Aucune méta-description n'a été spécifiée. Les moteurs de recherche afficheront du texte de la page à la place. %2$sAssurez-vous d'en écrire une%3$s !",
    ],

  '%1$sMeta description length%3$s: The meta description is too short (under %4$d characters). Up to %5$d characters are available. %2$sUse the space%3$s!':
    [
      "%1$sLongueur de la méta-description%3$s: La méta-description est trop courte (moins de %4$d caractères). Jusqu'à %5$d caractères sont disponibles. %2$sUtilisez l'espace disponible%3$s !",
    ],

  '%1$sMeta description length%3$s: The meta description is over %4$d characters. To ensure the entire description will be visible, %2$syou should reduce the length%3$s!':
    [
      '%1$sLongueur de la méta-description%3$s: La méta-description dépasse %4$d caractères. Pour garantir que toute la description soit visible, %2$svous devriez réduire sa longueur%3$s !',
    ],

  '%1$sMeta description length%2$s: Well done!': [
    '%1$sLongueur de la méta-description%2$s: Bien fait !',
  ],

  // SEO TITLE WIDTH TRANSLATIONS
  'SEO title': ['titre SEO'],
  '%1$sSEO title width%3$s: %2$sPlease create an SEO title%3$s.': [
    '%1$sLargeur du titre SEO%3$s: %2$sVeuillez créer un titre SEO%3$s.',
  ],
  '%1$sSEO title width%3$s: The SEO title is too short. %2$sUse the space to add keyphrase variations or create compelling call-to-action copy%3$s.':
    [
      "%1$sLargeur du titre SEO%3$s: Le titre SEO est trop court. %2$sUtilisez l'espace pour ajouter des variations de mots-clés ou créer un appel à l'action convaincant%3$s.",
    ],
  '%1$sSEO title width%2$s: Good job!': [
    '%1$sLargeur du titre SEO%2$s: Bon travail !',
  ],
  '%1$sSEO title width%3$s: The SEO title is wider than the viewable limit. %2$sTry to make it shorter%3$s.':
    [
      '%1$sLargeur du titre SEO%3$s: Le titre SEO dépasse la limite visible. %2$sEssayez de le raccourcir%3$s.',
    ],

  // SINGLE H1
  "%1$sSingle title%3$s: H1s should only be used as your main title. Find all H1s in your text that aren't your main title and %2$schange them to a lower heading level%3$s!":
    [
      '%1$sTitre unique%3$s: Les H1 ne doivent être utilisés que comme titre principal. Trouvez tous les H1 dans votre texte qui ne sont pas votre titre principal et %2$schangez-les en un niveau de titre inférieur%3$s !',
    ],
} as const;
