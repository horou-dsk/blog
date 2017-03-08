var express = require('express');
var router = express.Router();
var session = require("../filter/session");
var filter = require("../filter/filter");
require("../db/mysql");
var controller=require("../routes/controller");
router.all("*",function (req,res,next) {
   session(req,res);
   if(filter(req,res))
   next();
});
/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Red_ButterFly的博客' });
  controller.home(req,res);
});

router.get('/index',function (req,res) {
    req.getSession("wq",e=>{
        req.setSession({"wq":"八嘎呀路"});
        res.send(`<h1>${e.wq}</h1>`);
    })
});

router.get('/home',function (req,res) {
    req.getSession(['wq','haha','nihao']);
    controller.home(req,res);
});

module.exports = router;
