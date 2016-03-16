var $iconGap = $('#iconGap');
var $isChangeSize = $('#isChangeSize');
var $iconWidth = $('#iconWidth');
var $iconHeight = $('#iconHeight');
var $cssPrefix = $('#cssPrefix');
var $spriteFilename = $('#spriteFilename');
var $downloadButton = $('#downloadButton');

var $fileInput = $('.fileInput');
var $editArea = $('.editArea');
var $css = $('.css');
var $output = $('.output');

var config = {
    icon: { isChangeSize: false, width: 20, height: 20, gap: 20 },
    sprite: { width: null, height: null, filename: 'sprite.png' },
    css: { prefix: 'icon-' }
};
var iconList = {
    /*name: {
        width: null,
        height: null,
        left: null,
        top: null,
        img: img
    }*/
};


// 绑定数据 
viewBindData($iconGap, 'config.icon.gap');
viewBindData($isChangeSize, 'config.icon.isChangeSize');
viewBindData($iconWidth, 'config.icon.width');
viewBindData($iconHeight, 'config.icon.height');
viewBindData($cssPrefix, 'config.css.prefix', createCss);
viewBindData($spriteFilename, 'config.sprite.filename', createCss);

function viewBindData($view, valNameStr, event, callback) {
    var $view = $($view);
    var callback = arguments[arguments.length - 1];
    callback = typeof callback == 'function' ? callback : function() {};

    // 找到 valNameStr 所在的对象引用
    var valObj = window;
    var valNameArr = valNameStr.split('.');
    for (var i = 0; i < valNameArr.length - 1; i++) {
        valObj = valObj[valNameArr[i]];
    };
    var valName = valNameArr[valNameArr.length - 1];
    var val = valObj[valName];

    // 文本框
    if ($view.is(':text')) {
        $view.val(val); // 初始值
        // 绑定
        $view.on('keyup change', function() {
            var newVal = $view.val();
            if (typeof val == 'number') {
                newVal = Number(newVal);
                if (isNaN(newVal)) {
                    newVal = valObj[valName];
                    $view.val(newVal);
                };
            };
            valObj[valName] = newVal;
            console.log(valNameStr, valObj[valName]);

            // 回调
            callback();
        });
    };
    // 复选框
    if ($view.is(':checkbox')) {
        $view.prop('checked', val); // 初始值
        // 绑定
        $view.on('change', function() {
            valObj[valName] = $view.is(':checked');
            console.log(valNameStr, valObj[valName]);

            // 回调
            callback();
        });
    };

    // console.log(valNameStr, valObj[valName], $view[0]);

}

// 注册事件
$fileInput.change(function() {
    addFiles(this.files);
});
// 给页面注册拖放事件
document.addEventListener('dragover', dragover); // 没有这个不行 
document.addEventListener('drop', drop);

function dragover(e) {
    e.preventDefault();
    // console.log(e);
}

function drop(e) {
    e.preventDefault();
    // console.log(e);
    // console.log(e.dataTransfer); //在 chrome 中通过这两种方式看不到 files？？
    // console.log(e.dataTransfer.files); //在 chrome 这这样才能看到files
    addFiles(e.dataTransfer.files);
}

function addFiles(files) {
    for (var i = 0; i < files.length; i++) {
        // 创建作用域
        + function() {
            var file = files[i];
            // 否是是图像
            if (!/image/.test(file.type)) {
                return
            };
            // 图片名
            var name = file.name.split('.')[0];
            // 不允许重复
            if (name in iconList) {
                return
            };
            if (file.name == config.sprite.filename) {
                return
            };

            // 读取文件
            var fileReader = new FileReader();
            // fileReader.readAsDataURL(file);
            fileReader.onload = function(e) {

                // 创建img
                var img = new Image;
                if (config.icon.isChangeSize) {
                    img.width = config.icon.width;
                    img.height = config.icon.height;
                }
                // img.src = this.result;
                img.onload = function() {
                    // 显示该图标
                    $editArea.append(img);

                    // 储存句柄
                    var icon = iconList[name] = {};
                    icon.img = this;
                    // 尺寸
                    // icon.height = this.height; // 改变宽度，高度自动，这样获取的不准
                    icon.width = this.clientWidth;
                    icon.height = this.clientHeight;

                    // （横向）
                    // 计算位置
                    icon.left = config.sprite.width ? config.icon.gap + config.sprite.width : 0;
                    icon.top = 0;
                    // 更新数据
                    config.sprite.width = icon.left + icon.width;
                    config.sprite.height = Math.max(config.sprite.height, icon.height);
                    // 显示位置
                    this.style.position = 'absolute';
                    this.style.left = icon.left + 'px';
                    this.style.top = icon.top + 'px';
                    // 更新区域大小
                    $editArea.css({
                        width: config.sprite.width,
                        height: config.sprite.height
                    });
                    // 生成css
                    createCss();
                };
                img.src = this.result;
            }

            fileReader.onprogress = function(e) {
                // console.log(e)
            }

            fileReader.readAsDataURL(file);

        }();
    };
}

function createCss() {
    var css = '.icon{background:no-repeat url($url)}'
        .replace('$url', config.sprite.filename) + '\n\n';
    var cssClass = '.$prefix$class{background-position:-$xpx -$ypx}'
        .replace('$prefix', config.css.prefix);
    for (var i in iconList) {
        var c = i.replace(/ /g, '-').replace('_', '-');
        css += cssClass.replace('$class', c)
            .replace('$x', iconList[i].left)
            .replace('$y', iconList[i].top) + '\n';
    }

    css = css.replace(/-0/ig, 0).replace(/([: ])0px/ig, '$10');

    $css.html(css);
}

function createSprite() {
    // 如果还没有
    if (!config.sprite.width) {
        return
    };

    // 创建canvas
    var canvas = document.createElement('canvas');
    canvas.width = config.sprite.width;
    canvas.height = config.sprite.height;
    // document.body.appendChild(canvas);

    // 根据数据画上icon
    var ctx = canvas.getContext('2d');
    for (var i in iconList) {
        var icon = iconList[i];
        ctx.drawImage(icon.img, icon.left, icon.top, icon.width, icon.height);
    }

    // 生成 sprite
    var spriteUrl = canvas.toDataURL('image/png')
        .replace('image/png', 'image/png; /' + config.sprite.filename); // 文件名
    var img = document.createElement('img');
    img.src = spriteUrl;

    // 下载链接
    // var a = document.createElement('a');
    // a.href = spriteUrl;
    // a.setAttribute('download', config.sprite.filename); // 文件名 chrome 支持
    // a.text = '下载 '+ config.sprite.filename;

    $downloadButton.attr('href', spriteUrl);
    $downloadButton.attr('download', config.sprite.filename);
    $downloadButton.attr('target', '_blank');


    $output.html(img);


    // open(spriteUrl);

}



///////////////////////////// 图标移动 todo
var isMouseDown = false;
var oX, oY;
var $moveIcon;
var oLeft, oTop;
$editArea.on('mousedown', 'img', function(e) {
    isMouseDown = true;
    $moveIcon = $(this);
    oX = e.clientX;
    oY = e.clientY;
    oLeft = parseFloat($moveIcon.css('left'));
    oTop = parseFloat($moveIcon.css('top'));
    console.log(oX, oY, '|', oLeft, oTop)
});
$(document).on('mousemove', function(e) {
    if (isMouseDown) {
        e.preventDefault();
        var diffX = e.clientX - oX;
        var diffY = e.clientY - oY;
        console.log(diffX, diffY, oLeft + diffX, oTop + diffY);
        $moveIcon.css({
            left: oLeft + diffX,
            top: oTop + diffY
        });
    };
});
$(document).on('mouseup', function(e) {
    isMouseDown = false;
});
