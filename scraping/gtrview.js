const axios = require('axios');
const { parse } = require('node-html-parser');

async function scrapeGTRReview(page) {
    const news = [];
    const url = `https://www.gtreview.com/news/page/${page}/`;
    try {
        const response = await axios.get(url);
        const root = parse(response.data);

        const main = root.querySelector('div.col-md-8');
        main.querySelectorAll('article').forEach(title => {
            const heading = title.querySelector('div.content h3').text.trim();
            const imageLink = title.querySelector('figure.faded a img').getAttribute('src');
            const date = title.querySelector('p.listdate')?.text.trim().split('/')[1].trim() || '';
            const description = title.querySelector('div.content').text.trim().split('\n')[2].trim();
            const link = title.querySelector('h3 a').getAttribute('href');

            news.push({ heading, description, date, link, imageLink, source: 'GTR Review' });
        });
    } catch (error) {
        console.error(`Error occurred while scraping GTR Review page ${page}:`, error);
    }

    return news;
}

module.exports = scrapeGTRReview;
