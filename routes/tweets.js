var express = require('express');
var router = express.Router();
require('../models/connection');
const { checkBody } = require('../modules/checkBody');

const Tweet = require('../models/tweets');
const Trend = require('../models/trends');


const fetch = require('node-fetch');

router.get('/', (req, res) => {
  Tweet.find().populate('author').sort({_id: -1}).limit(10)
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
    nb_likes: 0,
    date: new Date(),
    author: req.body.author,
  });

  newTweet.save().then(newDoc => {
    if (newDoc !== null) {
      if (newDoc.text.includes('#')) {
        let regex = /#[^#]*\s/gi;
        const tab = newDoc.text.match(regex);
        if (tab !== null) {
          for (const a of tab) {
            Trend.findOne({ hashtag: a.slice(0, -1) })
              .then(data => {
                if (!data) {
                  const newTrend = new Trend({
                    hashtag: a.slice(0, -1),
                    count: 1,
                  });
                  newTrend.save()
                    .then();
                }
                else {
                  Trend.updateOne({ hashtag: a.slice(0, -1) }, { count: data.count + 1 })
                    .then();
                }
              })
          }
          res.json({ result: true });
        }
        else {
          res.json({ result: tab });
          return;
        }
      }
      else {
        res.json({ result: true, message: 'Tweet enregistré' });
        return;
      }
    }
    else {
      res.json({ result: false, error: 'Erreur innatendue' });
      return;
    }
  });
});


router.delete('/delete/:id', (req, res) => {
  Tweet.findById(req.params.id)
    .then(newDoc => {
      if (newDoc !== null) {
        if (newDoc.text.includes('#')) {
          let regex = /#[^#]*\s/gi;
          const tab = newDoc.text.match(regex);
          for (const a of tab) {
            Trend.findOne({ hashtag: a.slice(0, -1) })
              .then(data => {
                Trend.updateOne({ hashtag: a.slice(0, -1) }, { count: data.count - 1 })
                .then();
                // .then(res.json({ result: true, message: `${data.hashtag} : ${data.count-1}` }));
              })
          }
          Tweet.deleteOne({ _id: req.params.id })
            .then(res.json({ result: true, message: 'Tweet supprimé et trend maj', id: req.params.id }))
        }
        else {
          Tweet.deleteOne({ _id: req.params.id })
            .then(res.json({ result: true, message: 'Tweet supprimé', id: req.params.id }))
        }
      }
      else {
        res.json({ result: false, error: 'Tweet inexistant' });
      }
    })
});

router.get('/like/add/:id', (req, res) => {
  Tweet.findById(req.params.id)
  .then(data => {
    if(data){
      Tweet.updateOne({_id: req.params.id}, {nb_likes: data.nb_likes +1})
      .then(res.json({ result: true, message: 'Like +1' }))
    }
    else{
      res.json({ result: false, message: 'Pas de tweet associé à cet ID' })
    }
  })
})


router.get('/like/remove/:id', (req, res) => {
  Tweet.findById(req.params.id)
  .then(data => {
    if(data){
      Tweet.updateOne({_id: req.params.id}, {nb_likes: data.nb_likes -1})
      .then(res.json({ result: true, message: 'Like -1' }))
    }
    else{
      res.json({ result: false, message: 'Pas de tweet associé à cet ID' })
    }
  })
})

//Route pour afficher les tweets via leur trend

router.get('/trends/:hashtag', (req, res) => {
  const regex = new RegExp('#' + req.params.hashtag, 'ig');
  Tweet.find({ text: { $regex: regex } })
    .then(data => {
      if (data === null) {
        res.json({ result: false, error: 'Erreur inattendue' });
      }
      else {
        res.json({ result: true, tweets: data });
      }
    });
});

router.get('/trends', (req, res) => {
  Trend.find()
    .then(data => {
      if (!data) {
        res.json({ result: false, error: 'Problems' });
      }
      else {
        res.json({ result: true, trends: data });
      }
    });
});

module.exports = router;
