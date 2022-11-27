$(function () {
    var nextIndex = 0;
    var STEP = 10;
    var times = 0;
    
    var loadingOrders = false;
    
    function loadMoreOrders() {
        if (loadingOrders){
            return;
        }
        loadingOrders = true;
        var tbl = $(".tblPurchasedCards tbody");
        doPost("/listPurchasedCards", {start: nextIndex + times}, function (resp) {
            loadingOrders = false;
            if (resp.status == 200) { 
                times ++;
                nextIndex += STEP;  
                for (i = 0; i < resp.items.length; i++) {
                    var val = resp.items[i];
                    var d = new Date(val.created_at); 
                    tbl.append('<tr>' +
                        '<td class="col-md-1"><div style="text-align: left; overflow: hidden" class="purFCardPrev' + val.id + '"></div><a data-src="' + val.url + '" class="editCardLinkFront' + val.id + ' link">Edit</a></td>' +
                        '<td class="col-md-1"><div style="text-align: left; overflow: hidden" class="purBCardPrev' + val.id + '"></div><a data-src="' + val.url_back + '" class="editCardLinkBack' + val.id + ' link">Edit</a></td>' +
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
                        '<td>' +
                        "Order ID: " + val.shopping_cart_id +
                        "<br/>Date of Order: " + formatDate(d) +
                        "<br/>Quantity: " + val.qty +
                        "<br/>Finish: " + val.finish +
                        "<br/>Paper: " + (val.paper_stock == "UltraPremium" ? "Superior" : "Executive") +
                        "<br/>Shipping: " + (val.shipping_type == "Exp" ? "Express" : "Standard") +
                        "<br/>Email: " + val.email +
                        "<br/>Print card?: " + (val.dont_print_card ? "<b>No</b>" : "Yes") + 
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
                        '<a target="_blank" data-href-front="' + getWinPdf(val.url, val.id) + '" data-href-back="' + getWinPdf(val.url_back, val.id + ".back") + '" class="link downloadPDF' + val.id + '">Windows PDF</a> <br/> <br/> ' + 
                        '<a target="_blank" data-href-front="/generatePDF?width=1000&height=100&type=card&url=' + val.url + '&id=' + val.id + '" data-href-back="/generatePDF?width=1000&height=100&type=card&url=' + val.url_back + '&id=' + val.id + '.back" class="link downloadPDF' + val.id + '">PDF</a> | <a data-href-front="' + val.url + '" data-href-back="' + val.url_back + '" href="#" class="downloadSVG' + val.id + '">SVG</a>' +
                        '<br/>' +
                        '<a target="_blank" data-href-front="/generatePDF?width=1000&height=100&type=card&url=' + val.url + '&id=' + val.id + '&rgb=true" data-href-back="/generatePDF?width=1000&height=100&type=card&url=' + val.url_back + '&id=' + val.id + '.back&rgb=true" class="link downloadPDF' + val.id + '">RGB-PDF</a>' +
                        '<br/>' +
                        '<a data-href-front="' + val.url + '" data-href-back="' + val.url_back + '" href="#" class="downloadAISVG' + val.id + '">Generic SVG</a></td>'
                        : "<td><a class='link' data-href-front='/getUserCardImage?id=" +val.url+ "' data-href-back='/getUserCardImage?id=" +val.url_back+ "' id='downloadCustom" + val.id + "'>Download</a></td>")) + 
                        '</tr>');
                    var callEditor = function (url) {
                        var win = window.open(realAppDomain  + "/svgedit/editor?docUrl=" + encodeURIComponent(url) + "&version=3.0");
                    };
                    $('.downloadAISVG' + val.id).click(function (e) {
                        e.preventDefault();
                        downloadAiSvg('/getUserCardImage?id=' + $(e.target).attr("data-href-front"));
                    });
                    $("#downloadCustom" + val.id).click(function (e){
                        window.open($(e.target).attr("data-href-front"));
                    });
                    if (val.back_of_card != "Blank") {
                        $('.downloadAISVG' + val.id).click(function (e) {
                            e.preventDefault();
                            downloadAiSvg('/getUserCardImage?id=' + $(e.target).attr("data-href-back"));
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
                    if (val.back_of_card != "Blank") {
                        $('.downloadPDF' + val.id).click(function (e) {
                            e.preventDefault();
                            window.open($(e.target).attr("data-href-back"));
                        });
                    }
                    $(".purRowCmp" + val.id).val(val.status);
                    $(".btnSave" + val.id).hide();
                    if (val.design_type == "SystemDesign") {
                        updateCardImageForPurchase('.purFCardPrev' + val.id, "/getUserCardImage?id=" + val.url + "&embed=true");
                    } else {
                        updateCardImageForPurchase('.purFCardPrev' + val.id, "/img/customCard.svg");
                        $(".editCardLinkFront" + val.id).hide();
                        $(".editCardLinkBack" + val.id).hide();
                    }

                    if (val.url_back != null) {
                        if (val.back_of_card != "Blank") {
                            if (val.design_type == "SystemDesign") {
                                updateCardImageForPurchase('.purBCardPrev' + val.id, "/getUserCardImage?id=" + val.url_back + "&embed=true");
                            } else {
                                updateCardImageForPurchase('.purBCardPrev' + val.id, "/img/customCard.svg");
                            }
                        } else {
                            $(".editCardLinkBack" + val.id).hide();
                        }
                    } else {
                        $(".editCardLinkBack" + val.id).hide();
                    }
                    $('.downloadSVG' + val.id).click(function (e) {
                        e.preventDefault();
                        window.open('/getUserCardImage?id=' + $(e.target).attr("data-href-front") + '&random=' + Math.random());
                    });
                    if (val.back_of_card != "Blank") {
                        $('.downloadSVG' + val.id).click(function (e) {
                            e.preventDefault();
                            window.open('/getUserCardImage?id=' + $(e.target).attr("data-href-back") + '&random=' + Math.random());
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
        }, function (err){
            loadingOrders = false;
            console.log(err);
            alert("Connection error.");
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
