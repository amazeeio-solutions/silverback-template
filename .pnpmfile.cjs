function readPackage(pkg) {
  const versions = {
    react: '19.0.0',
    'react-dom': '19.0.0',
    typescript: '5.4.5',
    graphql: '16.8.1',
    sharp: '0.33.1',
    'vite-imagetools': '6.2.9',
  };
  for (const type of ['dependencies', 'devDependencies', 'peerDependencies']) {
    for (const [name, version] of Object.entries(versions)) {
      if (pkg[type] && Object.keys(pkg[type]).includes(name)) {
        pkg[type][name] = version;
      }
    }
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
