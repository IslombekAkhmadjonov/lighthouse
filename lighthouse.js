const fs = require('fs')
const puppeteer = require('puppeteer')
const lighthouse = require('lighthouse/lighthouse-core/fraggle-rock/api.js')

const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while(checkCounts++ <= maxChecks){
    let html = await page.content();
    let currentHTMLSize = html.length; 

    if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
      countStableSizeIterations++;
    else 
      countStableSizeIterations = 0; //reset the counter

    if(countStableSizeIterations >= minStableSizeIterations) {
      console.log("Fully Rendered Page: " + page.url());
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await page.waitForTimeout(checkDurationMsecs);
  }  
};

async function captureReport() {
	//const browser = await puppeteer.launch({args: ['--allow-no-sandbox-job', '--allow-sandbox-debugging', '--no-sandbox', '--disable-gpu', '--disable-gpu-sandbox', '--display', '--ignore-certificate-errors', '--disable-storage-reset=true']});
	const browser = await puppeteer.launch({"headless": false, args: ['--allow-no-sandbox-job', '--allow-sandbox-debugging', 
  '--no-sandbox', '--ignore-certificate-errors', '--disable-storage-reset=true']});
  const page = await browser.newPage();
  const baseURL = 'http://localhost';

  await page.setViewport({"width":1920,"height":1080});
	await page.setDefaultTimeout(10000);
	
	const navigationPromise = page.waitForNavigation({timeout: 30000, waitUntil: ['domcontentloaded']});
	await page.goto(baseURL);
  await navigationPromise;
		
	const flow = await lighthouse.startFlow(page, {
		name: 'Performance testing Essentials',
		configContext: {
		  settingsOverrides: {
			throttling: {
			  rttMs: 40,
			  throughputKbps: 10240,
			  cpuSlowdownMultiplier: 1,
			  requestLatencyMs: 0,
			  downloadThroughputKbps: 0,
			  uploadThroughputKbps: 0
			},
			throttlingMethod: "simulate",
			screenEmulation: {
			  mobile: false,
			  width: 1920,
			  height: 1080,
			  deviceScaleFactor: 1,
			  disabled: false,
			},
			formFactor: "desktop",
			onlyCategories: ['performance'],
		  },
		},
	});

  //================================NAVIGATE================================
  await flow.navigate(baseURL, {
  stepName: 'Open homepage'
  });
  console.log('Homepage is opened');

  //================================SELECTORS================================
  const tablesTab = '.page-item-13 > a';
  const kitchenTable1 = '.product-92';
  const btn = '.button';

  const cartTab = '.page-item-31 > a';
  const seeCartBtn = '.success';
  const cartBtn = '.to_cart_submit';

  const fullName = '[name="cart_name"]';
  const address = '[name="cart_address"]';
  const postalCode = '[name="cart_postal"]';
  const city = '[name="cart_city"]';
  const country = '[name="cart_country"]';
  const phone = '[name="cart_phone"]';
  const email = '[name="cart_email"]';
  
  const orderBtn = '[name="cart_submit"]';

  //================================PAGE_ACTIONS================================
  await page.waitForSelector(tablesTab);
  await navigationPromise;
  await waitTillHTMLRendered(page);
  await flow.startTimespan({ stepName: 'Open Tables tab'});
    await page.click(tablesTab);
    await waitTillHTMLRendered(page);
  await flow.endTimespan();
  console.log('Tables tab is opened');

  await page.waitForSelector(kitchenTable1);
  await flow.startTimespan({ stepName: 'Open a table'});
    await page.click(kitchenTable1);
    await waitTillHTMLRendered(page);
  await flow.endTimespan();
  console.log('Table is opened');
  await page.click(btn);
  console.log('Table is added');

  await page.waitForSelector(seeCartBtn);
  await flow.startTimespan({ stepName: 'Open Cart'});
    await page.click(seeCartBtn);
    await waitTillHTMLRendered(page);
  await flow.endTimespan();
  console.log('Cart is opened');

  await page.waitForSelector(cartBtn);
  await flow.startTimespan({ stepName: 'Open Checkout'});
    await page.click(cartBtn);
    await waitTillHTMLRendered(page);
  await flow.endTimespan();
  console.log('Checkout is opened');

  await page.waitForSelector(fullName);
	await page.type(fullName, 'name');
	await page.waitForSelector(address);
	await page.type(address, 'address');
	await page.waitForSelector(postalCode);
  await page.type(postalCode, '123');
	await page.waitForSelector(city);
  await page.type(city, 'city');
  await page.waitForSelector(country);
	await page.select(country, 'UZ');
  await page.waitForSelector(phone);
  await page.type(phone, '123');
  await page.waitForSelector(email);
	await page.type(email, 'email@gmail.com');

  await page.waitForSelector(orderBtn);
  await flow.startTimespan({ stepName: 'Open Checkout'});
    await page.click(orderBtn);
    await waitTillHTMLRendered(page);
  await flow.endTimespan();
  console.log('Order is placed');


	//================================REPORTING================================
	const reportPath = __dirname + '/user-flow.report.html';
	const report = flow.generateReport();
	
	fs.writeFileSync(reportPath, (await report).toString());
  
  await browser.close();
}
captureReport();