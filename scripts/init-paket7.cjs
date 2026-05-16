const fs = require('fs');

const data = {
  "id": "paket-7",
  "title": "Paket Latihan 7",
  "totalSoal": 0,
  "sesi1": [],
  "sesi2": []
};

fs.writeFileSync('src/data/paket/07-Paket-7.json', JSON.stringify(data, null, 2));
console.log('Paket 7 base created.');
