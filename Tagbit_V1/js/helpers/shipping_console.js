

if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
    alert('The File APIs are not fully supported in this browser. Please use an updated browser.');
}

$(function () {
    var editingShippingId = null;

    function init() {
        $('#shipperExpectedDate').datetimepicker({
            format: 'L'
        });
        doPost("/listShippingInfo", {}, function (resp) {
            if (resp.status == 200) {
                var tblShipping = $(".tblShippingTable");
                for (var i = 0; i < resp.items.length; i++) {
                    var item = resp.items[i];
                    var address = fillIfNull(item.email_address, "") + "<br/>Ph: " + fillIfNull(item.phone_number, "") + "<br/>" + fillIfNull(item.first_name, "") + " " + fillIfNull(item.last_name, "") + " <br/>" + fillIfNull(item.address1, "") + " <br/>" + fillIfNull(item.address2, "") + " <br/>" + fillIfNull(item.city, "") + " <br/>" + fillIfNull(item.country, "") + " <br/>" + fillIfNull(item.state, "") + " <br/>" + fillIfNull(item.postal_code, "") + " <br/>";
                    var tr = $('<tr id="shippingInfo_' + item.shipping_info_id + '" class="cartId_' + item.order_id + '" data-cart-id="' + item.shipping_info_id + '"></tr>')
                    tr.append("<td>" + item.order_id + "</td>");
                    tr.append("<td>" + fillIfNull(address) + "</td>");
                    tr.append("<td class='shipperName'>" + fillIfNull(item.shipper_name) + "</td>");
                    tr.append("<td class='shipperStatus'>" + fillIfNull(item.status) + "</td>");
                    tr.append("<td class='shipperExpectedDate'>" + (item.expected_date == null ? "NA" : fillIfNull(formatDate(item.expected_date))) + "</td>");
                    tr.append("<td>" + (item.date_purchased == null ? "NA" : fillIfNull(formatDate(item.date_purchased))) + "</td>");
                    tr.append("<td class='shipperTrackingId'>" + fillIfNull(item.tracking_id) + "</td>");
                    tr.append('<td><a class="editShipping'+ item.shipping_info_id + '" href="#">Edit</a></td>');
                    tblShipping.append(tr);
                    $(".editShipping" + item.shipping_info_id).click(function (e){
                        e.preventDefault();
                        e.stopPropagation();
                        editShipping(item.shipping_info_id);
                    });
                }
            } else {
                bootbox.alert("Error listing shipping info.");
            }
        });
        $("#shippingModel").on("hide.bs.modal", function (e) {
            $("#shipperName").val("");
            $("#shipperStatus").val("");
            $("#shipperExpectedDate").val("");
            $("#shipperTrackingId").val("");
        });
        $("#saveCountry").click(function (e) {
            e.preventDefault();
            updateShipping($("#shipperName").val(), $("#shipperStatus").val(), $("#shipperExpectedDate").val(), $("#shipperTrackingId").val(), editingShippingId, function (err) {
                if (err) {
                    bootbox.alert(err);
                } else {
                    showToast("Successfully updated shipping details.");
                    $("#shippingModel").modal('hide');
                }
            });
        });
        document.getElementById('uploadShippingInfo').addEventListener('change', handleFileSelect, false);
    }
    function handleFileSelect(evt) {
        var files = evt.target.files;
        var output = [];
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            if (f) {
                var r = new FileReader();
                r.onload = function (e) {
                    var csv = e.target.result;
                    var data = Papa.parse(csv, {
                        complete: function(results) {
                            var obj = [];
                            var ul = "<ul>";
                            for (var j = 0; j < results.data.length; j++) {
                                var row = results.data[j];
                                if (row.length >= 3){
                                    var shipper = row[2];
                                    var trackingId = row[1];
                                    var id = row[0];
                                    obj.push({shipper_name: shipper, tracking_id: trackingId, id: id});
                                    ul += '<li>Order ID: ' + id + "<br/>Shipper: " + shipper + "<br/>Tracking ID: " + trackingId + '</li>';
                                }
                            }
                            ul += "</ul>"
                            bootbox.confirm("<b>Are you sure to save the details? </b><br/><br/><div style='max-height: 300px; overflow: auto'><b>File Contents: </b><br/><br/>" + ul + "<br/><b>Errors: </b><br/><br/>" + results.errors.join("<br/>" + "</div>"), function (res){
                                if (res){
                                    for (var k = 0; k < obj.length; k++){
                                        var shippingId = $(".cartId_" + obj[k].id).data("cart-id");
                                        obj[k].id = shippingId;
                                        updateShipping(obj[k].shipper_name, "", "", obj[k].tracking_id, obj[k].id, function (err){
                                            if (err) {
                                                bootbox.alert(err);
                                            } else {
                                                showToast("Successfully updated shipping details.");
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
                r.readAsText(f);
            } else {
                alert("Failed to load file: " + f.name);
            }
        }
    }
    function editShipping(id) {
        editingShippingId = id;
        var shippingInfo = $("#shippingInfo_" + editingShippingId);
        $("#shipperName").val(fillIfNull($(".shipperName", shippingInfo).text(), ""));
        $("#shipperStatus").val(fillIfNull($(".shipperStatus", shippingInfo).text(), ""));
        $("#shipperExpectedDate").val(fillIfNull($(".shipperExpectedDate", shippingInfo).text(), ""));
        $("#shipperTrackingId").val(fillIfNull($(".shipperTrackingId", shippingInfo).text(), ""));
        $("#shippingModel").modal('show');
    }

    init();
});