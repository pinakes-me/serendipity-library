const https = require('https');

const fetchPage = (start, end) => new Promise((resolve, reject) => {
  https.get(`https://www.nl.go.kr/NL/search/openApi/saseoApi.do?key=ce11957f3bc5d5b41a50b78bed3aa3a1e2bee10c3b4b33632d7dadbf6c284843&startRowNumApi=${start}&endRowNumApi=${end}`, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => resolve(rawData));
  }).on('error', reject);
});

async function run() {
  const years = {};
  const data1 = await fetchPage(1, 500);
  const data2 = await fetchPage(501, 1000);
  const data3 = await fetchPage(1001, 1500);
  const data = data1 + data2 + data3;
  
  const matches = data.match(/<recomYear>(\d{4})<\/recomYear>/g);
  let recentCount = 0;
  if (matches) {
    matches.forEach(m => {
      const year = parseInt(m.match(/\d{4}/)[0], 10);
      years[year] = (years[year] || 0) + 1;
      if (year >= 2021) recentCount++;
    });
  }
  console.log('Year distribution:', years);
  console.log('Recent (>=2021):', recentCount);
}
run();
