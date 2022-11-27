$(function () {

    loadList(undefined, 10);

    $("#showAllRecords").click(function () {
        loadList(undefined, undefined, function () {
            $("#showAllRecords").hide();
        });
    });

    $("#email").keypress(function (ev) {
        if (ev.charCode == 13) {
            loadList(this.value, undefined, function () {
                $("#showAllRecords").show();
            });
        }
    });

    function loadList(email, limit, callback) {
        var tbl = $("#invoiceTable");
        tbl.children().remove();
        addWaitingOverlay();
        doPost("/listCarts", {email: email, limit: limit}, function (resp) {
            removeWaitingOverlay();
            if (resp.status == 200) {
                console.log("Here",resp.carts.length);

                for (var i = 0; i < resp.carts.length; i++) {
                    var row = "<tr>" +
                            "<td>" + moment(resp.carts[i].date_purchased).format("DD-MMM-YYYY hh:mm A") + "</td>" +
                            "<td>" + resp.carts[i].email + "</td>" +
                            "<td>" + resp.carts[i].shipping_address.replace(/\n/g, '<br/>')+ "</td>";
                            if(resp.carts[i].purchaseTypes == "CUSTOM"){
                                row += "<td id='shippingItems" + resp.carts[i].id + "'>" + resp.carts[i].qty + " CUSTOM T-SHIRT</td>";
                            }else{
                                row += "<td id='shippingItems" + resp.carts[i].id + "'>" + getSummery(resp.carts[i]) + "</td>";
                            }
                         
                         row +=   "<td>" + resp.carts[i].currency + " " + resp.carts[i].price + "<br/> via <br/>" + resp.carts[i].payement_type + "</td>" +
                            "<td><button class='btn btn-xs btn-default send-invoice-btn' data-order-id='"+resp.carts[i].orderid+"' data-order-date='"+resp.carts[i].orderdate+"'  data-item-ids='" + resp.carts[i].purchaseItemIds + "'>Send Invoice</button></td>" +
                            "</tr>";
                    console.log(tbl)
                    tbl.append(row);
                }
                $(".send-invoice-btn").click(function (e) {
                    updateShipping("", "", $(this).attr("data-order-date"), $(this).attr("data-order-id"), undefined, function (err) {
                        if (err) {
                            console.error(err);
                            showToast(err);
                        } else {
                            showToast("Successfully Sent Invoice.", "success");
                        }
                    }, $(this).attr("data-item-ids").split(","));
                    e.stopPropagation();
                }); 
            } else if (resp.status == 201) {
                showToast("No items found with this email: " + email);
            } else {
                console.log(resp);
                showToast("Error in retrieving details");
            }
            callback ? callback() : $.noop();
        }, function (err) {
            removeWaitingOverlay();
            console.log(err);
        });
    }

    function getSummery(resp) {
        var splitted = resp.purchaseTypes.split(",");
        var logos = 0, cards = 0 , products = 0;
        for (var i = 0; i < splitted.length; i++) {
            if (splitted[i] == "BC") {
                cards++;
            }else if(splitted[i] == "CUSTOM") {
                products++;
            }else {
                logos++;
            }
        }
        return [(logos ? logos + " Logo(s)" : ""), (cards ? cards + " Card(s)" : ""),(products ? products + " Products(s)" : "")].join(" ")
    }
});