var controller=require('../routes/controller');
module.exports=function (req,res,next) {
    var isN=true;
    if(req.url.indexOf('/account/')!=-1){
        req.getSession(function(v){
            if(!v.id){
                res.redirect('/');
            }else{
                isN=true;
            }
        })
    }
    req.setFn(function(){
        if(/\/\d+\/$/.test(req.url)){
            controller.postContent(req,res);
            return false;
        }
    });
    req.setFn(function () {
        if(isN)next();
    })
};