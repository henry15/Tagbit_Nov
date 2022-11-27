
var logoId, cardId, categoryId;
$(function () {
    var fileContents;
    var frontOfFile, backOfFile;

    function init() {
        $('#addLogoModal').on('hidden.bs.modal', function () {
            $('#addLogoCategoryName').select2("val", "");
            $('#addLogoTitle').val("");
            $('#addLogoDesc').val("");
            $('#addLogoUrl').val("");
            $('#addLogoSeoTitle').val("");
            $('#addLogoSeoDescription').val("");
            $('#addLogoSeoKeywords').val("");
            $('#logoFile').val("");
            logoId = undefined;
        });
        $('#addCardModal').on('hidden.bs.modal', function () {
            $('#addBCCategoryName').select2("val", "");
            $('#addBCTitle').val("");
            $('#addBCDesc').val("");
            $('#frontCard').val("");
            $('#backCard').val("");
            $("#addBCSeoTitle").val("");
            $("#addBCSeoDescription").val("");
            $("#addBCSeoKeyword").val("");
            cardId = undefined;
        });
        $('#addCategoryModal').on('hidden.bs.modal', function () {
            $('#addCatCategoryKeyWord').select2("val", "");
            $('#addCatCategoryName').val("");
            $('#addCatCategoryDesc').val("");
            $('#addCatCategoryUrl').val("");
            $('#addCatCategorySeoTitle').val("");
            $('#addCatCategorySeoDesc').val("");
            $('#addCatCategorySeoKeyword').val("");
            categoryId = undefined;
        });
        $('#addCatCategoryKeyWord').select2({
            tags: [],
            tokenSeparators: [',', ' ']
        });
        setupAddDialogs();
        doPost("/listCategories", {}, function (resp) {
            if (resp.status == 200) {
                if (typeof initCategorieListing != "undefined") {
                    initCategorieListing(resp);
                }
                $("#addBCCategoryName").empty();
                $("#addLogoCategoryName").empty();
                for (var i = 0; i < resp.categories.length; i++) {
                    if (i < 10) {
                        addCategoryTableRow(resp.categories[i].id, resp.categories[i].category_name, resp.categories[i].category_desc, resp.categories[i].url, false);
                    }
                    if (resp.categories[i].logo_category == true) {
                        $("#addLogoCategoryName").append("<option value='" + resp.categories[i].id + "'>" + resp.categories[i].category_name + "</option>");
                    }
                    if (resp.categories[i].card_category == true) {
                        $("#addBCCategoryName").append("<option value='" + resp.categories[i].id + "'>" + resp.categories[i].category_name + "</option>");
                    }
                    if (resp.categories[i].other_category == true) {
                        $("#addOtherProdCategory").append("<option value='" + resp.categories[i].id + "'>" + resp.categories[i].category_name + "</option>");
                    }
                }
                $("#addBCCategoryName").select2();
                $("#addLogoCategoryName").select2();
                $('[data-toggle="tooltip"]').tooltip();
            } else if (resp.status == 201) {
                $(".tblCategories").append("<tr class='no-categories'><td colspan='3'>No categories available.</td></tr>");
            } else {
                console.log(resp);
                bootbox.alert("Can't list categories.");
            }
        });
        doPost("/listCards", {start: 0}, function (resp) {
            if (resp.status == 200) {
                for (var i = 0; i < resp.cards.length; i++) {
                    addCardToTables(resp.cards[i].id, resp.cards[i].category_name, resp.cards[i].s3_front_card_url, resp.cards[i].s3_back_card_url, resp.cards[i].title, resp.cards[i].desc);
                }
            } else if (resp.status == 201) {
                if ($(".cardsContainer").children().length <= 1) {
                    $(".cardsContainer").append("<span class='no-cards'>No cards available.</span>");
                }
            } else {
                console.log(resp);
                bootbox.alert("Can't list cards.");
            }
        });
        doPost("/listLogos", {start: 0}, function (resp) {
            if (resp.status == 200) {
                for (var i = 0; i < resp.logos.length; i++) {
                    addLogoToTables(resp.logos[i].id, resp.logos[i].categories, resp.logos[i].s3_logo_url, resp.logos[i].title, resp.logos[i].desc, resp.logos[i].status, false);
                }
            } else if (resp.status == 201) {
                if ($(".logosContainer").children().length <= 1) {
                    $(".logosContainer").append("<span class='no-logos'>No logos available.</span>");
                }
            } else {
                console.log(resp);
                bootbox.alert("Can't list logos.");
            }
        });
    }

    function setupAddDialogs() {
        $(".addCardBtn").click(function (e) {
            e.preventDefault();
            var fnAddCard = function (url) {
                var _fnAddCard = function () {
                    addWaitingOverlay();
                    doPost(url, {
                        id: cardId,
                        category_ids: $("#addBCCategoryName").val(),
                        frontCard: frontOfFile,
                        backCard: backOfFile,
                        title: $("#addBCTitle").val(),
                        desc: $("#addBCDesc").val(),
                        url: $("#addBCUrl").val(),
                        seoTitle: $("#addBCSeoTitle").val(),
                        seoDescription: $("#addBCSeoDescription").val(),
                        seoKeyword: $("#addBCSeoKeyword").val()
                    }, function (resp) {
                        removeWaitingOverlay();
                        if (resp.status == 200) {
                            $(".dashboardCardTableItem:last").remove();
                            addCardToTables(resp.insertId, $("#addBCCategoryName :selected").text(), resp.s3_front_card_url, resp.s3_back_card_url, $("#addBCTitle").val(), $("#addBCDesc").val(), true, true);
                            $("#addBCTitle").val("");
                            $("#addBCDesc").val("");
                            $("#backCard").val("");
                            $("#frontCard").val("");
                            $("#addBCUrl").val("");
                            $("#addBCSeoTitle").val("");
                            $("#addBCSeoDescription").val("");
                            $("#addBCSeoKeyword").val("");
                            $("#addBCCategoryName").focus();
                            $("#addBCCategoryName").select2("val", "");
                            showToast("Card Added.", "success");
                            frontOfFile = "";
                            backOfFile = "";
                            $(".no-cards").remove();
                        } else {
                            console.log(resp);
                            bootbox.alert("Can't add Card: " + resp.msg);
                        }
                    }, function (err) {
                        removeWaitingOverlay();
                        console.log(err);
                        bootbox.alert("Error: Can't add to server");
                    });
                };
                var validateBack = function () {
                    if (backOfFile) {
                        validateResult = validateCard(backOfFile, false);
                        if (validateResult.success == true) {
                            _fnAddCard();
                        } else {
                            bootbox.confirm("Back of Card validation failed: <br/>" + validateResult.errors + "<br/><br/>Do you want to add this Card?", function (result) {
                                if (result) {
                                    _fnAddCard();
                                } else {
                                    backOfFile = "";
                                    $("#backCard").val("");
                                }
                            });
                        }
                    } else {
                        _fnAddCard();
                    }
                };
                if (frontOfFile) { 
                    if ($("#addBCUrl").val().trim().length == 0) {
                        bootbox.alert("SEO URL is required for business cards");
                    } else {
                        var validateResult = validateCard(frontOfFile, true);
                        if (validateResult.success == true) {
                            validateBack();
                        } else {
                            bootbox.confirm("Front of Card validation failed: <br/>" + validateResult.errors + "<br/><br/>Do you want to add this Card?", function (result) {
                                if (result) {
                                    _fnAddCard();
                                }
                            });
                        }
                    }
                } else {
                    _fnAddCard();
                }
            };

            if (cardId == undefined) {
                if ($("#frontCard").val() == "") {
                    bootbox.alert("Front of card is not selected");
                } else {
                    fnAddCard("/addCard");
                }
            } else {
                if ($("#frontCard").val() == "" || $("#backCard").val() == "") {
                    bootbox.confirm("You haven't uploaded either front or back card files. The corresponding files on server will not be changed!", function (val) {
                        if (val) {
                            fnAddCard("/updateCard");
                        }
                    });
                } else {
                    fnAddCard("/updateCard");
                }
            }
        });
        $(".addCategoryBtn").click(function (e) {
            e.preventDefault();
            if ($("#addCatCategoryName").val().length > 0) {
                if (categoryId) {
                    editCategory(categoryId);
                } else {
                    addWaitingOverlay();
                    doPost("/addCategory", {
                        category_name: $("#addCatCategoryName").val(),
                        category_desc: $("#addCatCategoryDesc").val(),
                        url: $("#addCatCategoryUrl").val(),
                        keywords: $("#addCatCategoryKeyWord").val(),
                        seo_title: $('#addCatCategorySeoTitle').val(),
                        seo_description: $('#addCatCategorySeoDesc').val(),
                        seo_keyword: $('#addCatCategorySeoKeyword').val(),
                        logo_category: $('#logoCategory').is(":checked"),
                        card_category: $('#cardCategory').is(":checked"),
                        other_category: $('#otherCategory').is(":checked")
                    }, function (resp) {
                        removeWaitingOverlay();
                        if (resp.status == 200) {
                            showToast("Category Added.", "success");
                            addCategoryTableRow(resp.insertId, $("#addCatCategoryName").val(), $("#addCatCategoryDesc").val(), $("#addCatCategoryUrl").val(), true);
                            $("#addLogoCategoryName").append("<option value='" + resp.insertId + "'>" + $("#addCatCategoryName").val() + "</option>");
                            $("#addBCCategoryName").append("<option value='" + resp.insertId + "'>" + $("#addCatCategoryName").val() + "</option>");
                            $('#addCatCategoryName').val("");
                            $('#addCatCategoryDesc').val("");
                            $('#addCatCategoryUrl').val("");
                            $("#addCatCategoryKeyWord").select2('val', []);
                            $("#addCatCategoryName").focus();
                            $(".no-categories").remove();
                            $('#addCatCategorySeoTitle').val("");
                            $('#addCatCategorySeoDesc').val("");
                            $('#addCatCategorySeoKeyword').val("");
                        } else {
                            console.log(resp);
                            bootbox.alert("Can't add category: " + resp.msg);
                        }
                    }, function (err) {
                        removeWaitingOverlay();
                        console.log(err);
                        bootbox.alert("Error: Can't add to server");
                    });
                }
            } else {
                bootbox.alert("Empty category name");
            }
        });
        $(".editCategoryBtn").click(function (e) {
            e.preventDefault();
            editCategory(categoryId)
        });

        $(".addLogoBtn").click(function (e) {
            e.preventDefault();
            var fnAddLogo = function (url) {
                addWaitingOverlay();
                doPost(url, {
                    id: logoId,
                    category_ids: $("#addLogoCategoryName").val(),
                    file: fileContents,
                    title: $("#addLogoTitle").val(),
                    desc: $("#addLogoDesc").val(),
                    url: $("#addLogoUrl").val(),
                    seotitle: $("#addLogoSeoTitle").val(),
                    seoKeyword: $("#addLogoSeoKeywords").val(),
                    seoDescription: $("#addLogoSeoDescription").val(),
                    status: "Active"
                }, function (resp) {
                    removeWaitingOverlay();
                    if (resp.status == 200) {
                        $(".dashboardLogoTableItem:last").remove();
                        if (logoId == undefined) {
                            addLogoToTables(resp.insertId, $("#addLogoCategoryName :selected").text(), resp.s3_logo_url, $("#addLogoTitle").val(), $("#addLogoDesc").val(), "Active", true, true);
                        } else {
                            updateLogoInTables(resp.insertId, $("#addLogoCategoryName :selected").text(), resp.s3_logo_url, $("#addLogoTitle").val(), $("#addLogoDesc").val(), "Active");
                        }
                        showToast("Logo Added.", "success");
                        $("#addLogoTitle").val("");
                        $("#addLogoDesc").val("");
                        $('#addLogoUrl').val("");
                        $('#addLogoSeoTitle').val("");
                        $('#addLogoSeoDescription').val("");
                        $('#addLogoSeoKeywords').val("");
                        $("#addLogoCategoryName").focus();
                        $("#addLogoCategoryName").select2("val", "");
                        $("#logoFile").val("");
                        $(".no-logos").remove();
                        logoId = undefined;
                        fileContents = undefined;
                    } else {
                        console.log(resp);
                        bootbox.alert("Can't add Logo: " + resp.msg);
                    }
                }, function (err) {
                    removeWaitingOverlay();
                    console.log(err);
                    bootbox.alert("Error: Can't add to server");
                });
            };
            if (logoId == undefined) {
                if ($("#logoFile").val() == "") {
                    bootbox.alert("Logo is not selected");
                } else {
                    if ($("#addLogoUrl").val().trim().length == 0) {
                        bootbox.alert("SEO URL is required for logos.");
                    } else {
                        var logoCategories = $("#addLogoCategoryName :selected").val();
                        if (logoCategories == null || logoCategories.length == 0) {
                            bootbox.alert("You should add at-least one category");
                        } else {
                            var validateResult = validateLogo(fileContents);
                            if (validateResult.success == true) {
                                fnAddLogo("/addLogo");
                            } else {
                                bootbox.confirm("Logo validation failed: <br/>" + validateResult.errors + "<br/><br/>Do you want to add this logo?", function (result) {
                                    if (result) {
                                        fnAddLogo("/addLogo");
                                    } else {
                                        $("#logoFile").val("");
                                        fileContents = undefined;
                                    }
                                });
                            }
                        }
                    }
                }
            } else {
                var fn = function () {
                    fnAddLogo("/updateLogo");
                };
                if ($("#logoFile").val() == "") {
                    bootbox.confirm("Your logo file is not uploaded. The file on server will not be changed!", function (val) {
                        if (val) {
                            fn();
                        }
                    });
                } else {
                    fn();
                }
            }
        });
        document.getElementById('logoFile').addEventListener('change', readSingleFile, false);
        document.getElementById('frontCard').addEventListener('change', readFrontOfFile, false);
        document.getElementById('backCard').addEventListener('change', readBackOfFile, false);
        $("#addLogoCategoryName").select2({
            placeholder: "Select Categories",
            allowClear: true
        });
        $("#addBCCategoryName").select2({
            placeholder: "Select Categories",
            allowClear: true
        });
    }

    function validateCard(cardFile, isFront) {
        var result = {
            success: true,
            errors: isFront == true ? "<b>Front of Card</b><br/>" : "<b>Back of Card</b><br/>"
        };
        if (cardFile != undefined && cardFile.length > 0) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(cardFile, "image/svg+xml");
            var logo = $("#logo", doc);
            if (logo.length == 0) {
                result.success = false;
                result.errors += "logo is missing<br/>"
            }
            var name = $("#name", doc);
            if (name.length == 0) {
                result.success = false;
                result.errors += "name is missing<br/>"
            } else {
                if (name[0].tagName != "text") {
                    result.success = false;
                    result.errors += "name is not a &lt;text&gt; element<br/>"
                }
            }
            var designation = $("#designation", doc);
            if (designation.length == 0) {
                result.success = false;
                result.errors += "designation is missing<br/>"
            } else {
                if (designation[0].tagName != "text") {
                    result.success = false;
                    result.errors += "designation is not a &lt;text&gt; element<br/>"
                }
            }
            var website = $("#website", doc);
            if (website.length == 0) {
                result.success = false;
                result.errors += "website is missing<br/>"
            } else {
                if (website[0].tagName != "text") {
                    result.success = false;
                    result.errors += "website is not a &lt;text&gt; element<br/>"
                }
            }
            var email = $("#email", doc);
            if (email.length == 0) {
                result.success = false;
                result.errors += "email is missing<br/>"
            } else {
                if (email[0].tagName != "text") {
                    result.success = false;
                    result.errors += "email is not a &lt;text&gt; element<br/>"
                }
            }
            var mobile = $("#mobile", doc);
            if (mobile.length == 0) {
                result.success = false;
                result.errors += "mobile is missing<br/>"
            } else {
                if (mobile[0].tagName != "text") {
                    result.success = false;
                    result.errors += "mobile is not a &lt;text&gt; element<br/>"
                }
            }
            var address1 = $("#address1", doc);
            if (address1.length == 0) {
                result.success = false;
                result.errors += "address1 is missing<br/>"
            } else {
                if (address1[0].tagName != "text") {
                    result.success = false;
                    result.errors += "address1 is not a &lt;text&gt; element<br/>"
                }
            }
            var address2 = $("#address2", doc);
            if (address2.length == 0) {
                result.success = false;
                result.errors += "address2 is missing<br/>"
            } else {
                if (address2[0].tagName != "text") {
                    result.success = false;
                    result.errors += "address2 is not a &lt;text&gt; element<br/>"
                }
            }
            var color1 = $("#color1", doc);
            if (color1.length == 0) {
                result.success = false;
                result.errors += "color1 is missing<br/>"
            }
            var color2 = $("#color2", doc);
            if (color2.length == 0) {
                result.success = false;
                result.errors += "color2 is missing<br/>"
            }
            var color3 = $("#color3", doc);
            if (color3.length == 0) {
                result.success = false;
                result.errors += "color3 is missing<br/>"
            }
        }
        return result;
    }

    function validateLogo(logoFile) {
        var result = {success: true, errors: ""};
        var parser = new DOMParser();
        var doc = parser.parseFromString(logoFile, "image/svg+xml");
        var companyName = $("#Company_Name", doc);
        if (companyName.length == 0) {
            result.success = false;
            result.errors += "Company_Name is missing<br/>"
        } else {
            if (companyName[0].tagName != "text") {
                result.success = false;
                result.errors += "Company_Name is not a &lt;text&gt; element<br/>"
            } else {
                if (companyName.attr("x") == undefined) {
                    result.success = false;
                    result.errors += "Company_Name doesn't have x attribute<br/>"
                }
                if (companyName.attr("y") == undefined) {
                    result.success = false;
                    result.errors += "Company_Name doesn't have y attribute<br/>"
                }
            }
        }
        var tagLine = $("#Tagline", doc);
        if (tagLine.length == 0) {
            result.success = false;
            result.errors += "Tagline is missing<br/>"
        } else {
            if (tagLine[0].tagName != "text") {
                result.success = false;
                result.errors += "Tagline is not a &lt;text&gt; element<br/>"
            } else {
                if (tagLine.attr("x") == undefined) {
                    result.success = false;
                    result.errors += "Tagline doesn't have x attribute<br/>"
                }
                if (tagLine.attr("y") == undefined) {
                    result.success = false;
                    result.errors += "Tagline doesn't have y attribute<br/>"
                }
            }
        }
        var color1 = $("#Color1", doc);
        if (color1.length == 0) {
            result.success = false;
            result.errors += "Color1 is missing<br/>"
        }
        var color2 = $("#Color2", doc);
        if (color2.length == 0) {
            result.success = false;
            result.errors += "Color2 is missing<br/>"
        }
        var color3 = $("#Color3", doc);
        if (color3.length == 0) {
            result.success = false;
            result.errors += "Color3 is missing<br/>"
        }
        return result;
    }

    function readSingleFile(evt) {
        readFile(evt, true, function (contents) {
            fileContents = contents;
        });
    }

    function readFrontOfFile(evt) {
        readFile(evt, true, function (contents) {
            frontOfFile = contents;
        });
    }

    function readBackOfFile(evt) {
        readFile(evt, true, function (contents) {
            backOfFile = contents;
        });
    }

    function addCategoryTableRow(id, name, desc, url, addToInnerTable) {
        var row2 = '<tr id="category' + id + '">' +
                '<td class="col-md-5">' + name + '</td>' +
                '<td class="col-md-6">' + (desc == null ? " " : desc) + '</td>' +
                '</tr>';
        $(".tblCategoriesDashBoard").append(row2);
        if (addToInnerTable != false && typeof addCategoryToInnerTable != "undefined") {
            addCategoryToInnerTable(id, name, desc, url);
        }
    }

    function editCategoryTableRow(id, name, desc, url) {
        $(".tblCategories").find("#category" + id + " td:first").text(name);
        $(".tblCategories").find("#category" + id + " td:nth-child(2)").text(desc);
        $(".tblCategories").find("#category" + id + " td:nth-child(3)").text(url);
    }

    function addLogoToTables(id, category, src, rtitle, rdesc, status, toDashboardTop, addToInnerTable) {
        var title = rtitle == "" ? "No title" : rtitle;
        var tr = '<tr class="dashboardLogoTableItem">' +
                '<td class="col-md-6"><div style="text-align: left; overflow: visible" class="logoPrev' + id + '"></td>' +
                '<td class="col-md-3">' + category + '</td>' +
                '<td class="col-md-3">' + title + '</td>' +
                '</tr>';
        if ($(".dashboardLogoTableItem").length < 5) {
            if (toDashboardTop == true) {
                $("#homePageLogoTbl tr:first").after(tr);
            } else {
                $("#homePageLogoTbl").append(tr);
            }
        }
        updateLogoImage(id, '/getLogoImage?id=' + src);
        if (typeof addLogoToInnerTable != "undefined" && addToInnerTable) {
            addLogoToInnerTable(id, category, src, rtitle, rdesc, status);
        }
    }

    function addCardToTables(id, category_name, s3_front_card_url, s3_back_card_url, rtitle, rdesc, toDashboardTop, addToInnerTable) {
        var title = rtitle == "" ? "No title" : rtitle;
        var tr = '<tr class="dashboardCardTableItem">' +
                '<td class="col-md-6"><div style="text-align: left; overflow: visible" class="cardFrontPrev' + id + '"></td>' +
                '<td class="col-md-3">' + category_name + '</td>' +
                '<td class="col-md-3">' + title + '</td>' +
                '</tr>';
        if ($(".dashboardCardTableItem").length < 5) {
            if (toDashboardTop == true) {
                $("#homePageCardTbl tr:first").after(tr);
            } else {
                $("#homePageCardTbl").append(tr);
            }
        }
        updateCardImage(id, '/getCardImage?id=' + s3_front_card_url + '&random=' + Math.random(), "F");
        if (s3_back_card_url != null) {
            updateCardImage(id, '/getCardImage?id=' + s3_back_card_url + '&random=' + Math.random(), "B");
        }
        if (typeof addCardToInnerTable != "undefined" && addToInnerTable) {
            addCardToInnerTable(id, category_name, s3_front_card_url, s3_back_card_url, rtitle, rdesc);
        }
    }

    function updateLogoInTables(id, category, src, rtitle, rdesc) {
        var title = rtitle == "" ? "No title" : rtitle;
        var desc = rdesc == "" ? "No Description" : rdesc;
        $(".logo" + id + " .card_title b").text(title);
        $(".logo" + id + " .card_details p").text(desc);
        $(".logo" + id + " .card_category").text(category);
        updateLogoImage(id, '/getLogoImage?id=' + src);
    }

    function editCategory(id) {
        addWaitingOverlay();
        doPost("/updateCategory", {
            id: id,
            category_name: $('#addCatCategoryName').val(),
            category_desc: $('#addCatCategoryDesc').val(),
            keywords: $("#addCatCategoryKeyWord").val(),
            url: $('#addCatCategoryUrl').val(),
            seo_title: $('#addCatCategorySeoTitle').val(),
            seo_description: $('#addCatCategorySeoDesc').val(),
            seo_keyword: $('#addCatCategorySeoKeyword').val(),
            logo_category: $('#logoCategory').is(":checked"),
            card_category: $('#cardCategory').is(":checked"),
            other_category: $('#otherCategory').is(":checked")
        }, function (resp) {
            removeWaitingOverlay();
            if (resp.status == 200) {
                editCategoryTableRow(id, $("#addCatCategoryName").val(), $("#addCatCategoryDesc").val(), $("#addCatCategoryUrl").val());
                showToast("Category Edited.", "success");
                $('#addCatCategoryName').val("");
                $('#addCatCategoryDesc').val("");
                $('#addCatCategoryUrl').val("");
                $('#addCatCategoryKeyWord').children().remove()
                $("#addCatCategoryKeyWord").select2('val', []);
                $('#addCatCategorySeoTitle').val("");
                $('#addCatCategorySeoDesc').val("");
                $('#addCatCategorySeoKeyword').val("");
                $('#addCategoryModal').modal("hide");
            } else {
                console.log(resp);
                bootbox.alert("Can't edit categories.");
            }
        }, function (err) {
            removeWaitingOverlay();
            console.log(err);
            bootbox.alert("Error: Can't add to server");
        });
    }

    init();
});

function updateShipping(shipperName, status, expectedDate, trackingId, id, callback, itemIds) {
    addWaitingOverlay();
    doPost("/updateShipping", {shipper_name: shipperName, status: status, expected_date: expectedDate, tracking_id: trackingId, id: id, purchased_item_ids: itemIds}, function (resp) {
        if (resp.status == 200) {
            var shippingInfo = $("#shippingInfo_" + id);
            $(".shipperName", shippingInfo).text(fillIfNull(shipperName));
            $(".shipperStatus", shippingInfo).text(fillIfNull(status));
            $(".shipperExpectedDate", shippingInfo).text(fillIfNull(expectedDate));
            $(".shipperTrackingId", shippingInfo).text(fillIfNull(trackingId));
            callback();
        } else {
            callback("Error updating the shipping details");
        }
        removeWaitingOverlay();
    }, function (err) {
        console.log(err);
        removeWaitingOverlay();
        callback("Comunication failure.");
    });
}

function fillIfNull(item, fill) {
    if (item == null || item == undefined || item.trim().length <= 0 || item == "NA") {
        return fill == undefined ? "NA" : fill;
    } else {
        return item;
    }
}

function readFile(evt, svgOnly, callback) {
    var f = evt.target.files[0];
    if (f) {
        if (!svgOnly || f.type.indexOf("image/svg") >= 0) {
            var r = new FileReader();
            r.onload = function (e) {
                callback(e.target.result, f);
            };
            if (svgOnly) {
                r.readAsText(f);
            } else {
                r.readAsDataURL(f);
            }
        } else {
            bootbox.alert("Please upload an " + (svgOnly ? "SVG image. Other image formats not supported" : "") + "image.");
            evt.srcElement.value = "";
        }
    } else {
        bootbox.alert("File is not loaded!!");
        evt.srcElement.value = "";
    }
}

function updateLogoImage(id, url) {
    var mainId = '.logoPrev' + id;
    $(mainId).attr("data-src", url);
    $(mainId).svg();
    var svg = $(mainId).svg('get');
    if (svg != undefined) {
        svg.load(url, {
            onLoad: function (svg, error) {
                if (error) {
                    console.log(error);
                } else {
                    $(svg.root()).attr("height", "2in");
                    $(svg.root()).attr("width", "3in");
                    var cmpAlign = $("#Company_Name", svg.root()).attr("text-anchor");
                    var tagAlign = $("#Tagline", svg.root()).attr("text-anchor");
                    if (cmpAlign != undefined) {
                        var cmp = $("#innerTbl" + id).find(".logoRowCmp" + id);
                        cmp.val(cmpAlign);
                    }
                    if (tagAlign != undefined) {
                        var tag = $("#innerTbl" + id).find(".logoRowTag" + id);
                        tag.val(tagAlign);
                    }
                    $("font", svg.root()).remove();
                    $("#fonts", svg.root()).remove();
                }
            }, changeSize: true
        });
    }
}

function updateCardImage(id, url, posChar) {
    var newId;
    if (posChar == "F") {
        newId = ".cardFrontPrev" + id;
    } else {
        newId = ".cardBackPrev" + id;
    }
    $(newId).svg();
    var svg = $(newId).svg('get');
    if (svg != undefined) {
        svg.load(url, {
            onLoad: function (svg, error) {
                if (error) {
                    console.log(error);
                } else {
                    $(svg.root()).attr("height", "200px");
                    $("font", svg.root()).remove();
                    if ($("style", svg.root()).length == 0) {
                        $("defs", svg.root()).after($("#allFonts").text());
                    } else {
                        $("style", svg.root()).after($("#allFonts").text());
                    }
                    $(newId).show();
                    $('.cardRow' + posChar + 'Name' + id).val($("#name", $(newId)).attr("text-anchor"));
                    $('.cardRow' + posChar + 'Desig' + id).val($("#designation", $(newId)).attr("text-anchor"));
                    $('.cardRow' + posChar + 'Phone' + id).val($("#mobile", $(newId)).attr("text-anchor"));
                    $('.cardRow' + posChar + 'Email' + id).val($("#email", $(newId)).attr("text-anchor"));
                    $('.cardRow' + posChar + 'Web' + id).val($("#website", $(newId)).attr("text-anchor"));
                    $('.cardRow' + posChar + 'Ad1' + id).val($("#address1", $(newId)).attr("text-anchor"));
                    $('.cardRow' + posChar + 'Ad2' + id).val($("#address2", $(newId)).attr("text-anchor"));
                }
            }, changeSize: true
        });
    }
}

