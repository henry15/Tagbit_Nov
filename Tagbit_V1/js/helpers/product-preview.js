var $;
var parent;
var _amplitude;
var _crop;
var _crop_left;
var _crop_right;
var _rotate;
var _height;
var _width;
 
function init(jquery, parentObj, x_selector, y_selector) {
    $ = function (selector) {
        return jquery(selector, document);
    };
    parent = parentObj;
    $("#canvas").draggable({
        drag: function () {
            var left = $("#canvas").css("left").replace("px", "");
            var top = $("#canvas").css("top").replace("px", "");
            parent.$(x_selector).slider({
                value: left
            });
            parent.$(y_selector).slider({
                value: top
            });
        }
    });
}

function setImage(contents) {
    if (contents){
        $("img").attr("src", contents);
    } else {
        $("img").removeAttr("src");
    }
}

function getParams(callback) {
    var params;
    if ($("#canvas").is(":visible")){
        var left = $("#canvas").css("left").replace("px", "");
        var top = $("#canvas").css("top").replace("px", "");
        params = [
            left,
            top,
            _amplitude,
            _crop,
            _crop_left,
            _crop_right,
            _rotate,
            _width,
            _height
        ];
    } else {
        params = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    callback(params);
}

function draw(url, x, y, amplitude, crop, crop_left, crop_right, rotate, rwidth, height) { 
    _amplitude = amplitude;
    _crop = crop;
    _crop_left = crop_left;
    _crop_right = crop_right;
    _rotate = rotate;
    _width = rwidth;
    _height = height; 
    //var magicNum = 40;
    //console.log("X: " + x, "Y: " + y, "width: " + rwidth, "height: " + height, "amplitude: " + amplitude, "crop: " + crop);
    var canvas = document.getElementById("canvas");
    $(canvas).css({
        left: x,
        top: y,
        width: rwidth,
        height: height,
        "-ms-transform": "rotate(" + rotate + "deg)",
        "-webkit-transform": "rotate(" + rotate + "deg)",
        "transform": "rotate(" + rotate + "deg)"
    });
    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.onload = start;
    img.src = url;
    function start() {
        var iw = img.width;
        var ih = img.height;
        canvas.height = ih;
        canvas.width = iw;

        var y_coords = [], max_y = 0;

        function calcY(yShift, t1, t2, amplitude) {
            var x = 0, y = 0;
            var duration = t2 - t1;
            var fx = function (x) {
                return x * (1 - x);
            };
            ctx.lineWidth = 1;
            for (x = t1; x < t2; x++) {
                var delta = (x - t1) / duration;
                y = yShift + amplitude * fx(delta);
                y_coords.push(y);
                if (y > max_y) {
                    max_y = y;
                }
            }
        }

        calcY(crop, 0, canvas.width, amplitude);
        canvas.height += max_y;
 
        for (var sx = 0; sx < iw; sx++) {
            if ((sx > crop && sx < iw / 2) || (sx <= iw - crop && sx >= iw / 2)) {
                ctx.drawImage(img, sx, 0, 1, ih, sx, y_coords[sx], 0.8, canvas.height - max_y);
            }
        }
    }
}
