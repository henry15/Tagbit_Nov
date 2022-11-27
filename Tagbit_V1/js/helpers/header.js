var historyStateNotSupported = (window.history && history.state) ? false : true;
var historyPushStateNotSupported = (window.history && history.pushState && history.replaceState) ? false : true;

(function () {
    if ('onhashchange' in window) {
        if (window.addEventListener) {
            window.addHashChange = function (func, before) {
                window.addEventListener('hashchange', func, before);
            };
            window.removeHashChange = function (func) {
                window.removeEventListener('hashchange', func);
            };
            return;
        } else if (window.attachEvent) {
            window.addHashChange = function (func) {
                window.attachEvent('onhashchange', func);
            };
            window.removeHashChange = function (func) {
                window.detachEvent('onhashchange', func);
            };
            return;
        }
    }
    var hashChangeFuncs = [];
    window.addHashChange = function (func, before) {
        if (typeof func === 'function')
            hashChangeFuncs[before ? 'unshift' : 'push'](func);
    };
    window.removeHashChange = function (func) {
        for (var i = hashChangeFuncs.length - 1; i >= 0; i--)
            if (hashChangeFuncs[i] === func)
                hashChangeFuncs.splice(i, 1);
    };

    var oldHref = location.href;
    setInterval(function () {
        var newHref = location.href;
        if (oldHref !== newHref) {
            var _oldHref = oldHref;
            oldHref = newHref;
            for (var i = 0; i < hashChangeFuncs.length; i++) {
                hashChangeFuncs[i].call(window, {
                    'type': 'hashchange',
                    'newURL': newHref,
                    'oldURL': _oldHref
                });
            }
        }
    }, 100);
})();

(function () {
    window.pushState = function (name, url) {
        if (historyPushStateNotSupported && History){
            History.pushState({name: name}, "", url);
        } else {
            history.pushState({name: name}, "", url);
        }
        if (historyStateNotSupported){
            history.state = {name: name};
        }
    };
    window.changeState = function (name, url) {
        if (historyPushStateNotSupported && History){
            History.replaceState({name: name}, "", url);
        } else {
            history.replaceState({name: name}, "", url);
        }
        if (historyStateNotSupported){
            history.state = {name: name};
        }
    };
    if ('onpopstate' in window) {
        if (window.addEventListener) {
            window.addPopState = function (func, before) {
                window.addEventListener('popstate', func, before);
            };
            window.removePopState = function (func) {
                window.removeEventListener('popstate', func);
            };
            return;
        } else if (window.attachEvent) {
            window.addPopState = function (func) {
                window.attachEvent('popstate', func);
            };
            window.removePopState = function (func) {
                window.detachEvent('popstate', func);
            };
            return;
        }
    }
    var hrefChangeFuncs = [];
    window.addPopState = function (func, before) {
        if (typeof func === 'function') {
            hrefChangeFuncs[before ? 'unshift' : 'push'](func);
        }
    };
    window.removePopState = function (func) {
        for (var i = hrefChangeFuncs.length - 1; i >= 0; i--) {
            if (hrefChangeFuncs[i] === func) {
                hrefChangeFuncs.splice(i, 1);
            }
        }
    };
    var oldHref = location.href;
    setInterval(function () {
        var newHref = location.href;
        if (oldHref !== newHref) {
            var _oldHref = oldHref;
            oldHref = newHref;
            for (var i = 0; i < hrefChangeFuncs.length; i++) {
                hrefChangeFuncs[i].call(window, {
                    'type': 'popstate',
                    'newURL': newHref,
                    'oldURL': _oldHref
                });
            }
        }
    }, 100);
})();


$(function () {
    if (location.pathname == "/index"){
        history.replaceState("", "", "");
    }
    var geoIp = null;

    if (historyStateNotSupported){
        $(".top-countries-list").css({
            minWidth: 15
        });
    }

    function hashChanged() {
        var hash = location.hash;
        var showPopup = function () {
            if (!$(".headerAccount-dropdown").is(":visible")) {
                $('.headerAccount-signin').removeClass('login-off');
                $('.headerAccount-signin').toggleClass('login-on');
                $('.headerAccount-signin').find('.headerAccount-dropdown').addClass('active');
                $('.headerAccount-signin').find('a.dropdown-toggle .fa-angle-up').addClass('inactive');
                $('.headerAccount-signin').find('a.dropdown-toggle .fa-angle-down').removeClass('inactive');
                if ($('.headerAccount-signin ul.headerAccount-dropdown').is(':visible')) {
                    $('.headerAccount-signin.login-on').find('a.dropdown-toggle .fa-angle-up').removeClass('inactive');
                    $('.headerAccount-signin.login-on').find('a.dropdown-toggle .fa-angle-down').addClass('inactive');
                }
            }
        };
        if (hash == "#/login") {
            showPopup();
            $('.signin-form').show();
            $('.recover-form').hide();
            $('.signup-form').hide();
        } else if (hash == "#/signup") {
            showPopup();
            $('.signin-form').hide();
            $('.recover-form').hide();
            $('.signup-form').show();
        } else if (hash == "#/forgot") {
            showPopup();
            $('.signin-form').hide();
            $('.recover-form').show();
            $('.signup-form').hide();
        }
    }

    addHashChange(hashChanged);

    function initThemes (){
        $('.saved-items').hover(function () {
            $(this).find('img').src = '/img/design-blue.png';
        }, function () {
            $(this).find('img').src = '/img/design.png';
        });
    }
    
    function init() {
        initThemes();
        try {
            var str = decodeHTMLEntities(currentCountryFromServer);
            geoIp = "";//JSON.parse(str);
            changeToCurrentCountry();
        } catch (err) {
            console.log(err);
        }
        /* for theme purposes */
        document.createElement('header');
        document.createElement('nav');
        document.createElement('section');
        document.createElement('article');
        document.createElement('aside');
        document.createElement('footer');
        $('#signinModal').hide();
        /*
         $('.modal-content-signin #headerSignUp').on('click', function () {
         $('.modal-content-signin').hide();
         $('.modal-content-signup').show();
         $(".modal-content-forgot").hide();
         });
         $('.modal-content-signup #headerSignIn').on('click', function () {
         $('.modal-content-signin').show();
         $('.modal-content-signup').hide();
         $(".modal-content-forgot").hide();
         });
        $("#headerSignIn").click(function (e) {
            window.location = "#/login";
            e.stopPropagation();
        });
    */
        $('#subject-type').select2();
        $('#myModal').hide();
        /*$('.drop-contact').on("click", function () {
            window.location = "/contact-us";
        });*/
        $('.drop-login-mobile').on('click', function () {
            window.location = "/login";
        });
        if (window.location.pathname.indexOf("logo-design-online") > -1) {
            $(".drop-logomaker").addClass("active");
        } else if (window.location.pathname.indexOf("my-designs") > -1) {
            $("#myProducts").addClass("active");
        } else if (window.location.pathname.indexOf("contact-us") > -1) {
            $(".drop-contact").addClass("active");
        }

        $("#changePasswordBtn").click(function (e) {
            e.preventDefault();
            var emailVal = $('#changePwdEmailAddr').val(); 
			if (emailVal === "") {
				bootbox.alert("Email is not entered");
			} else {
				addWaitingOverlay();
				doPost("/forgotPassword", {email: $("#changePwdEmailAddr").val()}, function (resp) {
					removeWaitingOverlay();
					if (resp.status == 200) {
						bootbox.alert("A link has been sent to the email to reset your password");
						$('.signin-form').show();
						$('.recover-form').hide();
					} else {
						console.log(resp); 
						bootbox.alert(resp.msg); 
					}
				}, function (err) {
					removeWaitingOverlay();
					console.log(err);
					bootbox.alert(typeof err == "string" ? err : "Server Error: " + err.error);
				});
			}
        });
        //if (isLoggedIn(true)) {
        //    showLogoutOptions();
        //} else {
        //    validateLocalStorageItems();
        //    $(".drop-login-mobile").addClass("login-show");
        //    $(".signout-mobile").addClass("login-hide");
        //    var loginInfo = $.cookie('loginInfo');
        //    if (loginInfo != undefined) {
        //        var loginInfo = JSON.parse($.cookie('loginInfo'));
        //        $("#rememberme").prop('checked', true);
        //        $("#emailid").val(loginInfo.userName);
        //        $("#password").val(loginInfo.password);
        //        login(false);
        //    }
        //    updateMyDesignsCount(false);
        //    updateCartCount(false);
        //}
        $("#loginBtn").click(function (e) {
            e.preventDefault();
            login(true);
        });
        $(".logoutBtn").click(function () {
            signout();
        });
        /*$("#signUpBtn").click(function (e) {
            e.preventDefault();
            if ($('#signupForm').valid()) {
                signup({
                    email: $("[name=signup_email]").val(),
                    password: $("[name=signup_password]").val()
                }, function () {
                    $("#emailid").val($("[name=signup_email]").val());
                    $("#password").val($("[name=signup_password]").val());
                    $("#headerSignIn").click();
                    $("#loginBtn").click();
                }, undefined, true);
            }
        });*/
        //$.validator.setDefaults({
        //    debug: true
        //});
        $("#loginFormOnTop").validate();
        $('#signupForm').validate({
            messages: {
                confirm_password: {
                    equalTo: "Password must be same as Re-enter Password."
                }
            }
        });
        var msg_id = getURLParameterByName("msg_id");
        if (msg_id == 5) {
            bootbox.alert("Unable to unsubscribe from the mailing list.");
        } else if (msg_id == 4) {
            bootbox.alert("You have been successfully unsubscribed from the newsletter mailing list.");
        } else if (msg_id == 3) {
            bootbox.alert("We have sent you the new password to your email. You may login with the new password.");
        } else if (msg_id == 2) {
            bootbox.alert("You can now login with your email and password");
        } else if (msg_id == 1) {
            bootbox.alert("You have been logged out.<br/>Please login again to use the feature.");
        }


        $('.top-countries-list').on('change.bfhselectbox', function () {
            $.cookie("country", $('.top-countries-list').val(), {path: "/"});
        });

        //set up some basic options for the feedback_me plugin
        fm_options = {
            position: "left-bottom",
            name_required: true,
            message_placeholder: "Go ahead, type your feedback here...",
            name_placeholder:"Your Name",
            email_placeholder:"Email Address",
            message_required: true,
            show_asterisk_for_required: true,
            feedback_url: "/sendFeedback",
            show_email: true,
            email_required: true,
            delayed_options: {
                send_fail: "Sending failed :(",
                send_success: "Thank you for the feedback :)",
                delay_success_milliseconds: 5000,
                delay_fail_milliseconds: 5000
            }
        };
        //init feedback_me plugin
       // fm.init(fm_options);
        //var user = getUser();
        //if (user != undefined) {
        //    if (user.first_name != undefined && user.first_name != null) {
        //        $(".feedback_name").val(user.first_name);
        //    }
        //    if (user.email != undefined && user.email != null) {
        //        $(".feedback_email").val(user.email);
        //    }
        //}
        hashChanged();
    }

    function decodeHTMLEntities(text) {
        var entities = [
            ['apos', '\''],
            ['amp', '&'],
            ['lt', '<'],
            ['gt', '>'],
            ['quot', '"']
        ];

        for (var i = 0, max = entities.length; i < max; ++i) {
            text = text.replace(new RegExp('&' + entities[i][0] + ';', 'g'), entities[i][1]);
        }

        return text;
    }

    function changeToCurrentCountry() {
        $(".top-countries-list").on("countryLoaded", function () {
            var countryCookie = $.cookie("country");
            var country = countryCookie || "IN";
            if (geoIp != null && geoIp.country != undefined && geoIp.country != null && countryCookie == undefined) {
                country = geoIp.country;
            }
            var as = $(".top-countries-list a");
            for (var i = 0; i < as.length; i++) {
                if ($(as[i]).data("option") == country) {
                    $(as[i]).click();
                    break;
                }
            }
            $(".bfh-selectbox-toggle").hide(1, function () {
                $(".bfh-selectbox-toggle").show();
            });
        });
    }

    function validateLocalStorageItems() {
        var logos = retrieveJson("logos");
        var cart = retrieveJson("carts");
        var cards = retrieveJson("cards");
        var logosToRemove = [];
        var cardsToRemove = [];
        var cartItemsToRemove = [];
        if (logos != null) {
            logos.forEach(function (val, idx) {
                var obj = retrieveJson(val);
                if (obj == null || obj == undefined) {
                    logosToRemove.push(val);
                }
            });
        }
        if (cards != null) {
            cards.forEach(function (val, idx) {
                var obj = retrieveJson(val);
                if (obj == null || obj == undefined) {
                    cardsToRemove.push(val);
                }
            });
        }
        if (cart != null) {
            cart.forEach(function (val, idx) {
                var obj = retrieveJson(val);
                if (obj == null || obj == undefined) {
                    cartItemsToRemove.push(val);
                } else {
                    var itemKey = (obj.itemType == "LOGO" ? "logo_" : "card_") + obj.item_id;
                    var actualObj = retrieveJson(itemKey);
                    if (actualObj == null || actualObj == undefined) {
                        deleteJson("cart_" + obj.item_id);
                    }
                }
            });
        }
        for (var i = 0; i < logosToRemove.length; i++) {
            deleteJson(logosToRemove[i]);
            logos.splice(logos.indexOf(logosToRemove[i]), 1)
        }
        for (var i = 0; i < cardsToRemove.length; i++) {
            deleteJson(cardsToRemove[i]);
            cards.splice(cards.indexOf(cardsToRemove[i]), 1)
        }
        for (var i = 0; i < cartItemsToRemove.length; i++) {
            deleteJson(cartItemsToRemove[i]);
            cart.splice(cart.indexOf(cartItemsToRemove[i]), 1)
        }
        storeJson("logos", logos);
        storeJson("cards", cards);
        storeJson("carts", cart);
    }

    function login(showError) {
        signin($("#emailid").val(), $("#password").val(), function (resp) {
            if ($("#rememberme").is(":checked")) {
                $.cookie('loginInfo', JSON.stringify({
                    userName: $("#emailid").val(),
                    password: $("#password").val()
                }), {expires: 7, path: "/"});
            } else {
                $.removeCookie('loginInfo', {path: "/"});
            }
            if (isProtectedPage()) {
                showLogoutOptions();
            } else {
                if (window.location.pathname.indexOf("checkout") >= 0 || window.location.pathname.indexOf("shop") >= 0){
                    window.location.reload();
                } else {
                    window.location = "/";
                }
            }
            $(".login-open-btn").attr('style', 'display: none;'); 
            $(".signup-open-btn").attr('style', 'display: none;');
            $("#headerAccountLogout").attr('style', 'display: block;');
        }, function (err) {
            $.removeCookie('loginInfo', {path: "/"});
            console.log(err);
            if (showError == true) {
                $(".error-signin").text(err);
                $('.error-signin').fadeIn();
                //bootbox.alert(err);
            }
        });
    }

    function setLng(lang) {
        $.cookie("lang", lang, {path: "/"});
        window.location.reload();
    }

    init();
});

function showLogoutOptions() {
    var user = getUser();
    $(".saved-items").hide();
    $("#logoutLabel").html("My Account");
    $(".signout-mobile>a").html(user.email + '<i class="fa fa-angle-down"></i>');
    $("#headerAccount").hide();
    $("#headerRegister").hide();
    $("#headerAccountLogout").show();
    $("#myProducts").show();
    $(".drop-login-mobile").hide();
    $(".drop-login-mobile").addClass('login-hide');
    $(".signout-mobile").show();
    $(".signout-mobile").addClass('login-show');
    updateCartCount(true);
    updateMyDesignsCount(true);
    $(".my-designs").show();
    $(document).trigger('click');
}
