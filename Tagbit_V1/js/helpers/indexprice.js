function priceidx() {
    var tshirt_detail = 0;
    var mug_detail = 0;
    var bc_detail = 0;
    doGet("/getOtherProductSettingsValues", {
        setting_id: 3,
        country_id: $(".top-countries-list").val()
    }, function (a) {
        200 == a.status ? (tshirt_detail=a.values) : (showToast("Error: " + a.msg), console.log(a))
        price = String(tshirt_detail[0].price);
        currency = String(tshirt_detail[0].currency);
        $("#tshirt-price").html("From "+price+" "+currency);
    })

    doGet("/getOtherProductSettingsValues", {
        setting_id: 1,
        country_id: $(".top-countries-list").val()
    }, function (a) {
        200 == a.status ? (mug_detail=a.values) : (showToast("Error: " + a.msg), console.log(a))
        price = String(mug_detail[0].price);
        currency = String(mug_detail[0].currency);
        $("#mug-price").html("From "+price+" "+currency);
    })

    doPost("/getPricingDetails", {
        type: "BC",
        country: $(".top-countries-list").val()
    },function (a) {
        200 == a.status ? (bc_detail=a) : (showToast("Error: " + a.msg), console.log(a))
        price = String(bc_detail.pricing[0].premium);
        currency = String(bc_detail.currency);
        qty = String(bc_detail.pricing[0].qty);
        $("#bc-price").html("From "+price+" "+currency+" ("+qty+" pcs) ");
    })

}
$(function () {
    $(".top-countries-list").change(console.log('Changed'));
    $('body').on('DOMSubtreeModified', '.bfh-selectbox-option', function(){
        priceidx();
      });
});