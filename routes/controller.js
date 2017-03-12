var formidable=require('formidable');
var fs=require('fs');
var path=require('path');
const crypto = require('crypto');
module.exports={
    home:function(req,res){
        mysqldb.query("select * from users join blogArticles on users.id=blogArticles.user_id",function(err,data,fields){
            if(err){
                console.log(err);
                return;
            }
            for(let v of data){
                var date=new Date(v.create_date);
                v.create_date=date.getFullYear()+"年"+(date.getMonth()+1)+"月"+date.getDate()+"日"+"  "+date.getHours()+":"+date.getMinutes();
            }
            req.getSession(function(reqs){
                res.render('index', { title: 'Red_ButterFly的博客' ,info:data,userinfo:reqs});
            });
        });
        /*var articles=yield users.getblogArticles();
        articles.forEach(function(note){
            console.log(note);
        });*/
        /*users.findAll().then(function(data){
            for(var a of data){
                console.log(a.dataValues);
            }
            req.setFn(e=>{
                console.log(e);
                res.send("<h1>哈哈哈哈</h1>");
            });
            res.render('index', { title: 'Red_ButterFly的博客' });
        }).catch(function(err){
            console.log(err);
        });*/
    },
    login:function(req,res){
        var userinfo=req.body;
        let pwd=crypto.createHmac('md5',userinfo.pwd)
            .digest('hex');
        mysqldb.query('select * from users where name=? and password=?',[userinfo.username,pwd],function(err,data){
            if(err)return;
            let expireTime;
            let sessionAge=2592000000;
            for(var v of data){
                if(userinfo.autologin==='true'){
                    expireTime=Date.now()+sessionAge;
                    res.cookie('.ExS',req.getSessionId(),{httpOnly:true,maxAge:sessionAge});
                }else{
                    expireTime=null;
                }
                req.setSession({id:v.id,name:v.name,age:v.age,email:v.email,head:v.head,expireTime:expireTime});
            }
            req.getSession(function(e){
                if(e&&e.id){
                    res.send({status:1});
                }else{
                    res.send({status:0});
                }
            });
        });
    },
    relogin:function (req,res) {
        req.clearSession();
        res.clearCookie('.ExS',{path:"/"});
        //req.setSession({wocao:"能不能添加，我要睡觉了！！"});
        req.setFn(function(){
            res.redirect('/');
        });
    },
    account:function(req,res){
        req.getSession(function (reqs) {
            let ac=req.query.tab||'new-post';
            res.render('account',{title:'会员账号',userinfo:reqs,inmodal:ac});
        });
    },
    editorimg:function (req,res) {
        let form = new formidable.IncomingForm();
        form.encoding = 'utf-8';
        form.uploadDir=path.join(__dirname,"../public/images/temp/");
        let uploadfolderpath=path.join(__dirname, '../public/images/post/');

        form.parse(req,function (err,fields,files) {
            if(err){
                console.log(err);
                return;
            }
            for(let item in files){
                let file=files[item];
                var tempfilepath = file.path;
                // 获取文件类型
                var type = file.type;
                // 获取文件名，并根据文件名获取扩展名
                var filename = file.name;
                var extname = filename.lastIndexOf('.') >= 0
                    ? filename.slice(filename.lastIndexOf('.') - filename.length)
                    : '';
                // 文件名没有扩展名时候，则从文件类型中取扩展名
                if (extname === '' && type.indexOf('/') >= 0) {
                    extname = '.' + type.split('/')[1];
                }
                // 将文件名重新赋值为一个时间戳（避免文件重名）
                filename = Math.floor(Math.random()*1000).toString()+Date.now() + extname;

                // 构建将要存储的文件的路径
                var filenewpath = path.join(uploadfolderpath, filename);
                // 将临时文件保存为正式的文件
                fs.rename(tempfilepath, filenewpath, function (err) {
                    // 存储结果
                    var result = '';

                    if (err) {
                        // 发生错误
                        console.log('fs.rename err');
                        result = 'error|save error';
                    } else {
                        // 保存成功
                        console.log('fs.rename done');
                        // 拼接图片url地址
                        result = 'http://localhost:22220/images/post/' + filename;
                    }

                    // 返回结果
                    res.writeHead(200, {
                        'Content-type': 'text/html'
                    });
                    res.end(result);
                }); // fs.rename
            }
        })
    },
    register:function (req,res) {
        let userinfo=req.query;
        if(userinfo.username){
            let pwd=crypto.createHmac('md5',userinfo.pwd)
                .digest('hex');
            mysqldb.query('insert into users(name,password) value(?,?)',[userinfo.username,pwd],function (err,e) {
                if(err)return console.log(err);
                res.redirect('/');
            })
        }else{
            res.render('register',{title:"注册"});
        }
    },
    newpost:function(req,res){
        var postdata=req.body;
        if(postdata.title==''){
            res.send({status:0,msg:"请输入文章标题^ ^"});
        }else if(postdata.content==''){
            res.send({status:0,msg:"请输入文章内容^ ^"});
        }else{
            req.getSession(function (user) {
                mysqldb.query('insert into blogarticles(title,content,create_date,user_id) value(?,?,?,?)',
                    [postdata.title,postdata.content,new Date(),user.id],function(err){
                    if(err)return console.log(err);
                    res.send({status:1,msg:"提交成功！"});
                });
            });
        }
    }
};