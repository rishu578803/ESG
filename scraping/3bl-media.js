const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function ThreeBL() {
    const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const url = 'https://www.3blmedia.com/news/all';
    const options = ['Environment', 'Green Infrastructure', 'Sustainable Development Goals', 'Sustainable Finance & Socially Responsible Investment'];

    let news = [];

    for (let option of options) {
        console.log(`Navigating to URL: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

        console.log(`Selecting option: ${option}`);
        await page.select('#edit-field-fmr-primary-category-target-id', option);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for the page to load after selecting an option

        for (let i = 0; i < 2; i++) {
            console.log(`Scraping page ${i + 1} for option: ${option}`);
            let content = await page.content();
            let $ = cheerio.load(content);

            let titles = $('section.teaser-newsfeed');

            titles.each((index, element) => {
                try {
                    let heading = $(element).find('h4.h5.teaser-title').text().trim();
                    let description = $(element).text().trim().split('\n').pop().trim();
                    let date = $(element).find('p.date').text().trim();
                    let link = 'https://www.3blmedia.com' + $(element).find('h4.h5.teaser-title span a').attr('href');
                    let imageLink = 'https://www.3blmedia.com' + $(element).find('div.teaser-image a img').attr('src');

                    news.push({heading, description, date, link, imageLink});
                } catch (e) {
                    console.error('Error extracting article details:', e);
                }
            });

            // Check if the "next page" button exists and click it
            let nextPageBtn = await page.$('a.page-link[rel="next"]');
            if (nextPageBtn) {
                console.log('Navigating to the next page');
                await nextPageBtn.evaluate(btn => btn.click());
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for the next page to load
            } else {
                console.log('No next page button found, breaking loop');
                break;
            }
        }
    }

    // Filter duplicate news entries
    let uniqueNews = news.filter((value, index, self) =>
        index === self.findIndex((t) => (
            t.Title === value.Title
        ))
    );

    // Filter news based on date range if needed, currently skipped to keep dates as text
    // uniqueNews = uniqueNews.filter(item => {
    //     let itemDate = new Date(item.Date); // Convert date text to Date object for comparison
    //     return itemDate >= new Date('2024-06-01') && itemDate <= new Date('2024-06-30');
    // });

    uniqueNews.forEach(item => {
        item.source = '3BL Media';
    });

    console.log(uniqueNews);

    fs.writeFileSync('3blmedia_news.json', JSON.stringify(uniqueNews, null, 2), 'utf-8');

    await browser.close();
}

module.exports = ThreeBL;
//Done

