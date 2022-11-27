$(function () {
    var LENGTH = 20;
    var transactionFinished = false;
    var start = 0;

    function init() {
        $(window).on('scroll', function () {
            if ($(window).scrollTop() > $(document).height() - $(window).height() - 50) {
                if (!transactionFinished) {
                    getOrderCancel(start);
                    start += LENGTH + 1;
                }
            }
        }).scroll();
    }

    function getOrderCancel(start, end) {
        console.log("Getting from " + start + " to " + (start + 20));
        doPost("/getorderCancel", {start: start}, function (resp) {
            var tbl = $(".tblTransactions tbody");
            if (resp.status == 200) {
                for (var i = 0; i < resp.data.length; i++) {
                    var imgsrc = "/getMyOtherProductImage?id="+resp.data[i].url;
                    var str = "<tr><td class='col-md-2'>" + moment(resp.data[i].created).format("DD-MMM-YYYY <br/> hh:mm A") + "</td>" +
                        "<td class='col-md-2'>" + resp.data[i].first_name + " " + resp.data[i].last_name + "</td>" +
                        "<td class='col-md-1'>" + resp.data[i].phone_num + "</td>" +
                        "<td class='col-md-2'>" + resp.data[i].email+ "</td>" +
                        "<td class='col-md-1'> <img src='"+imgsrc +"' height='50' width='50' ></td>" +
                        "<td class='col-md-2' style='word-break: break-all;'>" + resp.data[i].reason + "</td>" +
                        "<td class='col-md-1'>" + resp.data[i].txn_id + "</td>" +
                        '<td>' +
                        '<select class="purRowCmp' + resp.data[i].id + '" data-id="' + resp.data[i].id + '">' +
                        '   <option value="PENDING">PENDING</option>' +
                        '   <option value="PROCESSING">PROCESSING</option>' +
                        '   <option value="CANCELLED">CANCELLED</option>' +
                        '</select> ' +
                        '<button class="btn btn-small btn-primary btnSave' + resp.data[i].id + '" data-id="' + resp.data[i].id + '">Save</button>' +
                        '</td>'+
                        "</tr>";
                    tbl.append(str);

                    $(".purRowCmp" + resp.data[i].id).val(resp.data[i].status);
                    $(".btnSave" + resp.data[i].id).hide();
                    $(".purRowCmp" + resp.data[i].id).change(function (e) {
                        $(".btnSave" + $(e.target).attr("data-id")).show();
                    });
                    $(".btnSave" + resp.data[i].id).click(function (e) {
                        e.preventDefault();
                        addWaitingOverlay();
                        doPost("/updateOrderCancel", {
                            id: $(e.target).attr("data-id"),
                            status: $(".purRowCmp" + $(e.target).attr("data-id")).val()
                        }, function (response) {
                            removeWaitingOverlay();
                            if (response.status == 200) {
                                $(".btnSave" + $(e.target).attr("data-id")).hide();
                                showToast("Item updated.");
                            } else {
                                console.log(response);
                                bootbox.alert("Error: " + response.msg);
                            }
                        }, function (err) {
                            consle.log(err);
                            removeWaitingOverlay();
                        });
                    });
                }
            } else if (resp.status == 201) {
                transactionFinished = true;
                if (tbl.find("tr").length == 0) {
                    tbl.append("<tr><td colspan='8'>No return record found</td></tr>");
                }
            } else {
                bootbox.alert("Error listing cancel records.");
                console.log(resp);
            }
        });
    }

    init();
});