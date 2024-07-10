// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const { parse, format } = require('date-fns');
// const fs = require('fs');
// const axios = require('axios');

// async function BusinessGreen() {
//     const browser = await puppeteer.launch({ headless: true, args: ['--start-maximized'] });
//     const page = await browser.newPage();
//     await page.setViewport({ width: 1920, height: 1080 });

//     let news = [];
//     const baseUrl = 'https://www.businessgreen.com';
//     const targetUrl = `${baseUrl}/type/news/page/`;

//     for (let i = 1; i <= 20; i++) {
//         const url = `${targetUrl}${i}`;
//         console.log(`Scraping: ${url}`);
        
//         const response = await axios.get(url);
//         const $ = cheerio.load(response.data);

//         $('div.mb-2').each((index, element) => {
//             try {
//                 const heading = $(element).find('div.platformheading h4').text().trim();
//                 const description = $(element).find('div.searchpara').text().trim();
//                 let link = $(element).find('div.platformheading h4 a').attr('href');
//                 link = baseUrl + link;
//                 const date = $(element).find('div.published').text().trim().split('\n')[0];
//                 const image_link = $(element).find('div.listing-left div a img').attr('src');
                
//                 news.push({ Title: heading, Description: description, Date: date, Link: link, Image_URL: image_link });
//             } catch (e) {
//                 console.error(e);
//             }
//         });
//     }

//     // Log raw news data for debugging
//     console.log('Raw news data:', news);

//     // Format dates and filter data
//     news = news.map(item => {
//         let parsedDate;
//         try {
//             parsedDate = format(parse(item.Date, 'dd MMM yyyy', new Date()), 'yyyy-MM-dd');
//         } catch (error) {
//             console.error(`Error parsing date: ${item.Date} - ${error.message}`);
//             parsedDate = 'Invalid date';
//         }
//         return {
//             ...item,
//             Date: parsedDate
//         };
//     });

//     // Filter out invalid dates
//     news = news.filter(item => item.Date !== 'Invalid date');

//     news = news.filter((value, index, self) =>
//         index === self.findIndex((t) => t.Title === value.Title)
//     );

//     news = news.filter(item => item.Date >= '2024-06-01' && item.Date <= '2024-06-30');

//     news.forEach(item => {
//         item.Source = 'Business Green';
//     });

//     console.log(news);

//     fs.writeFileSync('business_green_news.json', JSON.stringify(news, null, 2), 'utf-8');

//     await browser.close();
// }

// module.exports = BusinessGreen;
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const axios = require('axios');

async function BusinessGreen() {
    const browser = await puppeteer.launch({ headless: true, args: ['--start-maximized'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    let news = [];
    const baseUrl = 'https://www.businessgreen.com';
    const targetUrl = `${baseUrl}/type/news/page/`;

    for (let i = 1; i <= 20; i++) {
        const url = `${targetUrl}${i}`;
        console.log(`Scraping: ${url}`);
        
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        $('div.mb-2').each((index, element) => {
            try {
                const heading = $(element).find('div.platformheading h4').text().trim();
                const description = $(element).find('div.searchpara').text().trim();
                let link = $(element).find('div.platformheading h4 a').attr('href');
                link = baseUrl + link;
                const date = $(element).find('div.published').text().trim().split('\n')[0];
                const imageLink = $(element).find('div.listing-left div a img').attr('src');
                
                news.push({heading, description, date, link, imageLink });
            } catch (e) {
                console.error(e);
            }
        });
    }

    // Log raw news data for debugging
    console.log('Raw news data:', news);

    // Filter out duplicate news entries
    news = news.filter((value, index, self) =>
        index === self.findIndex((t) => t.Title === value.Title)
    );

    // Optional: Filter news based on date range as text (if required)
    // This part is commented out because it would require date parsing to filter by date range
    // news = news.filter(item => {
    //     let itemDate = new Date(item.Date); // Convert date text to Date object for comparison
    //     return itemDate >= new Date('2024-06-01') && itemDate <= new Date('2024-06-30');
    // });

    news.forEach(item => {
        item.source = 'Business Green';
    });

    console.log(news);

    fs.writeFileSync('business_green_news.json', JSON.stringify(news, null, 2), 'utf-8');

    await browser.close();
}

module.exports = BusinessGreen;

//Done

