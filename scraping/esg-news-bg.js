const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { parse } = require('date-fns');

async function ESGNewsBG() {
    const browser = await puppeteer.launch({ headless: false }); // Launch browser in headless mode
    const page = await browser.newPage(); // Create a new page instance

    try {
        const url = 'https://esgnews.bg/en/home-english/';
        console.log('Navigating to:', url);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0}); // Navigate to the URL

        await autoScroll(page); // Function to scroll to the bottom of the page

        // Click the "Load More" button if it exists
        const loadMoreButton = await page.$('a[data-load="Load More"]');
        if (loadMoreButton) {
            console.log('Clicking "Load More" button...');
            await loadMoreButton.click();
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds for content to load
        }

        const content = await page.content(); // Get the page content
        const $ = cheerio.load(content); // Load content into cheerio for easier DOM manipulation

        const news = [];

        // Iterate over each article element and extract relevant information
        console.log('Scraping articles...');
        $('article.jeg_post').each((index, element) => {
            const heading = $(element).find('h3.jeg_post_title').text().trim();
            const description = $(element).find('div.jeg_post_excerpt').text().trim();
            const date = $(element).find('div.jeg_meta_date').text().trim();
            const link = $(element).find('h3.jeg_post_title a').attr('href');
            const imageLink = $(element).find('div.thumbnail-container img').attr('src');

            // Push article data into the news array
            news.push({
                heading,
                description,
                date,
                link: 'https://esgnews.bg' + link, // Concatenate with base URL
                imageLink,
                source : "ESG NEWS"

            });
        });
        console.log("News dates before filtering:", news.map(article => article.date));

        // Filter news by date (June 2024)
        const filteredNews = news.filter(article => {
            const articleDate = parse(article.date, 'MMMM d, yyyy', new Date());
            return articleDate >= new Date('2024-06-01') && articleDate <= new Date('2024-06-30');
        });


        console.log('Filtered news:', filteredNews); // Output the filtered news array

        return filteredNews; // Return the filtered news array

    } catch (error) {
        console.error('Error during scraping:', error);
        return []; // Return an empty array if there's an error
    } finally {
        await browser.close(); // Close the browser after scraping is done
    }
}

// Function to scroll to the bottom of the page
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });
}

module.exports = ESGNewsBG;

// Example usage:
// Call scrapeESGNewsBG() in another module or script to use the function.
//Done