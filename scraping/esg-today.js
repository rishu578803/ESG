const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { parse, format } = require('date-fns');
const fs = require('fs');

const urlBase = 'https://www.esgtoday.com/category/esg-news/page/';

async function ESGToday() {
    const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const news = [];

    for (let i = 1; i <= 10; i++) {
        const url = `${urlBase}${i}/`;
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Wait for the page to load
        await new Promise(resolve => setTimeout(resolve, 10000));

        const content = await page.content();
        const $ = cheerio.load(content);

        const div = $('main.tf_clearfix');
        const titles = div.find('article.tf_clearfix');

        titles.each((index, element) => {
            try {
                const image_link = $(element).find('figure.post-image a img').attr('src');
                const heading = $(element).find('h2.post-title.entry-title').text().trim();
                const description = $(element).find('div.entry-content').text().trim();
                const date = $(element).find('time.post-date.entry-date.updated').text().trim();
                const link = $(element).find('h2.post-title.entry-title a').attr('href');

                news.push({ Title: heading, Description: description, Date: date, Link: link, Image_URL: image_link });
            } catch (e) {
                console.error(e);
            }
        });
    }

    await browser.close();

    let parsedNews = news.map(item => {
        return {
            ...item,
            Date: format(parse(item.Date, 'MMMM d, yyyy', new Date()), 'yyyy-MM-dd')
        };
    });

    parsedNews = parsedNews.filter((value, index, self) =>
        index === self.findIndex((t) => (
            t.Title === value.Title
        ))
    );

    parsedNews = parsedNews.filter(item => item.Date < '2024-06-30');

    parsedNews.forEach(item => {
        item.source = 'ESG Today';
    });

    console.log(parsedNews);

    fs.writeFileSync('news.json', JSON.stringify(parsedNews, null, 2), 'utf-8');
}
 module.exports = ESGToday;
//Done