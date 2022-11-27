//jquery and Javascript
//POD javascript

function switchTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  }

$(function () {
    function a(a, b, c, d, e) {
        parseFloat(d[0]),
        parseFloat(d[1]),
        parseFloat(d[2]),
        parseFloat(d[3]),
        parseFloat(d[4]),
        parseFloat(d[5]),
        parseFloat(d[6]),
        parseFloat(d[7]),
        parseFloat(d[8]);
        a.window.initScalablePreview($, "/getOtherProductImage?id=" + b, "/getUserOtherProductImage?id=" + c, d, !0, 150)
    }
    function c(a) {
        addOtherProductToShoppingCart(a, function () {
            updateCartCount(isLoggedIn()),
            bootbox.alert("This product is added to shopping cart.")
        })
    }
   
    function getMerchData(){
        doGet("/getMerchData", function (data) {
           console.log(data)          
        }, function (data) {
           var orderlist = data.orderlist;
           var productlist = data.productlist;
           var paymethod = data.paymethod;
           var coupanlist = data.coupanlist;
           var paymenthtml = '<div><table class="table"><tr><th scope="col">Payment Method</th><th scope="col">Payment Details</th><th scope="col">Action</th></tr>';
           var producthtml = '<div><table class="table"><tr><th scope="col">#</th><th scope="col">Image</th><th scope="col">Title</th><th scope="col">Price</th><th scope="col">Action</th><th>Product Link</th></tr>';
           var orderhtml = '<div><table class="table"><tr><th scope="col">#</th><th scope="col">Image</th><th scope="col">Base Price</th><th scope="col">Total Base Price</th><th scope="col">Sold Price</th><th scope="col">Total Sold Price</th><th scope="col">Quantity</th><th scope="col">Date Purchased</th><th scope="col">Profit</th><th scope="col">Status</th></tr>';
           var paymentselectbox = '<select class="form-select" id="paymentselect">';
           var coupanhtml = '<div><table class="table"><tr><th scope="col">Product Name</th><th scope="col">Coupon Code</th><th scope="col">Coupon Percent</th><th scope="col">Action</th></tr>';

           var totalprofit = 0
           for(var i = 0;i<orderlist.length;i++){
                 var qty = orderlist[i]['small']+orderlist[i]['large']+orderlist[i]['medium']+orderlist[i]['xl']+orderlist[i]['doublexl'];
                 var profit = (orderlist[i]['total_price']-(orderlist[i]['base_price']*qty));
                 if(orderlist[i]["shipment_status"] == "delivered_freeze"){
                    totalprofit += profit;   
                 }
                 var status = (orderlist[i]['shipment_status'] == 'delivered_freeze')?'Completed':orderlist[i]['shipment_status'] == 'delivered'?'PROCESSED':orderlist[i]['shipment_status'] == null?"PROCESSING":orderlist[i]['shipment_status'];
                 orderhtml += '<tr><th scope="col">'+(i+1)+'</th><td><a href="/shop/product-details?id='+orderlist[i]['id']+'" target="_blank"><img src="/getMyOtherProductImage?id='+orderlist[i]['image']+'"></a></td><td>'+orderlist[i]['base_price']+'</td><td>'+(orderlist[i]['base_price']*qty)+'</td><td>'+orderlist[i]['single_price']+'</td><td>'+orderlist[i]['total_price']+'</td><td>'+qty+'</td><td>'+orderlist[i]['date_purchased']+'</td><td>'+profit+'</td><td>'+status.toUpperCase()+'</td></tr>';
           }
           for(var i = 0;i<productlist.length;i++){
               var id = productlist[i]['id'];
               producthtml += '<tr><th scope="col">'+(i+1)+'</th><td><img src="/getMyOtherProductImage?id='+productlist[i]['front_image']+'" style="width:50px"></td><td>'+productlist[i]['title']+'</td><td>'+productlist[i]['price']+'</td><td onclick="deleteProduct('+id+')" style="cursor:pointer">Delete</td><td><a href="/shop/product-details?id='+id+'" target="_blank">Link</a></td></tr>';
           }
           for(var i = 0;i<coupanlist.length;i++){
            var id = coupanlist[i]['coupan_id'];
            coupanhtml += '<tr><th scope="col">'+coupanlist[i]['title']+'</th><td>'+coupanlist[i]['code']+'</td><td>'+coupanlist[i]['percent']+'</td><td onclick="deleteCoupan('+id+')" style="cursor:pointer">Delete</td></tr>';
           }
           if(paymethod && paymethod["long_payment"] != null){
            for(var i=0;i<paymethod["long_payment"].length;i++){
                paymentselectbox +='<option value="'+paymethod["long_payment"][i]["pay_method"]+'-'+paymethod["long_payment"][i]["ID"]+'">'+paymethod["long_payment"][i]['bname']+'-'+paymethod["long_payment"][i]['ac_num']+'</option>';
                paymenthtml += '<tr><td>'+paymethod["long_payment"][i]["pay_method"]+'</td><td>';
                paymenthtml += '<div> Bank Name :'+paymethod["long_payment"][i]["bname"]+'<br>';
                paymenthtml += ' Account No :'+paymethod["long_payment"][i]["ac_num"]+'<br>';
                var long_payment = "long_payment";
                paymenthtml += ' IFSC Code :'+paymethod["long_payment"][i]["ifsc"]+'</div></td><td onclick="deletePayment(1,'+paymethod["long_payment"][i]["ID"]+')" style="cursor:pointer">Delete</td></tr>';
            }
           }
           if(paymethod && paymethod["short_payment"] != null){
            for(var i=0;i<paymethod["short_payment"].length;i++){
                var short_payment = "short_payment";
                paymentselectbox +='<option value="'+paymethod["short_payment"][i]["pay_method"]+'-'+paymethod["short_payment"][i]["ID"]+'">'+paymethod["short_payment"][i]['pay_method']+'-'+paymethod["short_payment"][i]['pay_id']+'</option>';
                paymenthtml += '<tr><td>'+paymethod['short_payment'][i]['pay_method']+'</td><td>'+paymethod['short_payment'][i]['pay_id']+'</td><td onclick="deletePayment(0,'+paymethod["short_payment"][i]["ID"]+')" style="cursor:pointer">Delete</td></tr>';
            }
           }
           orderhtml +='</table></div>';
           producthtml +='</table></div>';
           paymenthtml +='</table></div>';
           paymentselectbox +='</select>';
           coupanhtml +='</table></div>';
          // setTimeout(function(){
            //   console.log(orderhtml)
            $("#net_profit").append(totalprofit);
            $("#myListings").append(producthtml);
            $("#MyOrders").append(orderhtml);
            $("#pay_panel").append(paymenthtml);
            $("#cashout_select_panel").append(paymentselectbox);
            $("#totalprofit").val(totalprofit);
            $("#myCoupan").append(coupanhtml);
           //},2000)
        })
    }
    getMerchData();

    function postAccountDetails(dataobj){
        addWaitingOverlay(),
                doPost("/addAccount", dataobj, function (b) {
                    removeWaitingOverlay(),
                    200 == b.status ? c(a, !0) : 201 == b.status ? (console.log(b), c(a, !0)) : bootbox.alert("Error: " + b.msg)
                }, function (a) {
                    bootbox.alert("Success: Account added successfully")
                    removeWaitingOverlay()
                })
    }

    
});

$(function () {
    $("head").append($("#allFonts").html()),
    1 == isLoggedIn(!0) ? doPost("/getPurchaseHistory", {}, function (a) {
        if (200 == a.status) {
            var b = $(".my-purchases-ul"),
                e = function (a) {
                    var c = a.title;
                    var size = "S:"+a.small+" M:"+a.medium+" L:"+a.large+" XL:"+a.xl+" XXL:"+a.doublexl;
                    //var size = "Count ("+parseInt(a.small)+parseInt(a.medium)+parseInt(a.large)+parseInt(a.doublexl)+")";
                    var status = (a.status == "NOT_PRINTED")?"PROCESSING":(a.status == "PRINTING")?"PROCESSED":"SHIPPED";
                    (! c || c.trim().length <= 0) && (c = ".");
                    var d = "/getMyOtherProductImage?id=" + a.url + "&random=" + Math.random();
                    if(a.coupan_applied == 1 || a.coupan_applied == '1')
                    a.price = a.new_price;
                    if(status == "SHIPPED"){
                        if(a.return_status == null){
                            var f = '<span class="my-logo-company" onclick="requestreturn('+a.id+')" style="cursor:pointer;color:red"><b>Request Return</b></span>';
                        }else{
                            var f = '<span class="my-logo-company">Return Status :<b>'+a.return_status+'</b></span>';
                        }
                    }else{
                        if(status == "PROCESSING"){
                            if(a.cancel_status == null){
                                var f = '<span class="my-logo-company" onclick="requestcancel('+a.id+')" style="cursor:pointer;color:red"><b>Request Cancel</b></span>';
                            }else{
                                var f = '<span class="my-logo-company">Cancel Status :<b>'+a.cancel_status+'</b></span>';
                            }
                        }else{
                            var f = '';
                        }
                    }
                    var e = '<li class="col-md-12 purchaseHistoryItem myOtherItems' + a.id + '"><span class="my-logos-list "><div id="svgPurOtherObject' + a.id + '"><img src="'+d+'"></div><span class="my-logo-company">' + c + '</span><span class="my-logo-company"> Price :' + a.price +' '+ size+'</span><span class="my-logo-company"> Delivery Status :' + status + '</span>'+f+'</span></li>';
                    b.append(e)
                    //updateJQSvgImage("#svgPurOtherObject" + a.id, d)
                };
            if (a.items.length > 0) {
                for (var f = 0; f < a.items.length; f++) 
                    $(".hist-count").text(" (" + a.items.length + ")"),
                    e(a.items[f]);
                
            } else 
                $(".my-purchases-ul").text("No purchases made.")
                //All Ejs code goes here

                
                $(function () {
                    var name = getUser()['first_name'] || "Designer";
                    $('#name').html("Hi " + name + " !");
                    switchTab(event, 'myListings');
                    getCheckOutBalance();
                    
                
                    $('.fa-plus-circle').show();
                    $('.fa-minus-circle').hide();
                    $('.tooltip1').tooltip();
                    $("#content h3.expand").toggler();
                    $("#content div.demo").expandAll({trigger: "h3.expand", ref: "h3.expand"});
                    $("#content div.other").expandAll({
                        expTxt : "[Show]", 
                        cllpsTxt : "[Hide]",
                        ref : "ul.collapse",
                        showMethod : "show",
                        hideMethod : "hide"
                    });
                    $("#content div.post").expandAll({
                        expTxt : "[Read this entry]", 
                        cllpsTxt : "[Hide this entry]",
                        ref : "div.collapse", 
                        localLinks: "p.top a"    
                    });    
                    $('.expand a').on('click',function(){
                        if($(this).hasClass('open'))
                        {
                            $(this).parent().find('.fa-plus-circle').show();
                            $(this).parent().find('.fa-minus-circle').hide();
                        }
                        else
                        {
                            $(this).parent().find('.fa-plus-circle').hide();
                            $(this).parent().find('.fa-minus-circle').show(); 
                        }
                    });
                    $('.demo .switch a').on('click',function(){
                        if($('.expand a').hasClass('open'))
                        {
                            $('.expand a').parent().find('.fa-plus-circle').hide();
                            $('.expand a').parent().find('.fa-minus-circle').show();
                        }
                        else
                        {
                            $('.expand a').parent().find('.fa-plus-circle').show();
                            $('.expand a').parent().find('.fa-minus-circle').hide(); 
                        }
                    });
                });
                var cashoutBtn = document.getElementById("cashoutBtn");
                var cashoutbox = document.getElementById("cashoutbox");
                var reqMoneyBtn = document.getElementById("reqMoney");
                var modalpm = document.getElementById("info-model-pm");
                var btnpm = document.getElementById("paymBtn");
                var spanpm = document.getElementById("closepm");
                var spanpmb = document.getElementById("closepmb");
                var spanpmp = document.getElementById("closepmp");
                var spanpmu = document.getElementById("closepmu");
                var spanpmc = document.getElementById("closepmc");
                var paybank = document.getElementById("paybank");
                var paypp = document.getElementById("paypp");
                var payupi = document.getElementById("payupi");
                var returnprocess = document.getElementById("returnprocess");
                
                var addbankBtn = document.getElementById("addBA");
                var addPP = document.getElementById("addPP");
                var addUPI = document.getElementById("addUPI");
                addbankBtn.onclick = function(e){
                    e.preventDefault();
                    var b_name = $("#b_name").val().trim();
                    var ifsc = $("#ifsc").val().trim();
                    var acc_num = $("#acc_num").val().trim();
                    var confirm_acc_num =$("#confirm_acc_num").val().trim();
                
                    if(b_name == '' || ifsc == '' || acc_num == '' || confirm_acc_num == ''){
                        bootbox.alert("Please fill up all the details")
                    }else{
                        if(acc_num.length < 8){
                            bootbox.alert("Account Number should be of minimum 8 character.")
                        }else if(acc_num != confirm_acc_num){
                            bootbox.alert("Account Number and Confirm Account Number do not match.")
                        }else{
                            var obj = {
                                type:"BANKACCOUNT",
                                ac_num:acc_num,
                                bname:b_name,
                                ifsc:ifsc
                            }
                            postAccountDetails(obj)
                        }
                    }
                   
                }
                
                addPP.onclick = function(e){
                    e.preventDefault();
                    var pp_id = $("#pp_id").val().trim();
                    var confirm_pp_id =$("#confirm_pp_id").val().trim();
                    if(pp_id == ''  || confirm_pp_id == ''){
                        bootbox.alert("Please fill up all the details")
                    }else{
                       if(pp_id != confirm_pp_id){
                            bootbox.alert("Paypal id and Confirm Paypal id do not match.")
                        }else{
                            var obj = {
                                type:"PAYPAL",
                                pay_id:confirm_pp_id
                            }
                            postAccountDetails(obj)
                        }
                    }
                   
                }
                
                addUPI.onclick = function(e){
                    e.preventDefault();
                    var upi_id = $("#upi_id").val().trim();
                    var confirm_upi_id =$("#confirm_upi_id").val().trim();
                    if(upi_id == ''  || confirm_upi_id == ''){
                        bootbox.alert("Please fill up all the details")
                    }else{
                       if(upi_id != confirm_upi_id){
                            bootbox.alert("UPI id and Confirm UPI id do not match.")
                        }else{
                            var obj = {
                                type:"UPI",
                                pay_id:confirm_upi_id
                            }
                            postAccountDetails(obj)
                        }
                    }               
                }
                
                
                reqMoneyBtn.onclick = function(e){
                    e.preventDefault();
                    var paymentselect = $("#paymentselect").val();
                    var amount = $("#amount").val().trim();
                    var profit = $("#totalprofit").val();
                    var balance = parseInt(document.getElementById("net_balance").innerHTML);
                    if(amount > 0){
                        if(amount > balance){
                            bootbox.alert("Error: Request amount should be less then balance");
                        }else{
                            var dataobj = {};
                            dataobj["amount"] = amount;
                            dataobj["payment"] = paymentselect;
                            doPost("/requestMoney", dataobj, function (b) {
                                // removeWaitingOverlay(),
                                if(b.status == 200){
                                        getCheckOutBalance();
                                        bootbox.alert("Success:Cashout Request has been successfully placed. Our team will get back to you soon")
                                        //setTimeout(function(){
                                       //     location.reload(true);
                                        //},2000);
                                        
                                }else if(b.status == 201){
                                        bootbox.alert("Error: Request amount should be less then balance");
                                        getCheckOutBalance();
                                }else{
                                        bootbox.alert("Error: Error in  requesting money")
                                        getCheckOutBalance();
                                }
                                    cashoutbox.style.display ="none";
                                    paybank.style.display = "none";
                                    modalpm.style.display = "none";
                                    paypp.style.display = "none";
                                    payupi.style.display = "none";
                                }, function (a) {
                                        bootbox.alert("Error: Something went wrong.Please try again latter.")
                                // removeWaitingOverlay()
                            })
                        }
                    }else{
                        bootbox.alert("Error: Amount should be greater then 0");
                    }
                }
                btnpm.onclick = function() {
                    modalpm.style.display = "block";
                }
                cashoutBtn.onclick = function(){
                    var a = document.getElementById("paymentselect").innerHTML.trim();
                    if(a == ""){
                        modalpm.style.display = "block";
                    }else{
                        cashoutbox.style.display = "block";
                    }
                }
                // When the user clicks on <span> (x), close the modal
                spanpm.onclick = function() {
                    modalpm.style.display = "none";
                }
                spanpmb.onclick = function() {
                    paybank.style.display = "none";
                }
                spanpmp.onclick = function() {
                    paypp.style.display = "none";
                }
                spanpmu.onclick = function() {
                    payupi.style.display = "none";
                }
                spanpmc.onclick = function() {
                    cashoutbox.style.display = "none";
                }
                
                
                function postAccountDetails(dataobj){
                    //addWaitingOverlay(),
                    doPost("/addAccount", dataobj, function (b) {
                       // removeWaitingOverlay(),
                       if(b.status == 200){
                            if(b.alreadyadded == '1'){
                                bootbox.alert("Success: Account already exist")
                            }else{
                                bootbox.alert("Success: Account added successfully")
                                doGet("/getPaymentMethod",{}, function (b) {
                                    if(b.status == 200){
                                        var paymethod = b.paymethod;
                                        var paymenthtml = '<div><table class="table"><tr><th scope="col">Payment Method</th><th scope="col">Payment Details</th></tr>';
                                        var paymentselectbox = '<select class="form-select" id="paymentselect">';
                
                                        if(paymethod && paymethod["long_payment"] != null){
                                            for(var i=0;i<paymethod["long_payment"].length;i++){
                                                paymentselectbox +='<option value="'+paymethod["long_payment"][i]["pay_method"]+'-'+paymethod["long_payment"][i]["ID"]+'">'+paymethod["long_payment"][i]['bname']+'-'+paymethod["long_payment"][i]['ac_num']+'</option>';
                                                paymenthtml += '<tr><td>'+paymethod["long_payment"][i]["pay_method"]+'</td><td>';
                                                paymenthtml += '<div> Bank Name :'+paymethod["long_payment"][i]["bname"]+'<br>';
                                                paymenthtml += ' Account No :'+paymethod["long_payment"][i]["ac_num"]+'<br>';
                                                paymenthtml += ' IFSC Code :'+paymethod["long_payment"][i]["ifsc"]+'</div></td></tr>';
                                            }
                                        }
                                        if(paymethod && paymethod["short_payment"] != null){
                                            for(var i=0;i<paymethod["short_payment"].length;i++){
                                                paymentselectbox +='<option value="'+paymethod["short_payment"][i]["pay_method"]+'-'+paymethod["short_payment"][i]["ID"]+'">'+paymethod["short_payment"][i]['pay_method']+'-'+paymethod["short_payment"][i]['pay_id']+'</option>';
                                                paymenthtml += '<tr><td>'+paymethod['short_payment'][i]['pay_method']+'</td><td>'+paymethod['short_payment'][i]['pay_id']+'</td></tr>';
                                            }
                                        }
                                        paymenthtml +='</table></div>';
                                        paymentselectbox +='</select>';
                
                                        document.getElementById("pay_panel").innerHTML = "";
                                        document.getElementById("cashout_select_panel").innerHTML = "";
                
                                        $("#pay_panel").append(paymenthtml);
                                        $("#cashout_select_panel").append(paymentselectbox);
                                    }else{
                                        bootbox.alert("Error: Something  went wrong. Please try again latter")
                                    }
                                })
                            }
                       }else{
                            bootbox.alert("Error: Account added successfully")
                       }
                        paybank.style.display = "none";
                        modalpm.style.display = "none";
                        paypp.style.display = "none";
                        payupi.style.display = "none";
                
                    }, function (a) {
                            bootbox.alert("Error: Something went wrong.Please try again latter.")
                       // removeWaitingOverlay()
                    })
                }
                
                function getCheckOutBalance(){
                    doPost("/getCashout",{},function(b){
                        if(b.status == 200){
                            var cashout = b.cashout;
                            var cashoutpending = 0;
                            var paidtodate = 0;
                            for(var i=0;i<cashout.length;i++){
                                if(cashout[i]["status"] == 'PENDING'){
                                    cashoutpending += cashout[i]["amount_request"]
                                }else{
                                    paidtodate += cashout[i]["amount_request"]
                                }
                            }
                          //  $("#cashoutpending").val(cashoutpending)
                          //  $("#paidtodate").val(paidtodate);
                            setRevenueSystem(cashoutpending,paidtodate);
                        }
                    })
                }
                
                function setRevenueSystem(cashoutpending,paidtodate){
                    setTimeout(function(){
                       // var cashoutpending = $("#cashoutpending").val();
                        //var paidtodate = $("#paidtodate").val();
                        var totalprofit = $("#totalprofit").val();
                
                        var balance = parseInt(totalprofit) - parseInt(paidtodate) - parseInt(cashoutpending);
                        if(balance < 0)
                            balance = 0;
                       /* console.log("parseInt(totalprofit): ",parseInt(totalprofit))
                        console.log("parseInt(paidtodate): ",parseInt(paidtodate))
                        console.log("parseInt(cashoutpending): ",parseInt(cashoutpending))
                        document.getElementById("net_balance").innerHTML = "";
                       
                        document.getElementById("pending_cashout").innerHTML = "";
                        document.getElementById("paid_to_date").innerHTML = "";*/
                        document.getElementById("net_profit").innerHTML = "";
                        $("#net_balance").html(balance);
                        $("#net_profit").html(totalprofit);
                        $("#pending_cashout").html(cashoutpending);
                        $("#paid_to_date").html(paidtodate);
                    },1000)                
                }
                
                
                
                
                
                
                

                //End






            
        } else 
            $(".my-purchases-ul").text("No purchases made."),
            bootbox.alert("Error: " + a.msg)
        
    }, function (a) {
        $(".my-purchases-ul").text("No purchases made."),
        bootbox.alert("Server Error: Communication Failed.")
    }) : $(".my-purchases-ul").text("No purchases made.")

   
    
    
});
$(document).ready(function(){
    var users = getUser();
    console.log("User",users);
    setTimeout(function(){
        if(users.usertype == "DESIGNER" && (users.first_name == "" || users.first_name == null || users.first_name == null || users.first_name == "")){
            window.alert("Please update your first name and last name");
            window.location.href= "/editProfile";
        }
    },2000);
})

//All Ejs code goes here

