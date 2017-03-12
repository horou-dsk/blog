module.exports=function (req,res,next) {
    if(req.url.indexOf('/account/')!=-1){
        req.getSession(function(v){
            if(!v.id){
                res.redirect('/');
            }else{
                next();
            }
        })
    }else{
        next();
    }
};