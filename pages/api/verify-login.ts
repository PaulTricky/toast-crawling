// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import webdriver from "selenium-webdriver";
const chrome = require("selenium-webdriver/chrome");

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let account = { username: "", password: "" };
  try {
    if (req?.query?.account) {
      account = JSON.parse(atob(req?.query?.account as string));
    }
    console.log(account);
    if (account?.username && account.password) {
      const driver = await new webdriver.Builder()
        .forBrowser(webdriver.Browser.CHROME)
        .setChromeOptions(
          new chrome.Options()
            .headless()
            .windowSize({ width: 640, height: 480 })
        )
        .build();

      await driver.get(
        "https://sandbox.eng.toasttab.com/restaurants/admin/home"
      );

      // Type into search box
      await driver
        .findElement(webdriver.By.xpath("//input[@name='username']"))
        .sendKeys(account.username);

      await driver
        .findElement(webdriver.By.xpath("//button[@type='submit']"))
        .click();

      await driver.wait(
        webdriver.until.elementsLocated(
          webdriver.By.xpath("//input[@name='password']")
        )
      );

      // Type into search box
      await driver
        .findElement(webdriver.By.xpath("//input[@name='password']"))
        .sendKeys(account.password);

      await driver
        .findElement(webdriver.By.xpath("//button[@type='submit']"))
        .click();

      let title = await driver.getTitle();

      let url = await driver.getCurrentUrl();

      console.log("url", url);

      if (url.includes("u/mfa-webauthn-platform-enrollment")) {
        await driver
          .findElement(
            webdriver.By.xpath("//button[@value='refuse-add-device']")
          )
          .click();
      } else if (title === "Toast Home") {
        return res.status(200).json({
          status: "success",
        });
      }

      url = await driver.getCurrentUrl();

      console.log("url", url);

      title = await driver.getTitle();
      if (title === "Toast Home") {
        return res.status(200).json({
          status: "success",
        });
      }

      // const passwordResponse = await page.waitForResponse(async (response) => {
      //   console.log(
      //     response.url(),
      //     response.url().includes("/u/login/password")
      //   );
      //   return response.url().includes("/u/login/password");
      // });

      // console.log("passwordResponse?.status()", passwordResponse?.status());
      return res.status(200).json({
        status: "fail",
      });
      // if (passwordResponse?.status() !== 302) {
      //   return res.status(200).json({
      //     status: "fail",
      //   });
      // }

      // res.status(200).json({
      //   status: "success",
      // });
    } else {
      res.status(200).json({
        status: "fail",
      });
    }
  } catch (e) {
    res.status(200).json({
      status: "fail",
    });
  }
};
