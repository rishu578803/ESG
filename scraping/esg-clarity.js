const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { parse, format } = require('date-fns');
const fs = require('fs');

const urlBase = 'https://esgclarity.com/asia/news-asia/page/';

async function Clarity() {
    const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const news = [];

    for (let i = 1; i <= 2; i++) {
        const url = `${urlBase}${i}/`;
        await page.goto(url, { waitUntil: 'networkidle2' });

        const content = await page.content();
        const $ = cheerio.load(content);

        const titles = $('div.homepage-article-container');

        titles.each((index, element) => {
            try {
                const imageLink = $(element).find('div.homepage-article-image-container a img').attr('src');
                const heading = $(element).find('div.homepage-article-content-container a').text().trim();
                const date = $(element).find('div.entry-meta').text().trim();
                const link = $(element).find('div.homepage-article-content-container a').attr('href');
                const description = '';

                news.push({heading, description, date, link, imageLink });
            } catch (e) {
                console.error(e);
            }
        });
    }

    await browser.close();

    let parsedNews = news.map(item => {
        try {
            // Remove ordinal indicators and ensure the date is in a parseable format
            const cleanedDate = item.Date.replace(/(\d+)(st|nd|rd|th)/, '$1').replace(/\s+/g, ' ');
            const parsedDate = parse(cleanedDate, 'd MMM yyyy', new Date());
            if (isNaN(parsedDate)) {
                throw new Error(`Invalid date format: ${cleanedDate}`);
            }
            return {
                ...item,
                Date: format(parsedDate, 'yyyy-MM-dd')
            };
        } catch (error) {
            console.error('Error parsing date:', error.message, 'Original date:', item.Date);
            return null;
        }
    }).filter(item => item !== null);
    

    parsedNews = parsedNews.filter((value, index, self) =>
        index === self.findIndex((t) => (
            t.Title === value.Title
        ))
    );

    parsedNews = parsedNews.filter(item => item.Date >= '2024-06-01' && item.Date <= '2024-06-30');

    parsedNews.forEach(item => {
        item.source = 'ESG Clarity';
    });

    console.log(parsedNews);

    fs.writeFileSync('news.json', JSON.stringify(parsedNews, null, 2), 'utf-8');
}

module.exports = Clarity;

// Call the function to start scraping
//Done