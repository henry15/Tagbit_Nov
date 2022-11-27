/**
 * Created by DesignerBe on 26-09-2020.
 */
var consts = {
    SESSION_STORE_NAME: "user"
};
var overlayCount = 0;

var PDF_GENERATOR_URL = "http://52.76.89.235:8081";
var OFL_ROOT = "https://www.tagbit.co";
//var PDF_GENERATOR_URL = "http://localhost:8081/";
//var OFL_ROOT = "http://localhost:8080";

function getWinPdf(url, id, type) {
    if(!type){
        type = "card";
    }
    return PDF_GENERATOR_URL + '?cmyk=true&width=1000&height=100&type=' + type + '&id=' + id + '&url=' + url + '&rootUrl=' + encodeURIComponent(OFL_ROOT);
} 

function selectDropDownItemByName(dropBoxId, selectedValue) {
    $(dropBoxId + ' option').filter(function () {
        return ($(this).val() == selectedValue);
    }).prop('selected', true);
}

function addWaitingOverlay() {
    if (overlayCount <= 0) {
        var overlay = document.createElement("div");
        overlay.setAttribute("id", "overlay");
        overlay.setAttribute("class", "overlay");
        document.body.appendChild(overlay);
    }
    overlayCount++;
}

function removeWaitingOverlay() {
    overlayCount--;
    if (overlayCount <= 0) {
        try {
            document.body.removeChild(document.getElementById("overlay"));
        } catch (err) {
            console.log(err);
        }
    }
}

function getNewRandomNumber(min, max) {
    return Math.round((Math.random() * (max - min)) + min);
}

function getURLParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getAsStr(element) {
    var str = element;
    if (typeof element == "number") {
        str = element + "";
    } else if (typeof element != "string") {
        str = element.toString();
    }
    return str;
}

function isEmptyString(str) {
    if (typeof str != "string") {
        str = getAsStr(str);
    }
    if ((str == undefined) || (str == null))
    {
        return false;
    }
    return (!str || /^\s*$/.test(str) || str.length === 0 || !str.trim() || str.trim().length === 0);
}

function addLogoToShoppingCart(id, callback) {
    addWaitingOverlay();
    doPost("/addItemToCurrentShoppingCart", {item_id: id, itemType: 'LOGO'}, function (resp) {
        removeWaitingOverlay();
        if (resp.status == 200) {
            if (callback != undefined) {
                callback();
            }
        } else {
            bootbox.alert(resp.msg);
        }
    }, function (err) {
        removeWaitingOverlay();
        console.log(err);
        bootbox.alert((typeof err == "string" ? err : "Server Error."));
    });
}

function formatDate(date) {
    var d = new Date(date);

    var m_names = new Array("Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec");
    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    if (isNaN(curr_date) || isNaN(curr_month) || isNaN(curr_year)) {
        return null;
    }
    return curr_date + "-" + m_names[curr_month] + "-" + curr_year;
}

function getIframeWindow(iframe_object) {
    var doc;

    if (iframe_object.contentWindow) {
        return iframe_object.contentWindow;
    }

    if (iframe_object.window) {
        return iframe_object.window;
    }

    if (!doc && iframe_object.contentDocument) {
        doc = iframe_object.contentDocument;
    }

    if (!doc && iframe_object.document) {
        doc = iframe_object.document;
    }

    if (doc && doc.defaultView) {
        return doc.defaultView;
    }

    if (doc && doc.parentWindow) {
        return doc.parentWindow;
    }

    return undefined;
}