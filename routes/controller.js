module.exports={
    home:function(req,res){
        mysqldb.query("select * from users join blogArticles on users.id=blogArticles.user_id",function(err,data,fields){
            if(err){
                console.log(err);
                return;
            }
            var date=new Date(data[0].create_date);
            var time=date.getFullYear()+"年"+(date.getMonth()+1)+"月"+date.getDate()+"日"+"  "+date.getHours()+":"+date.getMinutes();
            res.render('index', { title: 'Red_ButterFly的博客' ,info:data[0],time:time});
            console.log(data);
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
    }
};