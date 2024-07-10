const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { parse, format } = require('date-fns');
const fs = require('fs');

const url = 'https://www.bbc.com/news/topics/cnvwkvd5q11t';

async function BBCNews() {
    const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 5000)); // Adjust wait time as needed

    const news = [];

    for (let i = 0; i < 3; i++) { // Loop through 3 pages
        // Wait for page content to load
        await page.waitForSelector('a.sc-2e6baa30-0.gILusN'); // Ensure that the main elements are loaded
        
        // Scrape news articles
        const content = await page.content();
        const $ = cheerio.load(content);

        $('a.sc-2e6baa30-0.gILusN').each((index, element) => {
            try {
                const heading = $(element).find('h2.sc-4fedabc7-3.bvDsJq').text().trim();
                const description = $(element).find('p.sc-ae29827d-0.cNPpME').text().trim();
                const date = $(element).find('span.sc-4e537b1-1.dkFuVs').text().trim();
                const link = $(element).attr('href');
                const imageLink = $(element).find('div.css-1m7apul-StyledFigure img').attr('src');

                news.push({ heading, description, date, link: 'https://www.bbc.com' + link, imageLink});
            } catch (error) {
                console.error('Error scraping article:', error);
            }
        });

        // Navigate to the next page
        const nextPageBtn = await page.$('button[data-testid="pagination-next-button"]');
        if (nextPageBtn) {
            await nextPageBtn.click();
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for the next page to load
        } else {
            break;
        }
    }

    await browser.close();

    // Log the news data to debug date formats
    console.log('Raw news data:', news);

    let parsedNews = news.map(item => {
        let parsedDate;
        try {
            parsedDate = format(parse(item.date, 'd MMM yyyy', new Date()), 'yyyy-MM-dd');
        } catch (error) {
            console.error(`Error parsing date: ${item.date} - ${error.message}`);
            parsedDate = 'Invalid date';
        }
        return {
            ...item,
            date: parsedDate
        };
    });

    parsedNews = parsedNews.filter((value, index, self) =>
        index === self.findIndex((t) => (
            t.heading === value.heading
        ))
    );

    parsedNews = parsedNews.filter(item => item.date >= '2024-06-01' && item.date <= '2024-06-30');

    parsedNews.forEach(item => {
        item.source = 'BBC';
    });

    console.log(parsedNews);

    fs.writeFileSync('bbc_news.json', JSON.stringify(parsedNews, null, 2), 'utf-8');
}

module.exports = BBCNews;
//Done