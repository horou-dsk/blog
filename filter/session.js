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
    _this=null;
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
        function removeSession(sid){
            collection.remove({id:sid},function(err,rr){
                if(err){
                    console.log(err);
                    return;
                }
                console.log("定时清理session：id = "+sid);
            });
        }
        collection.find().toArray(function(err,result){
            if(err)return;
            for(let val of result){
                if(val._session.expireTime){
                    if(val._session.expireTime-current_time<=0){
                        removeSession(val.id);
                    }
                }else if(current_time-val.time>18000000){
                    removeSession(val.id);
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
                collection.insert({"id":ExS,time:Date.now(),_session:{}});
            });
        }
        if(!ExS) {
            setExS();
        }
        req.sbodys={};
        req.getSession_num=0;
        req.fns=[];
        req.getSessionId=function(){
            return ExS;
        };
        req.setSession=function(val){
            req.isSetSession=true;
            mongoCollection("webSession",collection=>{
                collection.findOne({id:ExS},function(err,data){
                    let session_data={};
                    if(!data){
                        collection.insert({id:ExS,time:Date.now(),_session:{}});
                    }else{
                        session_data=data._session;
                    }
                    for(let k in val){
                        session_data[k]=val[k];
                    }
                    collection.update({id:ExS},{$set:{_session:session_data}},true,false);
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
                                collection.insert({id:ExS,time:Date.now(),_session:{}});
                                if(typeof fn==="function"){
                                    fn({});
                                }else if(typeof key==='function'){
                                    key({});
                                }
                                req.getSession_num--;
                                return;
                            }
                            e=e._session||{};
                            if(isArray(key)){
                                for(var v of key){
                                    value=e[v];
                                    if(!value)
                                        value=null;
                                    req.sbodys[v]=value;
                                }
                            }else if(typeof key==='function'){
                                req.sbodys=e;
                                fn=key;
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
        req.clearSession=function(){
            req.getSession_num++;
            mongoCollection("webSession",collection=>{
                collection.findOne({id:ExS},function(err,data){
                    if(!data){
                        collection.insert({id:ExS,time:Date.now(),_session:{}});
                    }
                    collection.update({id:ExS},{$set:{_session:{}}},true,false);
                    req.getSession_num--;
                });
            });
        };
        var reqtimer;
        req.setFn=function(fn){
            req.fns.push(fn);
            if(reqtimer)return;
            reqtimer=interval(function(){
                if(!req.getSession_num){
                    for(var vfn of req.fns){
                        if(vfn(req.sbodys)===false)
                            break;
                    }
                    interval.cancel(reqtimer);
                }
            },100);
        };
    }
};