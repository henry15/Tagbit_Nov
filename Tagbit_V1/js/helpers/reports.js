$(function (){
    var sortField = "shopping_carts.id";
    var sortOrder = "DESC";
    function init() {
        updateData({
            sortField: sortField,
            sortOrder: sortOrder,
            limit: 10
        });
        $("#showAllRecords").click(function (){
            updateData({
                sortField: sortField,
                sortOrder: sortOrder
            }, function (){
                $("#showAllRecords").hide();
            });
        });
        $("#applyBtn").click(function () {
            var serialNum = $("#serialNum").val().trim();
            var status = $("#statusCmb").val().trim();
            var startDate = $("#startDate").val().trim();
            var endDate = $("#endDate").val().trim();
            var product = $("#productCmb").val().trim();
            updateData({
                orderNo: serialNum || undefined,
                orderStatus: status || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                product: product || undefined,
                sortField: sortField,
                sortOrder: sortOrder
            }, function (){
                $("#showAllRecords").show();
            });
        });
        $("#downloadBtn").click(function (){
            tableToExcel('tblOrders', 'Reports', 'myfile.xls')
        });
        $(".tblOrderList th a").click(function (evt){
            var field = $(evt.target).attr("data-field");
            if (sortField == field){
                if (sortOrder == "ASC"){
                    sortOrder = "DESC";
                } else {
                    sortOrder = "ASC";
                }
            } else {
                sortOrder = "ASC";
                sortField = field;
            }
            $("#applyBtn").click();
        });
        $("#clearFilterBtn").click(function (){
            updateData({
                sortField: sortField,
                sortOrder: sortOrder
            });
            $("#serialNum").val("");
            $("#startDate").val("");
            $("#endDate").val("");
            $("#statusCmb").val("");
            $("#statusCmb").val("");
        });
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

    function updateData(data, callback){
        addWaitingOverlay();
        doPost("/purchasedItems", data, function(resp){
            removeWaitingOverlay();
            if (resp.status == 200){
                var tbl = $(".tblOrderList tbody");
                tbl.empty();
                var items  = {};
                if (resp.items.length > 0){
                    for(var i = 0; i < resp.items.length; i++){
                        var item = resp.items[i];
                        if (items[item.cart_id] == undefined){
                            items[item.cart_id] = [];
                        }
                        items[item.cart_id].push(item);
                    }
                    for(var i = 0; i < resp.items.length; i++){
                        var item = resp.items[i];
                        tbl.append("<tr><td>" + item.cart_id + (item.item_type == "BC" ? "BC" : (item.item_type == "OTHER" ? "OT" : "LG")) + item.item_id +"</td><td>" +item.first_name+" "+item.last_name+" / "+ item.email_address+"</td><td>"+item.phone_number+"</td><td>"+item.address1+"<br/>"+item.address2+"<br/>"+item.city+"<br/>"+item.state+"<br/>"+item.country+"<br/>"+item.postal_code+"</td><td>"+item.payement_type+"</td>"+"<td>"+(item.item_type == "BC" ? item.qty : 1)+"</td><td>"+(item.item_type == "BC" ? "Card" : "Logo")+"</td><td>"+(item.item_type == "BC" ? item.paper_stock : "NA")+"</td>"+"<td>"+item.price+" </td><td> "+item.currency + " " + (items[item.cart_id].length - 1 == 0 ? "" : "("+(items[item.cart_id].length - 1) + " more item)") +"</td><td>"+moment(item.date_purchased).format("YYYY-MM-DD hh:mm A")+"</td>"+"<td>"+(item.order_status == "NOT_PRINTED" ? "Not Printed" : (item.order_status == "PRINTING" ? "Printing" : "Printed"))+"</td>"+"</tr>");
                    }
                } else {
                    $(".tblOrderList").append("<tr><td colspan='11'>No items found.</td></tr>");
                }
                callback ? callback() : $.noop();
            } else {
                console.log(resp);
                bootbox.alert("Error retrieving purchase details.");
            }
        }, function (err){
            console.log(err);
            removeWaitingOverlay();
        });
    }
    init();
});
