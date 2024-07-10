const axios = require('axios');
const { parse } = require('node-html-parser');

async function scrapeESGMena(page) {
    const news = [];
    const url = `https://esgmena.com/2024/06/page/${page}`;
    try {
        const response = await axios.get(url);
        const root = parse(response.data);

        root.querySelectorAll('li.list-post.pclist-layout').forEach(title => {
            const heading = title.querySelector('h2.penci-entry-title.entry-title.grid-title').text.trim();
            const date = title.querySelector('span.otherl-date').text.trim();
            const description = title.querySelector('div.item-content.entry-content')?.text.trim() || '';
            const link = title.querySelector('div.thumbnail a').getAttribute('href');
            const imageLink = title.querySelector('div.thumbnail a').getAttribute('data-bgset');

            news.push({ heading, description, date, link, imageLink, source: 'ESG Mena' });
        });
    } catch (error) {
        console.error(`Error occurred while scraping ESG Mena page ${page}:`, error);
    }

    return news;
}

module.exports = scrapeESGMena;
