$(function (){
    function init(){
        $("#txtUserEmail").keypress(function(e){
            if (e.keyCode == 13){
                listUsers($("#txtUserEmail").val(), 100);
            }
        });
        listUsers();
    }

    function listUsers(email, limit){
        var tbl = $(".tblUsers tbody");
        var _addEmptyRow = function (){
            tbl.empty();
            tbl.append('<tr><td colspan="5">No users found!!</td></tr>');
        };
        doGet("/listUsers", {email: email, limit: limit}, function (resp){
            if (resp.status == 200){
                $("#totaluser").append(resp.users[0]["totalusers"])
                $("#totalactiveusers").append(resp.users[0]["totalactiveusers"]);
                tbl.empty();
                for (var i = 0; i < resp.users.length; i++) {
                    var user = resp.users[i];
                    tbl.append("<tr>" +
                        "<td>" + user.email + "</td>" +
                        "<td>" + noNull(user.first_name) + " " + noNull(user.last_name) + "</td>" +
                        "<td>" + noNull(user.phone_num) + "</td>" +
                        "<td>" + noNull(user.address) + "</td>" +
                        "<td>" +
                        "   <form target='_blank' method='post' style='display: inline;' action='" + hostName + "/fakeLogin'>" +
                        "      <input type='hidden' name='emailid' value='" + user.email + "'/>" +
                        "      <input type='hidden' name='md5_secret' value='" + user.md5_password + "'/>" +
                        "      <input data-toggle='tooltip' data-placement='top' title='Please logout existing session before login' type='submit' class='btn btn-xs btn-default' value='Login' />" +
                        "   </form> " +
                        "   <button data-id='" + user.id + "' class='btn btn-xs btn-default more-details-btn'>More Details</button>" +
                        "</td>" +
                        "</tr>");
                }
                $('[data-toggle="tooltip"]').tooltip()
                $(".more-details-btn").click(function (e){
                    addWaitingOverlay();
                    doGet("/getMoreUserDetails", {id: $(this).attr("data-id")}, function (resp){
                        removeWaitingOverlay();
                        if (resp.status == 200){
                            var data = $("<div style='overflow-y: auto; max-height: 400px'></div>");
                            if(resp.details.length == 0){
                                data.append("No more details!");
                            } else {
                                for (var i = 0; i < resp.details.length; i++) {
                                    var item = resp.details[i];
                                    console.log(item);
                                    data.append("<h4>" + item.name + "</h4>");
                                    data.append(item.email_address + "<br/>" + item.phone_number + "<br/>" + item.address1 + "<br/>" + item.address2 + "<br/>" + item.city + "<br/>" + item.postal_code + "<br/>" + item.state + "<br/>" + item.country);
                                    data.append("<hr/>");
                                }
                            }
                            bootbox.dialog({
                                title: "Shipping Addresses",
                                message: "<div id='moreDetails'></div>",
                                buttons: {
                                    success: {
                                        label: "Close",
                                        className: "btn-success",
                                    }
                                }
                            });
                            $("#moreDetails").replaceWith(data);
                        } else {
                            console.log(err);
                            showToast("Error: " + err.msg);
                        }
                    }, function (err){
                        console.log(err);
                        showToast("Error contacting server.");
                        removeWaitingOverlay();
                    });
                    e.stopPropagation();
                });
            } else {
                _addEmptyRow();
                console.log(resp);
                showToast("Error: "  + resp.msg);
            }
        }, function (err){
            _addEmptyRow();
            console.log(err);
            showToast("Error in connection.");
        })
    }

    function noNull(str){
        if (str == null){
            return "";
        } else {
            return str;
        }
    }

    init();
});