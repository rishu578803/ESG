const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function Finance() {
    const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const url = 'https://www.financialexpress.com/about/sustainability/';
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds

    let news = [];

    for (let i = 1; i <= 1; i++) {
        const response = await page.content();
        const $ = cheerio.load(response);

        $('article.post-has-image').each((index, element) => {
            try {
                const imageLink = $(element).find('figure a img').attr('src');
                const heading = $(element).find('div.entry-title').text().trim();
                const description = $(element).find('div.hide-for-small-only.post-excerpt').text().trim();
                const date = $(element).find('div.entry-meta').text().trim(); // Extract date as text
                const link = $(element).find('div.entry-title a').attr('href');

                news.push({ heading, description, date, link, imageLink ,source : "Financial Express"});
            } catch (e) {
                console.error(e);
            }
        });

        // Click on the next page button
        await page.click('a.next.page-numbers');
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
    }

    console.log(news);

    // Write data to JSON file
    fs.writeFileSync('news.json', JSON.stringify(news, null, 2), 'utf-8');

    await browser.close();
}

module.exports = Finance;
//Done
