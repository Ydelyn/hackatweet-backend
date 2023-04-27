var express = require('express');
var router = express.Router();
require('../models/connection');
const { checkBody } = require('../modules/checkBody');

const Tweet = require('../models/tweets');


const fetch = require('node-fetch');

router.get('/', (req, res) => {
  Tweet.find()
    .then(data => {
      if (!data) {
        res.json({ result: false, error: 'Problems' });
      }
      else {
        res.json({ result: true, tweets: data });
      }
    });
});

router.post('/add', (req, res) => {
  if (!checkBody(req.body, ['text', 'author'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const newTweet = new Tweet({
    text: req.body.text,
    author: req.body.author,
  });

  newTweet.save().then(newDoc => {
    if(newDoc !== null){
      res.json({ result: true, message: 'Tweet enregistré' });
    }
    else{
      res.json({ result: false, error: 'Erreur innatendue' });
    }
  });
});


router.delete('/delete/:id', (req, res) => {
  Tweet.deleteOne({_id : req.params.id })
  .then(res.json({result : true , message : 'Tweet supprimé'}));
});


//Route pour afficher les tweets via leur trend

router.get('/:hashtag', (req, res) => {
  const regex = new RegExp('#' + req.params.hashtag, 'ig');
  Tweet.find({ text: {$regex: regex} })
    .then(data => {
      if (data === null) {
        res.json({ result: false, error: 'Erreur innatendue' });
      }
      else {
        res.json({ result: true, tweets: data });
      }
    });
});

module.exports = router;
