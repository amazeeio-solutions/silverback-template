<?php

declare(strict_types=1);

namespace Drupal\silverback_ai_import;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\file\Entity\File;
use Drupal\file\FileInterface;
use Drupal\node\Entity\Node;
use Drupal\silverback_ai\HttpClient\OpenAiHttpClient;
use GuzzleHttp\Exception\RequestException;
use Drupal\silverback_ai\AiService;
use JsonException as JsonExceptionAlias;

/**
 * @todo Add class description.
 */
final class ContentImportAiService {

  private const DEFAULT_AI_MODEL = 'gpt-4o-mini';
  private const ADMINISTRATOR_ID = 1;

  public const DOCX = 'docx';
  public const URL = 'url';
  public const PDF = 'pdf';
  public const NONE = 'none';

  /**
   * Constructs a ContentImportAiService object.
   */
  public function __construct(
    private readonly RouteMatchInterface $routeMatch,
    private readonly AccountProxyInterface $currentUser,
    private readonly EntityTypeManagerInterface $entityTypeManager,
    private readonly LoggerChannelFactoryInterface $loggerFactory,
    private readonly ConfigFactoryInterface $configFactory,
    private readonly OpenAiHttpClient $silverbackAiOpenaiHttpClient,
    private readonly AiImportPluginManager $pluginManager,
    private readonly AiPostImportPluginManager $pluginManagerPost,
    private readonly AiService $ai
  ) {
  }

  /**
   * Processes a content chunk by converting it using an appropriate plugin.
   *
   * Takes a content chunk (either object or array), ensures it's in array format,
   * finds the appropriate conversion plugin, and performs the conversion.
   *
   * @param mixed $chunk
   *   The content chunk to process. Can be either object or array.
   *   Will be converted to array format before processing.
   *
   * @return mixed
   *   The processed chunk after plugin conversion
   *
   * @throws JsonExceptionAlias
   *   When JSON encoding/decoding fails.
   * @throws \RuntimeException
   *   When no appropriate plugin is found for the chunk.
   *
   * @see getPlugin()
   */
  public function processChunk($chunk) {
    // Convert to array.
    $chunk = json_decode(json_encode($chunk), TRUE);
    $plugin = $this->getPlugin($chunk);
    return $plugin->convert($chunk);
  }

  /**
   * Get Abstract Syntax Tree (AST) from different source types
   *
   * @param FileInterface|string $source The source to parse (can be a FileInterface object or string path/URL)
   * @param int $type The type of source (self::DOCX by default, self::URL, or self::PDF)
   * @return mixed The Abstract Syntax Tree representation of the source
   *
   * @throws \Exception If the source is invalid or cannot be parsed
   */
  public function getAst(FileInterface|string $source, $type =  self::DOCX) {
    $handlers = [
      self::DOCX => 'getAstFromFilePath',
      self::URL => 'getAstFromUrl',
      self::PDF => 'getAstFromPdfFile',
    ];
    $handler = $handlers[$type];
    return $this->$handler($source);
  }

  /**
   * Retrieves the AST (Abstract Syntax Tree) from a given file path using an HTTP service.
   *
   * @param \Drupal\file\FileInterface $file
   *   The file for which to generate the AST.
   *
   * @return mixed
   *   The decoded JSON response containing the AST from the external service, or NULL if the request fails.
   *
   * @throws \GuzzleHttp\Exception\RequestException|\GuzzleHttp\Exception\GuzzleException
   *   Thrown when the HTTP request fails, though it is caught and logged within this method.
   *
   * @todo Implement configuration handling for service endpoints or client headers.
   */
  private function getAstFromFilePath(FileInterface $file) {
    $uri = $file->getFileUri();
    $stream_wrapper_manager = \Drupal::service('stream_wrapper_manager')->getViaUri($uri);
    $file_path = $stream_wrapper_manager->realpath();
    $parse_service_url = $this->configFactory->get('silverback_ai_import.settings')->get('converter_service_url');
    // @todo Add DI.
    $client = \Drupal::httpClient();
    try {
      // @todo For now this is working only for docx files.
      $response = $client->request('GET', "{$parse_service_url}/convert?path={$file_path}", [
        'headers' => [
          'Accept' => 'application/json',
        ],
      ]);
      $body = $response->getBody()->getContents();
      $response = json_decode($body);
    } catch (RequestException $e) {
      // Handle any errors.
      $this->loggerFactory->get('silverback_ai_import')->error($e->getMessage());
    }
    return $response;
  }

  /**
   * Retrieves an Abstract Syntax Tree (AST) from a URL using an external conversion service.
   *
   * Currently only supports DOCX files. Sends the URL to a configured HTML conversion
   * service and returns the AST representation of the document.
   *
   * @param string $url
   *   The URL of the document to convert (currently only DOCX files)
   *
   * @return object|null
   *   Returns the decoded JSON response containing the AST if successful,
   *   or NULL if the request fails
   *
   * @throws \GuzzleHttp\Exception\GuzzleException
   *   When the HTTP request fails
   *   When JSON decoding fails
   *
   * @todo Extend support for other file types besides DOCX
   *
   * @see \GuzzleHttp\ClientInterface::request()
   */
  private function getAstFromUrl(string $url) {
    $parse_service_url = $this->configFactory->get('silverback_ai_import.settings')->get('converter_service_url');
    $client = \Drupal::httpClient();
    try {
      // @todo For now this is working only for docx files.
      $response = $client->request('GET', "{$parse_service_url}/html-convert?path={$url}", [
        'headers' => [
          'Accept' => 'application/json',
        ],
      ]);
      $body = $response->getBody()->getContents();
      return json_decode($body);
    } catch (RequestException $e) {
      // Handle any errors.
      $this->loggerFactory->get('silverback_ai_import')->error($e->getMessage());
    }

    return NULL;
  }

  /**
   * Converts a PDF file to an Abstract Syntax Tree (AST) using an external service.
   *
   * Takes a Drupal file entity containing a PDF, resolves its real path, and sends it
   * to a configured conversion service. The service returns a JSON response containing
   * the PDF's AST representation.
   *
   * @param \Drupal\file\FileInterface $file
   *   The PDF file entity to convert.
   *
   * @return object|null
   *   Returns the decoded JSON response containing the AST if successful,
   *   or NULL if the request fails
   *
   * @throws \GuzzleHttp\Exception\GuzzleException
   *   When the HTTP request fails
   * @throws \RuntimeException
   *   When stream wrapper manager fails to resolve the file path
   *
   * @see \Drupal\Core\StreamWrapper\StreamWrapperManagerInterface::getViaUri()
   * @see \GuzzleHttp\ClientInterface::request()
   */
  private function getAstFromPdfFile(FileInterface $file) {
    $uri = $file->getFileUri();
    $stream_wrapper_manager = \Drupal::service('stream_wrapper_manager')->getViaUri($uri);
    $file_path = $stream_wrapper_manager->realpath();
    $parse_service_url = $this->configFactory->get('silverback_ai_import.settings')->get('converter_service_url');

    $client = \Drupal::httpClient();
    try {
      $response = $client->request('GET', "{$parse_service_url}/pdf-convert?path={$file_path}", [
        'headers' => [
          'Accept' => 'application/json',
        ],
      ]);
      $body = $response->getBody()->getContents();
      $response = json_decode($body);
    } catch (RequestException $e) {
      // Handle any errors.
      $this->loggerFactory->get('silverback_ai_import')->error($e->getMessage());
    }
    return $response;
  }

  /**
   * Helper method.
   *
   * @param string $ast
   * @param string $schema
   *
   * @return array
   * @throws \Exception
   */
  public function extractData(string $ast, string $schema) {
    $model = $this->configFactory->get('silverback_ai_import.settings')->get('ai_model') ?: self::DEFAULT_AI_MODEL;

    $prompt = <<<EOD
    You are a precise JSON data extraction and template rendering assistant. Follow these steps carefully:

    Input Context:
    $ast

    1. Input Validation:
    - Verify the input AST node is valid JSON
    - Confirm the schema matches the expected extraction requirements
    - Validate that all required keys in the schema exist in the AST

    2. Data Extraction:
    - Extract ONLY the values specified in the following schema from the AST node:
    $schema

    - Ensure type consistency with the schema definition
    - If a required value is missing, return a clear error message

    Return only JSON, following the given schema.

    Important Constraints:
    - Case-sensitive matching
    - Strict type checking
    - No modifications to template structure
    - Complete token replacement
    EOD;

    return $this->ai->request($prompt, $model, ['module' => 'silverback_import_ai']);
  }

  /**
   * Send the AI request.
   *
   * @param string $ast
   * @param string $type
   * @param string $template
   * @param string $schema
   *
   * @return array
   * @throws \Exception
   */
  public function sendOpenAiRequest(string $ast, string $type, string $template, string $schema) {

    $model = $this->configFactory->get('silverback_ai_import.settings')->get('ai_model') ?: self::DEFAULT_AI_MODEL;

    $prompt = <<<EOD
    You are a precise JSON data extraction and template rendering assistant. Follow these steps carefully:

    Input Context:
    $ast

    1. Input Validation:
    - Verify the input AST node is valid JSON
    - Confirm the schema matches the expected extraction requirements
    - Validate that all required keys in the schema exist in the AST

    2. Data Extraction:
    - Extract ONLY the values specified in the following schema from the AST node:
    $schema

    - Ensure type consistency with the schema definition
    - If a required value is missing, return a clear error message

    3. Template Rendering:
    - Replace tokens in the following template using extracted values:
      $template

    - Ensure the resulting HTML is well-formed
    - Preserve all original comments
    - Validate that all placeholders are replaced
    - Convert the htmlTable variable (if exists) to HTML

    4. Output Requirements:
    - Return ONLY the final rendered template, nothing else
    - Maintain the original comments
    - Do not include any additional text, explanations, or metadata
    - The output should be valid HTML, including comments, do not include markdown code block

    Important Constraints:
    - Case-sensitive matching
    - Strict type checking
    - No modifications to template structure
    - Complete token replacement
    EOD;

    return $this->ai->request($prompt, $model, ['module' => 'silverback_import_ai']);
  }

  /**
   * Extract data from markdown using AI.
   *
   * @param string $markdown
   *
   * @return array
   * @throws \Exception
   */
  public function extractBaseDataFromMarkdown(string $markdown) {

    $model = $this->configFactory->get('silverback_ai_import.settings')->get('ai_model') ?: self::DEFAULT_AI_MODEL;

    $prompt = <<<EOD
    You are an expert Markdown data extraction assistant. Your task is to analyze and extract specific information from provided Markdown text.

    Input Markdown Context:
    $markdown

    Follow these steps carefully:

    1. Extract the following information from the markdown:
    - Title
    - Language (in language code format, e.g. EN, EL etc)

    2. Format your output strictly as JSON using this template:
      {
        'title' : extracted_title,
        'language' : extracted_langcode,
      }

    Rules:
    - Only return the JSON output.
    - The output should be valid JSON, not markdown.
    - Ensure the language code adheres to ISO 639-1 format.
    - Be precise and concise in extracting the required information.
    EOD;

    return $this->ai->request($prompt, $model, ['module' => 'silverback_import_ai']);
  }

  /**
   * Retrieves a plugin instance that matches the specified chunk.
   *
   * This method creates an instance of the default AI plugin and then
   * iterates through all available plugin definitions to find a plugin
   * that matches the provided chunk. The first matching plugin instance
   * will be selected and returned.
   *
   * @param array $chunk
   *   The input data that will be used to match against plugin definitions.
   *
   * @return object
   *   The plugin instance that matches the provided chunk or the default
   *   plugin if no matches are found.
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   * @todo Order the plugin definitions by weight before attempting to find a match.
   *
   */
  public function getPlugin(array $chunk) {
    $default_plugin = $this->pluginManager->createInstance('ai_default');
    $definitions = $this->pluginManager->getDefinitions();
    // @todo Order by weight.
    foreach ($definitions as $definition) {
      $plugin = $this->pluginManager->createInstance($definition['id'], ['chunk' => $chunk]);
      if ($plugin->matches($chunk)) {
        $default_plugin = $plugin;
        break;
      }
    }
    return $default_plugin;
  }

  /**
   * Flattens a hierarchical AST (Abstract Syntax Tree) into a linear array of nodes.
   *
   * This function converts a nested AST structure into a flat array where each node
   * is assigned a unique ID and maintains a reference to its parent. It processes
   * specific node types differently and handles recursive traversal of child nodes.
   *
   * @param $ast
   *   The AST structure to flatten.
   * @param int|null $parent
   *   The ID of the parent node (used in recursion)
   *
   * @return array An array of flattened nodes, where each node contains:
   *  - type: The capitalized node type
   *  - id: A unique identifier
   *  - parent: Reference to the parent node's ID
   *  - Additional properties specific to each node type
   */
  public function flattenAst($ast, int $parent = NULL) {

    $ast = json_decode(json_encode($ast), TRUE);
    static $flatNodes = [];
    static $id;

    if ($ast === NULL) {
      return $flatNodes;
    }

    foreach ($ast as $chunk) {
      if (
        isset($chunk['type'])
        && in_array($chunk['type'], [
          'Strong',
          'Text',
          'ListItem',
          'Emphasis',
        ])
      ) {
        continue;
      }

      if (
        isset($chunk['type'])
        && $chunk['type'] == 'Link'
        && isset($chunk['children'])
        && count($chunk['children']) == 1
        && $chunk['children'][0]['type'] !== 'Image'
      ) {
        continue;
      }

      $children = $chunk['children'] ?? [];
      // Chunk preprocessing.
      $chunk['type'] = ucfirst($chunk['type']);
      $chunk['id'] = ++$id;
      $chunk['parent'] = $parent;

      $flatNodes[] = $chunk;
      // Recursively process children.
      foreach ($children as $child) {
        $this->flattenAst([$child], $id);
      }
    }

    return $flatNodes;
  }

  /**
   * Recursively iterates through a nested array to process Image type items.
   *
   * Traverses through the array and its nested children, processing any items
   * of type 'Image' by adding a 'gutenberg' property. The function modifies
   * the array in place using reference parameters.
   *
   * @param array &$data
   *   The array to process, passed by reference
   *   Expected structure: [
   *                       'type' => string,
   *                       'children' => array (optional)
   *                     ].
   * @param int $depth
   *   Current depth in the recursive traversal (default: 0)
Ω   *
   * @throws \JsonException
   * @see processChunk() Method used to process Image type items
   */
  public function iterateArray(array &$data, int $depth = 0): void {
    foreach ($data as &$item) {
      // Process item here.
      if (isset($item['type'])) {
        if ($item['type'] == 'Image') {
          $item['gutenberg'] = $this->processChunk($item);
        }
      }
      if (isset($item['children']) && is_array($item['children'])) {
        $this->iterateArray($item['children'], $depth + 1);
      }
    }
  }

  /**
   * Extracts various metadata from a given URL by fetching and parsing its HTML content.
   *
   * This function attempts to retrieve the HTML content of a URL and extract key information
   * including title, path, meta tags, and language settings. It includes error handling for
   * various failure scenarios.
   *
   * @param string $url
   *   The URL to extract data from.
   *
   * @return array An associative array containing:
   *  - title: string|null The page title if found
   *  - path: string The URL path component, defaults to "/" if not found
   *  - metatags: array Meta tag name-content pairs
   *  - language: string|null The page language if specified
   *  - error: string|null Error message if any error occurred, null otherwise
   *
   * @throws \Exception Caught internally and returned as error in result array
   */
  public function extractPageDataFromUrl($url) {
    $data = [
      'title' => NULL,
      'path' => NULL,
      'metatags' => [],
      'language' => NULL,
      'error' => NULL,
    ];

    // Validate URL.
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
      $data['error'] = "Invalid URL";
      return $data;
    }

    try {
      // Use file_get_contents with a user agent to avoid being blocked by some servers.
      $options = [
        'http' => [
          'method' => 'GET',
          // Example user agent.
          'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
          // Timeout in seconds.
          'timeout' => 10,
        ],
      ];
      $context = stream_context_create($options);
      $html = @file_get_contents($url, FALSE, $context);

      if ($html === FALSE) {
        $error = error_get_last();
        $data['error'] = "Failed to fetch URL: " . ($error ? $error['message'] : "Unknown error");
        return $data;
      }

      if (preg_match('/<title>(.*?)<\/title>/i', $html, $matches)) {
        $data['title'] = trim(html_entity_decode($matches[1]));
      }

      $data['path'] = parse_url($url, PHP_URL_PATH);
      if ($data['path'] === NULL) {
        // Handle cases where there's no path.
        $data['path'] = "/";
      }

      // Extract Meta Tags.
      preg_match_all('/<meta\s+(?:name|http-equiv)="([^"]*)"\s+content="([^"]*)"/i', $html, $matches);
      for ($i = 0; $i < count($matches[0]); $i++) {
        $name = strtolower($matches[1][$i]);
        $data['metatags'][$name] = trim(html_entity_decode($matches[2][$i]));
      }

      // Extract Language.
      if (preg_match('/<html.*?lang="([^"]*)"/i', $html, $matches)) {
        $data['language'] = $matches[1];
      } elseif (preg_match('/<meta\s+http-equiv="Content-Language"\s+content="([^"]*)"/i', $html, $matches)) {
        $data['language'] = $matches[1];
      }
    } catch (\Exception $e) {
      $data['error'] = "An error occurred: " . $e->getMessage();
    }

    return $data;
  }

  /**
   * Creates a Node entity from a DOCX Abstract Syntax Tree (AST).
   *
   * Processes the content.md file from the AST's output directory,
   * extracts data through markdown processing, and creates a new node
   * entity if valid data is present in the expected JSON structure.
   *
   * @param object $ast
   *   The AST object containing outputDirectory property
   *   with path to the processed DOCX content.
   *
   * @return \Drupal\node\Entity\Node|null
   *   Returns a Node entity if creation is successful and data is valid,
   *   or NULL if required data structure is not found
   *
   * @throws \Drupal\Core\Entity\EntityStorageException
   *   When there's an error saving the node entity
   * @throws \RuntimeException
   *   When the content.md file cannot be read
   *
   * @see \Drupal\node\Entity\Node::create()
   */
  public function createEntityFromDocxAst($ast) {
    $markdown = file_get_contents($ast->outputDirectory . '/content.md');
    $data = $this->extractBaseDataFromMarkdown($markdown);
    // @todo Surround with try-catch
    if (isset($data['choices'][0]['message']['content'])) {
      $data = json_decode($data['choices'][0]['message']['content'], TRUE);
      $entity = Node::create([
        'type' => 'page',
        'title' => $data['title'],
        'langcode' => strtolower($data['language']),
      ]);
      $entity->save();
      return $entity;
    }
    return NULL;
  }

  /**
   * Creates a Node entity of type 'page' from a given URL.
   *
   * Extracts page data from the provided URL and creates a new node entity
   * if the required data (title and language) is available.
   *
   * @param string $url
   *   The URL to extract page data from.
   *
   * @return \Drupal\node\Entity\Node|null
   *   Returns a Node entity if creation is successful,
   *   or NULL if required data is missing
   *
   * @throws \Drupal\Core\Entity\EntityStorageException
   * @throws \Exception
   *   When there's an error saving the node entity
   *
   * @see \Drupal\node\Entity\Node::create()
   */
  public function createEntityFromUrl($url) {
    $data = $this->extractPageDataFromUrl($url);
    // @todo Handle exceptions
    if (!empty($data['title']) && !empty($data['language'])) {
      $entity = Node::create([
        'type' => 'page',
        'title' => $data['title'],
        'langcode' => strtolower($data['language']),
      ]);
      $entity->save();
      return $entity;
    }
    return NULL;
  }

  /**
   * Creates a File entity from Dropzone uploaded file data.
   *
   * This function handles the process of copying an uploaded file to a designated
   * public directory and creating a corresponding File entity in Drupal.
   *
   * @param array $file_data
   *   The file data from Dropzone upload
   *   Expected structure: ['uploaded_files'][0]['path'].
   *
   * @return \Drupal\file\Entity\File The created and saved file entity
   *
   * @throws \Drupal\Core\File\Exception\FileException When file operations fail
   * @throws \Drupal\Core\Entity\EntityStorageException When file entity creation fails
   *
   * @see \Drupal\Core\File\FileSystemInterface::prepareDirectory()
   * @see \Drupal\Core\File\FileSystemInterface::copy()
   * @see \Drupal\file\Entity\File::create()
   */
  public function createFileEntityFromDropzoneData($file_data) {
    // @todo Handle exceptions
    $filepath = $file_data['uploaded_files'][0]['path'];
    $directory = 'public://converted';
    $file_system = \Drupal::service('file_system');
    $file_system->prepareDirectory($directory, FileSystemInterface::CREATE_DIRECTORY | FileSystemInterface::MODIFY_PERMISSIONS);
    $file_system->copy($filepath, $directory . '/' . basename($filepath), FileSystemInterface::EXISTS_REPLACE);

    $file = File::create([
      'filename' => basename($filepath),
      'uri' => "{$directory}/" . basename($filepath),
      'status' => FileInterface::STATUS_PERMANENT,
      'uid' => $this->currentUser->id() ?? self::ADMINISTRATOR_ID,
    ]);
    $file->setPermanent();
    $file->save();
    return $file;
  }

  /**
   * Get all post import plugins.
   *
   * @return array
   */
  public function getPostImportPlugins() {
    $definitions = $this->pluginManagerPost->getDefinitions();
    $plugins = [];
    foreach ($definitions as $definition) {
      $plugins[] = $definition['id'];
    }
    return $plugins;
  }

  /**
   * Post import process for plugin.
   *
   * @param $plugin_id
   * @param $chunks
   *
   * @return mixed
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   */
  public function postProcessChunks($plugin_id, $chunks,) {
    $plugin = $this->pluginManagerPost->createInstance($plugin_id);
    return $plugin->convert($chunks);
  }
}
