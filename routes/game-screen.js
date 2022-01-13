var express = require('express');
var router = express.Router();

/* GET Game Play page. */
router.get('/gamescreen', function(req, res, next) {
  res.render('GameScreen', { title: 'Noob Game' });
});

module.exports = router;