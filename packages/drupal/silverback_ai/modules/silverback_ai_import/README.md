### Silverback AI Import Module

---

## Introduction

The **Silverback AI Import** module enables advanced content importation using AI-driven parsing and conversion. It provides tools to process content from sources such as Microsoft Word documents and HTML pages, transforming them into Gutenberg-compatible blocks for Drupal sites.

This module is ideal for websites requiring seamless integration of structured content into their CMS, leveraging AI for efficiency and accuracy.

---

## Features

- **Content Import Support**: Import content from:

  - Microsoft Word (`.docx`) files.

  - HTML URLs.

- **AI-driven Parsing**: Extract and process content using the OpenAI model.

- **Custom Gutenberg Blocks**: Automatically convert content into pre-defined block types such as headers, lists, paragraphs, tables, and images.

- **Batch Processing**: Import large content sets efficiently using batch operations.

---

## Requirements

The module depends on:

- **Drupal Core**: Versions 10 or 11.

- **Silverback AI** module.

- **Media** module for handling images.

Ensure these dependencies are installed before enabling the module.

---

## Configuration

1\. Navigate to the **AI Import Settings** page:  

   `Admin > Configuration > System > Silverback Import AI Settings`

2\. Set the following:

   - **OpenAI Model**: Select or configure the OpenAI model.

   - **Converter Service URL**: Provide the URL for the external service used to parse and process files.

3\. Access the import functionality when creating or editing content.

---

## Usage

1\. **Importing Content**:

   - Add a content node and locate the "Import Content" section.

   - Choose a source:

     - **Microsoft Word File**: Upload a `.docx` file.

     - **HTML Page**: Enter a valid URL.

   - Process the import to convert content into structured blocks.

2\. **Batch Import**:

   - Large sets of data can be processed using the batch handler available in the module. [TBD]

---

## Custom Plugins

The module supports extensible AI plugins for various content types:

- **Default**: Generic HTML content.

- **Header**: Markdown headers.

- **Image**: Image embedding and metadata.

- **List**: Ordered and unordered lists.

- **Paragraph**: Text paragraphs.

- **Table**: Tabular data.

Developers can add custom plugins by extending the `AiImportPluginManagerInterface`.

---

## Maintainers

This module is maintained by the **Silverback** team.
