var countryList = [];

var addingCountry = true;
var editingCountryId = null;

var addingLogoPricing = true;
var editingLogoPricingId = null;

var addingCardPricing = true;
var editingCardPricingId = null;


$(function () {

    var savedOtherProductPricingId;

    function init() {
        $("#tabs").tabs();
        listCountries();
        listLogoPricing();
        listCardPricing();
        listOtherProducts();
        listOtherProductsPricing();

        $("[data-target=#otherProductPricingModel]").click(function () {
            savedOtherProductPricingId = undefined;
        });

        $("#saveCountry").click(function () {
            var countryName = $("#countryName").val();
            var currency = $("#countryCurrency :selected").text();
            var countryCode = $("#countryCode").val();

            if (addingCountry == true) {
                doPost("/addCountry", {name: countryName, currency: currency, code: countryCode}, function (resp) {
                    if (resp.status == 200) {
                        showToast("Successfully added country details.");
                        addCountryRow(resp.insertId, countryName, currency, countryCode);
                    } else {
                        bootbox.alert("Error adding country");
                        console.log(resp);
                    }
                });
            } else {
                doPost("/updateCountry", {
                    name: countryName,
                    currency: currency,
                    code: countryCode,
                    id: editingCountryId
                }, function (resp) {
                    if (resp.status == 200) {
                        showToast("Successfully saved country detailes.");
                        var row = $("#country_" + editingCountryId);
                        $(".country_name", row).text(countryName);
                        $(".country_currency", row).text(currency);
                        $(".country_code", row).text(code);
                        $(".country_" + editingCountryId).text(countryName);
                        countryList["C" + editingCountryId] = {code: code, country: countryName, currency: currency};
                    } else {
                        bootbox.alert("Error adding country");
                        console.log(resp);
                    }
                });
                addingCountry = true;
            }
            $('#countryModel').modal('hide');
        });

        $("#saveLogoPricing").click(function () {
            var country = $("#logoPricingCountry :selected").val();
            var price = $("#logoPricingPrice").val();
            var color_changes = $("#logoPricingColorChanges").val();

            if (addingLogoPricing == true) {
                doPost("/addLogoPrice", {
                    country: country,
                    price: price,
                    color_changes: color_changes
                }, function (resp) {
                    if (resp.status == 200) {
                        showToast("Successfully added logo pricing details.");
                        addLogoPricingRow(resp.insertId, country, price, color_changes);
                    } else {
                        bootbox.alert("Error adding logo pricing");
                        console.log(resp);
                    }
                });
            } else {
                doPost("/updateLogoPrice", {
                    country: country,
                    price: price,
                    color_changes: color_changes,
                    id: editingLogoPricingId
                }, function (resp) {
                    if (resp.status == 200) {
                        showToast("Successfully saved logo pricing detailes.");
                        var row = $("#logoPricing_" + editingLogoPricingId);
                        var countryObj = countryList["C" + country];
                        $(".logoPricingName", row).text(countryObj.country);
                        $(".logoPricingPrice", row).text(price);
                        $(".logoPricingColorChangeCurrency", row).text(countryObj.currency);
                        $(".logoPricingColorChange", row).text(color_changes);
                    } else {
                        bootbox.alert("Error updating logo pricing");
                        console.log(resp);
                    }
                });
                addingLogoPricing = true;
            }
            $('#logoPricingModel').modal('hide');
        });

        $("#saveCardPricing").click(function () {
            var country = $("#cardPricingCountry :selected").val();
            var finish = $("#cardPricingFinish :selected").val();
            var quantity = $("#cardPricingQuantity :selected").val();
            var executive = $("#cardPricingExecutive").val();
            var superior = $("#cardPricingSuperior").val();
            var back_side = $("#cardPricingBackSide").val();
            var back_side_superior = $("#cardPricingBackSideSuperior").val();
            var std_shipping = $("#cardPricingStandardShipping").val();
            var exp_shipping = $("#cardPricingExpShipping").val();
            var card_design = $("#cardPricingDesign").val();
            var sameForAll = $("#cardPricingSameForAllCountries").is(":checked");

            if (addingCardPricing == true) {
                doPost("/addCardPrice", {
                    country: country,
                    finish: finish,
                    qty: quantity,
                    premium: executive,
                    back_side: back_side,
                    super_premium: superior,
                    back_side_super_premium: back_side_superior,
                    std_shipping: std_shipping,
                    exp_shipping: exp_shipping,
                    card_design: card_design,
                    same_for_all: sameForAll
                }, function (resp) {
                    if (resp.status == 200) {
                        showToast("Successfully added card pricing details.");
                        addCardPricingRow(resp.insertId, country, finish, quantity, executive, superior, back_side, back_side_superior, std_shipping, exp_shipping, card_design);
                        if (sameForAll) {
                            $(".cardPricingDesign" + country).text(card_design);
                        }
                    } else {
                        bootbox.alert("Error adding card pricing");
                        console.log(resp);
                    }
                });
            } else {
                doPost("/updateCardPrice", {
                    country: country,
                    finish: finish,
                    qty: quantity,
                    premium: executive,
                    back_side: back_side,
                    super_premium: superior,
                    back_side_super_premium: back_side_superior,
                    std_shipping: std_shipping,
                    exp_shipping: exp_shipping,
                    same_for_all: sameForAll,
                    card_design: card_design,
                    id: editingCardPricingId
                }, function (resp) {
                    if (resp.status == 200) {
                        showToast("Successfully saved card pricing detailes.");
                        var row = $(".cardPricing_" + editingCardPricingId);
                        var countryObj = countryList["C" + country];
                        $(".cardPricingName", row).text(countryObj.country);
                        $(".cardPricingFinish", row).text(finish);
                        $(".cardPricingQty", row).text(quantity);
                        $(".cardPricingPremium", row).text(executive);
                        $(".cardPricingColorChangeCurrency", row).text(countryObj.currency);
                        $(".cardPricingSuperPremium", row).text(superior);
                        $(".cardPricingBackSide", row).text(back_side);
                        $(".cardPricingBackSideSuperPremium", row).text(back_side_superior);
                        $(".cardPricingStdShipping", row).text(std_shipping);
                        $(".cardPricingExpShipping", row).text(exp_shipping);
                        if (sameForAll) {
                            $(".cardPricingDesign" + country).text(card_design);
                        }
                    } else {
                        bootbox.alert("Error updating card pricing");
                        console.log(resp);
                    }
                });
                addingCardPricing = true;
            }
            $('#cardPricingModel').modal('hide');
        });

        $("#countryModel").on("hide.bs.modal", function (e) {
            addingCountry = true;
            $("#countryName").val("");
            $("#countryCurrency").val("INR");
            $("#countryCode").val("")
        });

        $("#logoPricingModel").on("hide.bs.modal", function (e) {
            addingLogoPricing = true;
            $("#logoPricingCountry").val(1);
            $("#logoPricingPrice").val("");
            $("#logoPricingColorChanges").val("")
        });

        $("#cardPricingModel").on("hide.bs.modal", function (e) {
            addingCardPricing = true;
            $("#cardPricingCountry").val(1);
            $("#cardPricingFinish").val("GLOSS");
            $("#cardPricingQuantity").val(100);
            $("#cardPricingExecutive").val("");
            $("#cardPricingSuperior").val("");
            $("#cardPricingBackSide").val("");
            $("#cardPricingBackSideSuperior").val("");
            $("#cardPricingStandardShipping").val("");
            $("#cardPricingExpShipping").val("");
        });

        $("#otherProductsPricingProduct").change(function (e) {
            loadProductSettings($("#otherProductsPricingProduct").val());
        });

        $("#otherProductsPricingSetting").change(function (e) {
            loadProductSettingValues($("#otherProductsPricingSetting").val());
        });

        $("#addOtherProdPricingSaveBtn").click(function () {
            var url = "/addOtherProductsPricing";
            if (savedOtherProductPricingId) {
                url = "/updateOtherProductsPricing";
            }
            var setting = $("#otherProductsPricingSetting").val();
            var country = $("#otherProductsPricingCountry").val();
            var price = $("#otherProductsPricingPrice").val();

            if (!setting || !country || !price || !/^\d+\.?\d*$/.test(price)) {
                bootbox.alert("Please fill all the fields before submiting. (Price must be a number!!)");
            } else {
                doPost(url, {
                    setting_id: $("#otherProductsPricingSettingValue").val(),
                    country_id: country,
                    price: price,
                    same_value_checked: $("#sameValueForProductValueCheckBox").is(":checked"),
                    id: savedOtherProductPricingId
                }, function (resp) {
                    if (resp.status == 200) {
                        showToast("Successfully added country details.", "success");
                        if (savedOtherProductPricingId != undefined) {
                            var obj = $("#otherProductPricing" + savedOtherProductPricingId);
                            obj.find("td:nth-child(1)").text($("#otherProductsPricingProduct :selected").text());
                            obj.find("td:nth-child(2)").text($("#otherProductsPricingSetting :selected").text());
                            obj.find("td:nth-child(3)").text($("#otherProductsPricingSettingValue :selected").text());
                            obj.find("td:nth-child(4)").text($("#otherProductsPricingCountry :selected").text());
                            obj.find("td:nth-child(5)").text($("#otherProductsPricingPrice").val());
                            var editLink = obj.find("td:nth-child(5) a:first");
                            editLink.attr("data-product-setting-id", setting);
                            editLink.attr("data-product", $("#otherProductsPricingProduct").val());
                            editLink.attr("data-country", country);
                            editLink.attr("data-price", price);
                            $("#otherProductPricingModel").modal('hide');
                        } else { 
                            addOtherProductsPricingRow($("#tblPricingOtherProducts tbody"), resp.insertId == undefined ? savedOtherProductPricingId : resp.insertId, $("#otherProductsPricingCountry :selected").text(), $("#otherProductsPricingCountry").val(), $("#otherProductsPricingProduct :selected").text(), $("#otherProductsPricingProduct").val(), $("#otherProductsPricingPrice").val(), $("#otherProductsPricingSetting :selected").text(), setting,  $("#otherProductsPricingSettingValue").val(), $("#otherProductsPricingSettingValue :selected").text());
                        }
                        $("#otherProductsPricingPrice").val("");
                        savedOtherProductPricingId = undefined;
                        if ($("#sameValueForProductValueCheckBox").is(":checked")){
                            listOtherProductsPricing();
                        }
                        $("#sameValueForProductValueCheckBox").prop("checked", false);
                    } else {
                        bootbox.alert("Error: " + resp.msg);
                        console.log(resp);
                    }
                });
            }
        });

        document.getElementById('uploadPricingInfo').addEventListener('change', function (evt) {
            var files = evt.target.files;
            var output = [];
            for (var i = 0; i < files.length; i++) {
                var f = files[i];
                if (f) {
                    var r = new FileReader();
                    r.onload = function (e) {
                        var csv = e.target.result;
                        var data = Papa.parse(csv, {
                            complete: function (results) {
                                doPost("/listLogoPricing", {}, function (resp) {
                                    if (resp.status == 200 || resp.status == 201) {
                                        var logoPricingSvr = resp.items || [];
                                        doPost("/listCardPricing", {}, function (resp) {
                                            if (resp.status == 200 || resp.status == 201) {
                                                var cardPricingSvr = resp.items || [];
                                                doPost("/getCountryList", {}, function (resp) {
                                                    if (resp.status == 200) {
                                                        var card_pricing = [];
                                                        var logo_pricing = [];
                                                        var ul = "<table class='table table-bordered table-responsive'>";
                                                        ul += '<tr><th rowspan="2">Country</th><th rowspan="2">Currency</th><th rowspan="2">Card Finish</th><th rowspan="2">Logo</th><th colspan="11">Premium</th><th colspan="11">Ultra Premium</th><th rowspan="2">Express Shipment</th><th rowspan="2">Color Changes</th></tr><tr><th>100</th><th>250</th><th>500</th><th>1000</th><th>2500</th><th>5000</th><th>7500</th><th>10000</th><th>15000</th><th>20000</th><th>25000</th><th>100</th><th>250</th><th>500</th><th>1000</th><th>2500</th><th>5000</th><th>7500</th><th>10000</th><th>15000</th><th>20000</th><th>25000</th></tr>';
                                                        /* j starts from since it will be the heading column */
                                                        for (var j = 1; j < results.data.length; j++) {
                                                            var row = results.data[j]; 
                                                            if (row.length == 1) {
                                                                continue;
                                                            } else if (row.length == 27) {
                                                                ul += "<tr>";
                                                                var cntObj = findCountryCode(resp.countries, row[0]);
                                                                if (cntObj == undefined) {
                                                                    results.errors.push((j + 1) + "th column's country (ie. " + row[0] + ") is not found in database. Please add it before adding price list.");
                                                                } else {
                                                                    var record = findRecordByCountry(logoPricingSvr, cardPricingSvr, cntObj.id);
                                                                    if (record != "" && record != undefined) {
                                                                        results.errors.push(record);
                                                                    }
                                                                    var country = row[0] + "(" + cntObj.id + ")";
                                                                    var currency = cntObj.currency;
                                                                    var cardType = row[1];
                                                                    var logo = row[2];
                                                                    var card_exe_100 = row[3];
                                                                    var card_exe_250 = row[4];
                                                                    var card_exe_500 = row[5];
                                                                    var card_exe_1000 = row[6];
                                                                    var card_exe_2500 = row[7];
                                                                    var card_exe_5000 = row[8];
                                                                    var card_exe_7500 = row[9];
                                                                    var card_exe_10000 = row[10];
                                                                    var card_exe_15000 = row[11];
                                                                    var card_exe_20000 = row[12];
                                                                    var card_exe_25000 = row[13];
                                                                    var card_sup_100 = row[14];
                                                                    var card_sup_250 = row[15];
                                                                    var card_sup_500 = row[16];
                                                                    var card_sup_1000 = row[17];
                                                                    var card_sup_2500 = row[18];
                                                                    var card_sup_5000 = row[19];
                                                                    var card_sup_7500 = row[20];
                                                                    var card_sup_10000 = row[21];
                                                                    var card_sup_15000 = row[22];
                                                                    var card_sup_20000 = row[23];
                                                                    var card_sup_25000 = row[24];
                                                                    var exp_shipping = row[25];
                                                                    var color_changes = row[26];
                                                                    if (logo.trim().length > 0 && cardType == "MATT") {
                                                                        logo_pricing.push({
                                                                            country: cntObj.id,
                                                                            price: logo,
                                                                            color_changes: color_changes
                                                                        });
                                                                    }
                                                                    if (card_exe_100.trim().length > 0) {
                                                                        card_pricing.push({
                                                                            country: cntObj.id,
                                                                            price: logo,
                                                                            finish: cardType,
                                                                            qty: 100,
                                                                            premium: card_exe_100,
                                                                            back_side: 0,
                                                                            super_premium: card_sup_100,
                                                                            back_side_super_premium: 0,
                                                                            std_shipping: 0,
                                                                            exp_shipping: exp_shipping
                                                                        });
                                                                    }
                                                                    if (card_exe_250.trim().length > 0) {
                                                                        card_pricing.push({
                                                                            country: cntObj.id,
                                                                            price: logo,
                                                                            finish: cardType,
                                                                            qty: 250,
                                                                            premium: card_exe_250,
                                                                            back_side: 0,
                                                                            super_premium: card_sup_250,
                                                                            back_side_super_premium: 0,
                                                                            std_shipping: 0,
                                                                            exp_shipping: exp_shipping
                                                                        });
                                                                    }
                                                                    if (card_exe_500.trim().length > 0) {
                                                                        card_pricing.push({
                                                                            country: cntObj.id,
                                                                            price: logo,
                                                                            finish: cardType,
                                                                            qty: 500,
                                                                            premium: card_exe_500,
                                                                            back_side: 0,
                                                                            super_premium: card_sup_500,
                                                                            back_side_super_premium: 0,
                                                                            std_shipping: 0,
                                                                            exp_shipping: exp_shipping
                                                                        });
                                                                    }
                                                                    if (card_exe_1000.trim().length > 0) {
                                                                        card_pricing.push({
                                                                            country: cntObj.id,
                                                                            price: logo,
                                                                            finish: cardType,
                                                                            qty: 1000,
                                                                            premium: card_exe_1000,
                                                                            back_side: 0,
                                                                            super_premium: card_sup_1000,
                                                                            back_side_super_premium: 0,
                                                                            std_shipping: 0,
                                                                            exp_shipping: exp_shipping
                                                                        });
                                                                    }
                                                                    if (card_exe_2500.trim().length > 0) {
                                                                        card_pricing.push({
                                                                            country: cntObj.id,
                                                                            price: logo,
                                                                            finish: cardType,
                                                                            qty: 2500,
                                                                            premium: card_exe_2500,
                                                                            back_side: 0,
                                                                            super_premium: card_sup_2500,
                                                                            back_side_super_premium: 0,
                                                                            std_shipping: 0,
                                                                            exp_shipping: exp_shipping
                                                                        });
                                                                    }
                                                                    if (card_exe_5000.trim().length > 0) {
                                                                        card_pricing.push({
                                                                            country: cntObj.id,
                                                                            price: logo,
                                                                            finish: cardType,
                                                                            qty: 5000,
                                                                            premium: card_exe_5000,
                                                                            back_side: 0,
                                                                            super_premium: card_sup_5000,
                                                                            back_side_super_premium: 0,
                                                                            std_shipping: 0,
                                                                            exp_shipping: exp_shipping
                                                                        });
                                                                    }
                                                                    if (card_exe_7500.trim().length > 0) {
                                                                        card_pricing.push({
                                                                            country: cntObj.id,
                                                                            price: logo,
                                                                            finish: cardType,
                                                                            qty: 7500,
                                                                            premium: card_exe_7500,
                                                                            back_side: 0,
                                                                            super_premium: card_sup_7500,
                                                                            back_side_super_premium: 0,
                                                                            std_shipping: 0,
                                                                            exp_shipping: exp_shipping
                                                                        });
                                                                    }
                                                                    if (card_exe_10000.trim().length > 0) {
                                                                        card_pricing.push({
                                                                            country: cntObj.id,
                                                                            price: logo,
                                                                            finish: cardType,
                                                                            qty: 10000,
                                                                            premium: card_exe_10000,
                                                                            back_side: 0,
                                                                            super_premium: card_sup_10000,
                                                                            back_side_super_premium: 0,
                                                                            std_shipping: 0,
                                                                            exp_shipping: exp_shipping
                                                                        });
                                                                    }
                                                                    if (card_exe_15000.trim().length > 0) {
                                                                        card_pricing.push({
                                                                            country: cntObj.id,
                                                                            price: logo,
                                                                            finish: cardType,
                                                                            qty: 15000,
                                                                            premium: card_exe_15000,
                                                                            back_side: 0,
                                                                            super_premium: card_sup_15000,
                                                                            back_side_super_premium: 0,
                                                                            std_shipping: 0,
                                                                            exp_shipping: exp_shipping
                                                                        });
                                                                    }
                                                                    if (card_exe_20000.trim().length > 0) {
                                                                        card_pricing.push({
                                                                            country: cntObj.id,
                                                                            price: logo,
                                                                            finish: cardType,
                                                                            qty: 20000,
                                                                            premium: card_exe_20000,
                                                                            back_side: 0,
                                                                            super_premium: card_sup_20000,
                                                                            back_side_super_premium: 0,
                                                                            std_shipping: 0,
                                                                            exp_shipping: exp_shipping
                                                                        });
                                                                    }
                                                                    if (card_exe_25000.trim().length > 0) {
                                                                        card_pricing.push({
                                                                            country: cntObj.id,
                                                                            price: logo,
                                                                            finish: cardType,
                                                                            qty: 25000,
                                                                            premium: card_exe_25000,
                                                                            back_side: 0,
                                                                            super_premium: card_sup_25000,
                                                                            back_side_super_premium: 0,
                                                                            std_shipping: 0,
                                                                            exp_shipping: exp_shipping
                                                                        });
                                                                    }
                                                                    ul += '<td>' + country + '</td>';
                                                                    ul += '<td>' + currency + '</td>';
                                                                    ul += '<td>' + cardType + '</td>';
                                                                    ul += '<td>' + logo + '</td>';
                                                                    ul += '<td>' + card_exe_100 + '</td>';
                                                                    ul += '<td>' + card_exe_250 + '</td>';
                                                                    ul += '<td>' + card_exe_500 + '</td>';
                                                                    ul += '<td>' + card_exe_1000 + '</td>';
                                                                    ul += '<td>' + card_exe_2500 + '</td>';
                                                                    ul += '<td>' + card_exe_5000 + '</td>';
                                                                    ul += '<td>' + card_exe_7500 + '</td>';
                                                                    ul += '<td>' + card_exe_10000 + '</td>';
                                                                    ul += '<td>' + card_exe_15000 + '</td>';
                                                                    ul += '<td>' + card_exe_20000 + '</td>';
                                                                    ul += '<td>' + card_exe_25000 + '</td>';
                                                                    ul += '<td>' + card_sup_100 + '</td>';
                                                                    ul += '<td>' + card_sup_250 + '</td>';
                                                                    ul += '<td>' + card_sup_500 + '</td>';
                                                                    ul += '<td>' + card_sup_1000 + '</td>';
                                                                    ul += '<td>' + card_sup_2500 + '</td>';
                                                                    ul += '<td>' + card_sup_5000 + '</td>';
                                                                    ul += '<td>' + card_sup_7500 + '</td>';
                                                                    ul += '<td>' + card_sup_10000 + '</td>';
                                                                    ul += '<td>' + card_sup_15000 + '</td>';
                                                                    ul += '<td>' + card_sup_20000 + '</td>';
                                                                    ul += '<td>' + card_sup_25000 + '</td>';
                                                                    ul += '<td>' + exp_shipping + '</td>';
                                                                    ul += '<td>' + color_changes + '</td>';
                                                                    //obj.push({shipper_name: shipper, tracking_id: trackingId, id: id});
                                                                    ul += "</tr>";
                                                                }
                                                            } else {
                                                                results.errors.push((j + 1) + "th column is not properly filled. Only " + row.length + " columns are filled.");
                                                            }
                                                        }
                                                        ul += "</table>";
                                                        bootbox.confirm("<b>Are you sure to save the details? </b><br/><div style='max-height: 300px; overflow: auto'>" + "<br/><b>Errors: </b><br/><br/>" + results.errors.join("<br/>") + "<br/><b>File Contents: </b><br/><br/>" + ul + "</div>", function (res) {
                                                            if (res) {
                                                                doPost("/updatePricing", {
                                                                    card: card_pricing,
                                                                    logo: logo_pricing
                                                                }, function (resp) {
                                                                    if (resp.status == 200) {
                                                                        bootbox.alert("Price updated successfully.");
                                                                        listLogoPricing();
                                                                        listCardPricing();
                                                                    } else {
                                                                        console.log(resp);
                                                                        bootbox.alert("Error updating price.");
                                                                    }
                                                                }, function (err) {
                                                                    console.log(err);
                                                                    bootbox.alert("Error updating price.");
                                                                });
                                                            }
                                                        });
                                                    } else if (resp.status == 201) {
                                                        bootbox.alert("Please add countries before adding the pricing.");
                                                    } else {
                                                        bootbox.alert("Error getting country list.");
                                                        console.log(resp);
                                                    }
                                                });
                                            } else {
                                                console.log(resp);
                                                bootbox.alert("Error listing card pricing.");
                                            }
                                        });
                                    } else {
                                        console.log(resp);
                                        bootbox.alert("Error listing logo pricing.");
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
        }, false);
    }

    function addOtherProductsPricingRow(tbl, id, countryName, countryId, productName, productId, price, settingName, settingId, _settingId, settingValueLabel) {
        $(".noOtherProductPricingLabel").remove(); 
        tbl.prepend("<tr id='otherProductPricing" + id + "'>" +
                "<td>" + productName + "</td>" +
                "<td>" + settingName + "</td>" +
                "<td>" + settingValueLabel + "</td>" +
                "<td>" + countryName + "</td>" +
                "<td>" + price + "</td>" +
                '<td><a data-id="' + id + '" data-product-setting-id="' + _settingId + '" data-product-setting-value-id="' + settingId + '" data-product="' + productId + '" data-country="' + countryId + '" data-price="' + price + '" href="#" class="editOtherProductPricingLink">Edit</a> | <a data-id="' + id + '" href="#" class="deleteOtherProductPricingLink">Delete</a></td>' +
                "</tr>");
        $(".editOtherProductPricingLink").off().click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            savedOtherProductPricingId = $(this).attr("data-id"); 
            var productSettingId = $(this).attr("data-product-setting-id");
            var productSettingValueId = $(this).attr("data-product-setting-value-id");
            
            $("#otherProductsPricingProduct").val($(this).attr("data-product"));
            $("#otherProductsPricingCountry").val($(this).attr("data-country"));
            $("#otherProductsPricingPrice").val($(this).attr("data-price"));
            $("#otherProductPricingModel").modal("show");
            loadProductSettings($(this).attr("data-product"), function () {
                $("#otherProductsPricingSetting").val(productSettingId);  
                loadProductSettingValues($("#otherProductsPricingSetting").val(), function (){
                    $("#otherProductsPricingSettingValue").val(productSettingValueId);
                });
            });
        });
        $(".deleteOtherProductPricingLink").off().click(function (e) {
            deleteOtherProductPricing($(this).attr("data-id"));
            e.preventDefault();
        });
    }

    function addCountryRow(id, name, currency, code) {
        var tr = $('<tr id="country_' + id + '"></tr>');
        tr.append('<td class="country_name">' + name + '</td>');
        tr.append('<td class="country_currency">' + currency + '</td>');
        tr.append('<td class="country_code">' + code + '</td>');
        tr.append('<td><a href="#" onclick="editCountry(' + id + ')">Edit</a> | <a href="#" onclick="deleteCountry(' + id + ')">Delete</a></td>');
        $("#tblPricingCountries").append(tr);
        countryList["C" + id] = {code: code, country: name, currency: currency};
        $("#logoPricingCountry").append('<option class="country_' + id + '" value="' + id + '">' + name + '</option>');
        $("#cardPricingCountry").append('<option class="country_' + id + '" value="' + id + '">' + name + '</option>');
        $("#otherProductsPricingCountry").append('<option class="country_' + id + '" value="' + id + '">' + name + '</option>');
    }

    function addCardPricingRow(id, country_id, finish, qty, premium, super_premium, back_side, back_side_super_premium, std_shipping, exp_shipping, design_cost) {
        var country = countryList["C" + country_id];
        var tr = $('<tr class="cardPricing_' + id + '"></tr>');
        tr.append('<td class="cardPricingName" data-country="' + country_id + '">' + country.country + '</td>');
        tr.append('<td class="cardPricingFinish">' + finish + '</td>');
        tr.append('<td class="cardPricingQty">' + qty + '</td>');
        tr.append('<td><span class="cardPricingPremium">' + premium + '</span> <span class="cardPricingColorChangeCurrency">' + country.currency + '</span></td>');
        tr.append('<td><span class="cardPricingSuperPremium">' + super_premium + '</span> <span class="cardPricingColorChangeCurrency">' + country.currency + '</span></td>');
        tr.append('<td><span class="cardPricingBackSide">' + back_side + '</span> <span class="cardPricingColorChangeCurrency">' + country.currency + '</span></td>');
        tr.append('<td><span class="cardPricingBackSideSuperPremium">' + back_side_super_premium + '</span> <span class="cardPricingColorChangeCurrency">' + country.currency + '</span></td>');
        tr.append('<td><span class="cardPricingStdShipping">' + std_shipping + '</span> <span class="cardPricingColorChangeCurrency">' + country.currency + '</span></td>');
        tr.append('<td><span class="cardPricingExpShipping">' + exp_shipping + '</span> <span class="cardPricingColorChangeCurrency">' + country.currency + '</span></td>');
        tr.append('<td><span class="cardPricingDesign cardPricingDesign' + country_id + '">' + design_cost + '</span> <span class="cardPricingColorChangeCurrency">' + country.currency + '</span></td>');
        tr.append('<td><a href="#" onclick="editCardPricing(' + id + ')">Edit</a> | <a href="#" onclick="deleteCardPricing(' + id + ')">Delete</a></td>');
        $("#tblPricingCards").append(tr);
    }

    function addLogoPricingRow(id, country, price, color_changes) {
        if (countryList["C" + country] == undefined) {
            console.log(country + " is not found in ", countryList);
        } else {
            var currency = countryList["C" + country].currency;
            var tr = $('<tr id="logoPricing_' + id + '"></tr>');
            tr.append('<td class="logoPricingName" data-country="' + country + '">' + countryList["C" + country].country + '</td>');
            tr.append('<td><span class="logoPricingPrice">' + price + '</span> <span class="logoPricingColorChangeCurrency">' + currency + '</span></td>');
            tr.append('<td><span class="logoPricingColorChange">' + color_changes + '</span> <span class="logoPricingColorChangeCurrency">' + currency + '</span></td>');
            tr.append('<td><a href="#" onclick="editLogoPricing(' + id + ')">Edit</a> | <a href="#" onclick="deleteLogoPricing(' + id + ')">Delete</a></td>');
            $("#tblPricingLogos").append(tr);
        }
    }

    function listCountries() {
        doPost("/listCountries", {}, function (resp) {
            if (resp.status == 200) {
                for (var i = 0; i < resp.items.length; i++) {
                    var item = resp.items[i];
                    addCountryRow(item.id, item.country, item.currency, item.code);
                }
            } else if (resp.status == 201) {
                $("#tblPricingCountries").append("<tr><td colspan='4'>No countries found</td></tr>");
            } else {
                console.log(resp);
                bootbox.alert("Error listing countries list.");
            }
        });
    }

    function listLogoPricing() {
        doPost("/listLogoPricing", {}, function (resp) {
            $("#tblPricingLogos tbody").children().remove();
            if (resp.status == 200) {
                for (var i = 0; i < resp.items.length; i++) {
                    var item = resp.items[i];
                    addLogoPricingRow(item.id, item.country, item.price, item.color_changes);
                }
            } else if (resp.status == 201) {
                $("#tblPricingLogos").append("<tr><td colspan='4'>No Logo Pricing found</td></tr>");
            } else {
                console.log(resp);
                bootbox.alert("Error listing logo pricing.");
            }
        });
    }

    function listCardPricing() {
        doPost("/listCardPricing", {}, function (resp) {
            $("#tblPricingCards tbody").children().remove();
            if (resp.status == 200) {
                for (var i = 0; i < resp.items.length; i++) {
                    var item = resp.items[i];
                    addCardPricingRow(item.id, item.country, item.finish, item.qty, item.premium, item.super_premium, item.back_side, item.back_side_super_premium, item.std_shipping, item.exp_shipping, item.card_design);
                }
            } else if (resp.status == 201) {
                $("#tblPricingCards").append("<tr><td colspan='10'>No card pricing found</td></tr>");
            } else {
                console.log(resp);
                bootbox.alert("Error listing card pricing.");
            }
        });
    }

    function listOtherProductsPricing() {
        doPost("/listOtherProductsPricing", {}, function (resp) {
            var tbl = $("#tblPricingOtherProducts tbody");
            if (resp.status == 200) {
                if (resp.items.length) {
                    tbl.children().remove();
                    for (var i = 0; i < resp.items.length; i++) {
                        var item = resp.items[i]; 
                        addOtherProductsPricingRow(tbl, item.id, item.country, item.country_id, item.name, item.product_id, item.price, item.setting_name, item.setting_id, item._setting_id, item.setting_value_label);
                    }
                }
            } else {
                console.log(resp);
                bootbox.alert("Error listing card pricing.");
            }
        });
    }

    function deleteOtherProductPricing(id) {
        bootbox.confirm("Are you sure to delete this pricing?", function (result) {
            if (result) {
                doPost("/removeOtherProductsPricing", {id: id}, function (resp) {
                    if (resp.status == 200) {
                        showToast("Successfully deleted pricing.", "success");
                        $("#otherProductPricing" + id).remove();
                        if ($("#tblPricingOtherProducts tbody").children().length == 0) {
                            $("#tblPricingOtherProducts tbody").append('<tr class="noOtherProductPricingLabel">' +
                                    '    <td colspan="4">No pricing added yet!!</td>' +
                                    "</tr>");
                        }
                    } else {
                        bootbox.alert("Error deleting country");
                        console.log(resp);
                    }
                });
            }
        });
    }

    function listOtherProducts() {
        doPost("/listOtherProducts", {}, function (resp) {
            if (resp.status == 200) {
                $("#otherProductsPricingProduct").append("<option value='null'>Choose a product</option>");
                for (var i = 0; i < resp.items.length; i++) {
                    $("#otherProductsPricingProduct").append("<option value='" + resp.items[i].id + "'>" + resp.items[i].name + "</option>");
                }
            } else {
                console.log(resp);
                showToast("Error: " + resp.msg);
            }
        }, function (err) {
            console.log(err);
            showToast("Error in connection.")
        });
    }

    function findCountryCode(countries, name) {
        var found = undefined;
        name = name.trim();
        for (var i = 0; i < countries.length; i++) {
            var country = countries[i];
            if (country.country == name) {
                found = country;
                break;
            }
        }
        return found;
    }
    
    function loadProductSettingValues(settingId, callback) {
        $("#otherProductsPricingSettingValue").children().remove();
        if (settingId == "null") {
            showToast("Please select a setting!!");
        } else {
            addWaitingOverlay();
            doGet("/getOtherProductSettingsValues", {setting_id: settingId}, function (resp) {
                removeWaitingOverlay(); 
                if (resp.status == 200) {
                    for (var i = 0; i < resp.values.length; i++) { 
                        var setting = resp.values[i];
                        $("#otherProductsPricingSettingValue").append("<option value='" + setting.id + "'>" + setting.value_label + "</option>")
                    }
                    callback ? callback() : $.noop();
                } else {
                    console.log(resp);
                    showToast("Error: " + resp.msg);
                }
            }, function (err) {
                removeWaitingOverlay();
                console.log(err);
                showToast("Communication failure!!!");
            });
        }
    }
    
    function loadProductSettings(item, callback) {
        $("#otherProductsPricingSetting").children().remove();
        if (item == "null") {
            showToast("Please select a product!!");
        } else {
            addWaitingOverlay();
            doGet("/getOtherProductSettings", {product_id: item}, function (resp) {
                removeWaitingOverlay();
                if (resp.status == 200) {
                    $("#otherProductsPricingSetting").append("<option>Select a setting</option>")
                    for (var i = 0; i < resp.settings.length; i++) {
                        var setting = resp.settings[i];
                        $("#otherProductsPricingSetting").append("<option value='" + setting.id + "'>" + setting.setting_name + "</option>");
                    }
                    callback ? callback() : $.noop();
                } else {
                    console.log(resp);
                    showToast("Error: " + resp.msg);
                }
            }, function (err) {
                removeWaitingOverlay();
                console.log(err);
                showToast("Communication failure!!!");
            });
        }
    }

    function findRecordByCountry(logo_pricing, vc_pricing, country) {
        var results = [];
        for (var i = 0; i < logo_pricing.length; i++) {
            var item = logo_pricing[i];
            if (item.country == country) {
                results.push("Logo pricing exist for " + countryList["C" + country].country + ". It will be replaced with new values.");
                break;
            }
        }
        for (var i = 0; i < vc_pricing.length; i++) {
            var item = vc_pricing[i];
            if (item.country == country) {
                results.push("Card pricing exist for " + countryList["C" + country].country + ". It will be replaced with new values.");
                break;
            }
        }
        return results.join("<br/>");
    }
    init();
});

function deleteLogoPricing(id) {
    bootbox.confirm("Are you sure to delete this logo pricing?", function (result) {
        if (result) {
            doPost("/deleteLogoPrice", {id: id}, function (resp) {
                if (resp.status == 200) {
                    showToast("Successfully deleted logo pricing.");
                    $("#logoPricing_" + id).remove();
                    $(".logoPricing_" + id).remove();
                } else {
                    bootbox.alert("Error deleting logo pricing");
                    console.log(resp);
                }
            });
        }
    });
}

function deleteCardPricing(id) {
    bootbox.confirm("Are you sure to delete this card pricing?", function (result) {
        if (result) {
            doPost("/deleteCardPrice", {id: id}, function (resp) {
                if (resp.status == 200) {
                    showToast("Successfully deleted card pricing.");
                    $("#cardPricing_" + id).remove();
                    $(".cardPricing_" + id).remove();
                } else {
                    bootbox.alert("Error deleting card pricing");
                    console.log(resp);
                }
            });
        }
    });
}

function editCountry(id) {
    addingCountry = false;
    editingCountryId = id;
    var country = $("#country_" + id);
    $("#countryName").val($(".country_name", country).text());
    $("#countryCurrency").val($(".country_currency", country).text());
    $("#countryCode").val($(".country_code", country).text());
    $('#countryModel').modal('show');
}

function deleteCountry(id) {
    bootbox.confirm("Are you sure to delete this country?", function (result) {
        if (result) {
            doPost("/deleteCountry", {id: id}, function (resp) {
                if (resp.status == 200) {
                    showToast("Successfully deleted country.");
                    $("#country_" + id).remove();
                    $(".country_" + id).remove();
                } else {
                    bootbox.alert("Error deleting country");
                    console.log(resp);
                }
            });
        }
    });
}

function editLogoPricing(id) {
    addingLogoPricing = false;
    editingLogoPricingId = id;
    var logoPricing = $("#logoPricing_" + id);
    $("#logoPricingCountry").val($(".logoPricingName", logoPricing).data("country"));
    $("#logoPricingPrice").val($(".logoPricingPrice", logoPricing).text());
    $("#logoPricingColorChanges").val($(".logoPricingColorChange", logoPricing).text())
    $('#logoPricingModel').modal('show');
}

function editCardPricing(id) {
    addingCardPricing = false;
    editingCardPricingId = id;
    var cardPricing = $(".cardPricing_" + id);
    $("#cardPricingCountry").val($(".cardPricingName", cardPricing).data("country"));
    $("#cardPricingFinish").val($(".cardPricingFinish", cardPricing).text());
    $("#cardPricingQuantity").val($(".cardPricingQty", cardPricing).text());
    $("#cardPricingExecutive").val($(".cardPricingPremium", cardPricing).text());
    $("#cardPricingSuperior").val($(".cardPricingSuperPremium", cardPricing).text());
    $("#cardPricingBackSide").val($(".cardPricingBackSide", cardPricing).text());
    $("#cardPricingBackSideSuperior").val($(".cardPricingBackSideSuperPremium", cardPricing).text());
    $("#cardPricingStandardShipping").val($(".cardPricingStdShipping", cardPricing).text());
    $("#cardPricingExpShipping").val($(".cardPricingExpShipping", cardPricing).text());
    $('#cardPricingModel').modal('show');
}