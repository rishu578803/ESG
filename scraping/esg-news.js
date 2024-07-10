const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { parse, format } = require('date-fns');
const fs = require('fs');

const urls = [
    'https://esgnews.com/category/global-news/',
    'https://esgnews.com/category/esg-reporting/',
    'https://esgnews.com/category/environmental',
    'https://esgnews.com/category/climate/',
    'https://esgnews.com/category/energy/',
    'https://esgnews.com/category/sustainable-finance/',
];

const news = [];

async function ESGNews() {const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { parse } = require('date-fns');

async function ESGNewsBG() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url = 'https://esgnews.bg/en/home-english/';

    try {
        // Increase the timeout to 60 seconds
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(10000); // Adjust wait time as needed

        // Function to scroll to the bottom of the page
        async function autoScroll(page){
            await page.evaluate(async () => {
                await new Promise((resolve, reject) => {
                    var totalHeight = 0;
                    var distance = 100;
                    var timer = setInterval(() => {
                        var scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        
                        if(totalHeight >= scrollHeight){
                            clearInterval(timer);
                            resolve();
                        }
                    }, 200);
                });
            });
        }

        await autoScroll(page);

        // Click the "Load More" button if it exists
        const loadMoreButton = await page.$('a[data-load="Load More"]');
        if (loadMoreButton) {
            await loadMoreButton.click();
            await page.waitForTimeout(3000); // Wait for content to load
        }

        const content = await page.content();
        const $ = cheerio.load(content);

        const news = [];

        $('article.jeg_post').each((index, element) => {
            const heading = $(element).find('h3.jeg_post_title').text().trim();
            const description = $(element).find('div.jeg_post_excerpt').text().trim();
            const date = $(element).find('div.jeg_meta_date').text().trim();
            const link = $(element).find('h3.jeg_post_title a').attr('href');
            const image_link = $(element).find('div.thumbnail-container img').attr('src');

            news.push({
                heading,
                description,
                date,
                link: 'https://esgnews.bg' + link,
                image_link
            });
        });

        // Filter news by date (June 2024)
        const filteredNews = news.filter(article => {
            const articleDate = parse(article.date, 'dd MMM yyyy', new Date());
            return articleDate >= new Date('2024-06-01') && articleDate <= new Date('2024-06-30');
        });

        console.log(filteredNews);

    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await browser.close();
    }
}

module.exports = ESGNewsBG;

    const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    for (const url of urls) {
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Wait for the popup to appear (Adjust the time as necessary)
        await new Promise(resolve => setTimeout(resolve, 10000));

        await scrollToBottom(page);

        await page.click('.ajax-load-more');
        await new Promise(resolve => setTimeout(resolve, 3000));

        await scrollToBottom(page);

        const content = await page.content();
        const $ = cheerio.load(content);

        $('div.has-thumbnail').each((index, element) => {
            const imageLink = $(element).find('a.tt-post-img.custom-hover img').attr('src');
            const title = $(element).find('div.tt-post-info');
            const heading = title.find('a.tt-post-title.c-h5').text().trim();
            const description = title.find('div.simple-text').text().trim();
            const date = title.find('span.tt-post-date').text().trim().replace(/ ET$/, '');
            const link = title.find('a.tt-post-title.c-h5').attr('href');

            news.push({heading, description, date, link, imageLink });
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
        item.source = 'ESG News';
    });

    console.log(parsedNews);

    fs.writeFileSync('news.json', JSON.stringify(parsedNews, null, 2), 'utf-8');
}

async function scrollToBottom(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

module.exports = ESGNews;
//Done