declare module 'url' {
  interface UrlObject {
    protocol?: string | null;
    hostname?: string | null;
    pathname?: string | null;
    // Add other properties as needed
  }

  interface UrlModule {
    parse(url: string): UrlObject;
    // Add other methods as needed
  }

  const url: UrlModule;
  export default url;
} 