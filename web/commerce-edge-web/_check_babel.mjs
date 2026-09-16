import https from 'https';
https.get('https://registry.npmjs.org/@babel/helpers', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const pkg = JSON.parse(data);
    const versions = Object.keys(pkg.versions);
    console.log('Total versions:', versions.length);
    const latest = pkg['dist-tags']?.latest;
    console.log('Latest:', latest);
    if (latest) {
      const v = pkg.versions[latest];
      console.log('Latest version field:', v.version);
      console.log('Has version field:', !!v.version);
      console.log('Name:', v.name);
    }
    // Check a specific version
    const v729 = pkg.versions['7.29.7'];
    if (v729) {
      console.log('7.29.7 version field:', v729.version);
      console.log('7.29.7 has version:', !!v729.version);
    }
    // Check 7.28.x
    const v728 = Object.keys(pkg.versions).filter(k => k.startsWith('7.28.'));
    console.log('7.28.x versions:', v728.slice(0, 3));
    if (v728.length > 0) {
      const v = pkg.versions[v728[0]];
      console.log(v728[0], 'version field:', v.version);
    }
  });
}).on('error', (e) => console.error(e));
