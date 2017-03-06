module.exports={
    home:function(req,res){
        var users=require("../model/index").users;
        users.findAll().then(function(data){
            for(var a of data){
                console.log(a.dataValues);
            }
            req.setFn(e=>{
                console.log(e);
                res.send("<h1>哈哈哈哈</h1>");
            });
        }).catch(function(err){
            console.log(err);
        });
    }
};