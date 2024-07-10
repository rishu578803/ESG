const axios = require('axios');
const cheerio = require('cheerio');
const { parse, format } = require('date-fns');

const url = 'https://www.esgtimes.in/category/esg/';
const news = [];

async function EsgTimes() {
    try {
        for (let i = 1; i <= 2; i++) {
            console.log(`Fetching page ${i}...`);
            const response = await axios.get(`${url}page/${i}/`);
            const $ = cheerio.load(response.data);
            
            $('div.post-container').each((index, element) => {
                const imageLink = $(element).find('div.post-thumbnail img').attr('src');
                const postContent = $(element).find('div.post-content-container');
                const heading = postContent.find('a.post-title').text().trim();
                const DAte = postContent.find('a.post-date').text().trim();
                const description = postContent.find('div.post-content').text().trim();
                const link = postContent.find('a.post-title').attr('href');

                // Parse date using date-fns parse and format functions
                const date = format(parse(DAte, 'MMMM dd, yyyy', new Date()), 'yyyy-MM-dd');

                news.push({
                    heading,
                    description,
                   date,
                    link,
                    imageLink,
                    source: 'ESG Times'
                });
            });
            console.log(news);
        }
        return news;
    } catch (error) {
        console.error('Error during scraping:', error);
        throw error; // Propagate the error up
    }
}

module.exports = EsgTimes;
//DOne