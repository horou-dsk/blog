const crypto = require('crypto');
global.interval=function(f,t,d){
    var timeFn=function(fn,timeout,delay){
        var forFn=function(){
            if(this.isout)return;
            setTimeout(()=>{
                fn();
                forFn.call(this);
            },timeout);
        };
        setTimeout(()=>{
            forFn.call(this);
        },delay||0);
    };
    return new timeFn(f,t,d);
};
interval.cancel=function(_this){
    _this.isout=true;
    _this=undefined;
};

var mongodb=require("mongodb");
var mongoServer=new mongodb.Server("localhost",27017,{auto_reconnect:true});
var db=new mongodb.Db("xlyblog",mongoServer,{safe:true});

db.open(function (err,db) {
    if(err){
        console.log(err);
        return;
    }
    db.createCollection("webSession",{safe:true},function (err,collection) {
        if(err){
            console.log(err);
            return;
        }
        collection.removeMany({},function (err,ok) {
            if(err){
                console.log(err);
                return;
            }
            console.log("清理session完成");
        });
    });
    global.mongoCollection=function(col,collection){
        db.createCollection(col,{safe:true},function(err,a){
            if(err){
                console.log(err);
                return;
            }
            collection(a);
        })
    }
});

global.session_id=0;
global.isArray=function(object){
    return object && typeof object==='object' &&
        Array == object.constructor;
};
function session_time(){
    var current_time=Date.now();
    mongoCollection("webSession",collection=>{
        collection.find().toArray(function(err,result){
            if(err)return;
            for(var val of result){
                if(current_time-val.time>3600000){
                    collection.remove({id:val.id},function(err,rr){
                        if(err){
                            console.log(err);
                            return;
                        }
                        console.log("定时清理session：id = "+val.id);
                    });
                }
            }
        });
    });
    setTimeout(session_time,600000);
}
setTimeout(()=>{
    session_time();
},10000);
module.exports=function(req,res){
    if(!req.getSession){
        var ExS=req.cookies[".ExS"];
        function setExS(){
            ExS = crypto.createHmac('md5',"xxx"+(session_id++)+"ooo"+Math.random())
                .digest('hex');
            res.cookie(".ExS",ExS,{httpOnly:true});
            mongoCollection("webSession",collection=>{
                collection.insert({"id":ExS,time:Date.now()});
            });
        }
        if(!ExS) {
            setExS();
        }
        req.sbodys={};
        req.getSession_num=0;
        req.setSession=function(val){
            req.isSetSession=true;
            mongoCollection("webSession",collection=>{
                collection.findOne({id:ExS},function(err,data){
                    if(!data){
                        collection.insert({id:ExS,time:Date.now()});
                    }
                    collection.update({id:ExS},{$set:val},true,false);
                    req.isSetSession=false;
                });
            });
        };
        req.getSession=function(key,fn){
            req.getSession_num++;
            var timer=interval(function(){
                if(!req.isSetSession){
                    mongoCollection("webSession",collection=>{
                        collection.findOne({id:ExS}).then(e=>{
                            var value;
                            if(!e){
                                collection.insert({id:ExS,time:Date.now()});
                                if(typeof fn==="function"){
                                    fn({});
                                }
                                req.getSession_num--;
                                return;
                            }
                            if(isArray(key)){
                                for(var v of key){
                                    value=e[v];
                                    if(!value)
                                        value=null;
                                    req.sbodys[v]=value;
                                }
                            }else{
                                value=e[key];
                                if(!value)
                                    value=null;
                                req.sbodys[key]=value;
                            }
                            req.getSession_num--;
                            if(typeof fn==="function"){
                                fn(req.sbodys);
                            }
                        });
                    });
                    interval.cancel(timer);
                }
            },100);
        };
        req.setFn=function(fn){
            var timer=interval(function(){
                if(!req.getSession_num){
                    fn(req.sbodys);
                    interval.cancel(timer);
                }
            },100);
        };
    }
};