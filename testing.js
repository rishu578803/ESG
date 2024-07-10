

// async function testScrapeGTRReview() {
//     for (let i = 1; i <= 5; i++) {
//         const news = await scrapeGTRReview(i);
//         console.log(news);
//     }
// }

// testScrapeGTRReview();
// const scrapeNews = require('../server/scraping/sustainability');

// async function test() {
    
//     try {
//         const newsData = await scrapeNews();
//         console.log(JSON.stringify(newsData, null, 2)); // Pretty-print JSON
//     } catch (error) {
//         console.error('Error scraping news:', error);
//     }
// }
// const ThreeBL = require("../server/scraping/3bl-media") 
// async function test() {
//     const newsdata = await ThreeBL();
//     console.log(newsdata);
    
// }
// test();
const CNBC = require("../server/scraping/CNBC");
function test(){
    const newsData = CNBC()
    console.log(newsData)
}
test();
