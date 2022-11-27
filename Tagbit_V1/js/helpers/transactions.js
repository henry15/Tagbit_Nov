$(function () {
    var LENGTH = 20;
    var transactionFinished = false;
    var start = 0;

    function init() {
        $(window).on('scroll', function () {
            if ($(window).scrollTop() > $(document).height() - $(window).height() - 50) {
                if (!transactionFinished) {
                    getTransactions(start);
                    start += LENGTH + 1;
                }
            }
        }).scroll();
    }

    function getTransactions(start, end) {
        console.log("Getting from " + start + " to " + (start + 20));
        doPost("/getTransactions", {start: start}, function (resp) {
            var tbl = $(".tblTransactions tbody");
            if (resp.status == 200) {
                for (var i = 0; i < resp.transactions.length; i++) {
                    var json = "";
                    try {
                        json = JSON.stringify(JSON.parse(resp.transactions[i].failure_details), null, 4);
                    } catch (err) {
                        json = resp.transactions[i].failure_details;
                    }
                    var str = "<tr><td class='col-md-2'>" + moment(resp.transactions[i].timestamp).format("DD-MMM-YYYY <br/> hh:mm A") + "</td>" +
                        "<td class='col-md-2'>" + resp.transactions[i].first_name + " " + resp.transactions[i].last_name + "</td>" +
                        "<td class='col-md-1'>" + resp.transactions[i].phone_num + "</td>" +
                        "<td class='col-md-2'>" + (resp.transactions[i].user_email != resp.transactions[i].email ? resp.transactions[i].email + "<br/>(" + resp.transactions[i].user_email + ")" : resp.transactions[i].email) + "</td>" +
                        "<td class='col-md-1'>" + resp.transactions[i].payment_gateway + "</td>" +
                        "<td class='col-md-2'>" + resp.transactions[i].transaction_id + "</td>" +
                        "<td class='col-md-1'>" + resp.transactions[i].status + "</td>" +
                        "<td class='col-md-1'>" +
                        "<button class='btn btn-xs btn-primary detailed-view' data-content='" + json + "' " +
                        " data-status='" + resp.transactions[i].status + "' " +
                        " data-userId='" + resp.transactions[i].user_id + "' " +
                        " data-email='" + resp.transactions[i].user_email + "' " +
                        " data-payment_type='" + resp.transactions[i].payment_gateway + "' " +
                        " data-date_purchased='" + resp.transactions[i].timestamp + "' " +
                        " data-txn_id='" + resp.transactions[i].id + "' " +
                        " data-name='" + resp.transactions[i].first_name + " " + resp.transactions[i].last_name + "' " +
                        ">Show</button>" +
                        "</td>" +
                        "</tr>";
                    tbl.append(str);
                }
                $(".detailed-view").off().click(function (e) {
                    var buttons = {
                        success: {
                            label: "Close",
                            className: "btn-success"
                        }
                    };
                    var thisObj = this;
                    if ($(this).attr("data-status") == "Failure" || $(this).attr("data-status") == "Cancel") {
                        buttons.fakeSucess = {
                            label: "Make this payment successful",
                            className: "hidden pull-left btn-danger",
                            callback: function () {
                                var text = "I AM SURE " + (new Date().getTime() % 1000);
                                var result = prompt("Please type the text '" + text + "' without single quotes.");
                                if (result == text) {
                                    addWaitingOverlay();
                                    $.post(hostName + "/fakePaymentSuccess", {
                                        userId: $(thisObj).attr("data-userId"),
                                        email: $(thisObj).attr("data-email"),
                                        payment_type: $(thisObj).attr("data-payment_type"),
                                        date_purchased: $(thisObj).attr("data-date_purchased"),
                                        txn_id: "SPL_AUTO_" + $(thisObj).attr("data-txn_id"),
                                        name: $(thisObj).attr("data-name")
                                    }).done(function (resp) {
                                        removeWaitingOverlay();
                                        if (resp.status == 200) {
                                            showToast("Action successful", "success")
                                        } else {
                                            console.log(resp);
                                            bootbox.alert("Error: " + resp.msg)
                                        }
                                    }).fail(function (err) {
                                        removeWaitingOverlay();
                                        console.log(err);
                                        bootbox.alert("Connection error making this transaction succesful.")
                                    }) 
                                } else {
                                    alert("Validation failed: You entered '" + result + "' instead of '" + text + "'");
                                }
                            }
                        }
                    }
                    bootbox.dialog({
                        title: "Gateway Response",
                        message: "<pre>" + $(this).attr("data-content") + "</pre>",
                        buttons: buttons
                    });
                    e.stopPropagation();
                });
            } else if (resp.status == 201) {
                transactionFinished = true;
                if (tbl.find("tr").length == 0) {
                    tbl.append("<tr><td colspan='8'>No transactions found</td></tr>");
                }
            } else {
                bootbox.alert("Error listing transactions info.");
                console.log(resp);
            }
        });
    }

    init();
});