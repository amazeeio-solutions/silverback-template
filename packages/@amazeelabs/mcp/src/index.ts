import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Create server instance
const server = new McpServer({
  name: 'Silverback Drupal',
  version: '1.0.0',
});

const pages = new Map<
  string,
  {
    // Path to the page
    path: string;
    // Plain text title
    title: string;
    // HTML content
    content: string;
  }
>();

// Add some example pages
pages.set('/home', {
  path: '/',
  title: 'Welcome to Silverback Drupal',
  content: `
    <h1>Welcome</h1>
    <p>This is the homepage of our Silverback Drupal site. Here you'll find information about our services and latest updates.</p>
    <p>Feel free to explore our other pages using the navigation.</p>
  `,
});

pages.set('/about', {
  path: '/about',
  title: 'About Us',
  content: `
    <h1>About Our Company</h1>
    <p>We are a team of dedicated professionals working to deliver the best web solutions using Drupal and modern technologies.</p>
    <p>Our mission is to help organizations build and maintain powerful digital experiences.</p>
  `,
});

pages.set('/services', {
  path: '/services',
  title: 'Our Services',
  content: `
    <h1>Services We Offer</h1>
    <ul>
      <li>Drupal Development</li>
      <li>Website Maintenance</li>
      <li>Performance Optimization</li>
      <li>Security Audits</li>
    </ul>
  `,
});

pages.set('/blog', {
  path: '/blog',
  title: 'Latest Blog Posts',
  content: `
    <h1>Blog</h1>
    <article>
      <h2>Getting Started with Drupal</h2>
      <p>Learn the basics of setting up your first Drupal website...</p>
    </article>
    <article>
      <h2>Best Practices for Content Management</h2>
      <p>Tips and tricks for managing your content effectively...</p>
    </article>
  `,
});

pages.set('/contact', {
  path: '/contact',
  title: 'Contact Us',
  content: `
    <h1>Get in Touch</h1>
    <p>We'd love to hear from you! Here's how you can reach us:</p>
    <ul>
      <li>Email: info@example.com</li>
      <li>Phone: (555) 123-4567</li>
      <li>Address: 123 Web Street, Digital City</li>
    </ul>
  `,
});

server.tool(
  'search-page',
  'Retrieve a list of page paths that match a given search term.',
  {
    term: z.string(),
  },
  async ({ term }) => {
    const result = Array.from(pages.values()).filter((page) =>
      page.title.toLowerCase().includes(term.toLowerCase()),
    );
    return {
      content: result.map((page) => ({
        type: 'text',
        text: page.path,
      })),
    };
  },
);

server.tool(
  'read-page',
  'Retrieve contents of a given page by its path.',
  {
    path: z.string(),
  },
  async ({ path }) => {
    const page = pages.get(path);
    if (!page) {
      return {
        content: [],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: 'text',
          text: page.content,
        },
      ],
    };
  },
);

export async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Server running on stdio');
}
