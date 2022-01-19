var express = require('express');
var router = express.Router();

/* GET Game Play page. */
router.get('/', function(req, res, next) {
  console.log('GAMESCREEN: '+ req.body.action);
  
  res.render('GameScreen', { nickName: req.body.nickName, action: req.body.action });
});

module.exports = router;