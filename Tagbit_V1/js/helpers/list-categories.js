function initCategorieListing (categoryResp) { 
    function init() { 
        if (categoryResp.status == 200) {
            for (var i = 0; i < categoryResp.categories.length; i++) {
                addCategoryTableRow(categoryResp.categories[i].id, categoryResp.categories[i].category_name, categoryResp.categories[i].category_desc, categoryResp.categories[i].url);
            }
            $('[data-toggle="tooltip"]').tooltip();
        } else if (categoryResp.status == 201) {
            $(".tblCategories").append("<tr class='no-categories'><td colspan='3'>No categories available.</td></tr>");
        } else {
            console.log(categoryResp);
            bootbox.alert("Can't list categories.");
        } 
    }
    
    init();

    function addCategoryTableRow(id, name, desc, url) {
        var row = '<tr id="category' + id + '">' +
            '<td class="col-md-3">' + name + '</td>' +
            '<td class="col-md-4">' + (desc == null ? " " : desc) + '</td>' +
            '<td class="col-md-4">' + (url == null ? " " : url) + '</td>' +
            '<td class="col-md-1">' +
            '<a data-hover="tooltip" data-placement="left" data-original-title="Edit category" class="btn btn-primary editCategoryBtn' + id + ' deleteCategory"><i class="fa fa-pencil-square-o" ></i></a>' +
            '<a href="#" class="btn btn-danger deleteCategory deleteCategoryBtn' + id + '" data-toggle="tooltip" data-placement="right" data-original-title="Delete"><i class="fa fa-trash-o" ></i></a></td>' +
            '</tr>';
        $(".tblCategories").prepend(row);
        $(".editCategoryBtn" + id).click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            getCategory(id);
        });
        $(".deleteCategoryBtn" + id).click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            deleteCategory(id);
        });
        $(".categoryNameList").append("<option class='category" + id + "' value='" + id + "'>" + name + "</option>"); 
        $("[data-hover='tooltip']").tooltip();
    }
    
    addCategoryToInnerTable = addCategoryTableRow;

    function getCategory(id) {
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

    function deleteCategory(id) {
        bootbox.confirm("Do you want to delete this Category?", function (result) {
            if (result == true) {
                addWaitingOverlay();
                doPost("/removeCategory", {id: id}, function (resp) {
                    removeWaitingOverlay();
                    if (resp.status == 200) {
                        $("#category" + id).remove();
                        $(".category" + id).remove();
                    } else {
                        console.log(resp);
                        bootbox.alert("Can't remove categories. Remove all logos/cards belongs to this category before removing the category.");
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