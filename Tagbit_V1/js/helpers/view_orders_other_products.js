$(function () {
    var nextIndex = 0;
    var STEP = 10;
    var times = 0;

    function loadMoreOrders() {
        var tbl = $(".tblPurchasedCards tbody");
        doGet("/listPurchasedOtherProducts", {start: nextIndex + times}, function (resp) {
            if (resp.status == 200) {
                nextIndex += STEP;
                times ++;
                for (i = 0; i < resp.items.length; i++) {
                    var val = resp.items[i];
                    var d = new Date(val.created_at);
                    tbl.append('<tr>' +
                        '<td class="col-md-1"><div style="text-align: left; overflow: hidden" class="purFCardPrev' + val.id + '"></div><a data-src="' + val.url + '" class="editCardLinkFront' + val.id + ' link">Edit</a></td>' +
                        '<td class="col-md-1"><div style="text-align: left; overflow: hidden" class="purBCardPrev' + val.id + '"></div>' + (val.url_back ? '<a data-src="' + val.url_back + '" class="editCardLinkBack' + val.id + ' link">Edit</a>' : "") + '</td>' +
                        '<td>' +
                        val.email_address + "<br/>" +
                        "Ph: " + val.phone_number + "<br/>" +
                        val.first_name + " " + val.last_name + "<br/>" +
                        val.address1 + "<br/>" +
                        val.address2 + "<br/>" +
                        val.city + ", " + val.state + "<br/>" +
                        val.country + "<br/>" +
                        "PIN: " + val.postal_code + "<br/>" +
                        '</td>' +
                        '<td class="orderDetail' + val.base_item_id + '">' +
                        "Order ID: " + val.shopping_cart_id +
                        "<br/>Product: " + val.otherProductName +
                        "<br/>Date of Order: " + formatDate(d)   + 
                        '</td>' +
                        '<td>' +
                        '<select class="purRowCmp' + val.id + '" data-id="' + val.id + '">' +
                        '   <option value="NOT_PRINTED">Processing</option>' +
                        '   <option value="PRINTING">Processed</option>' +
                        '   <option value="PRINTED">Shipped</option>' +
                        '</select> ' +
                        '<button class="btn btn-small btn-primary btnSave' + val.id + '" data-id="' + val.id + '">Save</button>' +
                        '</td>' +
                        (val.dont_print_card == true ? "<td>No options available</td>":
                        (val.design_type == "SystemDesign" ?
                        '<td>' +
                        '<a target="_blank" data-href-front="' + getWinPdf(val.url, val.id, "other") + '" data-href-back="' + getWinPdf(val.url_back, val.id + ".back") + '" class="link downloadPDF2' + val.id + '">Windows PDF</a> <br/> <br/> ' + 
                        '<a target="_blank" data-href-front="/generatePDF?type=other&url=' + val.url + '&id=' + val.id + '" ' + (val.url_back ? ' data-href-back="/generatePDF?type=other&url=' + val.url_back : "" ) + '&id=' + val.id + '.back" class="link downloadPDF' + val.id + '">PDF</a>' + ' | <a data-href-front="' + val.url + (val.url_back ? '" data-href-back="' + val.url_back : "" ) + '" href="#" class="downloadSVG' + val.id + '">SVG</a><br/>' +
                        '<a target="_blank" data-href-front="/generatePDF?type=other&url=' + val.url + '&id=' + val.id + '&rgb=true" data-href-back="/generatePDF?type=other&url=' + val.url_back + '&id=' + val.id + '.back&rgb=true" class="link downloadPDF' + val.id + '">RGB-PDF</a><br/>'+
                        '<a data-href-front="' + val.url + '" data-href-back="' + val.url_back + '" href="#" class="downloadAISVG' + val.id + '">Generic SVG</a></td>'
                        : "<td><a class='link' data-href-front='/getUserOtherProductImage?id=" +val.url+ "' data-href-back='/getUserOtherProductImage?id=" +val.url_back+ "' id='downloadCustom" + val.id + "'>Download</a></td>")) + 
                        '</tr>');
                    doGetWithExtraParams("/getUserOtherProductSettingValues", {product_id: val.base_item_id}, {id: val.base_item_id, shopping_cart_id: val.shopping_cart_id}, function (resp, productId){ 
                        var otherSettings = "";
                        var _domObj = $(".orderDetail" + productId.id);
                        for (var j = 0; j < resp.settings.length; j++){ 
                            if (resp.settings[j].control_type == "Color"){
                                _domObj.append( "<br/>" + resp.settings[j].setting_name + ": <span id='otherProductSettingValue_" +productId.shopping_cart_id + "_" + resp.settings[j].setting_value + "'></span>"); 
                                doGetWithExtraParams("/getOtherProductSettingsValues", {id: resp.settings[j].setting_value}, {settingVal: resp.settings[j].setting_value, valId: productId.shopping_cart_id}, function (resp2, settingId, valId){ 
                                    $("#otherProductSettingValue_" + settingId.valId+ "_" + settingId.settingVal).text(resp2.values[0].value_label);
                                }, function (err){
                                    console.log(err);
                                    showToast("Error retrieving some details for this product");
                                });
                            } else {
                                _domObj.append("<br/>" + resp.settings[j].setting_name + ": " + resp.settings[j].setting_value); 
                            }
                        }
                    }, function (err){
                        console.log(err);
                        showToast("Error retrieving item detail for " + val.base_item_id);
                    });
                    var callEditor = function (url) {
                        var win = window.open(realAppDomain  + "/svgedit/editor?type=OtherProduct&docUrl=" + encodeURIComponent(url) + "&version=3.0");
                    };
                     
                    $('.downloadAISVG' + val.id).click(function (e) {
                        e.preventDefault();
                        downloadAiSvg('/getUserOtherProductImage?id=' + $(e.target).attr("data-href-front"));
                    });
                    $("#downloadCustom" + val.id).click(function (e){
                        window.open($(e.target).attr("data-href-front"));
                    });
                    if (val.url_back != null) {
                        $('.downloadAISVG' + val.id).click(function (e) {
                            e.preventDefault();
                            downloadAiSvg('/getUserOtherProductImage?id=' + $(e.target).attr("data-href-back"));
                        });
                        $("#downloadCustom" + val.id).click(function (e){ 
                            window.open($(e.target).attr("data-href-back"));
                        });
                    }
                    $(".editCardLinkBack" + val.id).click(function (e) {
                        e.stopPropagation();
                        callEditor($(e.target).attr("data-src"));
                    });
                    $(".editCardLinkFront" + val.id).click(function (e) {
                        e.stopPropagation();
                        callEditor($(e.target).attr("data-src"));
                    });
                    $('.downloadPDF' + val.id).click(function (e) {
                        e.preventDefault();
                        window.open($(e.target).attr("data-href-front"));
                    });
                    $('.downloadPDF2' + val.id).click(function (e) {
                        e.preventDefault();
                        window.open($(e.target).attr("data-href-front"));
                    });
                    if (val.url_back != null) {
                        $('.downloadPDF' + val.id).click(function (e) {
                            e.preventDefault();
                            window.open($(e.target).attr("data-href-back"));
                        }); 
                        $('.downloadPDF2' + val.id).click(function (e) {
                            e.preventDefault();
                            window.open($(e.target).attr("data-href-back"));
                        });
                    }
                    $(".purRowCmp" + val.id).val(val.status);
                    $(".btnSave" + val.id).hide();
                    if (val.design_type == "SystemDesign") {
                        updateCardImageForPurchase('.purFCardPrev' + val.id, "/getUserOtherProductImage?id=" + val.url + "&embed=true");
                    } else {
                        updateCardImageForPurchase('.purFCardPrev' + val.id, "/img/customCard.svg");
                        $(".editCardLinkFront" + val.id).hide();
                        $(".editCardLinkBack" + val.id).hide();
                    }

                    if (val.url_back != null) { 
                        if (val.design_type == "SystemDesign") {
                            updateCardImageForPurchase('.purBCardPrev' + val.id, "/getUserOtherProductImage?id=" + val.url_back + "&embed=true");
                        } else {
                            updateCardImageForPurchase('.purBCardPrev' + val.id, "/img/customCard.svg");
                        } 
                    } else {
                        $(".editCardLinkBack" + val.id).hide();
                    }
                    $('.downloadSVG' + val.id).click(function (e) {
                        e.preventDefault(); 
                        window.open('/getUserOtherProductImage?id=' + $(e.target).attr("data-href-front") + '&random=' + Math.random());
                    });
                    if (val.url_back != null) {
                        $('.downloadSVG' + val.id).click(function (e) {
                            e.preventDefault();
                            window.open('/getUserOtherProductImage?id=' + $(e.target).attr("data-href-back") + '&random=' + Math.random());
                        });
                    }
                    $(".purRowCmp" + val.id).change(function (e) {
                        $(".btnSave" + $(e.target).attr("data-id")).show();
                    });
                    $(".btnSave" + val.id).click(function (e) {
                        e.preventDefault();
                        addWaitingOverlay();
                        doPost("/updatePurchaseItem", {
                            id: $(e.target).attr("data-id"),
                            status: $(".purRowCmp" + $(e.target).attr("data-id")).val()
                        }, function (resp) {
                            removeWaitingOverlay();
                            if (resp.status == 200) {
                                $(".btnSave" + $(e.target).attr("data-id")).hide();
                                showToast("Item updated.");
                            } else {
                                console.log(resp);
                                bootbox.alert("Error: " + resp.msg);
                            }
                        }, function (err) {
                            consle.log(err);
                            removeWaitingOverlay();
                        });
                    });
                }
            } else if (resp.status == 201) {
                if (tbl.children().length <= 1) {
                    tbl.append('<tr><td colspan="3">No items found</td></tr>');
                }
            } else {
                bootbox.alert("Error: " + resp.msg);
            }
        });
    }

    $(window).on('scroll', function () {
        if ($(window).scrollTop() > $(document).height() - $(window).height() - 10) {
            loadMoreOrders();
        }
    }).scroll();

    function downloadAiSvg(url) {
        doGet(url, {}, function (resp) {
            var fonts = $("[font-family]", resp);
            for (var i = 0; i < fonts.length; i++) {
                var item = $(fonts.get(i));
                item.attr("font-family", getFontName(item.attr("font-family")));
            }
            var serializer = new XMLSerializer();
            var svgLogoData = "data:image/svg+xml;base64," + Base64.encode(serializer.serializeToString(resp));
            window.open(svgLogoData);
        }, function (err, xhr) {
            console.error(err, xhr);
        });
    }

    function getFontName(name) {
        switch (name) {
            case "Serif":
            case "Sans-Serif":
            case "Monospace":
            {
                return name;
            }
            case "Cursive":
            case "Cursive1":
            {
                return "Comic Neue";
                break;
            }
            case "MuseoSlab":
            {
                return "Museo Slab";
                break;
            }
            case "MuseoSans":
            {
                return "Museo Sans";
                break;
            }
            case "Neuton":
            {
                return "Neuton";
                break;
            }
            case "Stag-Medium":
            {
                return "Stag";
                break;
            }
            case "STAGSANS":
            {
                return "Stag Sans";
                break;
            }
            case "Zapf":
            {
                return "Zapf ChanceC";
                break;
            }
            case "GLSNECB":
            {
                return "Gill Sans MT Ext Condensed Bold";
                break;
            }
            case "Helvetica":
            case "Helvetica":
            case "HELVETIA":
            {
                return "Helvetica";
            }
            case "CG Omega":
            {
                return "CG-OmegaC";
                break;
            }
            case "Eurostile LT Bold":
            {
                return "Stag Sans";
                break;
            }
            default:
            {
                return "Arial";
            }
        }
    }

    function updateCardImageForPurchase(newId, url) {
        $(newId).append('<object type="image/svg+xml" data="'+ url + '" width="250"></object>');
    }
});
