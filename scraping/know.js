const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { parse, format } = require('date-fns');
const fs = require('fs');

const baseUrl = 'https://www.knowesg.com/environment';
const detailUrl = 'https://www.knowesg.com';

async function Know() {
    const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    let news = [];

    await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 0 });
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    let content = await page.content();
    let $ = cheerio.load(content);

    let titles = $('a.group.py-5.border-b.border-neutral-1.block');

    titles.each((index, element) => {
        try {
            let heading = $(element).find('h2.sourceSerif.font-normal.text-base.group-hover\\:text-primary-dark.text-neutral-10.transition-colors.duration-100.ease-linear').text().trim();
            let date = $(element).find('div.mt-3.text-xs.text-neutral-4').text().trim();
            let link = $(element).attr('href');
            link = detailUrl + link;

            news.push({ Title: heading, Date: date, Link: link });
        } catch (e) {
            console.error('Error extracting main page article:', e);
        }
    });

    for (let i = 2; i < 10; i++) {
        await page.goto(`${baseUrl}/${i}/`, { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 10000));

        content = await page.content();
        $ = cheerio.load(content);

        titles = $('a.group.py-5.border-b.border-neutral-1.block');

        titles.each((index, element) => {
            try {
                let heading = $(element).find('h2.sourceSerif.font-normal.text-base.group-hover\\:text-primary-dark.text-neutral-10.transition-colors.duration-100.ease-linear').text().trim();
                let date = $(element).find('div.mt-3.text-xs.text-neutral-4').text().trim();
                let link = $(element).attr('href');
                link = detailUrl + link;

                news.push({ Title: heading, Date: date, Link: link });
            } catch (e) {
                console.error('Error extracting paginated article:', e);
            }
        });
    }

    let articles = [];

    for (let item of news) {
        await page.goto(item.Link, { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 7000));

        content = await page.content();
        $ = cheerio.load(content);

        try {
            let heading = $('h1.font-semibold.text-xl.sm\\:text-3xl.mt-2.text-neutral-9.leading-8.md\\:leading-10.lg\\:leading-10.tracking-wide.sourceserif').text();
            let imageLink = $('div.gatsby-image-wrapper picture img').attr('src');
            let date = $('div.font-normal.text-xs.mt-4.text-neutral-4 time').text();
            let description = $('div.mt-9.text-neutral-6.text-lg.prose.prose-sm.2xl\\:prose-lg.max-w-none.tracking-wide.sourceserif h2').text();

            articles.push({ heading, description, date, link: item.Link, imageLink });
        } catch (e) {
            console.error('Error extracting article details:', e);
        }
    }

    let parsedNews = articles.map(item => {
        return {
            ...item,
        };
    });

    parsedNews = parsedNews.filter((value, index, self) =>
        index === self.findIndex((t) => (
            t.Title === value.Title
        ))
    );

    // parsedNews = parsedNews.filter(item => item.Date >= '2024-06-01' && item.Date <= '2024-06-30');

    parsedNews.forEach(item => {
        item.source = 'Know ESG';
    });

    console.log(parsedNews);

    fs.writeFileSync('news.json', JSON.stringify(parsedNews, null, 2), 'utf-8');
}

module.exports = Know;

// Call the function to start scraping
//Done