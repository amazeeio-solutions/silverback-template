import gql from 'noop-tag';
import { expect, test } from 'vitest';

import { fetch } from '../lib.js';

test('Block: Teaser list', async () => {
  const result = await fetch(gql`
    {
      _loadDrupalPage(id: "87b412b9-09e6-4de4-be13-a97b64df74b8") {
        content {
          __typename
          ... on BlockTeaserList {
            layout
            buttonText
            staticContent {
              __typename
              ... on BlockTeaserItem {
                __typename
                content {
                  __typename
                  ... on CardItem {
                    id
                    path
                    title
                    hero {
                      lead
                      headline
                    }
                    teaserImage {
                      alt
                      source(width: 400, height: 300)
                    }
                  }
                }
              }
            }
            contentHubEnabled
            filters {
              title
              limit
            }
          }
        }
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "_loadDrupalPage": {
          "content": [
            {
              "__typename": "BlockTeaserList",
              "buttonText": null,
              "contentHubEnabled": null,
              "filters": {
                "limit": null,
                "title": null,
              },
              "layout": null,
              "staticContent": [
                {
                  "__typename": "BlockTeaserItem",
                  "content": {
                    "__typename": "DrupalPage",
                    "hero": {
                      "headline": "Block: Accordion",
                      "lead": "Block: Accordion",
                    },
                    "id": "a11aaeea-a71a-4ef0-a996-833c95767386",
                    "path": "/en/block-accordion",
                    "teaserImage": null,
                    "title": "Block: Accordion",
                  },
                },
                {
                  "__typename": "BlockTeaserItem",
                  "content": {
                    "__typename": "DrupalPage",
                    "hero": {
                      "headline": "Block: CTA",
                      "lead": "Block: CTA",
                    },
                    "id": "080b30e2-5a68-4390-9dec-0c7e850840a7",
                    "path": "/en/block-cta",
                    "teaserImage": null,
                    "title": "Block: CTA",
                  },
                },
                {
                  "__typename": "BlockTeaserItem",
                  "content": {
                    "__typename": "DrupalPage",
                    "hero": {
                      "headline": "Block: Conditional content",
                      "lead": "Block: Conditional content",
                    },
                    "id": "f14c6cb1-b052-4523-ad52-1fbfd32282ff",
                    "path": "/en/block-conditional-content",
                    "teaserImage": null,
                    "title": "Block: Conditional content",
                  },
                },
                {
                  "__typename": "BlockTeaserItem",
                  "content": {
                    "__typename": "DrupalPage",
                    "hero": {
                      "headline": "Block: Form",
                      "lead": "Block: Form",
                    },
                    "id": "69c06c93-0d3f-47e1-a5ee-ba697bd532c1",
                    "path": "/en/block-form",
                    "teaserImage": null,
                    "title": "Block: Form",
                  },
                },
              ],
            },
            {
              "__typename": "BlockTeaserList",
              "buttonText": null,
              "contentHubEnabled": null,
              "filters": {
                "limit": null,
                "title": null,
              },
              "layout": "CAROUSEL",
              "staticContent": [
                {
                  "__typename": "BlockTeaserItem",
                  "content": {
                    "__typename": "DrupalPage",
                    "hero": {
                      "headline": "Block: Accordion",
                      "lead": "Block: Accordion",
                    },
                    "id": "a11aaeea-a71a-4ef0-a996-833c95767386",
                    "path": "/en/block-accordion",
                    "teaserImage": null,
                    "title": "Block: Accordion",
                  },
                },
                {
                  "__typename": "BlockTeaserItem",
                  "content": {
                    "__typename": "DrupalPage",
                    "hero": {
                      "headline": "Block: CTA",
                      "lead": "Block: CTA",
                    },
                    "id": "080b30e2-5a68-4390-9dec-0c7e850840a7",
                    "path": "/en/block-cta",
                    "teaserImage": null,
                    "title": "Block: CTA",
                  },
                },
                {
                  "__typename": "BlockTeaserItem",
                  "content": {
                    "__typename": "DrupalPage",
                    "hero": {
                      "headline": "Block: Conditional content",
                      "lead": "Block: Conditional content",
                    },
                    "id": "f14c6cb1-b052-4523-ad52-1fbfd32282ff",
                    "path": "/en/block-conditional-content",
                    "teaserImage": null,
                    "title": "Block: Conditional content",
                  },
                },
                {
                  "__typename": "BlockTeaserItem",
                  "content": {
                    "__typename": "DrupalPage",
                    "hero": {
                      "headline": "Block: Form",
                      "lead": "Block: Form",
                    },
                    "id": "69c06c93-0d3f-47e1-a5ee-ba697bd532c1",
                    "path": "/en/block-form",
                    "teaserImage": null,
                    "title": "Block: Form",
                  },
                },
              ],
            },
          ],
        },
      },
    }
  `);
});

test('Block: Info Grid', async () => {
  const result = await fetch(gql`
    {
      _loadDrupalPage(id: "557b324d-2183-48e7-9054-6dc90e18beb1") {
        content {
          __typename
          ... on BlockInfoGrid {
            gridItems {
              icon
              infoGridContent {
                ... on BlockMarkup {
                  markup
                }
                ... on BlockCta {
                  url
                  icon
                  iconPosition
                  text
                  openInNewTab
                }
              }
            }
          }
        }
      }
    }
  `);

  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "_loadDrupalPage": {
          "content": [
            {
              "__typename": "BlockInfoGrid",
              "gridItems": [
                {
                  "icon": "EMAIL",
                  "infoGridContent": [
                    {
                      "markup": "
    <p>Some information here</p>
    ",
                    },
                  ],
                },
                {
                  "icon": "PHONE",
                  "infoGridContent": [
                    {
                      "markup": "
    <p>Some information here</p>
    ",
                    },
                  ],
                },
                {
                  "icon": "LIFE_RING",
                  "infoGridContent": [
                    {
                      "markup": "
    <p>Some information here</p>
    ",
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    }
  `);
});

test('Block: Accordion', async () => {
  const result = await fetch(gql`
    {
      _loadDrupalPage(id: "a11aaeea-a71a-4ef0-a996-833c95767386") {
        content {
          __typename
          ... on BlockAccordion {
            items {
              __typename
              ... on BlockAccordionItemText {
                __typename
                title
                icon
                textContent {
                  markup
                }
              }
            }
          }
        }
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "_loadDrupalPage": {
          "content": [
            {
              "__typename": "BlockAccordion",
              "items": [
                {
                  "__typename": "BlockAccordionItemText",
                  "icon": "checkmark",
                  "textContent": {
                    "markup": "
    <p>I am the content for title one.</p>

    <p>Lorem ipsum dolor sit amet consectetur adipiscing elit auctor, lectus nibh gravida platea euismod parturient vitae interdum senectus, laoreet litora mauris tempor risus curae inceptos. Morbi ut facilisi ullamcorper arcu dictum hac congue eros nunc, nisl nullam dictumst malesuada euismod primis fusce convallis tempor, sociosqu est dis cursus maecenas id felis dui. Vestibulum turpis scelerisque montes felis laoreet metus ligula tincidunt auctor tempus fusce fermentum, conubia habitant sapien hac sed semper cum cubilia nunc augue. Laoreet velit parturient fermentum penatibus sociosqu mollis auctor nascetur pellentesque et libero, ac nisl commodo posuere sagittis enim egestas placerat molestie curabitur. Dictumst laoreet commodo magnis feugiat sagittis platea felis est convallis, integer curae blandit sociis suspendisse maecenas potenti risus ridiculus, a tempor tellus pellentesque fermentum fames tincidunt scelerisque.</p>
    ",
                  },
                  "title": "Accordion Title One",
                },
                {
                  "__typename": "BlockAccordionItemText",
                  "icon": "questionmark",
                  "textContent": {
                    "markup": "
    <p><meta charset="utf-8">I am the content for title two.</p>

    <p>Lorem ipsum dolor sit amet consectetur adipiscing elit dis rutrum vestibulum congue est malesuada egestas vitae, at ante varius nec vulputate cubilia mauris cras auctor suscipit faucibus nisl dictumst. Pulvinar sociosqu parturient habitant himenaeos in volutpat nascetur magnis, iaculis varius at mi sollicitudin morbi ligula nec, diam per scelerisque risus elementum tempor vel. Velit montes quisque metus penatibus porttitor iaculis justo posuere, porta suspendisse sem nullam ante facilisis proin, neque sollicitudin dis himenaeos ligula morbi euismod. Volutpat tempus ultrices feugiat dictum senectus porta condimentum sodales, eros sociosqu libero risus suspendisse proin tortor, egestas ridiculus nostra platea commodo id torquent. Dis ultrices mollis hac tempor magna diam suscipit natoque odio et, tortor tellus enim litora eu felis ad volutpat cursus pharetra, nostra mus auctor inceptos metus mattis porta scelerisque magnis. Natoque iaculis nascetur pellentesque est arcu pharetra phasellus interdum, venenatis tempor proin dictum metus dapibus dis, tortor malesuada duis ad eu ullamcorper elementum. Metus odio dignissim dictum fames nec ut, faucibus porta placerat ullamcorper cum donec felis, tempor imperdiet scelerisque commodo himenaeos.</p>
    ",
                  },
                  "title": "Accordion Title Two",
                },
                {
                  "__typename": "BlockAccordionItemText",
                  "icon": "arrow",
                  "textContent": {
                    "markup": "
    <p><meta charset="utf-8">I am the content for title three.</p>

    <p>Lorem ipsum dolor sit amet consectetur adipiscing elit sodales, dictum massa scelerisque parturient sagittis rutrum taciti porttitor, in eleifend habitant habitasse enim placerat phasellus. Mus tempus euismod id donec facilisi imperdiet mollis, montes convallis cubilia per tristique faucibus, pellentesque quam interdum sagittis tellus ac. Sociis sapien imperdiet himenaeos mus ornare conubia hac molestie proin, etiam diam arcu eleifend euismod odio vivamus. Turpis nisl ad hac duis fusce phasellus nibh dictum integer purus arcu, donec sociosqu eu at tortor sapien scelerisque tempus gravida mattis, torquent praesent feugiat volutpat felis viverra pellentesque eget suscipit quisque.</p>
    ",
                  },
                  "title": "Accordion Title Three",
                },
                {
                  "__typename": "BlockAccordionItemText",
                  "icon": "",
                  "textContent": {
                    "markup": "
    <p><meta charset="utf-8"><meta charset="utf-8">I am the content for title four.</p>

    <p>Lorem ipsum dolor sit amet consectetur adipiscing elit justo habitant, platea laoreet hac suspendisse taciti euismod fermentum cras. Sed purus est varius nullam, sem magna ultricies viverra dui, class a vehicula. Leo enim dapibus malesuada feugiat dis dui placerat pretium, lacus taciti cum sociis diam tortor dictumst, libero vel venenatis turpis nisl dictum cursus. Auctor habitant duis vestibulum venenatis natoque a ligula, malesuada senectus integer tempus fames turpis. Nostra varius feugiat habitasse eget lacinia porttitor phasellus aliquet nascetur eu a semper maecenas conubia velit sagittis, euismod praesent justo nunc lectus pulvinar nullam egestas molestie pretium metus ullamcorper luctus tincidunt tellus. Accumsan dapibus per quisque malesuada sagittis leo montes erat, euismod nostra sem cras rhoncus turpis tempor placerat aptent, taciti cubilia lobortis pellentesque nulla lectus eleifend.</p>
    ",
                  },
                  "title": "Accordion Title Four",
                },
              ],
            },
          ],
        },
      },
    }
  `);
});

test('Block: Conditional content', async () => {
  const result = await fetch(gql`
    {
      _loadDrupalPage(id: "f14c6cb1-b052-4523-ad52-1fbfd32282ff") {
        content {
          __typename
          ... on BlockConditional {
            content {
              ... on BlockMarkup {
                markup
              }
            }
            displayFrom
            displayTo
          }
        }
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "_loadDrupalPage": {
          "content": [
            {
              "__typename": "BlockConditional",
              "content": [
                {
                  "markup": "
    <p>This content will only be shown for one year.</p>
    ",
                },
              ],
              "displayFrom": "2024-12-10T14:40:00.000Z",
              "displayTo": "2025-12-10T14:40:00.000Z",
            },
          ],
        },
      },
    }
  `);
});

test('Block: Image with Text', async () => {
  const result = await fetch(gql`
    {
      _loadDrupalPage(id: "4189dec1-3b09-4eec-b4d5-b7cc28eaeae3") {
        content {
          __typename
          ... on BlockImageWithText {
            image {
              __typename
              id
            }
            imagePosition
            textContent {
              __typename
              markup
            }
          }
        }
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "_loadDrupalPage": {
          "content": [
            {
              "__typename": "BlockImageWithText",
              "image": {
                "__typename": "MediaImage",
                "id": "3a0fe860-a6d6-428a-9474-365bd57509aa",
              },
              "imagePosition": "left",
              "textContent": {
                "__typename": "BlockMarkup",
                "markup": "
    <p>Image with text on the left</p>
    ",
              },
            },
            {
              "__typename": "BlockImageWithText",
              "image": {
                "__typename": "MediaImage",
                "id": "5dfc1856-e9e4-4f02-9cd6-9d888870ce1a",
              },
              "imagePosition": "right",
              "textContent": {
                "__typename": "BlockMarkup",
                "markup": "
    <p>Image with text on the right</p>
    ",
              },
            },
          ],
        },
      },
    }
  `);
});

test('Block: Image Teasers', async () => {
  const result = await fetch(gql`
    {
      _loadDrupalPage(id: "a23e5334-20fc-4c34-acba-bf3c8cb5fa40") {
        content {
          __typename
          ... on BlockImageTeasers {
            teasers {
              __typename
              image {
                __typename
                id
              }
              title
              ctaText
              ctaUrl
            }
          }
        }
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "_loadDrupalPage": {
          "content": [
            {
              "__typename": "BlockImageTeasers",
              "teasers": [
                {
                  "__typename": "BlockImageTeaser",
                  "ctaText": "Image One Teaser CTA",
                  "ctaUrl": "/",
                  "image": {
                    "__typename": "MediaImage",
                    "id": "3a0fe860-a6d6-428a-9474-365bd57509aa",
                  },
                  "title": "Image One Teaser Title",
                },
                {
                  "__typename": "BlockImageTeaser",
                  "ctaText": "Image Two Teaser CTA",
                  "ctaUrl": "/",
                  "image": {
                    "__typename": "MediaImage",
                    "id": "5dfc1856-e9e4-4f02-9cd6-9d888870ce1a",
                  },
                  "title": "Image Two Teaser Title",
                },
              ],
            },
          ],
        },
      },
    }
  `);
});

test('Block: Form', async () => {
  const result = await fetch(gql`
    {
      _loadDrupalPage(id: "69c06c93-0d3f-47e1-a5ee-ba697bd532c1") {
        content {
          __typename
          ... on BlockForm {
            url
          }
        }
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "_loadDrupalPage": {
          "content": [
            {
              "__typename": "BlockForm",
              "url": "http://127.0.0.1:8000/en/form/contact",
            },
            {
              "__typename": "BlockForm",
              "url": "http://127.0.0.1:8000/en/form/inquiry",
            },
            {
              "__typename": "BlockForm",
              "url": "http://127.0.0.1:8000/en/form/styling",
            },
          ],
        },
      },
    }
  `);
});

test('Block: Heading', async () => {
  const result = await fetch(gql`
    {
      _loadDrupalPage(id: "bdbcc2b9-2d33-4723-a6fc-35c5f56b1ab9") {
        content {
          __typename
          ... on BlockMarkup {
            markup
          }
        }
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "_loadDrupalPage": {
          "content": [
            {
              "__typename": "BlockMarkup",
              "markup": "
    <h2 class="wp-block-custom-heading">Heading two</h2>

    <h3 class="wp-block-custom-heading">Heading three</h3>

    <h4 class="wp-block-custom-heading">Heading four</h4>

    <h2 class="wp-block-custom-heading"><strong>Heading two - Bold</strong></h2>

    <h3 class="wp-block-custom-heading"><strong>Heading three - Bold</strong></h3>

    <h4 class="wp-block-custom-heading"><strong>Heading four - Bold</strong></h4>
    ",
            },
          ],
        },
      },
    }
  `);
});

test('Block: Media', async () => {
  const result = await fetch(gql`
    {
      _loadDrupalPage(id: "7f0f6893-c61d-4ecd-8b74-fb0a0d023ead") {
        content {
          __typename
          ... on BlockMedia {
            caption
            media {
              __typename
              ... on MediaImage {
                __typename
                id
              }
              ... on MediaVideo {
                __typename
                url
              }
            }
          }
        }
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "_loadDrupalPage": {
          "content": [
            {
              "__typename": "BlockMedia",
              "caption": "Media Image Caption",
              "media": {
                "__typename": "MediaImage",
                "id": "5dfc1856-e9e4-4f02-9cd6-9d888870ce1a",
              },
            },
          ],
        },
      },
    }
  `);
});

test('Block: Horizontal separator', async () => {
  const result = await fetch(gql`
    {
      _loadDrupalPage(id: "358dcf0d-0910-4d0b-acc8-5a20108b3f20") {
        content {
          __typename
          ... on BlockHorizontalSeparator {
            __typename
          }
        }
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "_loadDrupalPage": {
          "content": [
            {
              "__typename": "BlockHorizontalSeparator",
            },
            {
              "__typename": "BlockMarkup",
            },
            {
              "__typename": "BlockHorizontalSeparator",
            },
          ],
        },
      },
    }
  `);
});

test('Block: Quote', async () => {
  const result = await fetch(gql`
    {
      _loadDrupalPage(id: "54ee7380-a3c0-4c45-8305-933143dc2ff6") {
        content {
          __typename
          ... on BlockQuote {
            quote
            author
            role
            image {
              __typename
              id
            }
          }
        }
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "_loadDrupalPage": {
          "content": [
            {
              "__typename": "BlockQuote",
              "author": "Rose (Betty White)",
              "image": {
                "__typename": "MediaImage",
                "id": "5dfc1856-e9e4-4f02-9cd6-9d888870ce1a",
              },
              "quote": "My mother always used to say: The older you get, the better you get, unless you’re a banana.",
              "role": "TheGoldenGirls",
            },
          ],
        },
      },
    }
  `);
});

test('Block: Table', async () => {
  const result = await fetch(gql`
    {
      _loadDrupalPage(id: "71e7b043-3718-4d6a-a2c8-42fb03554800") {
        content {
          __typename
          ... on BlockMarkup {
            markup
          }
        }
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "_loadDrupalPage": {
          "content": [
            {
              "__typename": "BlockMarkup",
              "markup": "
    <figure class="wp-block-table"><table><tbody><tr><td>Col 1</td><td>Col 2</td><td>Col 3</td><td>Col 4</td></tr><tr><td>Row 1</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Row 2</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Row 3</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Row 4</td><td>-</td><td>-</td><td>-</td></tr></tbody></table><figcaption>Table Caption</figcaption></figure>

    <figure class="wp-block-table"><table class="has-fixed-layout"><tbody><tr><td>Col 1</td><td>Col 2</td><td>Col 3</td><td>Col 4</td></tr><tr><td>Row 1</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Row 2</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Row 3</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Row 4</td><td>-</td><td>-</td><td>-</td></tr></tbody></table><figcaption>Table Caption - Fixed width</figcaption></figure>

    <figure class="wp-block-table"><table><thead><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th><th>Header 4</th></tr></thead><tbody><tr><td>Col 1</td><td>Col 2</td><td>Col 3</td><td>Col 4</td></tr><tr><td>Row 1</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Row 2</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Row 3</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Row 4</td><td>-</td><td>-</td><td>-</td></tr></tbody></table><figcaption>Table Caption - Header Section</figcaption></figure>

    <figure class="wp-block-table"><table><tbody><tr><td>Col 1</td><td>Col 2</td><td>Col 3</td><td>Col 4</td></tr><tr><td>Row 1</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Row 2</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Row 3</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Row 4</td><td>-</td><td>-</td><td>-</td></tr></tbody><tfoot><tr><td>Footer 1</td><td>Footer 2</td><td>Footer 3</td><td>Footer 4</td></tr></tfoot></table><figcaption>Table Caption - Footer Section</figcaption></figure>
    ",
            },
          ],
        },
      },
    }
  `);
});
test('Block: List', async () => {
  const result = await fetch(gql`
    {
      _loadDrupalPage(id: "487b2750-bf2a-4b5d-a753-2942a63bb6a4") {
        content {
          __typename
          ... on BlockMarkup {
            markup
          }
        }
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "_loadDrupalPage": {
          "content": [
            {
              "__typename": "BlockMarkup",
              "markup": "
    <ul><li>Bullet Item 1</li><li>Bullet Item 2</li><li>Bullet Item 3</li></ul>

    <ul class="list-style--arrows"><li>Arrow Item 1</li><li>Arrow Item 2</li><li>Arrow Item 3</li></ul>

    <ul class="list-style--checkmarks"><li>Check Item 1</li><li>Check Item 2</li><li>Check Item 3</li></ul>

    <ul class="list-style--question-marks"><li>Question Item 1</li><li>Question Item 2</li><li>Question Item 3</li></ul>
    ",
            },
          ],
        },
      },
    }
  `);
});
test('Block: Paragraph', async () => {
  const result = await fetch(gql`
    {
      _loadDrupalPage(id: "67c21535-4851-4aea-b46e-c4eccd4e494a") {
        content {
          __typename
          ... on BlockMarkup {
            markup
          }
        }
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "_loadDrupalPage": {
          "content": [
            {
              "__typename": "BlockMarkup",
              "markup": "
    <p class="has-drop-cap">Lorem ipsum dolor sit amet consectetur, adipiscing elit nisi tincidunt urna, ligula viverra congue est. Netus congue bibendum fringilla risus nisl fermentum massa, eleifend venenatis lacus interdum elementum. Donec euismod venenatis ridiculus non risus porttitor magna mollis faucibus vel tincidunt, molestie lacus felis mi montes mauris placerat et sagittis vitae, sociosqu curabitur cursus iaculis quam dapibus sed mattis velit aptent. Vestibulum feugiat vel vitae venenatis vulputate ad nulla arcu eget in, magna pulvinar sem primis auctor erat justo scelerisque.</p>

    <p>Pharetra magna condimentum per est aliquet in blandit metus, magnis iaculis diam ultrices integer bibendum cursus consequat auctor, etiam mollis euismod nisi imperdiet tristique donec. Nec rutrum mus sociosqu dictumst arcu congue ligula, conubia lectus egestas volutpat lacus enim, ultrices praesent nisl venenatis netus quis. Nostra commodo per aliquam neque litora habitasse cubilia mattis phasellus nec, aliquet etiam libero urna consequat vivamus scelerisque eu rhoncus sed, mus lacinia natoque auctor quis massa pellentesque cras sem. Fringilla accumsan laoreet rutrum integer sagittis pellentesque, rhoncus condimentum luctus semper dictumst, aliquet eros imperdiet lectus bibendum. Donec vel placerat accumsan cursus, posuere mi velit facilisis fermentum, lobortis penatibus id.</p>
    ",
            },
          ],
        },
      },
    }
  `);
});
test('Block: CTA', async () => {
  const result = await fetch(gql`
    {
      _loadDrupalPage(id: "080b30e2-5a68-4390-9dec-0c7e850840a7") {
        content {
          __typename
          ... on BlockCta {
            url
            text
            openInNewTab
            icon
            iconPosition
          }
        }
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "_loadDrupalPage": {
          "content": [
            {
              "__typename": "BlockCta",
              "icon": null,
              "iconPosition": null,
              "openInNewTab": null,
              "text": "Block CTA",
              "url": null,
            },
            {
              "__typename": "BlockCta",
              "icon": "ARROW",
              "iconPosition": null,
              "openInNewTab": null,
              "text": "CTA with Icon",
              "url": null,
            },
          ],
        },
      },
    }
  `);
});
