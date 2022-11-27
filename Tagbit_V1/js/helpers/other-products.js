$(function () {
    var iframeData = {
        front: {
            fnCalls: [],
            window: undefined,
            selector: "#canvasBgFront"
        },
        back: {
            fnCalls: [],
            window: undefined,
            selector: "#canvasBgBack"
        }/*,
         bottom: {
         fnCalls: [],
         window: undefined,
         selector: "#canvasBgPreview"
         }*/
    };
    var isHashEvent = false;
    var designsLoaded = false;
    var step1Loaded = false;
    var currentDesign;
    var currentSettingPage = 1;
    var itemSettings = [];
    var _lastMaxQty;
    var customLogoImage;

    var savedImageUrl;
    var savedProductId;
    var savedItemSettings;
    var savedTo;

    $(window).on("hashAdding", function (evt) {
        isHashEvent = true;
    });

    $(window).on("hashRemoving", function (evt) {
        isHashEvent = false;
    });

    $("#canvasBgFront").ready(function () {
        /* This has to be outside all functions */
        executeFrontDeffred(iframeData.front);
        //callDeferredIframeFn(iframeData.front, "setImage", [frontImage])
    });

    $("#canvasBgBack").ready(function () {
        /* This has to be outside all functions */
        executeFrontDeffred(iframeData.back);
        //callDeferredIframeFn(iframeData.back, "setImage", [backImage])
    });
    /*
     $("#canvasBgPreview").ready(function () {
     // This has to be outside all functions
     executeFrontDeffred(iframeData.bottom);
     callDeferredIframeFn(iframeData.bottom, "setImage", [frontImage])
     });
     */
    function callDeferredIframeFn(frame, fnName, args) {
        frame.fnCalls.push({
            fnName: fnName,
            args: args
        });
        if (frame.window) {
            executeFrontDeffred(frame);
        }
    }

    function executeFrontDeffred(frame) {
        if ($(frame.selector)[0]) {
            if (frame.window) {
                $.each(frame.fnCalls, function (idx, val) {
                    frame.window[val.fnName].apply(this, val.args);
                });
                frame.fnCalls = [];
            } else {
                setTimeout(function () {
                    if (getIframeWindow($(frame.selector)[0]).init) {
                        frame.window = getIframeWindow($(frame.selector)[0]);
                        frame.window.init($, {
                            $: $
                        });
                    }
                    executeFrontDeffred(frame);
                }, 1000);
            }
        }
    }

    function redraw() {
        window.editorFrame.getAsJPGDataUrl(250, function (data) {
            draw(iframeData.front, frontImage, data, frontParams, frontBaseParams);
            //draw(iframeData.bottom, data, frontParams, frontBaseParams);
            if ($(".canvasBgBack").length > 0) {
                draw(iframeData.back, backImage, data, backParams, backBaseParams);
            }
        });
    }

    function draw(frame, image, url, attrs, base) {
        var baseWidth = parseFloat(base[0]), baseHeight = parseFloat(base[1]);
        var sfX = baseHeight / $(".canvasBgFront").height();
        var sfY = baseWidth / $(".canvasBgFront").width();
        var x = parseFloat(attrs[0]) / sfX,
                y = parseFloat(attrs[1]) / sfY,
                amplitude = parseFloat(attrs[2]),
                crop = parseFloat(attrs[3]),
                crop_left = parseFloat(attrs[4]),
                crop_right = parseFloat(attrs[5]),
                rotate = parseFloat(attrs[6]),
                width = parseFloat(attrs[7]),
                height = parseFloat(attrs[8]);
        callDeferredIframeFn(frame, "initScalablePreview", [$, image, url, attrs, true, 330]);
    }

    function hideAllBefore(sel) {
        $(".wiz-one").removeClass("active");
        $(".wiz-two").removeClass("active");
        $(".wiz-three").removeClass("active");
        $(".wiz-four").removeClass("active");
        $(".wiz-five").removeClass("active");
        $(".panel-one").show();
        if (sel == "one") {
            $(".wiz-one").addClass("active");
            $(".panel-five").hide();
            $(".panel-two").hide();
            $(".panel-three").hide();
            $(".panel-four").hide();
        } else {
            /* TODO:
             if ($(".designs-list").children().size() > 0) {
             $(".panel-five").show();
             } else {
             $(".panel-five").hide();
             }
             */
            if (sel == "five") {
                $(".wiz-five").addClass("active");
                $(".panel-four").hide();
                $(".panel-three").hide();
                $(".panel-two").hide();
            } else {
                $(".panel-two").show();
                if (sel == "two") {
                    $(".wiz-two").addClass("active");
                    $(".panel-three").hide();
                    $(".panel-four").hide();
                } else {
                    $(".panel-three").show();
                    if (sel == "three") {
                        $(".wiz-three").addClass("active");
                        $(".panel-four").hide();
                    } else {
                        if (sel == "four") {
                            $(".wiz-four").addClass("active");
                            $(".panel-four").show();
                        }
                    }
                }
            }
        }
    }

    function recalculatePrice(validatePrice) {
        var currency = $(".original-price:first").attr("data-currency");
        var settingsCtrl = $(".settingControl");

        var qty = 0;
        var qty_base_price;
        var qty_base_price_reduced;

        var totalRealPrice = 0;
        var totalReducedPrice = 0;

        var totalIndependentRealPrice = 0;
        var totalIndependentReducedPrice = 0;

        for (var i = 0; i < settingsCtrl.length; i++) {
            var item = $(settingsCtrl[i]);
            var relatedSetting = item.attr("data-related-setting");
            var control_type = item.attr("data-type");
            var value = item.val();
            var reduced_price = 0;
            var real_price = 0;
            var indepenedentPrice = 0;
            var indepenedentPriceReduced = 0;

            var _populateBasePrice = function (value) {
                var realSettingValue = $("[data-setting-id=" + relatedSetting + "]");
                for (var j = 0; j < realSettingValue.length; j++) {
                    var val = $(realSettingValue[j]).attr("data-setting-value").split("-");
                    if (value <= parseInt(val[1]) && value >= parseInt(val[0])) {
                        qty_base_price_reduced = parseFloat($(realSettingValue[j]).attr("data-price"));
                        qty_base_price = parseFloat($(realSettingValue[j]).attr("data-real-price"));
                        break;
                    }
                }
                if (!qty_base_price_reduced) {
                    qty_base_price_reduced = parseFloat($(realSettingValue[realSettingValue.length - 1]).attr("data-price"));
                    qty_base_price = parseFloat($(realSettingValue[realSettingValue.length - 1]).attr("data-real-price"));
                }
            }

            switch (control_type) {
                case "quantity":
                {
                    if ((!/^[0-9]+$/.test(value) || parseInt(value) < 1)) {
                        if (validatePrice) {
                            bootbox.alert("Invalid quantity entered.");
                        }
                        value = 1;
                        //item.val(value);
                    }
                    value = parseInt(value);
                    qty = value;
                    $(".totalQty").text(qty);
                    _populateBasePrice(qty);
                    break;
                }
                case "quantityWithSize":
                {
                    /* TODO: check all other boxes */
                    if (!/^[0-9]+$/.test(value)) {
                        if (validatePrice) {
                            bootbox.alert("Invalid quantity entered.");
                        }
                        value = 1;
                        //item.val(value);
                    }
                    value = parseInt(value);
                    qty += value;
                    $(".totalQty").text(qty);
                    _populateBasePrice(qty);
                    break;
                }
                case "radio":
                {
                    if (item.is(":checked")) {
                        if (item.attr("data-independent") == "0") {
                            real_price = parseFloat(item.attr("data-real-price"));
                            reduced_price = parseFloat(item.attr("data-price"));
                            console.log(item.attr("data-value-label") + ":" + real_price);
                        } else {
                            indepenedentPrice = parseFloat(item.attr("data-real-price"));
                            indepenedentPriceReduced = parseFloat(item.attr("data-price"));
                            console.log(item.attr("data-value-label") + ":" + indepenedentPrice);
                        }
                    }
                    break;
                }
                case "color":
                {
                    if (item.hasClass("active")) {
                        if (item.attr("data-independent") == "0") {
                            real_price = parseFloat(item.attr("data-real-price"));
                            reduced_price = parseFloat(item.attr("data-price"));
                            console.log(item.attr("data-value-label") + ":" + real_price);
                        } else {
                            indepenedentPrice += parseFloat(item.attr("data-real-price"));
                            indepenedentPriceReduced += parseFloat(item.attr("data-price"));
                            console.log(item.attr("data-value-label") + ":" + indepenedentPrice);
                        }
                    }
                    break;
                }
                case "checkbox":
                {
                    if (item.is(":checked")) {
                        if (item.attr("data-independent") == "0") {
                            real_price = parseFloat(item.attr("data-real-price"));
                            reduced_price = parseFloat(item.attr("data-price"));
                            console.log(item.attr("data-value-label") + ":" + real_price);
                        } else {
                            indepenedentPrice = parseFloat(item.attr("data-real-price"));
                            indepenedentPriceReduced = parseFloat(item.attr("data-price"));
                            console.log(item.attr("data-value-label") + ":" + indepenedentPrice);
                        }
                    }
                    break;
                }
                case "combo":
                {
                    var option = item.find("option:selected");
                    if (item.attr("data-independent") == "0") {
                        real_price = parseFloat(option.attr("data-real-price"));
                        reduced_price = parseFloat(option.attr("data-price"));
                        console.log(option.text() + ":" + real_price);
                    } else {
                        indepenedentPrice = parseFloat(option.attr("data-real-price"));
                        indepenedentPriceReduced = parseFloat(option.attr("data-price"));
                        console.log(option.text() + ":i - " + indepenedentPrice);
                    }
                    break;
                }
                default:
                {
                    console.log(control_type)
                    break;
                }
            }
            if (real_price && reduced_price) {
                totalRealPrice += parseFloat(real_price);
                totalReducedPrice += parseFloat(reduced_price);
            }
            if (indepenedentPrice && indepenedentPriceReduced) {
                totalIndependentRealPrice += parseFloat(indepenedentPrice);
                totalIndependentReducedPrice += parseFloat(indepenedentPriceReduced);
            }
        }
        var realTds = $('.price-label-real');
        var reducedTds = $('.price-label-reduced');
        for (var i = 0; i < realTds.length; i++) {
            var item = $(realTds[i]);
            var real_price = totalRealPrice + parseFloat(item.attr("data-price"));
            item.text(convertCurrency(currency, real_price));
        }
        for (var i = 0; i < reducedTds.length; i++) {
            var item = $(reducedTds[i]);
            var reduced_price = totalReducedPrice + parseFloat(item.attr("data-price"));
            item.text(convertCurrency(currency, reduced_price));
        }
        var real = 0;
        var reduced = 0;

        real = qty * (totalRealPrice + qty_base_price) + totalIndependentRealPrice;
        reduced = qty * (totalReducedPrice + qty_base_price_reduced) + totalIndependentReducedPrice;

        $("#totalOriginalPrice").text(convertCurrency(currency, real));
        $("#totalReducedPrice").text(convertCurrency(currency, reduced));
        console.log("----------------")
    }

    function convertCurrency(currency, money, freeText) {
        money = parseFloat(money);
        if (money == 0) {
            return freeText || currency + " 0.00";
        } else {
            return currency + " " + Number(money).toFixed(2);
        }
    }

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function addPriceLabelToDiv(settingId, elem, settingValues, label) {
        var table = $('<table class="table-responsive menuItm-table table table-bordered"></table>');
        elem.append(table);
        table.append('<thead><tr><th>Quantity</th><th class="text-center">Price</th><th class="text-right">Save ' + flatDiscountPercentageOther + '%</th></tr></thead>');
        for (var i = 0; i < settingValues.values.length; i++) {
            var item = settingValues.values[i];
            var realPrice = item.price;
            var reducedPrice = discountAmt(flatDiscountPercentageOther, item.price);
            /* Getting qty from range */
            var qty = item.value_label.split("-");
            if (isNumber(qty[1]) && (_lastMaxQty < qty[1] || _lastMaxQty == undefined)) {
                _lastMaxQty = parseFloat(qty[1]);
            }
            if (isNumber(qty[0])) {
                qty = qty[0];
            } else {
                qty = false;
            }
            table.append("<tr>\
                <td>" + item.value_label + "</td>\
                <td class='text-center original-price price-label-real' data-currency='" + item.currency + "' data-price='" + realPrice + "' data-qty='" + qty + "'>" + convertCurrency(item.currency, realPrice) + "</td>\
                <td class='text-right reduced-price price-label-reduced' data-qty='" + qty + "' data-id='" + item.setting_value_id + "' id='pricing" + item.setting_value_id + "' data-currency='" + item.currency + "' data-real-price='" + realPrice + "' data-price='" + reducedPrice + "' data-setting-id='" + settingId + "' data-setting-value='" + item.value_label + "'>" + convertCurrency(item.currency, reducedPrice) + "</td>\
            </tr>");
        }
        $("[data-qty=false]").attr("data-qty", parseFloat(_lastMaxQty) + 1);
    }

    function addRadioToDiv(settingId, elem, settingValues, label, relatedSetting, independent_pricing) {
        var table = $("<table class='table'></table>");
        elem.append(table);
        for (var i = 0; i < settingValues.values.length; i++) {
            var item = settingValues.values[i];
            var realPrice = item.price;
            var reducedPrice = discountAmt(flatDiscountPercentageOther, item.price);
            table.append("<tr><td class='col-md-4'><input data-independent='" + independent_pricing + "' data-related-setting='" + relatedSetting + "' data-price='" + reducedPrice + "' data-real-price='" + realPrice + "' class='settingControl' data-label='" + label + "' data-type='radio' type='radio' name='setting_" + settingId + "' data-setting-id='" + settingId + "' value='" + item.setting_value_id + "' data-value-label='" + item.value_label + "' /> " + item.value_label + "</td><td class='col-md-4 original-price' data-currency='" + item.currency + "' data-price='" + realPrice + "' data-real-price='" + reducedPrice + "'>" + convertCurrency(item.currency, realPrice) + "</td><td class='col-md-4 reduced-price ' data-id='" + item.setting_value_id + "' id='pricing" + item.setting_value_id + "' data-currency='" + item.currency + "' >" + convertCurrency(item.currency, reducedPrice) + "</td></tr>");
        }
        if (!savedProductId) {
            $("[name=setting_" + settingId + "]").first().prop("checked", true);
        }
        $("[name=setting_" + settingId + "]").change(function () {
            recalculatePrice();
        });
    }

    function addCheckboxToDiv(settingId, elem, settingValues, label, relatedSetting, independent_pricing) {
        var table = $("<table class='table'></table>");
        elem.append(table);
        for (var i = 0; i < settingValues.values.length; i++) {
            var item = settingValues.values[i];
            var realPrice = item.price;
            var reducedPrice = discountAmt(flatDiscountPercentageOther, item.price);
            table.append("<tr><td class='col-md-4'><input data-independent='" + independent_pricing + "' data-related-setting='" + relatedSetting + "' data-price='" + reducedPrice + "' data-real-price='" + realPrice + "' class='settingControl' data-type='checkbox' type='checkbox' name='setting_" + settingId + "' data-label='" + label + "' data-setting-id='" + settingId + "' value='" + item.setting_value_id + "' data-value-label='" + item.value_label + "'/> " + item.value_label + "</td><td class='col-md-4 original-price' data-currency='" + item.currency + "' data-price='" + realPrice + "'>" + convertCurrency(item.currency, realPrice) + "</td><td class='col-md-4 reduced-price ' data-id='" + item.setting_value_id + "' id='pricing" + item.setting_value_id + "' data-currency='" + item.currency + "' data-price='" + reducedPrice + "'>" + convertCurrency(item.currency, reducedPrice) + "</td></tr>");
        }
        if (!savedProductId) {
            $("[name=setting_" + settingId + "]").first().prop("checked", true);
        }
        $("[name=setting_" + settingId + "]").change(function () {
            recalculatePrice();
        });
    }

    function addColorToDiv(settingId, elem, settingValues, label, relatedSetting, independent_pricing) {
        var container = $('<div class="menuItm-options"><label>' + label + ' :</label></div>');
        var table = $('<span class="menuItm-options-span menuItm-clors"></span>');
        container.append(table)
        elem.append(container);
        for (var i = 0; i < settingValues.values.length; i++) {
            var item = settingValues.values[i];
            var realPrice = item.price || 0;
            var reducedPrice = discountAmt(flatDiscountPercentageOther, item.price);
            table.append("<span data-toggle='tooltip' data-setting-value='" + item.setting_value_id + "'  data-placement='top' title='" + item.value_label + "' style='background-color:" + item.value_label + "' type='color' data-independent='" + independent_pricing + "' data-related-setting='" + relatedSetting + "' data-real-price='" + realPrice + "' data-price='" + reducedPrice + "' class='settingControl color-preview' data-label='" + label + "' data-type='color' data-setting-id='" + settingId + "' value='" + item.value_label + "' name='setting_" + settingId + "' data-value-label='" + item.value_label + "'></span>");
        }
        $('[data-toggle="tooltip"]').tooltip()
        $("[name=setting_" + settingId + "]").click(function (e) {
            $("[name=setting_" + settingId + "]").removeClass("active");
            $(this).addClass("active");
            recalculatePrice();
            e.stopPropagation();
        });
        if (!savedProductId) {
            $("[name=setting_" + settingId + "]").first().click();
        }
    }

    function addComboToDiv(settingId, elem, settingValues, label, relatedSetting, independent_pricing) {
        var div = $('<div class="menuItm-options"><label>' + label + ' :</label><span class="menuItm-options-span"></span></div>')
        var combo = $("<select class='selectpicker settingControl' data-independent='" + independent_pricing + "' data-related-setting='" + relatedSetting + "' data-setting-id='" + settingId + "' data-label='" + label + "' data-type='combo' name='setting_" + settingId + "'></select>");
        div.find(".menuItm-options-span").append(combo);
        elem.append(div);
        for (var i = 0; i < settingValues.values.length; i++) {
            var item = settingValues.values[i];
            var realPrice = item.price;
            var reducedPrice = discountAmt(flatDiscountPercentageOther, item.price);
            combo.append("<option data-price='" + reducedPrice + "' data-real-price='" + realPrice + "' value='" + item.setting_value_id + "'>" + item.value_label + (!independent_pricing ? "" : " (" + convertCurrency(item.currency, realPrice) + " Extra)") + "</option>");
        }
        $("[name=setting_" + settingId + "]").change(function () {
            recalculatePrice();
        });
    }

    function addTextToDiv(settingId, elem, label, relatedSetting, independent_pricing) {
        elem.append("<input data-independent='" + independent_pricing + "' data-related-setting='" + relatedSetting + "' name='setting_" + settingId + "' type='text' data-label='" + label + "' data-setting-id='" + settingId + "' data-type='text' class='settingControl form-control'/>");
        $("[name=setting_" + settingId + "]").keyup(function () {
            recalculatePrice();
        });
        $("[name=setting_" + settingId + "]").change(function () {
            recalculatePrice(true);
        });
    }

    function addQtyToDiv(settingId, elem, label, relatedSetting, independent_pricing) {
        elem.append("<div class='menuItm-options'><label>" + label + " :</label><span class='menuItm-options-span'><input data-independent='" + independent_pricing + "' value='1' data-related-setting='" + relatedSetting + "' name='setting_" + settingId + "' type='text' data-label='" + label + "' data-setting-id='" + settingId + "' data-type='quantity' class='settingControl form-control'/></span></div>");
        $("[name=setting_" + settingId + "]").keyup(function () {
            recalculatePrice();
        });
        $("[name=setting_" + settingId + "]").change(function () {
            recalculatePrice(true);
        });
    }

    function addQuantityWithSizeControl(settingId, elem, settingValues, label, relatedSetting, independent_pricing) {
        var container = $("<div class='col-md-2 menuItm-options menuItemNoBorderOrMargin'><label>" + label + " :</label></div>");
        var table = "<div class='col-md-10'><table><tr>";
        for (var i = 0; i < settingValues.values.length; i++) {
            table += ("<td>" + settingValues.values[i].value_label + "</td>");
        }
        table += "</tr><tr>";
        for (var i = 0; i < settingValues.values.length; i++) {
            table += ("<td><input data-setting-value='" + settingValues.values[i].setting_value_id + "' data-independent='" + independent_pricing + "' value='" + (i == 0 ? "1" : "0") + "' data-related-setting='" + relatedSetting + "' name='setting_" + settingId + "' type='text' data-label='" + label + "' data-setting-id='" + settingId + "' data-type='quantityWithSize' class='settingControl form-control'/></td>");
        }
        table += "</tr></table></div><div class='col-md-12'>&nbsp;</div>";
        elem.append(container);
        elem.append(table);
        $("[name=setting_" + settingId + "]").keyup(function () {
            recalculatePrice();
        });
        $("[name=setting_" + settingId + "]").change(function () {
            recalculatePrice(true);
        });
    }

    function addItem(settingId, control_type, elem, settingValues, label, relatedSetting, independent_pricing) {
        switch (control_type) {
            case "Pricing Label":
            {
                addPriceLabelToDiv(settingId, elem, settingValues, label, relatedSetting, independent_pricing);
                break;
            }
            case "Radio":
            {
                addRadioToDiv(settingId, elem, settingValues, label, relatedSetting, independent_pricing);
                break;
            }
            case "Checkbox":
            {
                addCheckboxToDiv(settingId, elem, settingValues, label, relatedSetting, independent_pricing);
                break;
            }
            case "Text":
            {
                addTextToDiv(settingId, elem, label, relatedSetting, independent_pricing);
                break;
            }
            case "Quantity":
            {
                addQtyToDiv(settingId, elem, label, relatedSetting, independent_pricing);
                break;
            }
            case "Combo":
            {
                addComboToDiv(settingId, elem, settingValues, label, relatedSetting, independent_pricing);
                break;
            }
            case "Color":
            {
                addColorToDiv(settingId, elem, settingValues, label, relatedSetting, independent_pricing);
                break;
            }
            case "QuantityWithSize":
            {
                addQuantityWithSizeControl(settingId, elem, settingValues, label, relatedSetting, independent_pricing);
                break;
            }
        }
    }

    function populateOtherProductSettings(callback) {
        doGet("/getOtherProductSettings", {product_id: otherProductId}, function (resp) {
            if (resp.status == 200) {
                var settings = {};
                for (var i = 0; i < resp.settings.length; i++) {
                    if (!settings[resp.settings[i].page_number]) {
                        settings[resp.settings[i].page_number] = {
                            items: [],
                            label: ""
                        };
                    }
                    settings[resp.settings[i].page_number].items.push(resp.settings[i]);
                    if (resp.settings[i].control_type != "Side Label") {
                        settings[resp.settings[i].page_number].label = resp.settings[i].setting_name;
                    }
                }
                $("#settingsSteps").children().remove();
                $("#settingsContent").children().remove();
                var num_pages = 0;
                var finishedItems = 0;
                var itemAdded = function () {
                    finishedItems++;
                    if (finishedItems == resp.settings.length) {
                        recalculatePrice();
                        $('.tooltip1').tooltip();
                        $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
                            var $target = $(e.target);
                            if ($target.parent().hasClass('active')) {
                                return false;
                            }
                        });
                        callback ? callback() : $.noop();
                    }
                }

                for (var page in settings) {
                    if (settings.hasOwnProperty(page)) {
                        itemSettings.push(page);
                        $("#settingsSteps").append("<a class='col-md-12 link pageLink' data-idx='" + num_pages + "' data-page='" + page + "'>" + page + ". " + settings[page].label + "</a>");
                        $("#settingsContent").append("<div class='settingPages' id='page" + page + "'></div>");
                        var tabDiv = $("#page" + page);
                        for (var i = 0; i < settings[page].items.length; i++) {
                            var item = settings[page].items[i];
                            var elem = $("<span></span>")//$("<div class='row'></div>");
                            var controlTypesToQueryAdditionalVals = ['Color', 'Combo', 'Radio', 'Checkbox', 'Pricing Label', 'QuantityWithSize'];
                            //elem.append("<h4>" + item.setting_name + "</h4>");
                            tabDiv.append(elem);
                            if (controlTypesToQueryAdditionalVals.indexOf(item.control_type) > -1) {
                                doGetWithExtraParams("/getOtherProductSettingsValues", {setting_id: item.id, country_id: $(".top-countries-list").val()}, {independent_pricing: item.independent_pricing, relatedSetting: item.related_setting, controlType: item.control_type, elem: elem, setting_id: item.id, settingName: item.setting_name}, function (settingValues, extra) {
                                    if (settingValues.status == 200) {
                                        addItem(extra.setting_id, extra.controlType, extra.elem, settingValues, extra.settingName, extra.relatedSetting, extra.independent_pricing);
                                        itemAdded();
                                    } else {
                                        console.log(settingValues);
                                        showToast("Error: " + settingValues.msg);
                                    }
                                }, function (err) {
                                    console.log(err);
                                    showToast("Error: Communication failure!!!");
                                });
                            } else {
                                addItem(item.id, item.control_type, elem, undefined, item.setting_name, item.related_setting, item.independent_pricing);
                                itemAdded();
                            }
                        }
                        tabDiv.hide();
                        num_pages++;
                    }
                }
                $(".pageLink").off().click(function () {
                    $(".settingPages").hide();
                    currentSettingPage = $(this).attr("data-page");
                    $("#page" + $(this).attr("data-page")).show();
                    $(".pageLink").removeClass("text-primary");
                    $(this).addClass("text-primary");
                    var offset = $(".panel-three .panel-body").offset().top;
                    $("body").scrollTop(offset - $(".panel-group").offset().top + $(".panel-group").scrollTop());
                    if ($(this).attr("data-idx") == num_pages - 1) {
                        $(".wiz-four").addClass("active");
                        $(".wiz-three").removeClass("active");
                        $("#btnNextStep3").text("Checkout");
                        $("#addToCartBtn").text("Checkout");
                        if (num_pages > 1) {
                            $("#btnBackStepSettings").show();
                        } else {
                            $("#btnBackStepSettings").hide();
                        }
                    } else {
                        if ($(this).attr("data-idx") == 0) {
                            $("#btnBackStepSettings").hide();
                        } else {
                            if (num_pages > 1) {
                                $("#btnBackStepSettings").show();
                            } else {
                                $("#btnBackStepSettings").hide();
                            }
                        }
                        $(".wiz-three").addClass("active");
                        $(".wiz-four").removeClass("active");
                        $("#btnNextStep3").text("Next");
                        $("#addToCartBtn").text("Next");
                    }
                });
                $(".pageLink:first").trigger("click");
            } else {
                console.log(resp);
                showToast("Error: " + resp.msg);
            }
        }, function (err) {
            console.log(err);
            showToast("Error: Communication failure!!!");
        });
    }

    function updatePreviewImage() {
        if (window.editorFrame.saveAction) {
            window.editorFrame.saveAction(true, function (data) {
                $("#productPreview").attr("src", data);
            });
        } else {
            setTimeout(function () {
                updatePreviewImage();
            }, 2048);
        }
    }

    function urlChanged() {
        var _step1Tasks = function (states, callback) {
            if (!step1Loaded) {
                var addLogo = function (logo_resp) {
                    if (logo_resp) {
                        var user = getUser();
                        if (logo_resp.status != "Purchased" || (logo_resp.status == "Purchased" && logo_resp.owner == user.id)) {
                            var imgSrc = "";
                            if (typeof logo_resp.id == "string" && logo_resp.id.indexOf("logo_") == 0) {
                                imgSrc = "data:image/svg+xml;base64logo_resp.id," + Base64.encode(logo_resp.url);
                            } else {
                                imgSrc = "/getUserLogoImage?id=" + logo_resp.s3_logo_url + '&random=' + Math.random();
                            }
                            var item = '<li class="col-md-3" data-url="' + imgSrc + '" id="userLogo' + logo_resp.id + '"><object type="image/svg+xml" data="' + imgSrc + '"></object></li>';
                            $(".logos-list").append(item);
                            $('#userLogo' + logo_resp.id).click(function (e) {
                                savedImageUrl = undefined;
                                changeUrl(logo_resp.id + "/choose-design");
                            });
                        }
                    } else {
                        var item = $('<li class="col-md-3"><span class="custom-logo"><img src="/img/upload_arrow.png"><br />Upload your Design</span></li>');
                        $(".logos-list").append(item);
                        item.click(function () {
                            $("#customLogoUpload").click();
                        });
                    }
                };
                step1Loaded = true;
                $("body,html").animate({
                    scrollTop: 0
                }, 1000).promise().then(function () {
                    hideAllBefore("one");
                    var noLogosMessage = "No Logos found! <a href='/logo-design-online'><b>Click here</b></a> to create one. or <a class='link' id='uploadCustomLogo'><b>Click here</b></a> to upload one.";
                    if (isLoggedIn() == true) {
                        doPost("/listUserLogos", {}, function (resp) {
                            if (resp.status == 200) {
                                if (resp.logos.length == 0) {
                                    $(".logos-list").html(noLogosMessage);
                                    callback ? callback() : $.noop();
                                } else {
                                    addLogo();
                                    for (var i = 0; i < resp.logos.length; i++) {
                                        addLogo(resp.logos[i]);
                                    }
                                    callback ? callback() : $.noop();
                                }
                            } else {
                                $(".logos-list").html(noLogosMessage);
                                callback ? callback() : $.noop();
                            }
                            $("#uploadCustomLogo").click(function () {
                                $("#customLogoUpload").click();
                            });
                        }, function (err) {
                            console.log(err);
                            bootbox.alert("Communication Error!!");
                        });
                    } else {
                        var localLogos = retrieveJson("logos");
                        if (localLogos && localLogos.length > 0) {
                            addLogo();
                            localLogos.forEach(function (val, idx) {
                                var value = retrieveJson(val);
                                value.id = val;
                                value.s3_logo_url = val;
                                addLogo(value);
                            });
                            callback ? callback() : $.noop();
                        } else {
                            $(".logos-list").html(noLogosMessage);
                            callback ? callback() : $.noop();
                        }
                        $("#uploadCustomLogo").click(function () {
                            $("#customLogoUpload").click();
                        });
                    }
                });
            } else {
                if (!states[2]) {
                    hideAllBefore("one");
                }
                if (callback) {
                    callback();
                } else {
                    $("body").scrollTop(0);
                }
            }
        };
        var _step2Tasks = function (states, callback) {
            _step5Tasks(states, function () {
                var reloadEditor = function () {
                    //Added by Rohit
                    $("#svgEditorFrameBack").empty();
                    $("#svgEditorFrameBack").append('<iframe src="/svgedit/other_editor_frame.html" name="editorFrame" style="margin: 0px; width: 100%; height: 100%; border: none; min-height: 500px" id="svgeditback"></iframe>');
                   
                    $("#svgEditorFrame").empty();
                    $("#svgEditorFrame").append('<iframe src="/svgedit/other_editor_frame.html" name="editorFrame" style="margin: 0px; width: 100%; height: 100%; border: none; min-height: 500px" id="svgedit"></iframe>');
                   
                    $(window.editorFrame).on("load", function () {
                        var _fn = function (timeout) {
                            setTimeout(function () {
                                if (window.editorFrame.setParent) {
                                    window.editorFrame.setParent({
                                        document: document,
                                        repaint: function () {
                                            doGet("/getOtherProductDetails?id=" + otherProductId, {}, function (resp) {
                                                if (resp.status == 200) {
                                                    frontParams = resp.details.front_logo_params.split(";");
                                                    backParams = resp.details.back_logo_params.split(";");
                                                    frontBaseParams = resp.details.base_params_front.split(";");
                                                    backBaseParams = resp.details.base_params_back.split(";");
                                                    redraw();
                                                } else {
                                                    console.log(resp);
                                                    bootbox.alert("Error: " + resp.msg);
                                                }
                                            }, function (err) {
                                                console.log(err);
                                                bootbox.alert("Communication Error!!");
                                            });
                                        },
                                        handleSvgChange: function () {
                                            redraw();
                                            updatePreviewImage();
                                            $("#previewBtnLink").click();
                                        },
                                        executeKeyUps: $.noop,
                                        getSupportedFonts: getSupportedFonts,
                                        frontParams: frontParams,
                                        frontBaseParams: frontBaseParams,
                                        frontImage: frontImage,
                                        getDesignSize: function (callback){
                                            var url = $($(".designs-list").children()[1]).attr("data-url");
                                            if (url){
                                                var img = new Image();
                                                img.src = url;
                                                img.onload = function (){
                                                    callback(img.height, img.width);
                                                };
                                            } else {
                                                callback(undefined);
                                            }
                                        }
                                    });
                                    window.editorFrame.initCommon("OP");
                                    if (savedImageUrl) {
                                        window.editorFrame.loadImage("/getUserOtherProductImage?id=" + savedImageUrl + '&random=' + Math.random(), undefined, undefined, true);
                                    } else {
                                        window.editorFrame.loadOtherProductImage(states[2] == "custom" ? customLogoImage : $("#userLogo" + states[2]).attr("data-url"), states[3] == "default" ? undefined : $("#userDesign" + states[3]).attr("data-url"));
                                    }
                                    currentDesign = states[2] + ":" + states[3];
                                } else {
                                    _fn(timeout + 100);
                                }
                            }, timeout);
                        };
                        _fn(0);
                    });
                    hideAllBefore("two");
                    callback ? callback() : $.noop();
                }
                if (!$(".panel-two").is(":visible")) {
                    $(".panel-two").show();
                    var offset = $(".panel-two .panel-body").offset().top + 70;
                    $("body,html").animate({
                        scrollTop: offset - $(".panel-group").offset().top + $(".panel-group").scrollTop()
                    }, 1000).promise().then(function () {
                        reloadEditor();
                    });
                } else {
                    if (!states[4]) {
                        hideAllBefore("two");
                    }
                    var offset = $(".panel-two .panel-body").offset().top + 70;
                    if (currentDesign != states[2] + ":" + states[3]) {
                        /* TODO: Warning */
                        reloadEditor();
                        $("body").scrollTop(offset - $(".panel-group").offset().top + $(".panel-group").scrollTop());
                    } else {
                        if (callback) {
                            callback();
                        } else {
                            $("body").scrollTop(offset - $(".panel-group").offset().top + $(".panel-group").scrollTop());
                        }
                    }
                }
            });
        };
        var _step5Tasks = function (states, callback) {
            _step1Tasks(states, function () {
                if (designsLoaded == true) {
                    if (states[3] == "choose-design") {
                        hideAllBefore("five");
                    }
                    if ($(".designs-list").children().size() == 0 && states[3] != "default") {
                        changeUrl(states[2] + "/default");
                    }
                    if (callback) {
                        callback();
                    } else {
                        var offset;
                        if ($(".panel-five .panel-body").is(":visible")) {
                            offset = $(".panel-five .panel-body").offset().top;
                        } else {
                            offset = $(".panel-two .panel-body").offset().top;
                        }
                        $("body").scrollTop(offset - $(".panel-group").offset().top + $(".panel-group").scrollTop());
                    }
                } else {
                    var addDesign = function (logo_resp) {
                        var imgSrc = logo_resp.design_file ? "/getOtherProductDesignImage?url=" + logo_resp.design_file : "/img/no-design.png";
                        var item;
                        if (logo_resp.design_file == undefined) {
                            item = '<li data-id="' + logo_resp.id + '" data-url="' + imgSrc + '"><img class="designPreviews" src="' + imgSrc + '" id="userDesign' + logo_resp.id + '"/></li>';
                            $(".designs-list").append(item);
                        } else {
                            item = '<li data-id="' + logo_resp.id + '" data-url="' + imgSrc + '"><iframe data-url="' + imgSrc + '" class="designPreviews" src="/product-preview/big-preview.html" id="userDesign' + logo_resp.id + '"> </iframe></li>';
                            $(".designs-list").append(item);
                            $("#userDesign" + logo_resp.id).on("load", function () { 
                                var newWindow = this.contentWindow; 
                                newWindow.initScalablePreview($, frontImage, imgSrc, frontParams, true, 180, window);
                            });
                        } 
                        $('#userDesign' + logo_resp.id).parent().click(function (e) {
                            e.stopPropagation();
                            var state = history.state.name.toString().split("/");
                            changeUrl(state[2] + "/" + $(this).attr("data-id"));
                            e.stopPropagation();
                        });
                    };
                    $(".panel-five").show();
                    var offset;
                    /* the below check is still valid even if we shown panel-five. so dont remove the check. */
                    if ($(".panel-five .panel-body").is(":visible")) {
                        offset = $(".panel-five .panel-body").offset().top;
                    } else {
                        offset = $(".panel-two .panel-body").offset().top;
                    }
                    $(".designs-list").children().remove();
                    addDesign({
                        design_file: undefined,
                        id: "default"
                    });
                    $("body,html").animate({
                        scrollTop: offset - $(".panel-group").offset().top + $(".panel-group").scrollTop()
                    }, 1000).promise().then(function () {
                        doGet("/getOtherProductDesigns", {id: otherProductId}, function (resp) {
                            designsLoaded = true; /* Donot move this line to bottom */
                            if (resp.designs.length > 0) {
                                for (var i = 0; i < resp.designs.length; i++) {
                                    addDesign(resp.designs[i]);
                                }
                            } else {
                                if (states[3] == "choose-design") {
                                    changeUrl(states[2] + "/default");
                                } else if (states[3] == "default") {
                                    //TODO: $(".panel-five").hide();
                                }
                            }
                            if (states[3] == "choose-design") {
                                hideAllBefore("five");
                            }
                            callback ? callback() : $.noop();
                        }, function (err) {
                            console.log(err);
                            showToast(err.msg);
                        });
                    });
                }
            });
        };
        var _step4Tasks = function (states) {
            _step2Tasks(states, function () {
                updatePreviewImage();
                var __afterAnimate = function () {
                    if (states[4] == "save") {
                        $(".wiz-four").addClass("active");
                    } else {
                        $(".wiz-three").addClass("active");
                    }
                    populateOtherProductSettings(function () {
                        if (savedTo == "purchase") {
                            $(".settingControl").attr("disabled", true);
                        }
                        $("#previewBtnLink").click();
                        if (typeof savedProductId != "undefined") {
                            for (var i = 0; i < savedItemSettings.length; i++) {
                                switch (savedItemSettings[i].control_type) {
                                    case "Color":
                                    {
                                        $("[name=setting_" + savedItemSettings[i].product_settings_id + "][data-setting-value=" + savedItemSettings[i].setting_value + "]").addClass('active');
                                    }
                                    case "Radio":
                                    {
                                        $("input[name=setting_" + savedItemSettings[i].product_settings_id + "][value=" + savedItemSettings[i].setting_value + "]").prop('checked', true);
                                        break;
                                    }
                                    case "Checkbox":
                                    {
                                        $("input[name=setting_" + savedItemSettings[i].product_settings_id + "][value=" + savedItemSettings[i].setting_value + "]").prop("checked", true);
                                        break;
                                    }
                                    case "Pricing Label":
                                    {
                                        break;
                                    }
                                    case "QuantityWithSize":
                                    {
                                        var value = savedItemSettings[i].setting_value.split("=");
                                        $("[data-setting-value=" + value[0] + "]").val(value[1]);
                                        break;
                                    }
                                    default:
                                    {
                                        $("[name=setting_" + savedItemSettings[i].product_settings_id + "]").val(savedItemSettings[i].setting_value);
                                        break;
                                    }
                                }
                            }
                        }
                        recalculatePrice();
                    });
                };
                if ($(".panel-three").is(":visible")) {
                    var offset = $(".panel-three .panel-body").offset().top;
                    $("body,html").scrollTop(offset - $(".panel-group").offset().top + $(".panel-group").scrollTop());
                    __afterAnimate();
                } else {
                    hideAllBefore("six");
                    var offset = $(".panel-three .panel-body").offset().top;
                    $("body,html").animate({
                        scrollTop: offset - $(".panel-group").offset().top + $(".panel-group").scrollTop()
                    }, 1000).promise().then(function () {
                        __afterAnimate();
                    });
                }
            });
        };
        if (!location.hash && isHashEvent) {
            isHashEvent = false;
        }
        if (!isHashEvent) {
            if (history.state == null) {
                var urls = window.location.pathname.split("/").splice(1).join("/");
                pushState(urls, location.pathname.split("/")[0] + "/" + urls);
                urlChanged();
            } else {
                var states = history.state.name.toString().split("/");
                if (states[2] == "edit") {
                    savedTo = states[4];
                    doGet("/getUserOtherProductDetails", {id: states[3], from: savedTo}, function (resp) {
                        if (resp.status == 200) {
                            savedProductId = resp.product.id;
                            savedImageUrl = resp.product.image_url;
                            currentDesign = resp.product.base_design_id;
                            savedItemSettings = resp.settings;
                            if (currentDesign == null) {
                                changeUrl((resp.product.user_logo_id ? resp.product.user_logo_id : "custom") + "/default");
                            } else {
                                changeUrl((resp.product.user_logo_id ? resp.product.user_logo_id : "custom") + "/" + currentDesign);
                            }
                        } else {
                            showToast("Error: " + resp.msg);
                            console.log(resp);
                        }
                    }, function (err) {
                        showToast("Communication failure!!!");
                        console.log(err);
                    });
                } else {
                    if (states[4]) {
                        _step4Tasks(states);
                    } else if (states[3]) {
                        if (states[3] == "choose-design") {
                            _step5Tasks(states);
                        } else if (states[3] == "default") {
                            _step2Tasks(states);
                        } else {
                            _step2Tasks(states);
                        }
                    } else if (states[2]) {
                        changeUrl(states[2] + "/choose-design");
                    } else {
                        _step1Tasks(states);
                    }
                }
            }
        }
    }

    function init() {
        doGet("/getOtherProductDetails?id=" + otherProductId, {}, function (resp) {
            if (resp.status == 200) {
                frontParams = resp.details.front_logo_params.split(";");
                backParams = resp.details.back_logo_params.split(";");
                frontBaseParams = resp.details.base_params_front.split(";");
                backBaseParams = resp.details.base_params_back.split(";");
            } else {
                console.log(resp);
                bootbox.alert("Error: " + resp.msg);
            }
        }, function (err) {
            console.log(err);
            bootbox.alert("Communication Error!!");
        });
        $('#customLogoUpload').on('change', function handleFileSelect(evt) {
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                var file = evt.target.files[0];
                var reader = new FileReader();
                if (file) {
                    addWaitingOverlay();
                    reader.readAsDataURL(file);
                }
                reader.addEventListener("load", function () {
                    removeWaitingOverlay();
                    customLogoImage = reader.result;
                    savedImageUrl = undefined;
                    changeUrl("custom/choose-design");
                }, false);
            } else {
                alert('The File APIs are not fully supported in this browser.');
            }
        });

        $("#btnBackStep2").click(function () {
            var arr = window.location.pathname.split("/");
            if ($(".designs-list").children().size() == 0) {
                changeUrl("");
            } else {
                changeUrl(arr[arr.length - 2] + "/choose-design");
            }
        });
        $("#btnBackStep5").click(function () {
            changeUrl("");
        });
        $("#btnSaveStep2").click(function () {
            var arr = window.location.pathname.split("/").splice(3, 2);
            changeUrl(arr.join("/") + "/settings");
        });
        $("#addToCartBtn").click(function (e) {
            e.preventDefault
            $("#btnNextStep3").trigger("click");
        });
        $("#btnBackStepSettings").click(function (e) {
            e.preventDefault
            $("#btnBackStep3").trigger("click");
        })
        $("#editBtnLink").click(function () {
            $("#btnBackStep3").trigger("click");
        });
        $("body").mousedown(function () {
            $("#zoomPreviewDiv").hide();
        })
        $("#previewBtnLink").click(function () {
            window.editorFrame.getAsJPGDataUrl(1500, function (data) {
                $("#canvasBgPreview").remove();
                $("#bottomIframeContainer").append('<iframe class="small" src="/product-preview/big-preview.html" id="canvasBgPreview"></iframe>');
                $("#canvasBgPreview").on("load", function () {
                    var newWindow = $("#canvasBgPreview")[0].contentWindow;
                    window.addEventListener("message", function (event) {
                        $("#canvasBgPreview").height(event.data.height);
                        $("#canvasBgPreview").width(event.data.width);
                    }, false);
                    newWindow.initScalablePreview($, frontImage, data, frontParams, false, undefined, window); 
                });
            });
            //$("#canvasBgPreview").attr("src", "/product-preview/big-preview.html");
            /*
             $("#zoomPreviewDiv").show();
             window.editorFrame.getAsJPGDataUrl(1500, function (data) {
             var newWindow = $("#zoomPreviewDiv iframe")[0].contentWindow;
             window.addEventListener("message", function (event) {
             $("#zoomPreviewDiv iframe").height(event.data.height);
             $("#zoomPreviewDiv iframe").width(event.data.width);
             }, false);
             newWindow.initScalablePreview($, frontImage, data, frontParams, false, undefined, window);
             });
             */
            /*
             var expectedWidth = 600;
             var expectedHeight = 400;
             // Fits window in the center of screen
             var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
             var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
             
             var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
             var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
             
             var left = ((width / 2) - (expectedWidth / 2)) + dualScreenLeft;
             var top = ((height / 2) - (expectedHeight / 2)) + dualScreenTop;
             var newWindow = window.open("/product-preview/big-preview.html", "", 'scrollbars=yes, width=' + expectedWidth + ', height=' + expectedHeight + ', top=' + top + ', left=' + left + ",location=no,menubar=no,status=no,toolbar=no,resizable=0");
             newWindow.onload = function () {
             window.editorFrame.getAsJPGDataUrl(150, function (data) {
             newWindow.initScalablePreview($, frontImage, data, frontParams);
             });
             }
             */
        });
        $("#btnNextStep3").click(function () {
            currentSettingPage++;
            if ($("[data-page=" + currentSettingPage + "]").length > 0) {
                $("[data-page=" + currentSettingPage + "]").click();
            } else {
                currentSettingPage--;
                var settingsCtrl = $(".settingControl");
                var settings = {};
                var failed = false;
                if (savedTo != "purchase") {
                    for (var i = 0; i < settingsCtrl.length; i++) {
                        var item = $(settingsCtrl[i]);
                        var settingId = item.attr("data-setting-id");
                        var type = item.attr("type") ? item.attr("type").toLowerCase() : "";
                        var control_type = item.attr("data-type")
                        if (settings[settingId] == undefined || (type == "checkbox" || control_type == "quantityWithSize")) {
                            var value;
                            var text;
                            if (type == "radio") {
                                value = $("[name=" + item.attr("name")).filter(':checked').val();
                                text = $("[name=" + item.attr("name")).filter(':checked').attr("data-value-label");
                            } else if (type == "color") {
                                if (!item.hasClass("active")) {
                                    continue;
                                } 
                                value = item.attr("data-setting-value");
                                text = $("[name=" + item.attr("name") + '].active').attr("data-value-label");
                            } else if (type == "checkbox") {
                                if (!item.is(":checked")) {
                                    continue;
                                }
                                value = settings[settingId] ? settings[settingId].value : [];
                                value.push(item.val());
                                text = settings[settingId] ? settings[settingId].text : [];
                                text.push(item.filter(':checked').attr("data-value-label"));
                            } else {
                                if (control_type == "quantityWithSize") {
                                    value = settings[settingId] ? settings[settingId].value : [];
                                    value.push(item.attr("data-setting-value") + "=" + item.val());
                                    text = settings[settingId] ? settings[settingId].text : [];
                                    text.push(item.attr("data-value-label"));
                                } else {
                                    value = item.val();
                                    text = item.children().filter("option:selected").text();
                                    if (control_type == "quantity") {
                                        if (!/^[0-9]+$/.test(value)) {
                                            value = false;
                                        }
                                    }
                                }
                            }
                            if (!value) {
                                bootbox.alert("Value is not properly filled for the field '" + item.attr("data-label") + "'");
                                failed = true;
                                break;
                            }
                            settings[settingId] = {
                                value: value,
                                text: text,
                                type: type
                            };
                        }
                    }
                }
                if (!failed) {
                    var designs = currentDesign.split(":");
                    var body = {
                        settings: settings,
                        product_id: otherProductId,
                        design_id: designs[1] == "default" ? null : designs[1],
                        saved_item_id: savedProductId,
                        user_logo_id: (designs[0] == "custom" || designs[0] == "null") ? null : designs[0],
                        svg_data: window.editorFrame.getSvgString(),
                        saved_to: savedTo,
                        url: savedImageUrl
                    }
                    var url = savedProductId ? "/updateUserOtherProduct" : "/addUserOtherProduct";
                    doPost(url, body, function (resp) {
                        if (resp.status == 200) {
                            var _finishSaveAction = function () {
                                if (savedTo != "purchase") {
                                    window.location = "/checkout"
                                } else {
                                    showToast("Modifications to the purchased item is finished.", "success");
                                }
                            };
                            addOtherProductToShoppingCart(resp.insertId || savedProductId, function () {
                                _finishSaveAction();
                            });
                        } else {
                            console.log(resp);
                            showToast('Error: ' + resp.msg);
                        }
                    }, function (err) {
                        console.log(err);
                        showToast("Communication failure!!");
                    });
                }
            }
        });
        $("#btnBackStep3").click(function () {
            if (currentSettingPage > 1) {
                currentSettingPage--;
                $("[data-page=" + currentSettingPage + "]").click();
            } else {
                var arr = window.location.pathname.split("/").splice(3, 3);
                arr.pop();
                changeUrl(arr.join("/"));
            }
        });
        urlChanged();
        addPopState(urlChanged);
    }

    function changeUrl(url) {
        var new_url = "other/" + location.pathname.split("/")[2] + "/" + url;
        pushState(new_url, "/" + new_url);
        urlChanged();
    }

    init();
});