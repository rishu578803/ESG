const puppeteer = require('puppeteer');
const { parse, format } = require('date-fns');
const fs = require('fs');

async function SCMPNews() {
    const browser = await puppeteer.launch({ headless: false }); // Launch browser
    const page = await browser.newPage(); // Open new tab
    await page.setViewport({ width: 1920, height: 1080 }); // Set view port

    const url = 'https://www.scmp.com/topics/esg-investing';
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 }); // Go to SCMP ESG investing topic page

    let news = [];

    try {
        console.log('Scraping articles...');
        const articles = await page.evaluate(() => {
            const articlesList = Array.from(document.querySelectorAll('div.eplnudt2.css-t1fovn.e1whfq0b0'));
            return articlesList.map(article => {
                const image_link_elem = article.querySelector('div.css-y5aea1.e1whfq0b5 a figure picture img');
                const heading_elem = article.querySelector('a.e1whfq0b2.css-8ug9pk.ef1hf1w0');
                const description_elem = article.querySelector('div.css-rofdc8.e1whfq0b4');
                const link_elem = article.querySelector('a.e1whfq0b2.css-8ug9pk.ef1hf1w0');
                const date_elem = article.querySelector('div.css-16gl5nu.e19yc7924 time');

                const imageLink = image_link_elem ? image_link_elem.src : null;
                const heading = heading_elem ? heading_elem.innerText.trim() : 'No heading';
                const description = description_elem ? description_elem.innerText.trim() : 'No description';
                const link = link_elem ? link_elem.href : 'No link';
                const date = date_elem ? date_elem.innerText.trim() : 'No date';

                return { heading, description, date, link: 'https://www.scmp.com' + link, imageLink };
            });
        });
        console.log(`Scraped ${articles.length} articles.`);
        console.log(articles);
        news.push(...articles);
    } catch (error) {
        console.error('Error scraping SCMP news:', error);
    }

    // Filter news within June 2024
    console.log('Filtering articles within June 2024...');
    news = news.filter(article => {
        let articleDate;
        try {
            articleDate = parse(article.date, 'dd MMM yyyy - h:mma', new Date());
        } catch (error) {
            console.error(`Error parsing date: ${article.date} - ${error.message}`);
            return false;
        }
        return articleDate >= new Date('2024-06-01') && articleDate <= new Date('2024-06-30');
    });

    console.log(`Filtered down to ${news.length} articles.`);

    console.log('Formatting dates...');
    news.forEach(article => {
        try {
            article.date = format(parse(article.date, 'dd MMM yyyy', new Date()), 'yyyy-MM-dd');
        } catch (error) {
            console.error(`Error formatting date: ${article.date} - ${error.message}`);
        }
        article.source = 'South China Morning Post';
    });

    console.log(news); // Output the scraped news to console

    await browser.close(); // Close the browser
}
 // Run the function to start scraping

module.exports = SCMPNews;
//Done