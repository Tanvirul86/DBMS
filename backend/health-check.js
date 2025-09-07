const fetch = global.fetch || require('node-fetch');

async function check() {
  try {
    const res = await fetch('http://localhost:5000/api/doctors');
    console.log('Status:', res.status);
    const body = await res.text();
    console.log('Body:', body.slice(0, 1000));
  } catch (err) {
    console.error('Request failed:', err);
  }
}

check();
