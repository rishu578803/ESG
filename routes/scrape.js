const express = require('express');
const router = express.Router();
const scrapeESGMena = require('../scraping/esgmena');
const scrapeGTRReview = require('../scraping/gtrview');
const dateparser = require('dateparser');
const scrapeNews = require('../scraping/sustainability');
const EsgTimes  = require("../scraping/esgtimes");
const  BBCNews = require("../scraping/BBC");
const BusinessGreen = require("../scraping/Business-green");
const CNBC = require("../scraping/CNBC");
const Clarity = require("../scraping/esg-clarity");
const ESGNewsBG = require("../scraping/esg-news-bg");
const ESGNews = require("../scraping/esg-news");
const ESGToday = require("../scraping/esg-today");
const Finance = require("../scraping/Financial-express");
const Know = require("../scraping/know");
const SCMPNews = require("../scraping/SCMP");
const ThreeBL = require('../scraping/3bl-media');



router.get('/scrape', async (req, res) => {
    try {
        let news = [];

        console.log('Starting to scrape ESG Mena...');
        for (let i = 1; i <= 5; i++) {
            const esgmenaNews = await scrapeESGMena(i);
            console.log(`Page ${i} ESG Mena news:`, esgmenaNews);
            news = news.concat(esgmenaNews);
        }
        console.log('Finished scraping ESG Mena.');

        console.log('Starting to scrape GTR Review...');
        for (let i = 1; i <= 5; i++) {
            const gtrReviewNews = await scrapeGTRReview(i);
            console.log(`Page ${i} GTR Review news:`, gtrReviewNews);
            news = news.concat(gtrReviewNews);
        }
        console.log('Finished scraping GTR Review.');
        console.log('Starting to scrape Sustainability News...');

        // ======================================================== what is scrape news ==========================================================================

        // const sustainabilityNews = await scrapeNews(1);
        // console.log('Sustainability News:', sustainabilityNews);
        // news = news.concat(sustainabilityNews);
        // console.log('Finished scraping Sustainability News.');

        // console.log("starting to scrape ESGTimes....");
        // const esgtimesNews = await EsgTimes();
        // news = news.concat(esgtimesNews);
        // console.log("finished scrapping ESGTIMES......")
        // console.log("starting to scrape Three Bl....");
        // const ThreeBLNews = await ThreeBL();
        // news = news.concat(ThreeBLNews);
        // console.log("finished scrapping ThreeBl......")
        // console.log("starting to scrape bbcnews....");
        // const BBCNew = await BBCNews();
        // news = news.concat(BBCNew);
        // console.log("finished scrapping bbcnews......");
        // console.log("starting to scrape businessgreen....");
        // const BusinessGreennews = await BusinessGreen();
        // news = news.concat(BusinessGreennews);
        // console.log("finished scrapping businessgreen......");
        // console.log("starting to scrape cnbc....");
        // const Cnbc = await CNBC();
        // news = news.concat(Cnbc);
        // console.log("finished scrapping cnbc......");
        // console.log("starting to scrape clarity....");
        // const Claritynews = await Clarity();
        // news = news.concat(Claritynews);
        // console.log("finished scrapping clarity......");
        // console.log("starting to scrape ESGnewsbg....");
        // const ESGNewsbg = await ESGNewsBG();
        // news = news.concat(ESGNewsbg);
        // console.log("finished scrapping ESGnewsbg......")
        // console.log("starting to scrape ESGnews....");
        // const ESGNewss = await ESGNews();
        // news = news.concat(ESGNewss);
        // console.log("finished scrapping ESGnews......")
        // console.log("starting to scrape esgtoday....");
        // const ESGTodayy = await ESGToday();
        // news = news.concat(ESGTodayy);
        // console.log("finished scrapping esgtoday......")
        // console.log("starting to scrape finance....");
        // const Financee = await Finance();
        // news = news.concat(Financee);
        // console.log("finished scrapping finance......")
        // console.log("starting to scrape know....");
        // const Knows = await Know();
        // news = news.concat(Knows);
        // console.log("finished scrapping know......")
        // console.log("starting to scrape Scmp....");
        // const SCMPNewss = await SCMPNews();
        // news = news.concat(SCMPNewss);
        // console.log("finished scrapping Scmp......")
        
        // console.log('Parsing dates...');
        // news = news.map(item => {
        //     // Check if item.date is valid before parsing
        //     const parsedDate = item.date ? dateparser.parse(item.date) : null;
        //     const modifiedDate = parsedDate ? parsedDate.toISOString().split('T')[0] : 'Invalid Date';
        //     return { ...item, modifiedDate };
        // });
        // console.log('Dates parsed successfully.');
// ==================================================================================================================================
        res.json(news);
    } catch (error) {
        console.error('Error occurred while scraping:', error);
        res.status(500).json({ error: 'Error occurred while scraping', message: error.message });
    }
});

module.exports = router;