# Silverback Campaign URLs (`silverback_campaign_urls`)

Adds a `campaign_url` entity: a redirect with free-form source and destination
strings, a status code (default `301`) and a force flag. Sources must be unique.
Campaign URLs are exposed via GraphQL so the frontend can turn them into
redirects.

## Setup / Configuration

- Enable the module and grant `administer campaign urls`.
- Manage campaign URLs at `/admin/config/search/campaign_url`.
- Enable the `silverback_campaign_urls` schema extension on the GraphQL server.
  The host schema must provide the `@resolveProperty` directive (the template
  defines it as an alias of `@property`).

## Usage

The extension adds this type:

```graphql
type CampaignUrl @entity(type: "campaign_url", bundle: "campaign_url") {
  source: String!
  destination: String!
  statusCode: Int!
  force: Boolean!
}
```

## Dependencies

- Depends on: `graphql_directives`.
