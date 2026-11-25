# Content preview (`content_preview`)

Provides the `access any content revision` permission. Users with it get view
access to any content entity, published or not, so previews can render
unpublished content and drafts.

## Configuration

The permission is granted to the `preview` role (`user.role.preview`).

## Dependencies

- Used by: the default preview user, set up by the `custom` module deploy hooks
  for `silverback_preview_link`.
