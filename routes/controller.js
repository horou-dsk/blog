var formidable=require('formidable');
var fs=require('fs');
var path=require('path');
const crypto = require('crypto');
function birthdayToAge(birthday){
    let currentTime=new Date();
    let age=currentTime.getFullYear()-birthday.getFullYear(),monthX=currentTime.getMonth()-birthday.getMonth();
    if(monthX<0){
        age--;
    }else if(monthX===0){
        if(currentTime.getDate()-birthday.getDate()<0){
            age--;
        }
    }
    return age;
}
module.exports={
    home:function(req,res){
        mysqldb.query("select * from users join blogarticles on users.id=blogarticles.user_id",function(err,data,fields){
            if(err){
                console.log(err);
                return;
            }
            for(let v of data){
                var date=new Date(v.create_date);
                var content=v.content.match(/<p([^>]+?|)>(?!<img)(.+?)<\/p>/);
                if(content!=null){
                    v.content=content[2].substr(0,4)=="<br>"?"":"<p>"+content[2]+"...</p>";
                }else{
                    v.content="";
                }
                if(v.content.search("<code")!=-1){
                    v.content="";
                }
                if(v.tabs){
                    v.tabs=v.tabs.split(',');
                }else{
                    v.tabs=[];
                }
                v.create_date=date.getFullYear()+"年"+(date.getMonth()+1)+"月"+date.getDate()+"日"+"  "+date.getHours()+":"+date.getMinutes();
            }
            req.getSession(function(reqs){
                res.render('index', { title: 'OGC' ,info:data,userinfo:reqs});
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
                let age=birthdayToAge(new Date(v.birthday));
                req.setSession({id:v.id,name:v.name,age:age,email:v.email,head:v.head,expireTime:expireTime});
            }
            req.getSession(function(e){
                if(e&&e.id){
                    res.send({status:1,msg:"登录成功!^_^"});
                }else{
                    res.send({status:0,msg:"用户名或密码错误!T T"});
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
            let title='会员账号';
            switch (ac){
                case 'new-post':
                    title='发布帖子';
                    break;
                case 'edit-post':
                    ac='new-post';
                    let blogId=req.query.ptid;
                    if(!blogId)break;
                    title="修改帖子";
                    let sql="select * from users join blogarticles on users.id=blogarticles.user_id where blogarticles.id=?";
                    mysqldb.query(sql,[blogId],function (err,datas) {
                        if(err)return console.log(err);
                        let data=datas[0];
                        if(data.tabs){
                            data.tabs=data.tabs.split(",");
                        }else{
                            data.tabs=[];
                        }
                        if(reqs.id!=data.user_id){
                            res.redirect('/');
                        }else{
                            res.render('account',{title:title,userinfo:reqs,inmodal:ac,bloginfo:data});
                        }
                    });
                    return;
            }
            res.render('account',{title:title,userinfo:reqs,inmodal:ac,bloginfo:{}});
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
                if(postdata.ptid){
                    mysqldb.query('update blogarticles set title=?,content=?,tabs=? where id=?',
                    [postdata.title,postdata.content,postdata.tabs,postdata.ptid],function (err,datas) {
                            if(err)return console.log(err);
                            res.send({status:1,msg:"修改成功！"});
                        })
                }else{
                    mysqldb.query('insert into blogarticles(title,content,tabs,create_date,user_id) value(?,?,?,?,?)',
                        [postdata.title,postdata.content,postdata.tabs,new Date(),user.id],function(err){
                        if(err)return console.log(err);
                        res.send({status:1,msg:"提交成功！"});
                    });
                }
            });
        }
    },
    postContent:function (req,res) {
        req.getSession(function (reqs) {
            var articleId=req.url.match(/\/(\d+)\//)[1];
            var sqlt='select * from users join blogarticles on users.id=blogarticles.user_id where blogarticles.id=?';
            mysqldb.query(sqlt,[articleId],function (err,datas) {
                if(err)return console.log(err);
                var data=datas[0];
                var createDate=new Date(data.create_date);
                var hour=(Date.now()-createDate.getTime())/1000/60/60;
                if(hour<1){
                    data.create_date=Math.floor(hour*60)+"分钟前";
                }else if(hour<24){
                    data.create_date=Math.floor(hour)+"小时前";
                }else if(hour<30*24){
                    data.create_date=Math.floor(hour/24)+"天前";
                }else if(hour/24<365){
                    data.create_date=Math.floor(hour/24/30)+"月前";
                }else{
                    data.create_date=Math.floor(hour/24/30/12)+"年前";
                }
                let isUser=false;
                if(reqs.id&&reqs.id===data.user_id){
                    isUser=true;
                }
                res.render('post',{title:"文章标题",userinfo:reqs,bloginfo:data,currentUser:isUser});
            });
        });
    }
};
