const express = require("express"),
bodyParser = require("body-parser"),
app = express(),
rateLimit = require("express-rate-limit"),
got = require('got');
require('dotenv').config()

const limiter = rateLimit({
    windowMs: process.env.minutes * 60 * 1000, // minutes
    max: process.env.maxReq // max req in windowMs time
});

/*
    * Why i add bodyParser ? 
    * I will update this very soon 
    * And add another cool stuff on this template
*/
app.use(bodyParser.urlencoded({ extended: false })) 
app.use(bodyParser.json())
app.use(limiter);

app.get("/", (req, res) => {
    res.redirect("/meme?lang=en")
})

/*
    * Why you Add languages ?
    * Its simple ... so u can add your own language
    * And use it in this simple meme api template
*/

const keys = require("./keys.json")
app.get("/meme", async (req, res) => {
    var lang = req.query.lang || req.query.language
    if(!lang) {
        res.redirect("/meme?lang=en")
    }
    if(lang == "en") {
        var random = keys.en[Math.floor(Math.random() * keys.en.length)];
        got(`https://www.reddit.com/r/${random}/random/.json`).then(res => {
			let content = JSON.parse(res.body);
			let permalink = content[0].data.children[0].data.permalink;
			let url = `https://reddit.com${permalink}`;
			let image = content[0].data.children[0].data.url;
			let title = content[0].data.children[0].data.title;
			let upVotes = content[0].data.children[0].data.ups;
			let downVotes = content[0].data.children[0].data.downs;
			let numComments = content[0].data.children[0].data.num_comments;
            res.json({
                title: title,
                upVotes: upVotes,
                downVotes: downVotes,
                numComments: numComments,
                meme: {
                    url: url,
                    image: image,
                },
                randomKey: random
            })
        })
    } else {
        res.redirect("/meme?lang=en")
    }
})

app.listen(process.env.port, () => {
    console.log(`Ready on ${process.env.port}`)
})