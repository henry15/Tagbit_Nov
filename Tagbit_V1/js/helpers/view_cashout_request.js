$(function () {
    var nextIndex = 0;
    var STEP = 20;
    var times = 0;

    function loadMoreOrders() {
        var tbl = $(".tblPurchasedCards tbody");
        doGet("/listCashoutRequest", {start: nextIndex + times}, function (resp) {
            if (resp.status == 200) {
                nextIndex += STEP;
                times ++;
                for (i = 0; i < resp.items.length; i++) {
                    var val = resp.items[i];
                    var d = new Date(val.created);
                    var html = '';
                    if(val.long_payment_id >0){
                        html += '<tr><td>'+val.first_name+' '+val.last_name+'</td><td>'+val.email+'</td><td>'+val.amount_request+'</td><td>'+val.long_pay_method+'</td>';
                        html += '<td> Account No : '+val.ac_num+'<br> Bank Name :'+val.bname+'<br> IFSC Code :'+val.ifsc+'</td>';
                        html += '<td>' +
                        '<select class="purRowCmp' + val.id + '" data-id="' + val.id + '">' +
                        '   <option value="PENDING">PENDING</option>' +
                        '   <option value="COMPLETED">COMPLETED</option>' +
                        '</select> ' +
                        '<button class="btn btn-small btn-primary btnSave' + val.id + '" data-id="' + val.id + '">Save</button>' +
                        '</td></tr>';
                    }else if(val.short_payment_id > 0){
                        html += '<tr><td>'+val.first_name+' '+val.last_name+'</td><td>'+val.email+'</td><td>'+val.amount_request+'</td><td>'+val.short_pay_method+'</td>';
                        html += '<td>'+val.pay_id+'</td>';
                        html += '<td>' +
                        '<select class="purRowCmp' + val.id + '" data-id="' + val.id + '">' +
                        '   <option value="PENDING">PENDING</option>' +
                        '   <option value="COMPLETED">COMPLETED</option>' +
                        '</select> ' +
                        '<button class="btn btn-small btn-primary btnSave' + val.id + '" data-id="' + val.id + '">Save</button>' +
                        '</td></tr>';
                    }
                    tbl.append(html);                  
                    $(".purRowCmp" + val.id).val(val.status);
                    $(".btnSave" + val.id).hide();                   
                   
                    $(".purRowCmp" + val.id).change(function (e) {
                        $(".btnSave" + $(e.target).attr("data-id")).show();
                    });
                    $(".btnSave" + val.id).click(function (e) {
                        e.preventDefault();
                        addWaitingOverlay();
                        doPost("/updateCashoutRequest", {
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
    loadMoreOrders();
    /*$(window).on('scroll', function () {
        if ($(window).scrollTop() > $(document).height() - $(window).height() - 20) {
            
        }
    }).scroll();*/


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

});
