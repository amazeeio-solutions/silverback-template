# Silverback Cloudinary (`silverback_cloudinary`)

Provides the `responsive_image` GraphQL data producer and the `@responsiveImage`
directive. They build signed [Cloudinary](https://cloudinary.com/) fetch URLs
(`f_auto`, `q_auto`) plus `sizes` and `srcset` for an image.

## Setup / Configuration

- Enable the module.
- Set the `CLOUDINARY_URL` env var
  (`cloudinary://<api_key>:<api_secret>@<cloud_name>`). The template's
  `settings.php` builds it from `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  and `CLOUDINARY_CLOUDNAME`.
- If the cloud name is `local`, original image URLs are returned unchanged.

## Usage

The input is an image array with `src`, `width` and `height`. The output is a
JSON string with `src`, `originalSrc`, `width`, `height` and, if `sizes` is
given, `sizes` and `srcset`. Without `width`, the original image is returned.
With only `width`, the height follows the original aspect ratio. With both
`width` and `height`, the image is cropped (`c_fill`, `g_auto`).

```graphql
type MediaImage @entity(type: "media", bundle: "image") {
  source(
    width: Int
    height: Int
    sizes: [[Int!]!]
    transform: String
  ): ImageSource!
    @property(path: "field_media_image.entity")
    @imageProps
    @responsiveImage(
      width: "$width"
      height: "$height"
      sizes: "$sizes"
      transform: "$transform"
    )
}
```

`sizes` holds `[maxScreenWidth, imageWidth]` pairs, e.g. `[[800, 780]]`.
`transform` is any Cloudinary transformation string, e.g.
`"co_rgb:000000,e_colorize:60"`.

## Dependencies

- Depends on: `graphql` (>= 4), `graphql_directives` (for the directive),
  `cloudinary/cloudinary_php` (^3).
