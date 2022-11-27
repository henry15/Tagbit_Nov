function registerForm(form) {
    for (var field in form) {
        if (!form.hasOwnProperty(field))
            continue;
        if (isFunction(form[field])) {
            form.obj.find('#' + field).first().click(form[field]);
        }
    }
}

function fillModel(form, model) {
    for (var field in model) {
        if (!model.hasOwnProperty(field))
            continue;
        var first = form.find('#' + field).first();
        if (first != undefined)
            model[field] = first.val();
    }
}

function fillDom(dom, model) {
    for (var field in model) {
        if (!model.hasOwnProperty(field))
            continue;
        var first = dom.find('#' + field).first();
        if (first != undefined) {
            if (first.val != undefined)
                first.val(model[field]);
            else
                first.text(model[field]);
        }
    }
}

function doPost(path, json, successfn, errorfn) {
    doRequest(path, json, "POST", successfn, errorfn, 0);
}

function doGet(path, params, successfn, errorfn) {
    doRequest(path, params, "GET", successfn, errorfn, 0);
}

function doGetWithExtraParams(path, params, exParams, successfn, errorfn) {
    return doRequest(path, params, "GET", function (resp){
        successfn(resp, exParams);
    }, errorfn, 0);
} 

function doRequest(path, data, method, successfn, errorfn, nRetries){
    return doActualRequest(path, data, method, successfn, errorfn, nRetries, true);
}

function doSyncRequest(path, data, method){
    var result;
    doActualRequest(path, data, method, function (resp){
        if (resp.error) {
            result.error = resp;
        }
        else{
            result = resp;
        }
    }, function (resp){
        result.error = resp;
    }, 4, false);
    return result;
}

function doActualRequest(path, data, method, successfn, errorfn, nRetries, async) {
    var maxRetries = 3;
    var realPath = path;
    var req = {type: method, url: path};
    if (nRetries === undefined) {
        nRetries = 0;
    }
    if (window.actualSite) {
        path = window.actualSite + path;
    }
    if (method == "POST") {
        req.data = JSON.stringify(data);
        req.contentType = "application/json";
    } else {
        req.data = data;
    }
    req.async = async;
    $.ajax(req).success(function (resp) {
            if (resp.error) {
                if (errorfn !== undefined)
                    errorfn(resp);
                else
                    showToast('Server returned error: ' + resp.error);
            }
            else
                successfn(resp);
        }
    ).fail(function (xhr, status, err) {
            if (xhr.status == 403) {
                window.location = window.actualSite + "/?msgId=1";
            } else {
                if (Math.floor(xhr.status / 100) == 4) {
                    if (errorfn !== undefined) {
                        errorfn({error: xhr.status});
                    }
                    else {
                        showToast("Server returned " + xhr.status + ".");
                    }
                }
                else {
                    if (nRetries < maxRetries) {
                        console.log("request failed. retrying...");
                        if (errorfn === undefined) {
                            showToast("Request failed. Retrying...");
                        }
                        setTimeout(
                            function () {
                                doRequest(realPath, data, method,
                                    successfn, errorfn, nRetries + 1);
                            }
                            , 3000);
                    } else {
                        if (errorfn !== undefined) {
                            errorfn({error: "timeout"});
                        }
                        else {
                            showToast("Communication Error");
                        }
                    }
                }
            }
        });
}

function showToast(msg, type, sticky, duration) {
    //type: danger info success
    if (duration === undefined)
        duration = 3000;
    if (type === undefined)
        type = "danger";
    var options = {duration: duration, sticky: sticky, type: type};
    $.toast(msg, options);
}

function isFunction(object) {
    return object && typeof object == 'function';
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var JSON = JSON || {};

JSON.stringify = JSON.stringify || function (obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        // simple data type
        if (t == "string") obj = '"' + obj + '"';
        return String(obj);
    }
    else {
        // recurse array or object
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            if (obj.hasOwnProperty(n)) {
                v = obj[n];
                t = typeof(v);
                if (t == "string") v = '"' + v + '"';
                else if (t == "object" && v !== null) v = JSON.stringify(v);
                json.push((arr ? "" : '"' + n + '":') + String(v));
            }
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
};

JSON.parse = JSON.parse || function (str) {
    if (str === "") str = '""';
    eval("var p=" + str + ";");
    return p;
};

function storeJson(key, json) {
    var key_ = "store_" + key;
    var value_ = JSON.stringify(json);
    if (localStorage === undefined) {
        $.cookie(key_, value_);
    } else
        localStorage.setItem(key_, value_)
}

function retrieveJson(key) {
    var key_ = "store_" + key;
    var value;
    if (localStorage === undefined) {
        value = $.cookie(key_);
    }
    else {
        value = localStorage.getItem(key_);
    }
    if (value === undefined || value == "")
        value = "{}";
    return JSON.parse(value);
}

function deleteJson(key) {
    var key_ = "store_" + key;
    if (localStorage === undefined) {
        $.removeCookie(key_);
    }
    else {
        window.localStorage.removeItem(key_);
    }
}

$.fn.exists = function () {
    return this.length !== 0;
};


function loadScript(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

$(function () {
    $(".actualSite").each(function (index, elem) {
        $(elem).attr("href", window.actualSite + $(elem).attr("href"));
    });
    if (window.actualSite == undefined){
        window.actualSite = window.location.origin;
    }
});