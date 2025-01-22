# Silverback Converter

The converter is a Node.js application designed to convert documents from
various formats (DocX, PDF, and HTML) into Markdown.

This tool is particularly useful for developers and content creators who need to
transform documents into a format suitable for further processing, analysis, or
integration with other systems.

## Features

- **DocX to Markdown**: Convert Word documents (`.docx`) to Markdown.
- **PDF to Markdown**: Convert PDF files to Markdown.
- **HTML to Markdown**: Extract main content from web pages and convert it to
  Markdown.
- **Jina AI Integration**: Fetch and convert content using the Jina AI API.
  (ATTENTION: EXPERIMENTAL, DO NOT USE THIS)

## Setup and Installation

### Prerequisites

- Node.js (version 18 or higher)
- npm (Node Package Manager)

### Installation

1. **Install dependencies**:

   ```bash
   npm i
   ```

2. **Set up environment variables** (optional):
   - Create a `.env` file in the root directory.
   - Add your Jina AI API key if you plan to use the Jina AI integration:
     ```env
     JINA_AI_API_KEY=your_jina_ai_api_key
     ```

### Running the Application

To start the application, run the following command:

```bash
npm start
```

The server will start on `http://localhost:3000`.

## Usage

### Endpoints

- **Convert DocX to Markdown**:

  ```
  GET /convert?path=/path/to/your/document.docx
  ```

- **Convert PDF to Markdown**:

  ```
  GET /pdf-convert?path=/path/to/your/document.pdf
  ```

- **Convert HTML to Markdown**:

  ```
  GET /html-convert?path=https://example.com
  ```

- **Fetch and Convert Content with Jina AI**:
  ```
  GET /jina-convert?path=https://example.com
  ```

### Example

To convert a Word document to Markdown, make a GET request to:

```
http://localhost:3000/convert?path=/path/to/your/document.docx
```

The response will include the converted Markdown content, the output directory,
and any warnings generated during the conversion process.

## Configuration

- **Output Directory**: By default, converted files are saved in a directory
  named after the input file's hash. You can customize the output directory by
  modifying the `outputDir` variable in the respective conversion scripts.
- **Image Handling**: Images extracted from documents are saved in an `images`
  subdirectory within the output directory.

## Dependencies

The application relies on several npm packages, including:

- `mammoth` for DocX conversion
- `@opendocsg/pdf2md` for PDF conversion
- `@extractus/article-extractor` for HTML content extraction
- `turndown` for HTML to Markdown conversion
- `express` for the server

For a complete list of dependencies, refer to the `package.json` file.
