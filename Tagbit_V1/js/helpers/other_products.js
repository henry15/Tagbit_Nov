
$(function () {
    var iframeData = {
        front: {
            fnCalls: [],
            window: undefined,
            selector: "#canvasBgFront",
            xselector: "#x_slider",
            yselector: "#y_slider"
        },
        back: {
            fnCalls: [],
            window: undefined,
            selector: "#canvasBgBack",
            xselector: "#x_slider1",
            yselector: "#y_slider1"
        }
    };

    var previewImage = "/img/previewLogo.jpg";

    var otherProductsFrontFile;
    var otherProductsBackFile;
    var frontLogoParams = [];
    var backLogoParams = [];
    //var deferredDesignToSave = [];
    //var deferredSettingToSave = [];
    var deferredPaymentSettingValues = [];
    var editingSettingId;
    var savedItemId;
    var frontFileName;
    var backFileName;
    var frontFileType;
    var backFileType;
    var forceRemoveFront;
    var forceRemoveBack;

    if (location.pathname == "/Logo/AddProduct") {
        $("#canvasBgFront").ready(function () {
            /* This has to be outside all functions */
            executeFrontDeffred(iframeData.front);
        });
        $("#canvasBgBack").ready(function () {
            /* This has to be outside all functions */
            executeFrontDeffred(iframeData.back);
        });
    }

    function init_list() {
        var tbl = $(".tblOtherProducts tbody");
        var _addEmptyItemsRow = function () {
            tbl.append('<td colspan="6">No other products!</td>');
        };
        doPost("/listOtherProducts", {}, function (resp) {
            if (resp.status == 200) {
                tbl.children().remove();
                if (resp.items.length > 0) {
                    for (var i = 0; i < resp.items.length; i++) {
                        var item = resp.items[i];
                        tbl.append("<tr id='otherProduct" + item.id + "'>" +
                                "<td>" + item.name + "</td>" +
                                "<td>" + item.description + "</td>" +
                                (item.base_image_url ? "<td><img src='/getOtherProductImage?id=" + encodeURIComponent(item.base_image_url) + "'/></td>" : "<td></td>") +
                                (item.base_image_back_url ? "<td><img src='/getOtherProductImage?id=" + encodeURIComponent(item.base_image_back_url) + "'/></td>" : "<td></td>") +
                                "<td>" +
                                "SEO Description: " + item.seo_description +
                                "<br />SEO Keywords: " + item.seo_keywords +
                                "<br />SEO Title: " + item.seo_title +
                                "<br />SEO URL: " + item.seo_url + "</td>" +
                                "<td>" + item.status + "</td>" +
                                "<td><a href='/other-products/add?id=" + item.id + "'>Edit</a> | <a href='#' class='deleteOtherItem' data-id='" + item.id + "'>Delete</a></td>" +
                                "</tr>");
                    }
                } else {
                    _addEmptyItemsRow();
                }
                $(".deleteOtherItem").click(function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var id = $(this).attr("data-id");
                    doPost('/removeOtherProduct', {id: id}, function (resp) {
                        if (resp.status == 200) {
                            showToast("Item successfully deleted.", "success");
                            $("#otherProduct" + id).remove();
                            if (tbl.children().length == 0) {
                                _addEmptyItemsRow();
                            }
                        } else {
                            console.log(resp);
                            showToast("Error: " + resp.msg);
                        }
                    }, function (err) {
                        console.log(err);
                        showToast("Error in connection.")
                    });
                });
            } else {
                _addEmptyItemsRow();
                console.log(resp);
                showToast("Error: " + resp.msg);
            }
        }, function (err) {
            console.log(err);
            showToast("Error in connection.")
        });
    }

    function addDesignFileToUI(contents, key) {
        $("#designPics").append("<div class='col-md-12 designDiv" + key + " designDiv' style='text-align: center'><img src='" + contents + "' style='padding: 3px;height: 100px'/><button data-contents='" + contents + "' class='btn btn-xs btn-danger previewBtn' style='position: absolute;top: 37%;left: 30%'>Use this for preview</button><button data-key='" + key + "' class='btn btn-xs btn-danger deleteBtn' style='position: absolute;top: 37%;left: 58%'>Remove</button></div>");
        $(".designDiv").mouseenter(function (e) {
            $(this).find("button").show();
            e.stopPropagation();
        });
        $(".designDiv").mouseleave(function (e) {
            $(this).find("button").hide();
            e.stopPropagation();
        });
        $(".previewBtn").off().click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            previewImage = $(this).attr("data-contents");
            previewImage = $(this).attr("data-contents");
            _draw();
        });
        $(".designDiv .deleteBtn").off().click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (savedItemId) {
                removeDesignFile($(this).attr("data-key"));
            } else {
                alert("Error 131.");
                //deferredDesignToSave[$(this).attr("data-key")].shouldDelete = true;
            }
            $(".designDiv" + $(this).attr("data-key")).remove();
        });
    }

    function init_editor() {
        //$("#tabs").tabs({
        //    heightStyle: "content"
        //});
        $('#designUploader').on('change', function (evt) {
            readFile(evt, false, function (contents, file) {
                if (file.type.indexOf("image") == -1) {
                    bootbox.alert("Please upload image files only.");
                } else {
                    var fileType = file.type.split("/").pop();
                    if (savedItemId) {
                        addDesignFile(contents, fileType, function (err, id) {
                            if (err) {
                                bootbox.alert("Error: " + err)
                            } else {
                                showToast("Successfully added design file.", "success");
                                addDesignFileToUI(contents, id);
                            }
                        });
                    } else {
                        alert("Error 158.");/*
                         addDesignFileToUI(contents, deferredDesignToSave.push({
                         data: contents,
                         fileType: fileType,
                         shouldDelete: false
                         }) - 1);*/
                    }
                }
            });
        }, false);
        //document.getElementById('frontProdImg').addEventListener('change', function (evt) {
            
        //    readFile(evt, false, function (contents, file) {
        //        otherProductsFrontFile = contents;
        //        frontFileType = file.type.split("/").pop();
        //        updateImageDiv(".canvasBgFront", iframeData.front, contents);
        //    });
        //}, false);
        //document.getElementById('backProdImg').addEventListener('change', function (evt) {
        //    console.log('imgselect');
        //    readFile(evt, false, function (contents, file) {
        //        otherProductsBackFile = contents;
        //        backFileType = file.type.split("/").pop();
        //        updateImageDiv(".canvasBgBack", iframeData.back, contents);
        //    });
        //}, false);

        $(".addNewDesignButton").click(function (e) {
            $("#designUploader").trigger("click");
            e.stopPropagation();
            e.preventDefault();
        });
        $(".addNewProductSetting").click(function (e) {
            e.preventDefault();
            $("#otherProductParamSettingName").val("");
            $("#settingType").val("Text");
            $("#valueList").children().remove();  
            var relatedSetting = $("#relatedSetting");
            relatedSetting.children().remove();
            doGetWithExtraParams("/getOtherProductSettings", {product_id: savedItemId}, {relatedSettingId: $(this).attr("data-related-setting-id")}, function (resp, exParams) {
                if (resp.status == 200) {
                    relatedSetting.append("<option value='null'>None</option>");
                    for (var i = 0; resp.settings && i < resp.settings.length; i++) {
                        if (resp.settings[i].id != editingSettingId) {
                            relatedSetting.append("<option value='" + resp.settings[i].id + "'>" + resp.settings[i].setting_name + "</option>");
                        }
                    } 
                } else {
                    console.log(resp);
                    showToast("Error: " + resp.msg)
                }
                removeWaitingOverlay();
            }, function (err) {
                removeWaitingOverlay();
                console.log(err);
                showToast("Error in connection.")
            });
            deferredPaymentSettingValues = [];
        });
        $("#newValueBtn").click(function (e) {
            e.preventDefault();
            var item = {
                value_label: "New Setting"
            };
            if (savedItemId && editingSettingId) {
                item.setting_id = editingSettingId;
                doPost("/addOtherProductSettingValue", item, function (resp) {
                    showToast("Setting value added!", "success");
                    item.id = resp.insertId;
                    addOtherProductSettingValueToUI(item);
                }, function (err) {
                    console.log(err);
                    showToast("Communication failure!!");
                });
            } else {
                addOtherProductSettingValueToUI(item);
            }
        });
        $('#newSettingModel').on('hidden.bs.modal', function (e) {
            $("#otherProductParamSettingName").val("");
            $("#otherProductParamSettingPage").val("");
            $("#valueList").children().remove();
            editingSettingId = undefined;
        }) 
        $("#addOtherProdSaveBtn").click(function (e) {
            e.preventDefault();
            if (savedItemId) {
                saveOtherProduct("/updateOtherProduct", {
                    frontFileType: frontFileType,
                    backFileType: backFileType,
                    id: savedItemId,
                    forceRemoveFront: forceRemoveFront,
                    forceRemoveBack: forceRemoveBack
                });
            } else {
                saveOtherProduct("/addOtherProduct", {
                    frontFileType: frontFileType,
                    backFileType: backFileType
                }, function (err, id) {
                    if (!err) {
                        window.location = "/other-products/add?id=" + id;/*
                         var errOccurred = false;
                         var i = 0;
                         var _saveDefferedDesign = function () {
                         if (i < deferredDesignToSave.length) {
                         var item = deferredDesignToSave[i];
                         if (item.shouldDelete == false) {
                         addDesignFile(item.data, item.fileType, function (err) {
                         if (err) {
                         errOccurred = true;
                         }
                         i++;
                         _saveDefferedDesign();
                         });
                         } else {
                         i++;
                         _saveDefferedDesign();
                         }
                         } else {
                         if (errOccurred) {
                         bootbox.alert("Error occurred while saving some design files!", function () {
                         window.location = "?id=" + savedItemId;
                         });
                         }
                         }
                         };
                         _saveDefferedDesign();
                         i = 0;
                         errOccurred = false;
                         var _saveDefferedSetting = function () {
                         if (i < deferredSettingToSave.length) {
                         var item = deferredSettingToSave[i];
                         if (!item.shouldDelete) {
                         item.product_id = savedItemId;
                         item.index = i;
                         saveOtherProductSetting(item, function (err) {
                         if (err) {
                         errOccurred = true;
                         }
                         i++;
                         _saveDefferedSetting();
                         });
                         } else {
                         i++;
                         _saveDefferedSetting();
                         }
                         } else {
                         if (errOccurred) {
                         bootbox.alert("Error occurred while saving some settings!", function () {
                         window.location = "?id=" + savedItemId;
                         });
                         }
                         }
                         };
                         _saveDefferedSetting();
                         */
                    }
                });
            }
        });
        $("#x_slider,#x_slider1").slider({
            value: 62,
            min: 0,
            max: 1000,
            step: 1,
            change: _draw,
            slide: _draw
        });
        $("#y_slider,#y_slider1").slider({
            value: 56,
            min: 0,
            max: 1000,
            step: 1,
            change: _draw,
            slide: _draw
        });
        $("#width_slider").slider({
            value: 127,
            min: 0,
            max: 1000,
            step: 1,
            change: function () {
                $("#rwidth_slider").slider({value: $(this).slider('value')});
                $("#height_slider").slider({value: $(this).slider('value')});
            },
            slide: function () {
                $("#rwidth_slider").slider({value: $(this).slider('value')});
                $("#height_slider").slider({value: $(this).slider('value')});
            }
        });
        $("#width_slider1").slider({
            value: 127,
            min: 0,
            max: 1000,
            step: 1,
            change: function () {
                $("#rwidth_slider1").slider({value: $(this).slider('value')});
                $("#height_slider1").slider({value: $(this).slider('value')});
            },
            slide: function () {
                $("#rwidth_slider1").slider({value: $(this).slider('value')});
                $("#height_slider1").slider({value: $(this).slider('value')});
            }
        });
        $("#amplitude_slider,#amplitude_slider1").slider({
            value: 0,
            min: 0,
            max: 1000,
            step: 1,
            change: _draw,
            slide: _draw
        });
        $("#rwidth_slider,#rwidth_slider1").slider({
            value: 127,
            min: 0,
            max: 1000,
            step: 1,
            change: _draw,
            slide: _draw
        });
        $("#height_slider,#height_slider1").slider({
            value: 127,
            min: 0,
            max: 1000,
            step: 1,
            change: _draw,
            slide: _draw
        });
        $("#crop_slider,#crop_slider1").slider({
            value: 0,
            min: 0,
            max: 1000,
            step: 1,
            change: _draw,
            slide: _draw
        });
        $("#crop_left_slider,#crop_left_slider1").slider({
            value: 0,
            min: 0,
            max: 1000,
            step: 1,
            change: _draw,
            slide: _draw
        });
        $("#crop_right_slider,#crop_right_slider1").slider({
            value: 0,
            min: 0,
            max: 1000,
            step: 1,
            change: _draw,
            slide: _draw
        });
        $("#rotate_slider,#rotate_slider1").slider({
            value: 0,
            min: 0,
            max: 360,
            step: 1,
            change: _draw,
            slide: _draw
        });
        _draw();
        $("#saveProductParam").click(function (e) {
            var otherProductItem = {
                setting_name: $("#otherProductParamSettingName").val(),
                page_number: $("#otherProductParamSettingPage").val(),
                control_type: $("#settingType").val(),
                related_setting: $("#relatedSetting").val() == "null" ? null : $("#relatedSetting").val(),
                setting_values: deferredPaymentSettingValues,
                independent_pricing: $("#independentPricing").prop("checked")
            };
            if (savedItemId) {
                otherProductItem.product_id = savedItemId;
                addOtherProductSetting(otherProductItem, function (err, id) {
                    if (err) {
                        bootbox.alert("Error: " + err);
                    } else {
                        showToast("Successfully saved product params.", "success");
                        if (editingSettingId) {
                            updateOtherProductSettingToUI(otherProductItem);
                        } else {
                            addOtherProductSettingToUI(otherProductItem);
                        }
                        $("#newSettingModel").modal('hide');
                    }
                });
            } else {
                alert("Error 422");
                /*
                 if (editingSettingId != undefined) {
                 updateOtherProductSettingToUI(otherProductItem, editingSettingId);
                 } else {
                 addOtherProductSettingToUI(otherProductItem, deferredSettingToSave.push(otherProductItem) - 1);
                 }
                 $("#newSettingModel").modal('hide');
                 */
            }
        });
        $(".removeFrontBtn").click(function (e) {
            e.preventDefault();
            forceRemoveFront = true;
            otherProductsFrontFile = undefined;
            frontLogoParams = undefined;
            $("#frontProdImg").val(null);
            callDeferredIframeFn(iframeData.front, "setImage", [undefined]);
            _draw();
            showToast("Front Image Removed. Please save the product.", "warning");
            $("#canvasBgFront").hide();
        });
        $(".removeBackBtn").click(function (e) {
            e.preventDefault();
            forceRemoveBack = true;
            otherProductsBackFile = undefined;
            backLogoParams = undefined;
            $("#backProdImg").val(null);
            callDeferredIframeFn(iframeData.back, "setImage", [undefined]);
            _draw();
            showToast("Back Image Removed. Please save the product.", "warning");
            $("#canvasBgBack").hide();
        });
        var itemId = getURLParameterByName("id");
        //if (itemId) {
        if (true) {
            $("#saveProductWarning").hide();
            $("#productParamsDiv").show();
            addWaitingOverlay();
            doPost("/getOtherProductDetails", {id: itemId}, function (resp) {
                removeWaitingOverlay();
                if (resp.status == 200) {
                    frontLogoParams = resp.item.front_logo_params.split(";");
                    backLogoParams = resp.item.back_logo_params.split(";");
                    savedItemId = resp.item.id;
                    $("#addOtherProdName").val(resp.item.name);
                    $("#addOtherProdCategory").val(resp.item.category);
                    $("#addOtherProdDesc").val(resp.item.description);
                    $("#addOtherProdStatus").val(resp.item.status);
                    $("#addOtherProdSeoUrl").val(resp.item.seo_url);
                    $("#addOtherProdSeoTitle").val(resp.item.seo_title);
                    $("#addOtherProdSeoDesc").val(resp.item.seo_description);
                    $("#addOtherProdSeoKeyword").val(resp.item.seo_keywords);

                    $("#x_slider").slider({"value": frontLogoParams[0]});
                    $("#y_slider").slider({"value": frontLogoParams[1]});
                    $("#amplitude_slider").slider({"value": frontLogoParams[2]});
                    $("#crop_slider").slider({"value": frontLogoParams[3]});
                    //---
                    $("#crop_left_slider").slider({"value": frontLogoParams[4]});
                    $("#crop_right_slider").slider({"value": frontLogoParams[5]});
                    //---
                    $("#rotate_slider").slider({"value": frontLogoParams[6]});
                    $("#rwidth_slider").slider({"value": frontLogoParams[7]});
                    $("#height_slider").slider({"value": frontLogoParams[8]});

                    $("#x_slider1").slider({"value": backLogoParams[0]});
                    $("#y_slider1").slider({"value": backLogoParams[1]});
                    $("#amplitude_slider1").slider({"value": backLogoParams[2]});
                    $("#crop_slider1").slider({"value": backLogoParams[3]});
                    //---
                    $("#crop_left_slider1").slider({"value": backLogoParams[4]});
                    $("#crop_right_slider1").slider({"value": backLogoParams[5]});
                    //---
                    $("#rotate_slider1").slider({"value": backLogoParams[6]});
                    $("#rwidth_slider1").slider({"value": backLogoParams[7]});
                    $("#height_slider1").slider({"value": backLogoParams[8]});

                    if (resp.item.base_image_url) {
                        updateImageDiv(".canvasBgFront", iframeData.front, "/getOtherProductImage?id=" + resp.item.base_image_url);
                    }
                    if (resp.item.base_image_back_url) {
                        updateImageDiv(".canvasBgBack", iframeData.back, "/getOtherProductImage?id=" + resp.item.base_image_back_url);
                    }
                    if (resp.designs) {
                        for (var j = 0; j < resp.designs.length; j++) {
                            addDesignFileToUI("/getOtherProductDesignImage?url=" + resp.designs[j].design_file, resp.designs[j].id);
                        }
                    }
                    _draw();
                } else {
                    console.log(resp);
                    showToast("Error: " + resp.msg);
                }
            }, function (err) {
                console.log(err);
                showToast("Error in connection.");
                removeWaitingOverlay();
            });
            getOtherProductSettings(itemId);
        } else {
            $("#saveProductWarning").show();
            $("#productParamsDiv").hide();
        }
        $('[data-toggle="tooltip"]').tooltip();
    }
    
    function getOtherProductSettings(itemId){
        addWaitingOverlay();
        $("#otherProductSettings").empty()
        doGet("/getOtherProductSettings", {product_id: itemId}, function (resp) {
            for (var i = 0; resp.settings && i < resp.settings.length; i++) {
                var setting = resp.settings[i];
                addOtherProductSettingToUI(setting);
            }
            removeWaitingOverlay();
        }, function (err) {
            removeWaitingOverlay();
            console.log(err);
            showToast("Error in connection.")
        }); 
    }

    function addOtherProductSetting(item, callback) {
        item.setting_id = editingSettingId;
        if (item.setting_id) {
            delete item.setting_values;
            delete item.product_id;
            addWaitingOverlay();
            doPost("/updateOtherProductSettings", item, function (resp) {
                removeWaitingOverlay();
                callback(undefined, item.id, item.order);
            }, function (err) {
                callback(err);
                removeWaitingOverlay();
                console.log(err);
                showToast("Error in connection.");
            });
        } else {
            addWaitingOverlay();
            doPost("/addOtherProductSetting", item, function (resp) {
                removeWaitingOverlay();
                callback(undefined, resp.insertId, item.order)
            }, function (err) {
                removeWaitingOverlay();
                console.log(err);
                showToast("Error in connection.");
            });
        }
    }

    function removeDesignFile(id) {
        doPost("/removeDesign", {id: id}, function (resp) {
            if (resp.status == 200) {
                showToast("Successfully removed design file.", "success");
            } else {
                console.log(resp);
                showToast("Error: " + resp.msg);
            }
        }, function (err) {
            console.log(err);
            showToast("Connection Error!!!");
        });
    }

    function addDesignFile(fileContents, fileType, callback) {
        addWaitingOverlay();
        doPost("/addDesign", {id: savedItemId, fileType: fileType, design: fileContents.substr(fileContents.indexOf(",") + 1)}, function (resp) {
            if (resp.status == 200) {
                callback ? callback(undefined, resp.id) : $.noop();
            } else {
                console.log(resp);
                callback ? callback(resp.msg) : $.noop();
            }
            removeWaitingOverlay();
        }, function (err) {
            removeWaitingOverlay();
            console.log(err);
            callback ? callback("Connection Error!!!") : $.noop();
        });
    }

    function updateImageDiv(divSelector, frame, contents) {
        $(divSelector).show();
        callDeferredIframeFn(frame, "setImage", [contents]);
        $(frame.selector).show();
        _draw();
    }

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
                    }, frame.xselector, frame.yselector);
                }
                executeFrontDeffred(frame);
            }, 1000);
        }
    }

    function _draw() {
        callDeferredIframeFn(iframeData.front, "draw", [previewImage,
            $("#x_slider").slider("value"),
            $("#y_slider").slider("value"),
            $("#amplitude_slider").slider("value"),
            $("#crop_slider").slider("value"),
            $("#crop_left_slider").slider("value"),
            $("#crop_right_slider").slider("value"),
            $("#rotate_slider").slider("value"),
            $("#rwidth_slider").slider("value"),
            $("#height_slider").slider("value")
        ]);
        $("#frontX").text($("#x_slider").slider("value"));
        $("#frontY").text($("#y_slider").slider("value"));
        $("#frontWidth").text($("#width_slider").slider("value"));
        $("#frontCurve").text($("#amplitude_slider").slider("value"));
        $("#frontCrop").text($("#crop_slider").slider("value"));


        $("#frontRWidth").text($("#rwidth_slider").slider("value"));
        $("#frontHeight").text($("#height_slider").slider("value"));

        $("#backRWidth").text($("#rwidth_slider1").slider("value"));
        $("#backHeight").text($("#height_slider1").slider("value"));

        $("#frontLeftCrop").text($("#crop_left_slider").slider("value"));
        $("#frontRightCrop").text($("#crop_right_slider").slider("value"));
        $("#frontRotate").text($("#rotate_slider").slider("value"));
        callDeferredIframeFn(iframeData.back, "draw", ["/img/previewLogo.jpg",
            $("#x_slider1").slider("value"),
            $("#y_slider1").slider("value"),
            $("#amplitude_slider1").slider("value"),
            $("#crop_slider1").slider("value"),
            $("#crop_left_slider1").slider("value"),
            $("#crop_right_slider1").slider("value"),
            $("#rotate_slider1").slider("value"),
            $("#rwidth_slider1").slider("value"),
            $("#height_slider1").slider("value")
        ]);
        $("#backX").text($("#x_slider1").slider("value"));
        $("#backY").text($("#y_slider1").slider("value"));
        $("#backWidth").text($("#width_slider1").slider("value"));
        $("#backCurve").text($("#amplitude_slider1").slider("value"));
        $("#backCrop").text($("#crop_slider1").slider("value"));
        $("#backLeftCrop").text($("#crop_left_slider1").slider("value"));
        $("#backRightCrop").text($("#crop_right_slider1").slider("value"));
        $("#backRotate").text($("#rotate_slider1").slider("value"));
    }

    function saveOtherProduct(url, details, callback) {
        callDeferredIframeFn(iframeData.front, "getParams", [function (frontLogoParams) {
                callDeferredIframeFn(iframeData.back, "getParams", [function (backLogoParams) {
                        if (!details) {
                            details = {};
                        }
                        if (!$("#addOtherProdName").val()) {
                            bootbox.alert("Name required!!");
                            return;
                        }
                        if ((!otherProductsFrontFile && !details.id) || forceRemoveFront) {
                            bootbox.alert("Front file required!!");
                            return;
                        }
                        if (!$("#addOtherProdSeoUrl").val()) {
                            bootbox.alert("SEO URL required!!");
                            return;
                        }
                        addWaitingOverlay();
                        doPost(url, {
                            name: $("#addOtherProdName").val(),
                            category: $("#addOtherProdCategory").val(),
                            description: $("#addOtherProdDesc").val(),
                            status: $("#addOtherProdStatus").val(),
                            seo_url: $("#addOtherProdSeoUrl").val(),
                            seo_title: $("#addOtherProdSeoTitle").val(),
                            seo_description: $("#addOtherProdSeoDesc").val(),
                            seo_keywords: $("#addOtherProdSeoKeyword").val(),
                            base_image_url: otherProductsFrontFile ? otherProductsFrontFile.substr(otherProductsFrontFile.indexOf(",") + 1) : otherProductsFrontFile,
                            base_image_back_url: otherProductsBackFile ? otherProductsBackFile.substr(otherProductsBackFile.indexOf(",") + 1) : otherProductsBackFile,
                            front_logo_params: frontLogoParams.join(";"),
                            back_logo_params: backLogoParams.join(";"),
                            frontFileType: details.frontFileType,
                            backFileType: details.backFileType,
                            frontFileName: frontFileName,
                            backFileName: backFileName,
                            forceRemoveFront: details.forceRemoveFront,
                            forceRemoveBack: details.forceRemoveBack,
                            id: details.id,
                            base_params_front: [$("#canvasBgFront").height(), $("#canvasBgFront").width()].join(";"),
                            base_params_back: [$("#canvasBgBack").height(), $("#canvasBgBack").width()].join(";")
                        }, function (resp) {
                            removeWaitingOverlay();
                            if (resp.status == 200) {
                                frontFileName = resp.frontFileName;
                                backFileName = resp.backFileName;
                                savedItemId = resp.itemId;
                                otherProductsFrontFile = undefined;
                                otherProductsBackFile = undefined;
                                callback ? callback(undefined, resp.insertId) : $.noop();
                                showToast("Product saved!", "success");
                                window.location = "/other-products/list";
                            } else {
                                console.log(resp);
                                showToast("Error: " + resp.msg);
                            }
                        }, function (err) {
                            removeWaitingOverlay();
                            console.log(err);
                            showToast("Error in connection.");
                            callback ? callback(err) : $.noop();
                        });
                    }
                ]);
            }
        ]);
    }

    function saveOtherProductSetting(item, callback) {
        doPost("/addOtherProductSetting", item, function (resp) {
            var item = $("#productSetting_" + resp.index);
            item.find(".editSetting").attr("data-id", resp.insertId);
            item.find(".editSetting").attr("data-setting-product-id", savedItemId);
            if (resp.status == 200) {
                callback ? callback(undefined, resp.id) : $.noop();
            } else {
                console.log(resp);
                callback ? callback(resp.msg) : $.noop();
            }
        }, function (err) {
            console.log(err);
            callback ? callback("Connection Error!!!") : $.noop();
        });
    }

    function updateOtherProductSettingToUI(item, key) {
        var elem;
        if (key) {
            elem = $("#productSetting_" + key);
        } else {
            elem = $("#productSetting_" + item.setting_id);
        }
        elem.find(".pageNumber").text(item.page_number);
        elem.find(".settingName").text(item.setting_name);
        elem.find(".controlType").text(item.control_type);
        var editElem = elem.find(".editSetting");
        editElem.attr("data-setting-page-num", item.page_number);
        editElem.attr("data-setting-control-type", item.control_type);
        editElem.attr("data-setting-name", item.setting_name);
        editElem.attr("data-independent", item.independent_pricing ? "1" : "0");
        editElem.attr("data-related-setting-id", item.related_setting);
    }

    function addOtherProductSettingToUI(item, key) {
        $("#otherProductSettings").append("<tr id='productSetting_" + (key != undefined ? key : item.id) + "'>\n\
            <td class='col-md-1 pageNumber'>" + item.page_number + "</td>\n\
            <td class='col-md-4 settingName'>" + item.setting_name + "</td>\n\
            <td class='col-md-4 controlType'>" + item.control_type + "</td>\n\
            <td class='col-md-3'>\n\
            <i data-toggle='tooltip' title='Edit Setting' class='fa fa-pencil-square-o editSetting' data-setting-name='" + item.setting_name + "' data-setting-control-type='" + item.control_type + "' data-setting-page-num='" + item.page_number + "' data-related-setting-id='" + item.related_setting + "' data-setting-product-id='" + item.product_id + "' data-independent='" + item.independent_pricing + "' data-id='" + item.id + "' data-index='" + key + "'></i> | \n\
            <i data-toggle='tooltip' title='Delete Setting' class='fa fa-trash-o deleteSetting' data-setting-id='" + item.product_id + "' data-id='" + item.id + "' data-index='" + key + "'></i> | \n\
            <i data-toggle='tooltip' title='Move Up' class='fa fa-arrow-up moveUp' data-item-order='" + item.item_order + "' data-setting-id='" + item.product_id + "' data-id='" + item.id + "' data-index='" + key + "'></i>\n\
            <i data-toggle='tooltip' title='Move Down' class='fa fa-arrow-down moveDown' data-item-order='" + item.item_order + "' data-setting-id='" + item.product_id + "' data-id='" + item.id + "' data-index='" + key + "'></i>\n\
            </td></tr>");
        $(".deleteSetting").off().click(function () {
            if (confirm("Are you sure?")) {
                var id = $(this).attr("data-id");
                var obj = $(this).parent().parent();
                if (id == "undefined") {  
                    alert("Error 797");
                    /*
                    var idx = $(this).attr("data-index");
                    deferredSettingToSave[idx].shouldDelete = true;
                    obj.remove();
                    */
                } else {
                    addWaitingOverlay();
                    doPost("/deleteOtherProductSettings", {id: id}, function (resp) {
                        removeWaitingOverlay();
                        if (resp.status == 200) {
                            showToast("Successfully Deleted!!!", "success");
                            obj.remove();
                        } else {
                            console.log(resp);
                            showToast("Error: " + resp.msg);
                        }
                    }, function (err) {
                        console.log(err);
                        showToast("Communication failure.");
                        removeWaitingOverlay();
                    })
                }
            }
        });
        $(".editSetting").off().click(function () {
            $("#otherProductParamSettingName").val($(this).attr("data-setting-name"));
            $("#settingType").val($(this).attr("data-setting-control-type"));
            $("#otherProductParamSettingPage").val($(this).attr("data-setting-page-num"));
            if ($(this).attr("data-independent") != "0") {
                $("#independentPricing").prop("checked", true);
            }
            if (savedItemId) {
                editingSettingId = $(this).attr("data-id");
                addWaitingOverlay();
                var relatedSetting = $("#relatedSetting");
                relatedSetting.children().remove();
                doGetWithExtraParams("/getOtherProductSettings", {product_id: savedItemId}, {relatedSettingId: $(this).attr("data-related-setting-id")}, function (resp, exParams) {
                    if (resp.status == 200) {
                        relatedSetting.append("<option value='null'>None</option>");
                        for (var i = 0; resp.settings && i < resp.settings.length; i++) {
                            if (resp.settings[i].id != editingSettingId) {
                                relatedSetting.append("<option value='" + resp.settings[i].id + "'>" + resp.settings[i].setting_name + "</option>");
                            }
                        }
                        relatedSetting.val(exParams.relatedSettingId);
                    } else {
                        console.log(err);
                        showToast("Error: " + resp.msg)
                    }
                    removeWaitingOverlay();
                }, function (err) {
                    removeWaitingOverlay();
                    console.log(err);
                    showToast("Error in connection.")
                });
                addWaitingOverlay();
                doGet("/getOtherProductSettingsValues", {setting_id: $(this).attr("data-id")}, function (resp) {
                    removeWaitingOverlay();
                    if (resp.status == 200) {
                        $("#newSettingModel").modal('show');
                        $("#valueList").children().remove();
                        for (var i = 0; i < resp.values.length; i++) {
                            addOtherProductSettingValueToUI(resp.values[i]);
                        }
                    } else {
                        console.log(resp);
                        showToast("Error: " + resp.msg);
                    }
                }, function (err) {
                    console.log(err);
                    showToast("Communication failure.");
                    removeWaitingOverlay();
                });
            } else {
                alert("Error 872");
                /*
                editingSettingId = $(this).attr("data-index");
                var values = deferredSettingToSave[$(this).attr("data-index")].setting_values;
                for (var i = 0; values && i < values.length; i++) {
                    addOtherProductSettingValueToUI(values[i], i);
                }
                $("#newSettingModel").modal('show');
                */
            }
        }); 
        $(".moveUp").off().click(function () { 
            addWaitingOverlay();
            doPost("/changeOrder", {current_order: $(this).attr("data-item-order"), direction: 'up', item_id: $(this).attr("data-id"), productId: savedItemId}, function (resp){
                getOtherProductSettings(savedItemId);
                removeWaitingOverlay();
            }, function (err){ 
                console.log(err);
                removeWaitingOverlay();
                showToast("Communication failure!!");
            });
        });
        $(".moveDown").off().click(function () {
            addWaitingOverlay();
            doPost("/changeOrder", {current_order: $(this).attr("data-item-order"), direction: 'down', item_id: $(this).attr("data-id"), productId: savedItemId}, function (resp){
                removeWaitingOverlay();
                getOtherProductSettings(savedItemId);
            }, function (err){ 
                console.log(err);
                removeWaitingOverlay();
                showToast("Communication failure!!");
            });
        });
        $("#newSettingModel").modal('hide');
        $('[data-toggle="tooltip"]').tooltip();
    }

    function addOtherProductSettingValueToUI(item, useIndex) {
        if (useIndex == undefined) {
            item.index = deferredPaymentSettingValues.push(item) - 1;
        }
        $("#valueList").append("<tr id='defferedPaymentSetting" + item.index + "'>\
                <td contentEditable='true' data-setting-id='" + item.setting_id + "' data-id='" + item.id + "' data-idx='" + item.index + "' class='settingsTxtBox settingLabelText'>" + (item.value_label ? item.value_label : "") + "</td>\
                <td><span class='link deleteBtn' data-idx='" + item.index + "' data-id='" + item.id + "'>Delete</span></td>\
                </tr>");
        $(".settingLabelText").off().blur(function (e) {
            e.stopPropagation();
            if (savedItemId && editingSettingId) {
                addWaitingOverlay();
                doPost("/updateOtherProductSettingValue", {value_label: $(this).text(), id: $(this).attr("data-id")}, function (resp) {
                    if (resp.status == 200) {
                        showToast("Setting value updated!", "success");
                    } else {
                        console.log(resp);
                        showToast("Error: " + resp.msg);
                    }
                    removeWaitingOverlay();
                }, function (err) {
                    console.log(err);
                    removeWaitingOverlay();
                    showToast("Communication failure!!");
                });
            } else {
                var idx = $(this).attr("data-idx");
                deferredPaymentSettingValues[idx].value_label = $(this).text();
            }
        });
        $(".deleteBtn").off().click(function (e) {
            e.stopPropagation();
            if (confirm("Are you sure?")) {
                var item = $(this).attr("data-id");
                if (item == "undefined") {
                    var idx = $(this).attr("data-idx");
                    deferredPaymentSettingValues.splice(idx, 1);
                    $("#defferedPaymentSetting" + idx).remove();
                } else {
                    addWaitingOverlay();
                    doPost("/deleteOtherProductSettingValues", {id: item}, function (resp) {
                        removeWaitingOverlay();
                        if (resp.status == 200) {
                            $("[data-id=" + item + "]").parent().remove();
                            showToast("Successfully deleted", "success");
                        } else {
                            console.log(resp);
                            showToast("Error: " + resp.msg);
                        }
                    }, function (err) {
                        removeWaitingOverlay();
                        console.log(err);
                        showToast("Communication failure!!");
                    })
                }
            }
        });
    }

    if (location.pathname == "/other-products/add") {
       // init_editor();
    } else {
       // init_list();
    }

    init_editor();
});
