const pkg = require('./node_modules/vitest/package.json');
console.log('bin:', JSON.stringify(pkg.bin, null, 2));
console.log('main:', pkg.main);
