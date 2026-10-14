# GraphQL Flood Protection

A Drupal module that provides rate limiting for GraphQL mutations using Drupal's
flood control system.

## Features

- **Rate Limiting**: Prevents abuse of GraphQL mutations by limiting requests
  per IP address
- **CDN Support**: Automatic client IP detection for Cloudflare, Fastly, and
  Netlify
- **Per-Mutation Tracking**: Rate limits are tracked separately for each
  mutation type
- **Mutation Filtering**: Exclude specific mutations from rate limiting
- **Configurable Settings**: Adjust rate limits through the admin interface
- **GraphQL Error Responses**: Returns proper GraphQL errors instead of HTTP 500
  errors
- **Security Logging**: Logs blocked IPs and mutation names for security
  monitoring

## Installation

1. Enable the module:

   ```bash
   drush en graphql_flood_protection
   ```

2. Configure the settings at `/admin/config/services/graphql-flood-protection`

## Configuration

### Admin Interface

Navigate to **Administration > Configuration > System > GraphQL Flood
Protection** to configure:

#### Rate Limiting Settings

- **IP Limit**: Maximum number of GraphQL mutations allowed per IP address
  (default: 6)
- **IP Window**: Time window in seconds for rate limiting (default: 3600 seconds
  = 1 hour)

#### Mutation Filtering

- **GraphQL Server**: Select the GraphQL server to load mutations from
- **Protection Mode**: Currently set to protect all mutations by default
- **Exclude Mutations**: Select specific mutations to exclude from rate limiting

### Example Configurations

#### Basic Configuration

- **Limit**: 50 requests
- **Window**: 3600 seconds (1 hour)
- **Result**: Each IP can make 50 mutations per hour (tracked per mutation type)

#### With Mutation Exclusions

- **Limit**: 20 requests
- **Window**: 3600 seconds
- **Excluded Mutations**: `healthCheck`, `ping`
- **Result**: Each IP can make 20 of each protected mutation per hour;
  `healthCheck` and `ping` are not rate-limited

### Use Cases for Mutation Exclusions

- **Health Checks**: Exclude monitoring mutations like `healthCheck` or `ping`
- **Public APIs**: Exclude mutations that should be available without limits
- **High-Frequency Operations**: Exclude mutations that need to be called
  frequently by legitimate users

## How it works

The module uses Drupal's event subscriber system to intercept GraphQL operations
before execution. If the limit is exceeded, the mutation will return a proper
GraphQL error response and not be executed.

### Logs blocked IPs for security monitoring

## Error Response

When a rate limit is exceeded, the mutation will return a GraphQL error response
like:

```json
{
  "errors": [
    {
      "message": "Too many submissions.",
      "category": "rate_limit"
    }
  ],
  "data": null
}
```

## Debugging

Check the logs for blocked IPs:

```bash
drush watchdog:show --type=graphql_flood_protection
```

## CDN Support

The module automatically detects the client's real IP address when your site is
behind a CDN or proxy. It checks headers in the following priority order:

1. **CF-Connecting-IP** - Cloudflare's trusted client IP header
2. **True-Client-IP** - Cloudflare Enterprise feature
3. **Fastly-Client-IP** - Fastly CDN
4. **X-Real-IP** - Common for Netlify and other CDN/proxies
5. **X-Forwarded-For** - Standard proxy header (uses first IP only)
6. **getClientIp()** - Fallback to Symfony's default detection

### Supported CDN Providers

- **Cloudflare**: Uses `CF-Connecting-IP` or `True-Client-IP` (Enterprise)
- **Fastly**: Uses `Fastly-Client-IP`
- **Netlify**: Uses `X-Real-IP`
- **Generic CDN/Proxy**: Uses `X-Forwarded-For` or `X-Real-IP`

**Note**: Headers are checked in priority order, and the first available header
is used. CDN-specific headers will only be populated when using that particular
CDN provider.

## Mutation Filtering

By default, all GraphQL mutations are protected by rate limiting. You can
exclude specific mutations from protection through the admin interface.

### How It Works

1. Select a GraphQL server in the configuration form
2. The module automatically discovers all available mutations from the schema
3. Select which mutations to exclude from rate limiting
4. Excluded mutations will not be subject to flood protection

### Per-Mutation Rate Limiting

Rate limits are tracked separately for each mutation type. For example:

- User makes 5 `createArticle` mutations
- User makes 3 `updateUser` mutations
- These count separately against the limit
- Each mutation type has its own rate limit counter

This allows for more granular control and prevents one mutation type from
blocking others.

## Technical Details

- **Event Subscriber**: Uses `OperationEvent::GRAPHQL_OPERATION_BEFORE` to
  intercept operations
- **IP Detection**: Multi-CDN support with automatic header detection
- **Mutation Detection**: Regex-based parsing to extract mutation names
- **Flood Control**: Leverages Drupal's built-in flood control system with
  per-mutation keys
- **Configuration**: Uses Drupal's configuration system for easy management
- **Schema Introspection**: Automatically discovers mutations from GraphQL
  server configuration

## Files

- `src/EventSubscriber/FloodProtectionEventSubscriber.php` - Main event
  subscriber with CDN support and mutation filtering
- `src/Exception/RateLimitExceededException.php` - Custom exception for rate
  limiting
- `src/Form/FloodProtectionSettingsForm.php` - Admin configuration form with
  AJAX
- `src/Service/MutationDiscovery.php` - Service for discovering mutations from
  GraphQL schema
- `config/install/graphql_flood_protection.settings.yml` - Default configuration
- `config/schema/graphql_flood_protection.schema.yml` - Configuration schema
