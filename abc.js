const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"
  );
  await page.goto("https://web.whatsapp.com");
  await page.waitFor(2000);
  await page.screenshot({ path: "example.png" });
  await page.evaluate(
    `window.getQRcodesrc = function(done) {
            var reload_icon = document.getElementsByClassName('_1MOym')[0];
            if(reload_icon)
                reload_icon.click();
            if(document.getElementsByClassName('_1pw2F')[0]){
                var src = document.getElementsByTagName('img')[0].src;
                return src;
            } else {
                return false;
            }
        }`
  );
  await page.evaluate("window.getQRcodesrc()")
  await browser.close();
})();
