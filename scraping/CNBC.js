// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const { parse, format } = require('date-fns');
// const fs = require('fs');

// const url = 'https://www.cnbc.com/climate/';

// async function CNBC() {
//     const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
//     const page = await browser.newPage();
//     await page.setViewport({ width: 1920, height: 1080 });

//     try {
//         await page.goto(url, { waitUntil: 'networkidle2' });

//         const content = await page.content();
//         const $ = cheerio.load(content);

//         const news = [];

//         const titles = $('div.Card-rectangleToLeftSquareMedia');

//         titles.each((index, element) => {
//             try {
//                 const heading = $(element).find('a.Card-title').text().trim();
//                 const date = $(element).find('span.Card-time').text().trim();
//                 const link = $(element).find('a.Card-title').attr('href');
//                 const image_link = $(element).find('div.Card-image a div div picture img').attr('src');
//                 const description = '';

//                 news.push({ Title: heading, Description: description, Date: date, Link: link, Image_URL: image_link });
//             } catch (e) {
//                 console.error('Error parsing element:', e);
//             }
//         });

//         // Logging parsed news for debugging
//         console.log('Raw news items:', news);

//         let parsedNews = news.map(item => {
//             try {
//                 // Remove weekday and ordinal suffix
//                 const cleanedDate = item.Date.replace(/(\d+)(st|nd|rd|th)/, '$1').replace(/\s+/g, ' ');
//                 const parsedDate = parse(cleanedDate, 'd MMM yyyy', new Date());
//                 if (isNaN(parsedDate)) {
//                     throw new Error(`Invalid date format: ${cleanedDate}`);
//                 }
//                 return {
//                     ...item,
//                     Date: format(parsedDate, 'yyyy-MM-dd')
//                 };
//             } catch (error) {
//                 console.error('Error parsing date:', error.message, 'Original date:', item.Date);
//                 return null;
//             }
//         }).filter(item => item !== null); // Filter out items with invalid dates

//         parsedNews = parsedNews.filter((value, index, self) =>
//             index === self.findIndex((t) => (
//                 t.Title === value.Title
//             ))
//         );

//         parsedNews = parsedNews.filter(item => item.Date >= '2024-06-01' && item.Date <= '2024-06-30');

//         parsedNews.forEach(item => {
//             item.Source = 'CNBC';
//         });

//         console.log('Parsed news items:', parsedNews);

//         fs.writeFileSync('news.json', JSON.stringify(parsedNews, null, 2), 'utf-8');

//     } catch (error) {
//         console.error('Error scraping CNBC news:', error);
//     } finally {
//         await browser.close();
//     }
// }

// module.exports = CNBC;

// // Call the function to start scraping
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://www.cnbc.com/climate/';

async function CNBC() {
    const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });

        const content = await page.content();
        const $ = cheerio.load(content);

        const news = [];

        const titles = $('div.Card-rectangleToLeftSquareMedia');

        titles.each((index, element) => {
            try {
                const heading = $(element).find('a.Card-title').text().trim();
                const date = $(element).find('span.Card-time').text().trim();
                const link = $(element).find('a.Card-title').attr('href');
                const imageLink = $(element).find('div.Card-mediaContainer picture img').attr('src'); console.log('Image URL:', image_link);
                const description = '';


                news.push({ heading, description, date, link, imageLink });
            } catch (e) {
                console.error('Error parsing element:', e);
            }
        });

        // Logging parsed news for debugging
        console.log('Raw news items:', news);

        // Filter out duplicate news entries
        const uniqueNews = news.filter((value, index, self) =>
            index === self.findIndex((t) => t.Title === value.Title)
        );

        uniqueNews.forEach(item => {
            item.source = 'CNBC';
        });

        console.log('Unique news items:', uniqueNews);

        fs.writeFileSync('news.json', JSON.stringify(uniqueNews, null, 2), 'utf-8');

    } catch (error) {
        console.error('Error scraping CNBC news:', error);
    } finally {
        await browser.close();
    }
}

module.exports = CNBC;

// Done