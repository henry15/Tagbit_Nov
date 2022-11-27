$(function () {
    var nextIndex = 0;
    var STEP = 10;
    var times = 0;
    var options = "";

    doGet("/getVendors",{}, function (resp) {
        if (resp.status == 200) { 
            vendorOptions(resp.items);
            loadMoreOrders("PRINTED")
        } else if (resp.status == 201) {
            vendorOptions([]);
            loadMoreOrders("PRINTED")
        } else {
            vendorOptions([]);
            loadMoreOrders("PRINTED")
        }
    }, function (err){
        vendorOptions([]);
        loadMoreOrders("PRINTED")
    });

    function vendorOptions(items){
        items.forEach(element => {
            options += "<option value ="+element.id+">"+element.companyname+"</option>";
        });
    }
    function loadMoreOrders(status) {
        if(!status){
            status = "PRINTED"
        }
        var tbl = $(".tblPurchasedCards2");
        doGet("/listPurchasedOtherCustomProducts", {start: nextIndex + times,status:status}, function (resp) {
            if (resp.status == 200) {
                nextIndex += STEP;
                times ++;
                for (i = 0; i < resp.items.length; i++) {
                    var val = resp.items[i];
                    var d = new Date(val.created_at);
                    var color = (val.color == null || val.color == "")?"NA":val.color;
                    tbl.append('<tr>' +
                        '<td class="col-md-2"><div style="text-align: left; overflow: hidden;width:164px;" class="purFCardPrev' + val.id + '"><img style="width:160px;"src="/getMyOtherProductImage?id='+val.url+'"></div></td>' +
                        '<td class="col-md-2"><div style="text-align: left; overflow: hidden;width:100px;" class="purFCardPrev' + val.id + '"><img style="width:100px;"src="/getMyOtherProductImage?id='+val.logo+'" alt="NA" height="100" width="100"></div></td>' +
                        '<td class="col-md-1"><div style="text-align: left; overflow: hidden">'+val.product_name+'</td>' +
                        '<td class="col-md-3">' +
                        val.email_address + "<br/>" +
                        "Ph: " + val.phone_number + "<br/>" +
                        val.first_name + " " + val.last_name + "<br/>" +
                        val.address1 + "<br/>" +
                        val.address2 + "<br/>" +
                        val.city + ", " + val.state + "<br/>" +
                        val.country + "<br/>" +
                        "PIN: " + val.postal_code + "<br/>" +
                        '</td>' +
                        '<td class="orderDetail col-md-2' + val.base_item_id + '">' +
                        "Order ID: " + val.shopping_cart_id +
                        "<br/>Product: " + val.otherProductName +
                        "<br/>Product SKU: TGB" + val.productsku +
                        "<br/>Color: " +color+
                        "<br/>Date of Order: " + formatDate(d)   + 
                        "<br/>Small: " + val.small + 
                        "<br/>Medium: " + val.medium + 
                        "<br/>Large: " + val.large + 
                        "<br/>Xl: " + val.xl + 
                        "<br/>XXl: " + val.doublexl + 
                        '</td>' +
                        '<td class="col-md-2">' +
                        '<select class="purRowCmp' + val.id + '" data-id="' + val.id + '">' +
                        '   <option value="NOT_PRINTED">New Order</option>' +
                        '   <option value="PRINTING">Sent for print</option>' +
                        '   <option value="PRINTED">Shipped now</option>' +
                        '</select> ' +
                        '<select class="purRowCmpVen' + val.id + '" data-id="' + val.id + '">' +
                        '  <optgroup label="Vendors" id="venopt'+val.id+'"><optgroup> '+
                        '</select> ' +
                        '<button class="btn btn-small btn-primary btnSave' + val.id + '" data-id="' + val.id + '">Save</button>' +
                        '</td>' +
                        "<td><a class='link col-md-1' data-href-front='/getMyOtherProductImage?id=" +val.url+ "' data-href-back='/getMyOtherProductImage?id=" +val.url_back+ "' id='downloadCustom" + val.id + "'>Download</a><br><a class='link' data-href-front='/getMyOtherProductImage?id=" +val.logo+ "' data-href-back='/getMyOtherProductImage?id=" +val.url_back+ "' id='downloadCustomLogo" + val.id + "'>Download Design</a></td>" + 
                        '</tr>');
                    
                    var callEditor = function (url) {
                        var win = window.open(realAppDomain  + "/svgedit/editor?type=OtherProduct&docUrl=" + encodeURIComponent(url) + "&version=3.0");
                    };
                     
                    
                    $("#downloadCustom" + val.id).click(function (e){
                        window.open($(e.target).attr("data-href-front"));
                    });
                    $("#downloadCustomLogo" + val.id).click(function (e){
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
                    $(".purRowCmpVen" + val.id).hide();
                    $("#venopt"+val.id).append(options);

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
                        if($(".purRowCmp" + $(e.target).attr("data-id")).val() == 'PRINTED')
                        $(".purRowCmpVen" + $(e.target).attr("data-id")).show();
                        $(".btnSave" + $(e.target).attr("data-id")).show();
                    });
                    $(".btnSave" + val.id).click(function (e) {
                        e.preventDefault();
                        addWaitingOverlay();
                        if($(".purRowCmp" + $(e.target).attr("data-id")).val() == 'PRINTED' && $(".purRowCmpVen" + $(e.target).attr("data-id")).val() == "")
                        alert("Please select a vendor")
                        else{
                            doPost("/updatePurchaseItem", {
                                id: $(e.target).attr("data-id"),
                                status: $(".purRowCmp" + $(e.target).attr("data-id")).val(),
                                vendor: $(".purRowCmpVen" + $(e.target).attr("data-id")).val()
                            }, function (resp) {
                                removeWaitingOverlay();
                                if (resp.status == 200) {
                                    $(".btnSave" + $(e.target).attr("data-id")).hide();
                                    $(".purRowCmpVen" + $(e.target).attr("data-id")).hide();
                                    showToast("Item updated.");
                                } else {
                                    console.log(resp);
                                    bootbox.alert("Error: " + resp.msg);
                                }
                            }, function (err) {
                                consle.log(err);
                                removeWaitingOverlay();
                            });
                        }
                        
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

   
    /*$(window).on('scroll', function () {
        var status = $("#Ondropdownchange").val();
        if ($(window).scrollTop() > $(document).height() - $(window).height() - 10) {
            loadMoreOrders(status);
        }
    }).scroll();*/

    $("#downloadBtn").click(function (){
        tableToExcel('tblOrders', 'Printing orders', 'myfile.xls')
    });

    $('#Ondropdownchange').on('change', function() {
        var tbl = $(".tblPurchasedCards2");
        tbl.empty();
        nextIndex = 0;
        times = 0;
        loadMoreOrders(this.value)
    });

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

    var tableToExcel = (function () {
        var uri = 'data:application/vnd.ms-excel;base64,'
            , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
            , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
            , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
        return function (table, name, filename) {
            if (!table.nodeType) table = document.getElementById(table)
            var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }
            window.open( uri + base64(format(template, ctx)));
        }
    })();
});
