var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');

router.get('/articles', (req, res) => {
  fetch(`https://newsapi.org/v2/top-headlines?sources=the-verge&apiKey=${NEWS_API_KEY}`)
    .then(response => response.json())
    .then(data => {
      if (data.status === 'ok') {
        res.json({ articles: data.articles });
      } else {
        res.json({ articles: [] });
      }
    });
});

//Route pour afficher les tweets via leur trend


module.exports = router;
