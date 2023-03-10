let chrome: any = {};
let puppeteer: any;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}
export default async (req: any, res: any) => {
  let account = { username: "", password: "" };

  try {
    if (req?.query?.account) {
      account = JSON.parse(atob(req?.query?.account as string));
    }
    console.log(account, process.env.AWS_LAMBDA_FUNCTION_VERSION);
    if (account?.username && account.password) {
      let options = {};

      if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
        options = {
          args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
          defaultViewport: chrome.defaultViewport,
          executablePath: await chrome.executablePath,
          headless: true,
          ignoreHTTPSErrors: true,
        };
      }

      console.log("start launch");
      const browser = await puppeteer.launch({ ...options, headless: true });
      console.log("end launch");

      console.log("start page");
      const page = await browser.newPage();
      console.log("end page");

      await page.goto(
        "https://sandbox.eng.toasttab.com/restaurants/admin/home"
      );

      // Type into search box
      await page.type(`input[name='username']`, account.username);

      await page.click(`button[type='submit']`);

      await page.waitForSelector(`input[name='password']`);

      // Type into search box
      await page.type(`input[name='password']`, account.password);

      // page.waitForTimeout(1000);

      await page.click(`button[type='submit']`);

      const passwordResponse = await page.waitForResponse(
        async (response: { url: () => string | string[] }) => {
          return response.url().includes("/u/login/password");
        }
      );

      if (passwordResponse?.status() !== 302) {
        return res.status(200).json({
          status: "fail",
        });
      }

      res.status(200).json({
        status: "success",
      });
    } else {
      res.status(200).json({
        status: "fail",
      });
    }
  } catch (e) {
    console.log("error", e);
    res.status(200).json({
      status: "fail",
    });
  }
};
