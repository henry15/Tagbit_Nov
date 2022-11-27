function initVendorListing (resp) { 
    function init() { 
            for (var i = 0; i < resp.length; i++) {
                addVendorTableRow(resp[i]);
            }
    }
    
    init();

    function addVendorTableRow(data) {
        var row = '<tr id="category' + data.id + '">' +
            '<td class="col-md-2">' + data.companyname + '</td>' +
            '<td class="col-md-2">' + data.gstin + '</td>' +
            '<td class="col-md-2">' + data.tech + '</td>' +
            '<td class="col-md-2">' + data.capacity + '</td>' +
            '<td class="col-md-2">' + data.status + '</td>' +
            '<td class="col-md-2">' +
            '<a href="#" class="btn btn-danger deleteCategory deleteCategoryBtn' + data.id + '" data-toggle="tooltip" data-placement="right" data-original-title="Delete"><i class="fa fa-trash-o" ></i></a></td>' +
            '</tr>';
        $(".tblCategories").prepend(row);
        
        $(".deleteCategoryBtn" + data.id).click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            deleteVendor(data.id);
        });
    }
    

    function getCategory_unsued(id) {
        addWaitingOverlay();
        categoryId = id;
        $('#addCatCategoryName').val("");
        $('#addCatCategoryDesc').val("");
        $('#addCatCategoryUrl').val("");  
        $('#addCatCategorySeoTitle').val("");
        $('#addCatCategorySeoDesc').val("");
        $('#addCatCategorySeoKeyword').val("");
        doPost("/getCategoryDetailsWithKeywords", {id: id}, function (resp) {
            $("#addCategoryModal").modal("show");
            removeWaitingOverlay();
            if (resp.status == 200) {
                $('#addCatCategoryName').val(resp.items.category_name);
                $('#addCatCategoryDesc').val(resp.items.category_desc);
                $('#addCatCategoryUrl').val(resp.items.url); 
                if (resp.items.keyword) {
                    var keywords = resp.items.keyword.split(","); 
                    $("#addCatCategoryKeyWord").select2('val', keywords); 
                } else {
                    $("#addCatCategoryKeyWord").select2('val', "");
                }
                $('#addCatCategorySeoTitle').val(resp.items.seo_title);
                $('#addCatCategorySeoDesc').val(resp.items.seo_description);
                $('#addCatCategorySeoKeyword').val(resp.items.seo_keyword);
                $('#logoCategory').prop('checked', resp.items.logo_category);
                $('#cardCategory').prop('checked', resp.items.card_category);
                $('#otherCategory').prop('checked', resp.items.other_category);
            } else {
                console.log(resp);
                bootbox.alert("Can't get category.");
            }
        }, function (err) {
            removeWaitingOverlay();
            console.log(err);
            bootbox.alert("Error: Can't add to server");
        });
    }

    function deleteVendor(id) {
        bootbox.confirm("Do you want to delete this Vendor?", function (result) {
            if (result == true) {
                addWaitingOverlay();
                doPost("/removeVendor", {id: id}, function (resp) {
                    removeWaitingOverlay();
                    if (resp.status == 200) {
                        $("#category" + id).remove();
                        $(".category" + id).remove();
                    } else {
                        console.log(resp);
                        bootbox.alert("Can't remove Vendors.");
                    }
                }, function (err) {
                    removeWaitingOverlay();
                    console.log(err);
                    bootbox.alert("Error: Can't add to server");
                });
            }
        });
    } 
}

$(function () {
    function init() {
        doGet("/getVendors",{}, function (resp) {
            if (resp.status == 200) { 
                initVendorListing(resp.items);
            } else if (resp.status == 201) {
                $(".tblCategories").append("<span class='no-logos'>No Vendors available.</span>");
            } else {
                console.log(resp);
                bootbox.alert("Can't list vendors.");
            }
        }, function (err){
            console.log(err);
            showToast("Communication----- Error!!")
            loadingInProgress = false;
        });       
    } 
    init();
});