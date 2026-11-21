async function check() {
  const res = await fetch('http://localhost:3000/dashboard');
  const html = await res.text();
  const scriptMatches = [...html.matchAll(/src="(\/_next\/static\/[^"]+)"/g)].map(m => m[1]);
  console.log('Found script chunks:', scriptMatches.length);
  for (const s of scriptMatches.slice(0, 5)) {
    const chunkRes = await fetch('http://localhost:3000' + s);
    console.log(s, 'Status:', chunkRes.status);
  }
}
check();
