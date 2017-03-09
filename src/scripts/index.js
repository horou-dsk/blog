(function (_window) {
    var interval=function(f,t,d){
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
    var isArray=function(object){
        return object && typeof object==='object' &&
            Array == object.constructor;
    };
    function copyObj(obj) {
        var a = {};
        for (var k in obj) {
            if (isArray(obj[k])) {
                a[k] = [];
                for (var ki in obj[k]) {
                    a[k].push(obj[k][ki]);
                }
            } else if (obj.hasOwnProperty(k)) {
                a[k] = typeof obj[k] == 'object' ? copyObj(obj[k]) : obj[k];
            }
        }
        return a;
    }
    function forOf(o, fn, t, dc) {
        if (dc)
            o = copyObj(o);
        t=t||this;
        for (var k in o) {
            if (!o.hasOwnProperty(k) || fn.call(t,o[k],k) == false)break;
        }
    }

    function $(elem){
        var elems=document.querySelectorAll(elem);
        if(elems.length>1)
            return elems;
        else
            return elems[0];
    }

    class Index{
        constructor(){
            console.log("你好");
            console.log("执行了");
            var header=document.querySelector("header.header");

        }

        home(){
            console.log("主页!");
            var tabs=$(".tab-btn");
            var forms=$(".login-modal form");
            forOf(tabs,function(v,index){
                v.addEventListener("click",function () {
                    forOf(forms,function(el,i){
                        tabs[i].className="tab-btn";
                        el.style.display='none';
                    });
                    forms[index].style.display='block';
                    tabs[index].className="tab-btn active";
                })
            });
            var login_dialog=$(".login-dialog-container"),
                login_bg=$('.login-bg'),
                login_btn=$("#login-btn"),
                close_btn=$(".login-dialog-container .close-dialog");
            login_btn.addEventListener("click",function () {
                login_dialog.style.display="flex";
                setTimeout(function(){
                    login_dialog.className="login-dialog-container in";
                },10);
            });
            function login_dialog_fadeout(){
                login_dialog.className="login-dialog-container out";
                setTimeout(function () {
                    login_dialog.style.display='none';
                },400)
            }
            login_bg.addEventListener("click",login_dialog_fadeout);
            close_btn.addEventListener("click",login_dialog_fadeout);
        }
    }
    var index=new Index();
    var ctrl=document.querySelector("[y_ctrl]").getAttribute("y_ctrl");
    if(index[ctrl])
    index[ctrl]();
})(window);