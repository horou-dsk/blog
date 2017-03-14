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
    function buildParams( prefix, obj, traditional, add ) {
        var name;

        if ( isArray( obj ) ) {

            // Serialize array item.
            forOf( obj, function(v, i) {
                if ( traditional || rbracket.test( prefix ) ) {

                    // Treat each array item as a scalar.
                    add( prefix, v );

                } else {

                    // Item is non-scalar (array or object), encode its numeric index.
                    buildParams(
                        prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
                        v,
                        traditional,
                        add
                    );
                }
            } );

        } else if ( !traditional && typeof obj  === "object" ) {

            // Serialize object item.
            for ( name in obj ) {
                buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
            }

        } else {

            // Serialize scalar item.
            add( prefix, obj );
        }
    }
    var xhr=new XMLHttpRequest();
    var $param= function( a, traditional ) {
        var prefix,
            s = [],
            add = function( key, valueOrFunction ) {

                // If value is a function, invoke it and use its return value
                var value = typeof valueOrFunction==='function' ?
                    valueOrFunction() :
                    valueOrFunction;

                s[ s.length ] = encodeURIComponent( key ) + "=" +
                    encodeURIComponent( value == null ? "" : value );
            };

        // If an array was passed in, assume that it is an array of form elements.
        if ( isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

            // Serialize the form elements
            forOf( a, function(v) {
                add( v.name, v.value );
            } );

        } else {

            // If traditional, encode the "old" way (the way 1.3.2 or older
            // did it), otherwise encode params recursively.
            for ( prefix in a ) {
                buildParams( prefix, a[ prefix ], traditional, add );
            }
        }

        // Return the resulting serialization
        return s.join( "&" );
    };
    var $ajax=function(o){
        let async=!o.async||false;
        xhr.open(o.type||'GET',o.url,async);
        xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded;charset=utf-8");
        xhr.send($param(o.data||{}));
        xhr.onreadystatechange=function(){
            if(xhr.readyState===4&&xhr.status===200){
                if(o.success)
                    o.success(JSON.parse(xhr.responseText));
            }
            if(xhr.status===404){
                throw "地址没有找到!";
            }
        }
    };
    var JQuery=$;
    var xly_layer=function(){
        this.container=document.querySelector(".xly-layer");
        this.bg=this.container.querySelector(".lay-bg");
        this.modal=this.container.querySelector(".lay-modal");
        this.text=this.container.querySelector(".lay-textContent");
    };
    xly_layer.prototype={
        show:function(text,fn){
            this.text.textContent=text;
            this.container.style.display="flex";
            this.modal.style.left=this.container.offsetWidth/2-this.modal.offsetWidth/2+"px";
            this.modal.style.transition='0s';
            this.modal.style.top=this.container.offsetHeight/2+100+"px";
            this.modal.style.transform='scale(0.5)';
            setTimeout(()=>{
                this.modal.style.transition='.4s';
                this.modal.style.transform='scale(1)';
                this.modal.style.top=this.container.offsetHeight/2-this.modal.offsetHeight/2+"px";
                this.container.className="xly-layer in";
                setTimeout(()=>{
                    this.modal.style.transform='scale(0.5)';
                    this.modal.style.top=this.container.offsetHeight/2-100+"px";
                    this.container.className="xly-layer out";
                    setTimeout(()=>{
                        this.container.style.display='none';
                        if(fn){
                            fn();
                        }
                    },400)
                },2000);
            },10);
        }
    };

    class Index{
        constructor(){
            console.log("你好");
            console.log("执行了");
            var header=document.querySelector("header.header");

        }

        home(){
            console.clear();
            var pageloadImg=JQuery('.pageload-img');
            JQuery(document).ready(function(){
                pageloadImg.fadeOut(500);
                setTimeout(function () {
                    pageloadImg.remove();
                },500)
            });
            function $(elem){
                var elems=document.querySelectorAll(elem);
                if(elems.length>1)
                    return elems;
                else
                    return elems[0];
            }
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
            if(login_btn)
            {
                login_btn.addEventListener("click",function () {
                    login_dialog.style.display="flex";
                    setTimeout(function(){
                        login_dialog.className="login-dialog-container in";
                    },10);
                });
            }
            function login_dialog_fadeout(){
                login_dialog.className="login-dialog-container out";
                setTimeout(function () {
                    login_dialog.style.display='none';
                },400)
            }
            login_bg.addEventListener("click",login_dialog_fadeout);
            close_btn.addEventListener("click",login_dialog_fadeout);
            var login_form=$(".login-form"),
                login_sub=$(".login-form .login-btn"),
                layer=new xly_layer();
            login_sub.addEventListener("click",function(){
                console.log(login_form.username.value,login_form.password.value);
                $ajax({
                    type:"POST",
                    url:"login",
                    data:{
                        username:login_form.username.value,
                        pwd:login_form.password.value,
                        autologin:login_form.autologin.checked
                    },
                    success:function(req){
                        if(req.status){
                            layer.show("登录成功!^_^",function(){
                                location.reload();
                            });
                        }else{
                            layer.show("用户名或密码错误!T T");
                        }
                    }
                });
            });
        }

        newpost(){
            console.clear();
            wangEditor.config.printLog = false;

            var editor = new wangEditor('editor-trigger');
            // 上传图片
            editor.config.uploadImgUrl = '/editorimg';
            editor.config.uploadParams = {
                // token1: 'abcde',
                // token2: '12345'
            };
            editor.config.uploadHeaders = {
                // 'Accept' : 'text/x-json'
            };
            // editor.config.uploadImgFileName = 'myFileName';

            // 隐藏网络图片
            // editor.config.hideLinkImg = true;

            // 表情显示项
            editor.config.emotionsShow = 'value';

            // 插入代码时的默认语言
            // editor.config.codeDefaultLang = 'html'

            // 只粘贴纯文本
            // editor.config.pasteText = true;

            // 跨域上传
            // editor.config.uploadImgUrl = 'http://localhost:8012/upload';

            // 第三方上传
            // editor.config.customUpload = true;

            // 普通菜单配置
            // editor.config.menus = [
            //     'img',
            //     'insertcode',
            //     'eraser',
            //     'fullscreen'
            // ];
            // 只排除某几个菜单（兼容IE低版本，不支持ES5的浏览器），支持ES5的浏览器可直接用 [].map 方法
            // editor.config.menus = $.map(wangEditor.config.menus, function(item, key) {
            //     if (item === 'insertcode') {
            //         return null;
            //     }
            //     if (item === 'fullscreen') {
            //         return null;
            //     }
            //     return item;
            // });

            // onchange 事件
            editor.onchange = function () {
                console.log(this.$txt.html());
            };

            // 取消过滤js
            // editor.config.jsFilter = false;

            // 取消粘贴过来
            // editor.config.pasteFilter = false;

            // 设置 z-index
            // editor.config.zindex = 20000;

            // 语言
            // editor.config.lang = wangEditor.langs['en'];

            // 自定义菜单UI
            // editor.UI.menus.bold = {
            //     normal: '<button style="font-size:20px; margin-top:5px;">B</button>',
            //     selected: '.selected'
            // };
            // editor.UI.menus.italic = {
            //     normal: '<button style="font-size:20px; margin-top:5px;">I</button>',
            //     selected: '<button style="font-size:20px; margin-top:5px;"><i>I</i></button>'
            // };
            editor.create();

            let subPost=$('#subPost');
            let layer=new xly_layer();
            subPost.on("click",function () {
                var data={title:$('#post-title').val(),content:editor.$txt.html()};
                console.log(data);
                $ajax({
                    type:"POST",
                    url:"/newpost",
                    data:data,
                    success:function(req){
                        if(req.status){
                            layer.show(req.msg,function(){
                                location.reload();
                            })
                        }else{
                            layer.show(req.msg);
                        }
                    }
                })
            });
        }
    }
    var index=new Index();
    var ctrl=document.querySelector("[y_ctrl]");
    if(ctrl)
        ctrl=ctrl.getAttribute('y_ctrl');
    if(index[ctrl])
    index[ctrl]();
})(window);