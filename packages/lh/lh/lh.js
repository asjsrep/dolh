const lighthouse = require('lighthouse');
	
const launchChrome = require  ("@serverless-chrome/lambda");
const request = require  ("superagent");
const {URL} = require('url');

exports.main = (args) => {
    let output = ''

    const chrome = await launchChrome();
 
    const response = await request
      .get(`${chrome.url}/json/version`)
      .set("Content-Type", "application/json");
   
    const endpoint = response.body.webSocketDebuggerUrl;

  const options = {logLevel: 'error', output: 'json', onlyCategories: ['performance', 'seo'], port: (new URL(endpoint)).port,};
  const config = {
    extends: 'lighthouse:default',
    settings: {
        throttling: false,
        recordTrace: false,

      maxWaitForFcp: 10 * 1000,
      maxWaitForLoad: 15 * 1000,
      formFactor: 'desktop',
      screenEmulation: {
       
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      },
      emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4695.0 Safari/537.36 Chrome-Lighthouse',
      // Skip the h2 audit so it doesn't lie to us. See https://github.com/GoogleChrome/lighthouse/issues/6539
      skipAudits: ['uses-http2', 'full-page-screenshot',   'screenshot-thumbnails',
      'final-screenshot',],
    },
  };
  const runnerResult = await lighthouse('https://example.com', options, config);

  // `.report` is the HTML report as a string
  //const reportHtml = runnerResult.report;
  //fs.writeFileSync('lhreport.html', reportHtml);

  // `.lhr` is the Lighthouse Result as a JS object
  console.log('Report is done for', runnerResult.lhr.finalUrl);
  output = runnerResult.lhr.categories;
console.log(output)
  await chrome.kill();


return output;
};