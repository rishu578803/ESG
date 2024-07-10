const { Builder, By, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const cheerio = require("cheerio");
const moment = require("moment");

async function scrapeNews(page) {
  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(new chrome.Options().addArguments("--start-maximized"))
    .build();
  let newsData = [];

  async function scrollToBottom() {
    for (let i = 0; i < 3; i++) {
      await driver.actions().sendKeys(Key.END).perform();
      await driver.sleep(1000);
    }
  }

  async function clickLoadMoreButton() {
    let retries = 3;
    while (retries > 0) {
      try {
        console.log("attempting to find load more button");
        let loadMoreBtn = await driver.findElement(
          By.className("load-more-m_button__1mmf1")
        );
        await loadMoreBtn.click();
        await driver.sleep(3000); // Adjust this sleep time if necessary
        await scrollToBottom(); // Scroll to bottom again after loading more content
        return true; // Successfully clicked and loaded more content
      } catch (err) {
        console.log(
          "Load more button not found or clickable, retries left:",
          retries - 1
        );
        retries--;
        if (retries === 0) {
          console.log(
            "Failed to click Load more button after multiple attempts"
          );
          return false; // Return false if unable to click after retries
        }
        await driver.sleep(3000); // Wait before retrying
      }
    }
  }

  try {
    await driver.get(
      "https://www.sustainabilitymenews.com/environmental-social"
    );
    await driver.sleep(10000);
    await scrollToBottom();

    let loadMoreSuccess = await clickLoadMoreButton();

    // Continue only if loading more content was successful
    if (loadMoreSuccess) {
      await scrollToBottom();
    }

    let response = await driver.getPageSource();
    let $ = cheerio.load(response);

    let news = [];

    let titles = $(".three-col-six-stories-m_card__Or020");
    titles.each((index, element) => {
      let image_link =
        "https:" +
        $(element)
          .find(".hero-image-m_image-wrapper__2EIzt figure img")
          .attr("src");
      let heading =
        $(element)
          .find("h2.headline-m_headline__3_NhV.headline-m_dark__en3hW")
          .text()
          .trim() ||
        $(element)
          .find("h5.headline-m_headline__3_NhV.headline-m_dark__en3hW")
          .text()
          .trim();
      let time = $(element)
        .find(
          ".time.arr--publish-time.timestamp-m_time__2v46i.timestamp-m_dark__2lk9E"
        )
        .text()
        .trim();
      let description = $(element)
        .find(
          "p.p-alt.arr--sub-headline.arrow-component.subheadline-m_subheadline__3fd7z.subheadline-m_dark__28u00"
        )
        .text()
        .trim();
      let link = $(element).find('a[aria-label="headline"]').attr("href");
      news.push([heading, description, time, link, image_link]);
    });

    titles = $(".one-col-story-list-m_one-col-border-default__2BDg7");
    titles.each((index, element) => {
      let image_link =
        "https:" +
        $(element)
          .find(".hero-image-m_image-wrapper__2EIzt figure img")
          .attr("src");
      let heading = $(element)
        .find("h6.headline-m_headline__3_NhV.headline-m_dark__en3hW")
        .text()
        .trim();
      let time = $(element)
        .find(
          ".time.arr--publish-time.timestamp-m_time__2v46i.timestamp-m_dark__2lk9E"
        )
        .text()
        .trim();
      let description = $(element)
        .find('div[data-test-id="subheadline"]')
        .text()
        .trim();
      let link = $(element).find('a[aria-label="headline"]').attr("href");
      news.push([heading, description, time, link, image_link]);
    });

    newsData = news.map((item) => {
      // Example: Parsing date with moment.js if needed
      let parsedDate = moment(item[2], "MMMM D, YYYY").format("YYYY-MM-DD");
      return {
        heading: item[0],
        description: item[1],
        date: parsedDate,
        link: item[3],
        imageLink: item[4],
        source: "Sustainability News",
      };
    });
  } finally {
    await driver.quit();
  }
  console.log(newsData);
  return newsData;
}

module.exports = scrapeNews;
//Done
