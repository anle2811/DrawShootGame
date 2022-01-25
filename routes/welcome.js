var express = require('express');
const app = require('../app');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.app.locals.checkObj.showList = false;
  req.app.locals.checkObj.nickname = '';
  req.app.locals.checkObj.newRoom = false;
  res.render('welcome', req.app.locals.checkObj);
});

router.post('/roomlist', function(req, res, next) {
  req.app.locals.checkObj.showList = true;
  req.app.locals.checkObj.nickname = req.body.nickname;
  req.app.locals.checkObj.newRoom = true;
  res.render('welcome', req.app.locals.checkObj);
});

router.post('/gamescreen', function(req, res, next) {
  console.log('NickName: '+ req.body.action);
  console.log('Room Info: '+ req.body.roomInfo);
  res.render('GameScreen', {action: req.body.action, nickName: req.body.nickName, roomInfo: req.body.roomInfo});
});

module.exports = router;
