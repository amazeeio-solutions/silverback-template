// Browser-compatible implementation of Node's url.parse
const urlShim = {
  parse(urlString: string) {
    try {
      const url = new URL(urlString);
      return {
        protocol: url.protocol,
        hostname: url.hostname,
        pathname: url.pathname,
        // Add other properties as needed
      };
    } catch {
      // Handle invalid URLs similar to Node's url.parse
      return {
        protocol: null,
        hostname: null,
        pathname: null
      };
    }
  }
};

export default urlShim; 