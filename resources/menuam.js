var SocialProviders = function() {
    this.uloginInt();
    this.MenuLoginInt();
    return this;
}
SocialProviders.prototype.MenuLoginInt = function() {
    $("a.__registration, a.__forgot").bind("click", function(e) {
        $.ajax({
            url: $(this).attr('href'),
            success: function(resp) {
                $("#fancybox-content").html(resp);
                if ($(e.currentTarget).hasClass('__registration')) {
                    $("#fancybox-content, #fancybox-wrap").css({
                        'height': '+=100',
                        'width': '+=150'
                    });
                    $("#fancybox-content input[type=text]:first").focus();
                    $.fancybox.resize();
                }
                if ($(e.currentTarget).hasClass('__forgot')) {
                    $("#fancybox-content, #fancybox-wrap").css({
                        'height': '-=150'
                    });
                    $("#fancybox-content input[type=text]:first").focus();
                    $.fancybox.resize();
                }
                $('form', $("#fancybox-content")).bind('submit', function() {
                    var form = this;
                    var data = $(form).serialize();
                    var action = $(form).attr('action');
                    var method = $(form).attr('method');
                    $.ajax({
                        url: action,
                        type: method,
                        data: data,
                        context: form,
                        dataType: 'json',
                        beforeSend: function() {
                            $('label', this).removeClass("error");
                        },
                        error: function() {
                            console.log("error", arguments);
                        },
                        success: function(resp) {
                            if (resp.success == true && resp.redir_to) {
                                window.location.href = resp.redir_to;
                            }
                            if (resp.success == true) {
                                console.log("resp.success", resp);
                                $("#fancybox-content").html(resp.message);
                            } else {
                                var ErrorMessages = new Array();
                                for (var errorItem in resp.errors) {
                                    $('label[for="' + errorItem + '"]', this).addClass("error");
                                    ErrorMessages.push(resp.errors[errorItem]);
                                }
                                jError(ErrorMessages.join("<br/>"), {
                                    ShowOverlay: false,
                                    VerticalPosition: 'top',
                                    TimeShown: 3000
                                });
                            }
                        }
                    });
                    return false;
                });
            }
        });
        return false;
    });
    $("#login-form").bind("submit", function() {
        var form = this;
        var data = $(form).serialize();
        var action = $(form).attr('action');
        var method = $(form).attr('method');
        $.ajax({
            url: action,
            type: method,
            data: data,
            dataType: 'json',
            success: function(resp) {
                if (resp.redir_to) {
                    window.location.href = resp.redir_to;
                }
                if (resp.refreshPage) {
                    window.location = window.location.href;
                }
                if (resp.success == true) {
                    $("#fancybox-content").html(resp.message);
                } else {
                    jError(resp.message, {
                        ShowOverlay: false,
                        VerticalPosition: 'top',
                        TimeShown: 3000
                    });
                }
            }
        });
        return false;
    });
}
SocialProviders.prototype.uloginCallBack = function(params) {}
SocialProviders.prototype.uloginInt = function() {
    if (window.uLogin) {
        uLogin.initWidget('uLogin');
    }
    $('#MenuAmLogin').click(function() {
        window.open($(this).attr('href'), "MenuLogin", "width=450,height=250,left=" +
            ((screen.width - 450) / 2) +
            ",top=" +
            ((screen.height - 250) / 2));
    });
};
SocialProviders.prototype.fillMemberData = function(member_id) {
    var self = this;
    $('<div>', {
        'id': 'fill_data'
    }).appendTo(document.body).dialog({
        width: 975,
        open: function() {
            $('body').css('overflow', 'hidden');
            var dil = this;
            $.ajax({
                url: '/' + jsLang + '/registration/register-social',
                context: dil,
                modal: true,
                data: {
                    member_id: member_id
                },
                success: function(html) {
                    $.fancybox.close();
                    $(this).html(html);
                    var me = this;
                    var dialogButtons = new Array();
                    $('.dialog-btn', this).each(function() {
                        var clickCallBack = $(this).attr('data-action');
                        var dButton = {
                            text: $(this).val(),
                            click: function() {
                                self.callAction(clickCallBack, me);
                            }
                        };
                        dialogButtons.push(dButton);
                        $(this).remove();
                    });
                    $(this).dialog('option', 'buttons', dialogButtons);
                }
            });
        },
        close: function() {
            $('body').css('overflow', 'auto');
            $(this).dialog('destroy').remove();
        }
    });
};
SocialProviders.prototype.cancel_authCallBack = function(target) {}
SocialProviders.prototype.save_and_finishCallBack = function(target) {
    var form = $('form', target);
    var url = $(form).attr('action');
    var type = $(form).attr('method');
    var data = $(form).serialize();
    $.ajax({
        url: url,
        type: type,
        data: data,
        dataType: 'json',
        context: target,
        beforeSned: function(resp) {
            $(this).data('buttons', $(this).dialog('option', 'buttons'));
            $(this).dialog('option', 'buttons', []);
            $(this).dialog('option', 'title', 'sending');
            $('label', this).removeClass('error');
            $('label', this).attr('title', '');
        },
        complete: function(resp) {
            var buttons = $(this).data('buttons');
            $(this).dialog('option', 'buttons', buttons);
            $(this).dialog('option', 'title', 'resived');
        },
        success: function(resp) {
            if (resp.success) {
                $(this).dialog('close');
                b.save_order();
            } else {
                for (var errorKey in resp.errors) {
                    $('label[for="' + errorKey + '"]', this).addClass('error');
                    $('label[for="' + errorKey + '"]', this).attr('title', resp.errors[errorKey]);
                }
            }
        },
        error: function(resp) {}
    });
};
SocialProviders.prototype.callAction = function(action, target) {
    var callAction = action + "CallBack";
    if ($.isFunction(this[callAction])) {
        this[callAction](target);
    } else {}
};
var menuLoginCallBack = function(pwindow, self) {
    $.ajax({
        url: '/' + jsLang + '/profile/me',
        dataType: 'json',
        type: 'post',
        error: function() {},
        success: function(resp) {
            $('#fullname').val(resp.member.fullname);
            $('#email').val(resp.member.email);
            $('#phone').val(resp.member.phone);
            $('#address').val(resp.member.address);
            if (resp.registarrtion_status == 1) {
                $('tr.password').remove();
                $('#submitOrder').trigger('focus');
                $('#quick_order_holder').remove();
                $('#use_social_login').remove();
            } else {
                $('#phone').trigger('focus');
            }
            $("#regAndOrder").attr('action', resp.action);
            self.close();
        }
    });
}
var uloginCallBack = function(token) {
    $.ajax({
        url: '/' + jsLang + '/login/social-ulogin',
        data: {
            token: token
        },
        dataType: 'json',
        type: 'post',
        error: function() {},
        success: function(resp) {
            $('#fullname').val(resp.member.fullname);
            $('#email').val(resp.member.email);
            $('#phone').val(resp.member.phone);
            $('#address').val(resp.member.address);
            if (parseInt(resp.registarrtion_status) == 1) {
                $('tr.password').remove();
                $('#submitOrder').trigger('focus');
                $('#quick_order_holder').remove();
                $('#use_social_login').remove();
            } else {
                $('#phone').trigger('focus');
            }
            $("#welcomeMessageHolder").html(resp.welcomeMessage);
            $("#fancybox-content").html('<div style="text-align: center; padding: 20px;">' + resp.welcomeMessage + '</div>');
            $("#btnSwitcherRegistration").trigger('click');
            $("#regAndOrder").attr('action', resp.action);
            $("#fancybox-close").click(function() {
                window.location.href = window.location.href;
            })
        }
    });
};;
function mCustomScrollbars() {
    $("#mcs5_container").mCustomScrollbar("horizontal", 500, "easeOutCirc", 1, "fixed", "yes", "yes", 20);
}
$.fx.prototype.cur = function() {
    if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null)) {
        return this.elem[this.prop];
    }
    var r = parseFloat(jQuery.css(this.elem, this.prop));
    return typeof r == 'undefined' ? 0 : r;
}

function LoadNewContent(id, file) {
    $("#" + id + " .customScrollBox .content").load(file, function() {
        mCustomScrollbars();
    });
}
$(document).ready(function() {
    var pop_height = $(window).height();
    $('#select_city_block').css('height', pop_height);
    $('.city_select').css('color', '#5a5a5a');
    var bbask = document.getElementById("basket");
    if (bbask) {
        if (bbask.style.display == 'block') {
            var bbtn = document.getElementById("city_sub_btn");
            bbtn.setAttribute('type', 'button');
        }
    }
    if ($(".rest-header #map").length > 0) {
        initMap(lat, long, rest_marker);
    }
    $('#change_city').click(function() {
        $('#select_city_block').css('display', 'block');
    })
    $('#city_close').click(function() {
        $('#select_city_block').css('display', 'none');
        $("#city_sub_btn").css("display", "none");
        $(".takeaway_select").css("display", "block");
        $(".select_city_text").css("display", "block");
        $(".styled-select").css("display", "block");
        $(".city_select").css("display", "block");
        $(".country_select_pop_confirm").css("display", "none");
    })
    $('.area_select_cancel_btn').click(function() {
        $('#city_close').click();
        $("#city_sub_btn").css("display", "none");
        $(".takeaway_select").css("display", "block");
        $(".select_city_text").css("display", "block");
        $(".styled-select").css("display", "block");
        $(".city_select").css("display", "block");
        $(".country_select_pop_confirm").css("display", "none");
    })
    initPriceRangeSlider();
    FixRestaurantMenuNav();
    $('#m_item a').click(function() {
        var href = $(this).attr('href');
        href = href.replace('#', '');
        var _this = this;
        openCurrentSection(href);
        changeBG_SetActiveMenu(_this);
        resetSearch();
        return false;
    });
    $('#isearch_form').submit(function(e) {
        var currentLngId = $('#currentLngId').val();
        _url = $(this).attr("action");
        _term = $('#term').val();
        startAjaxLoader();
        $.ajax({
            url: _url,
            type: 'post',
            data: {
                term: $('#term').val(),
                currentLngId: currentLngId,
                kitchen_filter: 1
            },
            success: function(data) {
                $(".mitems").removeClass("deselected");
                if (data) {
                    $('.cactus').html(data);
                } else {
                    $('.cactus').html(g_trans['no_search_result']);
                }
                endAjaxLoader();
            },
            error: function() {
                endAjaxLoader();
            }
        });
        return false;
    });
    $('#aKitchen').submit(function(e) {
        startAjaxLoader();
        var currentLngId = $('#currentLngId').val();
        _url = '/home/kitchenFilter';
        _data = $(this).serialize();
        $.ajax({
            url: _url,
            type: 'post',
            data: {
                data: _data,
                currentLngId: currentLngId,
                kitchen_filter: 1
            },
            success: function(data) {
                $(".mitems").removeClass("deselected");
                $('.cactus').html(data);
                endAjaxLoader();
            },
            error: function() {
                endAjaxLoader();
            }
        });
        return false;
    });
    scrollDivProduct();
    $('#aSorting').submit(function(e) {
        if ($('#sorting_select option:selected').val() == 'all')
            return false;
        startAjaxLoader();
        var currentLngId = $('#currentLngId').val();
        _url = '/home/sorting.html';
        _data = $(this).serialize();
        $.ajax({
            url: _url,
            type: 'post',
            data: {
                data: _data,
                currentLngId: currentLngId
            },
            success: function(data) {
                $(".mitems").removeClass("deselected");
                if (data != '')
                    $('.cactus').html(data);
                endAjaxLoader();
            },
            error: function() {
                endAjaxLoader();
            }
        });
        return false;
    });
    $('.add_remove_favorite_rest').submit(function() {
        var form = $(this);
        addremovefavrest(form);
        return false;
    });
    var addremovefavrest = function(form) {
        startAjaxLoader();
        var input = form.find('.hid_state');
        var btn = form.find('.add_to_favorite_rest_btn');
        if (input.val() == 1) {
            form.find('.add_to_favorite_rest_btn').css({
                "color": "#000",
                "text-decoration": "underline"
            });
            if (form.parent().get(0)["id"] == "fav_block") {
                form.find('.add_to_favorite_rest_btn').css({
                    "background": "url('/resources/default/css/images/heart_icon.png') no-repeat 0 3px"
                });
            }
            btn.val(g_trans['add_to_favorite']);
            input.val(0);
        } else {
            form.find('.add_to_favorite_rest_btn').css({
                "color": "#cb0000",
                "text-decoration": "none"
            });
            if (form.parent().get(0)["id"] == "fav_block") {
                form.find('.add_to_favorite_rest_btn').css({
                    "background": "url('/resources/default/css/images/heart_icon_hover.png') no-repeat 0 3px"
                });
            }
            btn.val(g_trans['Favorite_rest']);
            input.val(1);
        }
        var currentLngId = $('#currentLngId').val();
        _url = '/restaurant/ajaxaddremovefavoriterest.html';
        _data = form.serialize();
        $.ajax({
            url: _url,
            type: 'post',
            data: _data,
            success: function(data) {
                endAjaxLoader();
            },
            error: function() {
                endAjaxLoader();
            }
        });
        return false;
    }
    $('.add_remove_favorite_prod').submit(function() {
        var form = $(this);
        addremovefavprod(form);
        return false;
    })
    var addremovefavprod = function(form) {
        startAjaxLoader();
        var input = form.find('.hid_state');
        if (input.val() == 1) {
            form.find('.add_to_favorite_prod_btn').css("background", "url('/resources/default/css/images/heart_icon.png') no-repeat 0 3px");
            input.val(0);
        } else {
            form.find('.add_to_favorite_prod_btn').css("background", "url('/resources/default/css/images/heart_icon_hover.png') no-repeat 0 3px");
            input.val(1);
        }
        var currentLngId = $('#currentLngId').val();
        _url = '/restaurant/ajaxaddremovefavoriteprod.html';
        _data = form.serialize();
        $.ajax({
            url: _url,
            type: 'post',
            data: _data,
            success: function(data) {
                endAjaxLoader();
            },
            error: function() {
                endAjaxLoader();
            }
        });
        return false;
    }
    $('.action_start').live('click', function(e) {
        var _id = $(this).attr('id');
        $("#text_" + _id).dialog({
            modal: true,
            width: 700
        });
    });
    $('a._login').click(function() {
        $.fancybox({
            width: 430,
            height: 350,
            autoDimensions: false,
            padding: 0,
            type: 'ajax',
            autoScale: true,
            href: this,
            ajax: {
                data: {
                    action: 'loginPopUp'
                }
            },
            title: g_trans['auth_box'],
            onComplete: function(a, b, c) {
                sp = new SocialProviders();
                $("#fancybox-content input[type=text]:first").focus();
            },
            onClosed: function() {}
        });
        return false;
    });
    $("#sortingItems input:checkbox").click(function() {
        if ($(this).is(":checked")) {
            var group = "input:checkbox[name='" + $(this).attr("name") + "']";
            $(group).prop("checked", false);
            $(this).prop("checked", true);
        } else {
            $(this).prop("checked", false);
        }
    });
    setTimeout(function() {
        checkInduceFillData();
    }, 6000);
    InitHistoryNavigation();
});
var areaconfirmcheck = function() {
    var bbask = document.getElementById("basket");
    if (bbask.style.display == 'block') {
        $("#city_sub_btn").css("display", "none");
        $(".select_city_text").css("display", "none");
        $(".takeaway_select").css("display", "none");
        $(".city_select").css("display", "none");
        $(".styled-select").css("display", "none");
        $(".country_select_pop_confirm").css("display", "block");
        return false;
    }
}
var change_delivery_type = function(param, self) {
    var hidden_input = document.getElementById('del_type');
    hidden_input.value = param;
    $('.delivery_type_btns').removeClass('active');
    $(self).addClass("active");
    $("#city_sub_btn").trigger("click");
}
var menuLoginCallBack = function(self, selfWindow) {
    selfWindow.close();
    $.fancybox.close();
};
var uloginSimpleCallBack = function(token) {
    $.ajax({
        url: '/' + jsLang + '/login/social-ulogin',
        data: {
            token: token
        },
        dataType: 'json',
        type: 'post',
        error: function() {},
        success: function(resp) {
            if (resp.registarrtion_status == 0) {
                $.ajax({
                    url: resp.action,
                    data: {
                        member: resp.member
                    },
                    success: function(data) {
                        $("#fancybox-content").html(data);
                        $("#fancybox-content, #fancybox-wrap").css({
                            'height': '+=100',
                            'width': '+=100'
                        });
                        $.fancybox.resize();
                        $('form', $("#fancybox-content")).submit(function() {
                            var form = this;
                            var url = $(form).attr('action');
                            var type = $(form).attr('method');
                            var data = $(form).serialize();
                            $.ajax({
                                url: url,
                                type: type,
                                data: data,
                                dataType: 'json',
                                context: form,
                                beforeSned: function(resp) {
                                    $('label', this).removeClass('error');
                                    $('label', this).attr('title', '');
                                },
                                success: function(resp) {
                                    $('label', this).removeClass('error').attr("title", "");
                                    if (resp.success) {
                                        setTimeout(function() {
                                            $.fancybox.close();
                                        }, 3000);
                                        window.location = '/' + jsLang + '/profile/edit-my-profile.html';
                                    } else {
                                        for (var errorKey in resp.errors) {
                                            $('label[for="' + errorKey + '"]', this).addClass('error');
                                            $('label[for="' + errorKey + '"]', this).attr('title', resp.errors[errorKey]);
                                        }
                                    };
                                    var jsErrors = new Array();
                                    $('label.error', this).each(function() {
                                        jsErrors.push(this.title);
                                    });
                                    if (jsErrors.length > 0) {
                                        jsErrorsStr = jsErrors.join('<br/>');
                                        jError(jsErrorsStr, {
                                            ShowOverlay: false,
                                            VerticalPosition: 'top',
                                            TimeShown: 3000
                                        });
                                    }
                                }
                            });
                            return false;
                        });
                    }
                });
            } else {
                log_header = '<div class="fancybox-login-header rc5">  </div><div style="width: 95%; margin: 50px auto;">' + resp.welcomeMessage + '</div>';
                $("#fancybox-content").html(log_header);
                $("#fancybox-close").click(function() {
                    window.location.href = window.location.href;
                })
                setTimeout(function() {
                    $("#fancybox-close").trigger('click');
                }, 3000);
            }
        }
    });
};
var scrollDivProduct = function() {}
var setKitchenCheckboxStatus = function(kitchen_array_ids) {
    var current = 0;
    while (true) {
        var checkboxID = 'ddcl-s5a-i' + current;
        if (document.getElementById(checkboxID)) {
            for (var i in kitchen_array_ids) {
                if ($('#' + checkboxID).val() != kitchen_array_ids[i] && $('#' + checkboxID).val() != "all") {
                    $('#' + checkboxID).attr('checked', false);
                } else {
                    var tabSelector = $('.ui-dropdownchecklist-selector span');
                    $(tabSelector).html($('#' + checkboxID).next().html());
                    $('#' + checkboxID).attr('checked', true);
                }
            }
        } else {
            break;
        }
        current++;
    }
}
var getRatingConfig = function(size, isDisabled) {
    return {
        type: size,
        length: 5,
        decimalLength: 0,
        isDisabled: isDisabled,
        rateMax: 5,
        phpPath: '/home/rest-vote',
        bigStarsPath: '/resources/default/css/icons/big.png',
        smallStarsPath: '/resources/default/css/icons/small.png',
        onSuccess: function(data) {
            jSuccess(data.server, {
                ShowOverlay: false
            });
        },
        onError: function(data) {
            jError(data.server, {
                ShowOverlay: false
            });
        }
    }
}
var voteActiveSetFunction = function() {
    var _gp_rates = ReadCookie('gp_rates');
    var gp_rates = new Array();
    if (_gp_rates != '') {
        gp_rates = $.parseJSON(_gp_rates);
    }
    $('.rest-votes').each(function() {
        var rawId = $(this).attr('id').split('_');
        var gp_rates_str = "|" + gp_rates.join('|') + "|";
        var isDisabled = gp_rates_str.indexOf(rawId[1] + "|") > -1;
        var ratingConfig = getRatingConfig('small', isDisabled);
        $(this).jRating(ratingConfig);
    });
}

function changeBG_SetActiveMenu(_this) {
    $('#m_item a').each(function(index, element) {
        $(this).removeClass('menu-button-active');
        $(this).addClass('menu-button');
    });
    $(_this).addClass('menu-button-active');
    $('body').scrollTo($("#flank_div").offset().top - 65, 300);
}

function openCurrentSection(href) {
    setLanguagesHash(href);
    if (href == 'all-items') {} else {}
    if (href == 'all-items') {
        $('#m_item a:first-child').removeClass('menu-button');
        $('#m_item a:first-child').addClass('menu-button-active');
        $('.sections').each(function(index, element) {
            $(this).css('display', 'block');
        });
        $('.menu-cat-title').each(function(index, element) {
            $(this).css('display', 'block');
        });
    } else {
        $('.sections').each(function(index, element) {
            if ('section-' + href != $(this).attr('id')) {
                $(this).css('display', 'none');
            } else {
                $(this).css('display', 'block');
            }
        });
        $('.menu-cat-title').each(function(index, element) {});
    }
    scrollDivProduct();
    $("img.lazy").lazyload({
        event: "click"
    });
    return false;
}

function openInfo() {
    $("#dialog:ui-dialog").dialog("destroy");
    $("#dialog-message").dialog({
        modal: true
    });
}

function ReadCookie(cookieName) {
    var theCookie = " " + document.cookie;
    var ind = theCookie.indexOf(" " + cookieName + "=");
    if (ind == -1)
        ind = theCookie.indexOf(";" + cookieName + "=");
    if (ind == -1 || cookieName == "")
        return "";
    var ind1 = theCookie.indexOf(";", ind + 1);
    if (ind1 == -1)
        ind1 = theCookie.length;
    return unescape(theCookie.substring(ind + cookieName.length + 2, ind1));
}

function startAjaxLoader() {
    document.getElementById("loading").className = "loading-visible";
}

function endAjaxLoader() {
    document.getElementById("loading").className = "loading-invisible";
}

function setLanguagesHash(hash) {
    if (hash == '')
        return;
    var _languages = $('.lang a');
    $(_languages).each(function(index, element) {
        var _href = $(this).attr('href');
        var _href = explode('#', _href);
        _href = _href[0] + '#' + hash;
        $(this).attr('href', _href);
    });
}

function explode(delimiter, string, limit) {
    var emptyArray = {
        0: ''
    };
    if (arguments.length < 2 || typeof arguments[0] == 'undefined' || typeof arguments[1] == 'undefined') {
        return null;
    }
    if (delimiter === '' || delimiter === false || delimiter === null) {
        return false;
    }
    if (typeof delimiter == 'function' || typeof delimiter == 'object' || typeof string == 'function' || typeof string == 'object') {
        return emptyArray;
    }
    if (delimiter === true) {
        delimiter = '1';
    }
    if (!limit) {
        return string.toString().split(delimiter.toString());
    }
    var splitted = string.toString().split(delimiter.toString());
    var partA = splitted.splice(0, limit - 1);
    var partB = splitted.join(delimiter.toString());
    partA.push(partB);
    return partA;
}
var switchQuickForm = function(self) {
    $(self).addClass("active");
    $(self).siblings(".btnSwitcher").removeClass("active");
    $("#reg_form_block").slideUp("", function() {
        $("#quick_form_block").slideDown("", function() {
            $.fancybox.resize();
            $.fancybox.center();
        });
    });
};
var checkInduceFillData = function() {
    var induce_fill_data = $("#induce_fill_data").val();
    if (induce_fill_data == undefined) {
        return false;
    }
    if (induce_fill_data != 0) {
        $.ajax({
            url: "/" + jsLang + "/home/induce-fill-data",
            data: {
                member: induce_fill_data
            },
            dataType: 'json',
            success: function(data) {
                jNotify(data.induceMessage, {
                    ShowOverlay: false,
                    VerticalPosition: 'top',
                    LongTrip: 30,
                    autoHide: false,
                    onClosed: function() {
                        $.fancybox({
                            type: 'ajax',
                            type: 'ajax',
                            modal: false,
                            padding: 0,
                            onClosed: function() {
                                setTimeout(function() {
                                    checkInduceFillData();
                                }, 10000);
                            },
                            href: '/' + jsLang + '/profile/my-profile',
                            ajax: {
                                data: {
                                    member: data.authUser
                                }
                            }
                        });
                    }
                });
            }
        });
    };
};
var switchRegForm = function(self) {
    $(self).addClass("active");
    $(self).siblings(".btnSwitcher").removeClass("active");
    $("#quick_form_block").slideUp("", function() {
        $("#reg_form_block").slideDown("", function() {
            $.fancybox.resize();
            $.fancybox.center();
        });
    });
}

function resetSearch() {
    if ($("#tags").val() != '') {
        $("#tags").val("").change();
    }
}
(function($) {
    jQuery.expr[':'].Contains = function(a, i, m) {
        return $(a).attr("keywords").toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };

    function listFilter(input, list) {
        $(input).change(function() {
            var filter = $(this).val();
            if (filter) {
                $(list).find("a:not(:Contains(" + filter + ")).title").parent().parent().parent().hide();
                $(list).find("a:Contains(" + filter + ").title").parent().parent();
                $(list).find("a:Contains(" + filter + ").title").parent().parent().parent().slideDown();
            } else {
                $(list).find(".product").slideDown();
            }
            scrollDivProduct();
            checkEmptyCategories();
            $("img.lazy").lazyload({
                event: "click"
            });
            return false;
        }).keyup(function() {
            $(this).change();
        });
    }

    function checkEmptyCategories() {
        var allItems = 0;
        $(".sections").each(function() {
            var catItems = 0;
            $(this).find(".product").each(function() {
                if ($(this).is(":visible")) {
                    catItems++;
                }
            })
            allItems += catItems;
            if (catItems == 0) {
                $(this).children(".menu-cat-title").hide();
            } else {
                $(this).children(".menu-cat-title").show();
            }
        })
        if (allItems == 0) {
            $("#no_result").show();
        } else {
            $("#no_result").hide();
        }
    }
    $(function() {
        listFilter($("#tags"), $(".wrapper"));
    });
}(jQuery));
var initAddressTab = function() {
    $("#addressTab").tabs({
        fx: {
            height: 'toggle',
            opacity: 'toggle'
        },
        select: function(event, ui) {
            $("[id*=add-tab-]").each(function() {
                if ($(this).attr("id") != ui.panel.id) {
                    $(this).find("input,select").attr("disabled", "disabled");
                } else {
                    $(this).find("input,select").removeAttr("disabled");
                }
            });
        }
    });
}
var initPhonesTab = function() {
    $("#phonesTab").tabs({
        fx: {
            height: 'toggle',
            opacity: 'toggle'
        },
        select: function(event, ui) {
            $("[id*=phone-tab-]").each(function() {
                if ($(this).attr("id") != ui.panel.id) {
                    $(this).find("input,select").attr("disabled", "disabled");
                } else {
                    $(this).find("input,select").removeAttr("disabled");
                }
            });
        }
    });
}

function recordOutboundLink(category, _link, label) {
    if (_gaq) {
        _gaq.push(['_trackEvent', category, _link, label, 1]);
    }
}
var showAsGrid = function(type) {
    $.cookie("show_as_" + type, "grid");
    location.reload();
}
var showAsList = function(type) {
    $.cookie("show_as_" + type, "list");
    location.reload();
}
var prodShowAsGrid = function(type) {
    $.cookie("prod_show_as_" + type, "grid");
    location.reload();
}
var prodShowAsList = function(type) {
    $.cookie("prod_show_as_" + type, "list");
    location.reload();
}
var initPriceRangeSlider = function() {
    if ($("#price-range").length > 0) {
        $("#price-range").slider({
            range: true,
            min: 0,
            max: 200000,
            step: 500,
            values: [$("#price-range").attr('from'), $("#price-range").attr('to')],
            slide: function(event, ui) {
                $("#amount_from").val(ui.values[0]);
                $("#amount_to").val(ui.values[1]);
                $("#from_price_label").html(ui.values[0]);
                $("#to_price_label").html(ui.values[1]);
                var fromLeft = $(".ui-slider-handle:eq(0)").position();
                fromLeft = fromLeft['left'] - $("#from_price_label").width() / 2 - 4;
                var toLeft = $(".ui-slider-handle:eq(1)").position();
                toLeft = toLeft['left'] - $("#to_price_label").width() / 2 - 4;
                $("#from_price_label").css('left', fromLeft);
                $("#to_price_label").css('left', toLeft);
            }
        });
        $("#amount_from").val($("#price-range").slider("values", 0));
        $("#amount_to").val($("#price-range").slider("values", 1));
        $("#from_price_label").html($("#price-range").slider("values", 0));
        $("#to_price_label").html($("#price-range").slider("values", 1));
        var fromLeft = $(".ui-slider-handle:eq(0)").position();
        fromLeft = fromLeft['left'] - $("#from_price_label").width() / 2 - 4;
        var toLeft = $(".ui-slider-handle:eq(1)").position();
        toLeft = toLeft['left'] - $("#to_price_label").width() / 2 - 4;
        $("#from_price_label").css('left', fromLeft);
        $("#to_price_label").css('left', toLeft);
    }
}
var initJcarousel = function() {
    if ($('.jcarousel').length > 0) {
        $('.jcarousel').jcarousel();
        $('.jcarousel-pagination').on('jcarouselpagination:active', 'a', function() {
            $(this).addClass('active');
        }).on('jcarouselpagination:inactive', 'a', function() {
            $(this).removeClass('active');
        }).on('click', function(e) {
            e.preventDefault();
        }).jcarouselPagination({
            'perPage': 5,
            item: function(page) {
                if ($(".jcarousel ul li").length > 5) {
                    return '<a href="#' + page + '">' + page + '</a>';
                }
            }
        });
    }
}
var FixRestaurantMenuNav = function() {
    if ($("#restaurantMenuNav").length > 0) {
        $('#restaurantMenuNav').fixer({
            gap: 60
        });
    }
}
var InitHistoryNavigation = function() {
    var historyData = {};
    if ($.cookie('history_navigation')) {
        historyData = JSON.parse($.cookie('history_navigation'));
    } else {}
    var index = 0;
    if (typeof historyData[index] != "undefined") {
        index = 1;
    }
    var parts = window.location.pathname.split('/');
    var fullPath;
    if (parts[1] == 'am' || parts[1] == 'ru' || parts[1] == 'en') {
        fullPath = parts.splice(2, parts.length);
    } else {
        fullPath = parts.splice(1, parts.length);
    }
    if (typeof historyData[1] != "undefined") {
        if (historyData[1] != fullPath.join('/')) {
            historyData[0] = historyData[1];
            historyData[1] = fullPath.join('/');
        }
    } else {
        historyData[index] = fullPath.join('/');
    }
    $.cookie('history_navigation', JSON.stringify(historyData), {
        expires: 10,
        path: '/'
    });
}
var HistoryGoBack = function() {
    var parts = window.location.pathname.split('/');
    var lngCode = '';
    if (parts[1] == 'am' || parts[1] == 'ru' || parts[1] == 'en') {
        lngCode = parts[1] + '/';
    }
    if ($.cookie('history_navigation')) {
        historyData = JSON.parse($.cookie('history_navigation'));
        window.location.href = '/' + lngCode + historyData[0];
    } else {
        window.location.href = '/' + lngCode + 'home.html';
    }
}
var readCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
$(document).on('submit', '#add_to_favorite', function(e) {
    e.preventDefault();
    startAjaxLoader();
    var currentLngId = $('#currentLngId').val();
    _url = '/restaurant/ajaxaddfavoriterest.html';
    _data = $(this).serialize();
    $.ajax({
        url: _url,
        type: 'post',
        data: _data,
        success: function(data) {
            $('#add_to_favorite').css('display', 'none');
            $('#remove_from_favorite').css('display', 'block');
            endAjaxLoader();
        },
        error: function() {
            endAjaxLoader();
        }
    });
    return false;
});
$(document).on('submit', '#remove_from_favorite', function(e) {
    e.preventDefault();
    startAjaxLoader();
    var currentLngId = $('#currentLngId').val();
    _url = '/restaurant/ajaxremovefavoriterest.html';
    _data = $(this).serialize();
    $.ajax({
        url: _url,
        type: 'post',
        data: _data,
        success: function(data) {
            $('#add_to_favorite').css('display', 'block');
            $('#remove_from_favorite').css('display', 'none');
            endAjaxLoader();
        },
        error: function() {
            endAjaxLoader();
        }
    });
    return false;
});
$(function() {
    var show_popup_value = $('body').data('showpopupvalue');
    var show_popup = $.cookie('show_popup');
    if (show_popup != show_popup_value) {
        $('#select_city_block').css('display', 'block');
        $.cookie('show_popup', show_popup_value, {
            path: '/',
            expires: 3652
        });
    }
});
$(document).on("click", ".confirm_delete_btn", function() {
    var element = $(this);
    var address_id = $(this).attr("data-address");
    $.ajax({
        url: "/profile/AjaxDeleteMemberAddress",
        type: 'post',
        data: {
            address_id: address_id
        },
        success: function(data) {
            $(".profile_page_addresses_item [data-address=" + address_id + "]").closest(".profile_page_addresses_item").css("display", "none");
            $("#delete_address_confirm_popup").css("display", "none");
            $("#black_op").css("display", "none");
        },
        error: function() {}
    });
    return false;
})
var showdeleteaddresspopup = function(id) {
    var width = $("#main").width();
    var height = $("#main").height();
    var popup_width = $("#delete_address_confirm_popup").width();
    var left_px = (width - popup_width) / 2;
    $('#black_op').css({
        "width": width,
        "height": height,
        "display": "block"
    });
    $('#delete_address_confirm_popup').css("left", left_px);
    $('#delete_address_confirm_popup').css("display", "block");
    $('.confirm_delete_btn').attr('data-address', id);
}
var hidedeleteaddresspopup = function() {
    $("#delete_address_confirm_popup").css("display", "none");
    $("#black_op").css("display", "none");
}

function geocodePosition(pos) {
    geocoder.geocode({
        latLng: pos
    }, function(responses) {
        if (responses && responses.length > 0) {
            updateMarkerAddress(responses[0]['address_components'][1].short_name + " " + responses[0]['address_components'][0].short_name);
        } else {}
    });
}

function updateMarkerAddress(value) {
    $('#addres_info_street').val(value);
    $('#addres_info_house').val('');
    $('#addres_info_apartament').val('');
}
var google_map_function = function() {
    var map;
    var positionWatchId = 0;
    var initialized = false;
    var markerUser = undefined;
    var new_order_marker = undefined;
    var error;
    var center = new google.maps.LatLng('40.1792', '44.4991');
    if (positionWatchId != 0)
        return;
    var target, options;
    options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function success(pos) {
        var crd = pos.coords;
        var point = {
            lat: crd.latitude,
            lng: crd.longitude
        };
        if (!new_order_marker) {
            var image = {
                url: '/resources/default/css/images/user-marker.png',
                size: new google.maps.Size(64, 64),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(64, 85),
                scaledSize: new google.maps.Size(64, 64)
            };
            new_order_marker = new google.maps.Marker({
                map: map,
                position: point,
                title: 'My Location'
            });
        } else {
            new_order_marker.setPosition(point);
            new_order_marker.setMap(map);
        }
        map.panTo(point);
        if (positionWatchId) {
            navigator.geolocation.clearWatch(positionWatchId);
            positionWatchId = 0;
        }
        geocodePosition(new_order_marker.getPosition());
    }
    positionWatchId = navigator.geolocation.watchPosition(success, error, options);
    var autocomplete = null;
    var mapOptions = {
        zoom: 15,
        center: center
    };
    var tripsMap = new google.maps.Map(document.getElementById("address_map"), mapOptions);
    geocoder = new google.maps.Geocoder();
    map = tripsMap;
    var input = document.getElementById('addres_info_street');
    autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', tripsMap);
    var infowindow = new google.maps.InfoWindow();
    new_order_marker = new google.maps.Marker({
        map: tripsMap,
        anchorPoint: new google.maps.Point(0, -29),
        draggable: true
    });
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        newOrderLat = null;
        newOrderLng = null;
        infowindow.close();
        new_order_marker.setMap(null);
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
            newOrderLat = place.geometry.location.lat();
            newOrderLng = place.geometry.location.lng();
        }
        new_order_marker.setIcon(({
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        }));
        new_order_marker.setPosition(place.geometry.location);
        new_order_marker.setMap(tripsMap);
        tripsMap.setCenter(place.geometry.location);
        var address = '';
        if (place.address_components) {
            address = [(place.address_components[0] && place.address_components[0].short_name || ''), (place.address_components[1] && place.address_components[1].short_name || ''), (place.address_components[2] && place.address_components[2].short_name || '')].join(' ');
        }
    });
    google.maps.event.addListener(new_order_marker, 'dragend', function() {
        geocodePosition(new_order_marker.getPosition());
    });
    map.addListener('click', function(event) {
        new_order_marker.setMap(null);
        new_order_marker.setPosition(event.latLng);
        new_order_marker.setMap(tripsMap);
        geocodePosition(event.latLng);
    });
}
var getMyLocation = function(adjust_center) {
    var map;
    var positionWatchId = 0;
    var initialized = false;
    var markerUser = undefined;
    if (positionWatchId != 0)
        return;
    var target, options;
    options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function success(pos) {
        var crd = pos.coords;
        var point = {
            lat: crd.latitude,
            lng: crd.longitude
        };
        if (!markerUser) {
            var image = {
                url: '/resources/default/css/images/user-marker.png',
                size: new google.maps.Size(64, 64),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(64, 85),
                scaledSize: new google.maps.Size(64, 64)
            };
            markerUser = new google.maps.Marker({
                icon: image,
                map: map,
                position: point,
                title: 'My Location'
            });
        } else {
            markerUser.setPosition(point);
            markerUser.setMap(map);
        }
        if (adjust_center) {
            map.panTo(point);
        }
        if (positionWatchId) {
            navigator.geolocation.clearWatch(positionWatchId);
            positionWatchId = 0;
        }
    }

    function error(err) {
        console.warn('ERROR(' + err.code + '): ' + err.message);
    }
    positionWatchId = navigator.geolocation.watchPosition(success, error, options);
};;
var urlChanged = false;
 
// BASKET ///////
var basket = function(menu_id, rest_label, lng_code, bonus, menu_list, rest_alias) {
    var self = this;
    if (menu_list != '' && menu_id != '')
        self.menu_list = menu_id + "," + menu_list;
    else if (menu_list != '' && menu_id == '')
        self.menu_list = menu_list;
    else if (menu_list == '' && menu_id != '')
        self.menu_list = menu_id;
    else
        self.menu_list = "";
    self.menu_id = menu_id;
    self.rest_label = rest_label;
    self.loaded = false;
    self.lng_code = lng_code;
    self.bonus = bonus;
    self.rest_alias = rest_alias;
    self._price = '';
    var _delPrice = parseInt($("#city").find('option:selected').attr('price'));
    if (_delPrice > 0) {
        self._delivery_price = _delPrice;
    } else {
        self._delivery_price = 400;
    }
    self.delCity = parseInt($("#city").find('option:selected').val());
    self.getMenu(function(data) {
        self.basket_data = {};
        self.basket_data.restaurants = {};
        if (self.menu_id != '') {
            self.basket_data.restaurants[self.menu_id] = {};
            self.basket_data.restaurants[self.menu_id]['label'] = self.rest_label;
            self.basket_data.restaurants[self.menu_id]['products'] = {};
            self.basket_data.restaurants[self.menu_id]['price'] = {};
            self.basket_data.restaurants[self.menu_id].delivery_price = self._delivery_price;
        }
        self.opts = {};
        self.menu = data;
        self.loaded = true;
        self._prodCount = 0;
        self.checkBasket();
    });
    return this;
}
basket.prototype.GetRelatedProducts = function() {
    var self = this;
    var products = {};
    if (typeof this.basket_data.restaurants != 'undefined') {
        for (var r in this.basket_data.restaurants) {
            for (var p in this.basket_data.restaurants[r].products) {
                products[p] = this.basket_data.restaurants[r].products[p]['product'];
            }
        }
    }
    if (!$.isEmptyObject(products)) {
        $.ajax({
            url: '?action=relatedProducts',
            type: 'post',
            dataType: 'json',
            data: {
                'products': products
            },
            success: function(data) {
                if (data['html']) {
                    $("#relatedProducts").html(data['html']);
                    if (self.menu_list) {
                        self.menu_list += ',' + data['menu_lists'];
                    } else {
                        self.menu_list = data['menu_lists'];
                    }
                    self.getMenu(function(data) {
                        self.getMenuCallback(data);
                    });
                    $(".related-products-block").show();
                    initProductLink();
                } else {
                    $(".related-products-block").hide();
                }
            },
            error: function() {}
        })
    }
}
basket.prototype.getMenu = function(callback) {
    var self = this;
    $.ajax({
        url: '/' + self.lng_code + '/basket/get-menu',
        dataType: 'json',
        type: 'post',
        data: {
            menu_id: self.menu_list
        },
        success: function(data) {
            callback(data);
            $(".basketLoader").hide();
            endAjaxLoader();
        },
        error: function() {}
    });
}
basket.prototype.checkBasket = function(callback) {
    var self = this;
    var _choiceId = '';
    $.ajax({
        url: '/' + self.lng_code + '/basket/get-basket',
        dataType: 'json',
        success: function(data) {
            if (typeof data.basket != "undefined") {
                self.basket_data = $.parseJSON(data.basket);
                self.recalc_totals();
            }
        },
        error: function() {}
    });
}
basket.prototype.add_to_basket = function(menu_id, product_id, rest_id) {
    var self = this;
    self._prodCount = $(".b-product").length + 1;
    if (!self.loaded)
        return;
    if (self.menu[product_id].inventory == 1 && self.menu[product_id].instock == 0) {
        alert(g_trans['not_in_stock']);
        return;
    }
    if (typeof self.menu[product_id].options == 'undefined') {
        self.save_options(menu_id, product_id, rest_id);
    } else {
        if (self.menu_id) {
            self.choose_options(self.menu_id, product_id + '-' + self._prodCount, rest_id);
        } else {
            self.choose_options(menu_id, product_id + '-' + self._prodCount, rest_id);
        }
    }
    return;
}
basket.prototype.recalc_totals = function() {
    var self = this;
    var total = 0;
    var delivery_price = 0;
    var _delPrice = parseInt($("#city").find('option:selected').attr('price'));
    if (_delPrice > 0) {
        self._delivery_price = _delPrice;
    } else {
        self._delivery_price = 400;
    }
    self.basket_data['delCity'] = parseInt($("#city").find('option:selected').val());
    $(".basketLoader").show();
    for (var r in self.basket_data.restaurants) {
        var rest_total = 0;
        for (var i in self.basket_data.restaurants[r]['products']) {
            var _index = i.split('-');
            _index = _index[0];
            total += parseFloat(self.menu[_index]['price'] * self.basket_data.restaurants[r]['products'][i]['qty']);
            var _count = self.basket_data.restaurants[r]['products'][i]['qty'];
            var _price = self.menu[_index].price;
            var _ccount = 0;
            var _cprice = 0;
            var _totalChoicesPrice = 0;
            for (var k in self.basket_data.restaurants[r]['products'][i]['choices']) {
                _count = parseInt(self.basket_data.restaurants[r]['products'][i]['qty']);
                _cprice = parseFloat(self.basket_data.restaurants[r]['products'][i]['choices'][k]['price']);
                _totalChoicesPrice += _cprice;
                total += parseFloat(self.basket_data.restaurants[r]['products'][i]['qty'] * self.basket_data.restaurants[r]['products'][i]['choices'][k]['price']);
                self.basket_data.restaurants[r]['products'][i]['choices'][k]['qty'] = self.basket_data.restaurants[r]['products'][i]['qty'];
            }
            rest_total += (parseFloat(_totalChoicesPrice) + parseFloat(_price)) * _count;
            var _price_label = parseFloat((parseFloat(_price) + parseFloat(_totalChoicesPrice)) * _count).toFixed(toFixed_count) + '&nbsp;' + g_trans['dram'];
            $("#b-prod-" + i).find(".price").html(g_trans['price'] + '&nbsp;' + _price_label);
        }
        rest_total = parseFloat(rest_total).toFixed(toFixed_count);
        self.basket_data.restaurants[r]['price'] = rest_total;
    }
    total = parseFloat(total);
    self.basket_data['price'] = total;
    self._price = total;
    delivery_price = self._delivery_price;
    var _new_total_price = 0;
    if (total > 0) {
        for (var r in self.basket_data.restaurants) {
            _new_total_price += parseFloat(self.basket_data.restaurants[r].price);
            total += parseFloat(self.basket_data.restaurants[r].delivery_price).toFixed(toFixed_count);
        }
    }
    var del_type_cookie = readCookie('delivery_type');
    if (del_type_cookie != 'takeaway') {
        _new_total_price += self._delivery_price;
    }
    self.basket_data['total_price'] = _new_total_price;
    $('#price').html(self.basket_data['price']);
    if (Object.keys(self.basket_data.restaurants).length >= 1 && del_type_cookie != 'takeaway') {
        $('#total-price').html(self.basket_data['total_price']);
    }
    if ($.cookie('useBonus') == 1) {
        b.useBonus();
    }
    $("#delivery-price").html(delivery_price);
    if (total == 0) {
        $('#basket').hide();
    } else
        $('#basket').show();
    $.ajax({
        url: '/' + self.lng_code + '/basket/save-basket',
        dataType: 'json',
        type: 'post',
        data: {
            basket: self.basket_data
        },
        success: function(data) {
            $(".basketLoader").hide();
            if (data != null) {
                if (data.status == false) {
                    for (var errorKey in data.errors) {
                        $('label[for="' + errorKey + '"]').addClass('error');
                        $('label[for="' + errorKey + '"]').attr('title', data.errors[errorKey]);
                    }
                    var jsErrors = new Array();
                    $('label.error').each(function() {
                        jsErrors.push(this.title);
                    });
                    jsErrorsStr = jsErrors.join('<br/>');
                    jError(jsErrorsStr, {
                        ShowOverlay: false,
                        VerticalPosition: 'top',
                        TimeShown: 5000
                    });
                } else {
                    if ($.cookie('useBonus') == 1) {
                        $('#use_bonus_chk').prop('checked', true);
                    } else {
                        $('#use_bonus_chk').prop('checked', false);
                    }
                    $('#use_bonus_chk').prop('disabled', false);
                    data.price = parseFloat(data.price).toFixed(toFixed_count)
                    data.delivery_price = parseFloat(data.delivery_price).toFixed(toFixed_count)
                    data.total_price = parseFloat(data.total_price).toFixed(toFixed_count)
                    $("#price").html(data.price);
                    $("#delivery-price").html(data.delivery_price);
                    if (del_type_cookie != 'takeaway') {
                        $("#total-price").html(data.total_price);
                    } else {
                        $("#total-price").html(data.price);
                    }
                    if ($.cookie('useBonus') == 1) {
                        b.useBonus();
                    }
                }
            }
            if ($.isEmptyObject(self.basket_data.restaurants) && $(".shopping-cart").length > 0) {
                HistoryGoBack();
            }
        },
        error: function() {}
    });
    if (Object.keys(self.basket_data.restaurants).length >= 1 && del_type_cookie != 'takeaway') {
        self.ShowShoppingCart();
    }
    self.GetRelatedProducts();
}
basket.prototype.choose_options = function(menu_id, product_id, rest_id) {
    var self = this;
    var html = '';
    var optionsBlock = '';
    var imageBlock = '';
    var _index = product_id.split('-');
    _index = _index[0];
    var product = self.menu[_index];
    if (typeof product.options == "undefined" || product.options.length == 0) {
        var _description = '';
        if (typeof self.basket_data.restaurants[menu_id] == "undefined") {
            var _price = product.price;
            var _count = product.qty;
            var _description = '';
        } else {
            if (typeof self.basket_data.restaurants[menu_id].products[product_id] == "undefined") {
                var _price = product.price;
                var _count = 1;
                var _description = '';
            } else {
                var _price = self.basket_data.restaurants[menu_id].products[product_id].price;
                var _count = self.basket_data.restaurants[menu_id].products[product_id].qty;
                _price = _count * _price;
                var _description = self.basket_data.restaurants[menu_id].products[product_id].description;
            }
        }
        if (typeof _description == "undefined")
            _description = '';
        if (typeof product.image != "undefined" && product.image != '')z
            imageBlock += '<a href="/resources/default/img/restaurant_products/big/' +
            product.image + '" rel="lightbox" title="' + product.label + '"><img src="/resources/default/img/restaurant_products/small/' +
            product.image + '" class="prod_image" alt="' + product.label + ' title="' + product.label + '"><img src="/resources/default/css/icons/zoom.png" class="zoom-icon" alt="" title="' + g_trans['click_to_enlarge'] + '" /></a>' + self.GetAddthisButtons(product);
        else
            imageBlock += '<img src="/images/noImage.jpg" class="prod_image" >';
        imageBlock += '<div class="countBlock"><span style="float: left; line-height: 2em; margin-right: 10px;">' + g_trans['count'] + '</span><label class="fl"><input type="text" name="count" class="options_count fl" value="' +
            _count +
            '" style="width: 40px" maxlength="2" /></label><br class="cb"/></div>';
        imageBlock += '<input type="hidden" id="_productId" value="' + product.id +
            '" />';
        if (product.content != '')
            optionsBlock += product.content + "<br />";
        optionsBlock += '<span>' + g_trans['order_description'] + '</span>';
        optionsBlock += '<textarea id="description" >' +
            _description + '</textarea>';
        imageBlock += '<span class="fl" style="line-height: 2em;"><span>' +
            g_trans['total_price'] + '</span><br /> <span class="options_price">' +
            _price + '&nbsp;' + g_trans['dram'] + '</span></span><br /><br />';
        if (typeof self.basket_data.restaurants[menu_id] == "undefined") {
            optionsBlock += '<label class="btn_block"><input type="button" onclick="b.save_options(\'' + menu_id + '\',\'' + product.id + '\',\'' + rest_id + '\')" id="opts-save" value="' +
                g_trans['add_to_basket'] +
                '" class="btn" /><input type="button" onclick="b.close_dialog(); return false" class="btn" value="' +
                g_trans['close'] + '" /></label>';
        } else {
            if (typeof self.basket_data.restaurants[menu_id].products[product_id] == "undefined")
                optionsBlock += '<label class="btn_block"><input type="button" onclick="b.save_options(\'' + menu_id + '\',\'' + product.id + '\', \'' + rest_id + '\')" id="opts-save" value="' +
                g_trans['add_to_basket'] +
                '" class="btn" /><input type="button" onclick="b.close_dialog(); return false" class="btn" value="' +
                g_trans['close'] + '" /></label>';
            else
                optionsBlock += '<label class="btn_block"><input type="button" onclick="b.update_options(\'' + menu_id + '\',\'' + product_id + '\', \'' + rest_id + '\')" id="opts-save" value="' +
                g_trans['add_to_basket'] +
                '" class="btn"/><input type="button" onclick="b.close_dialog(); return false" class="btn" value="' +
                g_trans['close'] + '" /></label>';
        }
        html = '<div class="optionsBlock">' + optionsBlock + '</div><div class="imageBlock">' + imageBlock + '</div>';
        $('#dialog').html('');
        $('#dialog').html(html);
    } else {
        if (typeof self.basket_data.restaurants[menu_id] == "undefined") {
            var _price = product.price;
            var _count = product.qty;
            var _description = '';
        } else {
            if (typeof self.basket_data.restaurants[menu_id].products[product_id] == "undefined") {
                var _price = product.price;
                var _count = product.qty;
                var _description = '';
            } else {
                var _price = self.basket_data.restaurants[menu_id].products[product_id].price;
                var _count = self.basket_data.restaurants[menu_id].products[product_id].qty;
                _price = _count * _price;
                var _description = self.basket_data.restaurants[menu_id].products[product_id].description;
            }
        }
        if (typeof product.image != "undefined" && product.image != '')
            imageBlock += '<a href="/resources/default/img/restaurant_products/big/' +
            product.image + '" rel="lightbox" title="' + product.label + '"><img src="/resources/default/img/restaurant_products/small/' +
            product.image + '" class="prod_image" ><img src="/resources/default/css/icons/zoom.png" class="zoom-icon" alt="" title="' + g_trans['click_to_enlarge'] + '" /></a>' + self.GetAddthisButtons(product);
        else
            imageBlock += '<img src="/images/noImage.jpg" class="prod_image" >';
        imageBlock += '<div class="countBlock"><span style="float: left; line-height: 2em; margin-right: 10px;">' + g_trans['count'] + '</span><label class="fl"><input type="text" name="count" class="options_count fl" value="' +
            _count +
            '" style="width: 40px" maxlength="2" /></label><br class="cb"/></div>';
        $('#dialog').html('');
        self.opts = {};
        optionsBlock += self.draw_options(product.options, menu_id, product_id, 0, 0);
        optionsBlock += "<br />";
        if (typeof _description == "undefined")
            _description = '';
        if (product.content != '')
            optionsBlock += product.content + "<br />";
        optionsBlock += '<span>' + g_trans['order_description'] + '</span>';
        optionsBlock += '<textarea id="description" >' +
            _description + '</textarea>';
        imageBlock += '<span class="fl"><span>' + g_trans['total_price'] +
            '</span><br /> <span class="options_price">' + _price +
            '&nbsp;' + g_trans['dram'] + '</span></span><br /><br />';
        if (typeof self.basket_data.restaurants[menu_id] == "undefined") {
            optionsBlock += '<label class="btn_block"><input type="button" onclick="b.save_options(\'' + menu_id + '\',\'' + product.id + '\', \'' + rest_id + '\')" id="opts-save" value="' +
                g_trans['add_to_basket'] +
                '" class="btn" /><input type="button" onclick="b.close_dialog(); return false" class="btn" value="' +
                g_trans['close'] + '" /></label>';
        } else {
            if (typeof self.basket_data.restaurants[menu_id].products[product_id] == "undefined")
                optionsBlock += '<label class="btn_block"><input type="button" onclick="b.save_options(\'' + menu_id + '\',\'' + product.id + '\', \'' + rest_id + '\')" id="opts-save" value="' +
                g_trans['add_to_basket'] +
                '" class="btn" /><input type="button" onclick="b.close_dialog(); return false" class="btn" value="' +
                g_trans['close'] + '" /></label>';
            else
                optionsBlock += '<label class="btn_block"><input type="button" onclick="b.update_options(\'' + menu_id + '\',\'' + product_id + '\', \'' + rest_id + '\')" id="opts-save" value="' +
                g_trans['add_to_basket'] +
                '" class="btn"/><input type="button" onclick="b.close_dialog(); return false" class="btn" value="' +
                g_trans['close'] + '" /></label>';
        }
    }
    var get_total_choosen = function(option) {
        var total = 0;
        $('.opt-' + option).each(function() {
            if (parseInt($(this).val())) {
                total++;
            }
        });
        return total;
    }
    html = '<div class="optionsBlock">' + optionsBlock + '</div><div class="imageBlock">' + imageBlock + '</div>';
    $('#dialog').html(html);
    $('#dialog').dialog({
        title: product.label,
        width: 677,
        modal: true,
        open: function() {
            if ($('.options_count').length > 0) {
                $('.options_count').spinner({
                    min: 1,
                    max: 100
                });
            }
            self.InitAddThis();
        },
        close: function() {
            $('body').css('overflow', 'auto');
            $("#dialog").html('');
        }
    });
    $(".choice").change(function() {
        var _optionGroup = $(this).attr("option");
        self.choiceLimit("opt-" + _optionGroup, this, parseInt($(this).attr("minimum")), parseInt($(this).attr("maximum")));
        var optionGroup = $(this).attr("name");
        $("input[name=" + optionGroup + "]").each(function() {
            if (!$(this).is(":checked") && $(".sub-" + $(this).attr("id")).length > 0) {
                $(this).parent().removeClass("isopen");
                $(".sub-" + $(this).attr("id")).slideUp();
                $(".sub-" + $(this).attr("id")).find("input").each(function() {
                    $(this).attr("checked", false);
                })
            } else {}
        })
        if ($(".sub-" + $(this).attr("id")).length > 0) {
            if ($(this).is(":checked")) {
                $(this).parent().addClass("isopen");
                $(".sub-" + $(this).attr("id")).slideDown();
                $(".sub-" + $(this).attr("id")).find("input").first().trigger("click")
            } else {
                $(".sub-" + $(this).attr("id")).slideUp();
                $(".sub-" + $(this).attr("id")).find("input").each(function() {
                    $(this).attr("checked", false);
                })
            }
        }
        var total_price = self.get_total_price(parseFloat(product.price));
        $(".options_price").html(total_price + '&nbsp;' + g_trans['dram']);
    });
    var total_price = self.get_total_price(parseFloat(product.price));
    $(".options_price").html(total_price + '&nbsp;' + g_trans['dram']);
    if (typeof(self.basket_data.restaurants[menu_id]) == "undefined") {
        if (typeof(product.options) != "undefined") {
            for (var i in product.options) {
                if (parseInt(product.options[i].minimum) == 1) {
                    $(".opt-" + i + ":first").trigger("click");
                }
            }
        }
    } else {
        if (typeof(self.basket_data.restaurants[menu_id].products[product_id]) == "undefined" && typeof(product.options) != "undefined") {
            for (var i in product.options) {
                if (parseInt(product.options[i].minimum) == 1 && typeof(self.basket_data.restaurants[menu_id].products[product_id]) == "undefined") {
                    $(".opt-" + i + ":first").trigger("click");
                }
            }
        }
    }
    $(".options_count").change(function() {
        if ($(".choice").length > 0) {
            var _pprice = parseInt(product.price);
            var _price = 0;
            $(".choice:checked").each(function() {
                _price += parseFloat($(this).attr("price")).toFixed(toFixed_count) * 1;
            })
            _price = _price * 1;
            _pprice = _pprice * 1;
            var _count = parseInt($(this).val());
            var total_price = parseFloat((_pprice + _price) * _count).toFixed(toFixed_count);
            $(".options_price").html(total_price + '&nbsp;' + g_trans['dram']);
        } else {
            var _product_id = parseInt($("#_productId").attr("value"));
            var _price = parseFloat(self.menu[_product_id].price).toFixed(toFixed_count);
            var _count = parseInt($(this).val());
            _price = _price * 1;
            var total_price = parseFloat(_price * _count).toFixed(toFixed_count);
            $(".options_price").html(total_price + '&nbsp;' + g_trans['dram']);
        }
    });
}
basket.prototype.choose_options_new = function(menu_id, product_id, rest_id) {
    var self = this;
    var html = '';
    var optionsBlock = '';
    var imageBlock = '';
    var _index = product_id.split('-');
    _index = _index[0];
    var product = self.menu[_index];
    var rrest_id = window.location.hash.substr(1);
    if (typeof(rest_id) == 'undefined') {
        rest_id = rrest_id;
    }
    rest_id = rrest_id;
    if (typeof product.options == "undefined" || product.options.length == 0) {
        var _description = '';
        if (typeof self.basket_data.restaurants[menu_id] == "undefined") {
            var _price = product.price;
            var _count = product.qty;
            var _description = '';
        } else {
            if (typeof self.basket_data.restaurants[menu_id].products[product_id] == "undefined") {
                var _price = product.price;
                var _count = 1;
                var _description = '';
            } else {
                var _price = self.basket_data.restaurants[menu_id].products[product_id].price;
                var _count = self.basket_data.restaurants[menu_id].products[product_id].qty;
                _price = _count * _price;
                var _description = self.basket_data.restaurants[menu_id].products[product_id].description;
            }
        }
        if (typeof product.image != "undefined" && product.image != '')
            imageBlock += '<a href="/resources/default/img/restaurant_products/big/' +
            product.image + '" rel="lightbox" title="' + product.label + '"><img src="/resources/default/img/restaurant_products/small/' +
            product.image + '" class="prod_image" ><img src="/resources/default/css/icons/zoom.png" class="zoom-icon" alt="" title="' + g_trans['click_to_enlarge'] + '" /></a>' + self.GetAddthisButtons(product);
        else
            imageBlock += '<img src="/images/noImage.jpg" class="prod_image" >';
        imageBlock += '<div class="countBlock"><span style="float: left; line-height: 2em; margin-right: 10px;">' + g_trans['count'] + '</span><label class="fl"><input type="text" name="count" class="options_count fl" value="' +
            _count +
            '" style="width: 40px" maxlength="2" /></label><br class="cb"/></div>';
        imageBlock += '<input type="hidden" id="_productId" value="' + product.id +
            '" />';
        if (product.content != '')
            optionsBlock += product.content + "<br />";
        optionsBlock += '<span>' + g_trans['order_description'] + '</span>';
        optionsBlock += '<textarea id="description" >' +
            _description + '</textarea>';
        imageBlock += '<span class="fl" style="line-height: 2em;"><span>' +
            g_trans['total_price'] + '</span><br /> <span class="options_price">' +
            _price + '&nbsp;' + g_trans['dram'] + '</span></span><br /><br />';
        if (typeof self.basket_data.restaurants[menu_id] == "undefined") {
            optionsBlock += '<label class="btn_block"><input type="button" onclick="b.save_options(\'' + menu_id + '\',\'' + product.id + '\', \'' + rest_id + '\')" id="opts-save" value="' +
                g_trans['add_to_basket'] +
                '" class="btn" /><input type="button" onclick="b.close_dialog(); return false" class="btn" value="' +
                g_trans['close'] + '" /></label>';
        } else {
            if (typeof self.basket_data.restaurants[menu_id].products[product_id] == "undefined")
                optionsBlock += '<label class="btn_block"><input type="button" onclick="b.save_options(\'' + menu_id + '\',\'' + product.id + '\', \'' + rest_id + '\')" id="opts-save" value="' +
                g_trans['add_to_basket'] +
                '" class="btn" /><input type="button" onclick="b.close_dialog(); return false" class="btn" value="' +
                g_trans['close'] + '" /></label>';
            else
                optionsBlock += '<label class="btn_block"><input type="button" onclick="b.update_options(\'' + menu_id + '\',\'' + product_id + '\', \'' + rest_id + '\')" id="opts-save" value="' +
                g_trans['add_to_basket'] +
                '" class="btn"/><input type="button" onclick="b.close_dialog(); return false" class="btn" value="' +
                g_trans['close'] + '" /></label>';
        }
        html = '<div class="optionsBlock">' + optionsBlock + '</div><div class="imageBlock">' + imageBlock + '</div>';
        $('#dialog').addClass('product-dialog').html('');
        $('#dialog').html(html);
    } else {
        if (typeof self.basket_data.restaurants[menu_id] == "undefined") {
            var _price = product.price;
            var _count = product.qty;
            var _description = '';
        } else {
            if (typeof self.basket_data.restaurants[menu_id].products[product_id] == "undefined") {
                var _price = product.price;
                var _count = product.qty;
                var _description = '';
            } else {
                var _price = self.basket_data.restaurants[menu_id].products[product_id].price;
                var _count = self.basket_data.restaurants[menu_id].products[product_id].qty;
                _price = _count * _price;
                var _description = self.basket_data.restaurants[menu_id].products[product_id].description;
            }
        }
        if (typeof product.image != "undefined" && product.image != '')
            imageBlock += '<a href="/resources/default/img/restaurant_products/big/' +
            product.image + '" rel="lightbox" title="' + product.label + '"><img src="/resources/default/img/restaurant_products/small/' +
            product.image + '" class="prod_image" ><img src="/resources/default/css/icons/zoom.png" class="zoom-icon" alt="" title="' + g_trans['click_to_enlarge'] + '" /></a>' + self.GetAddthisButtons(product);
        else
            imageBlock += '<img src="/images/noImage.jpg" class="prod_image" >';
        imageBlock += '<div class="countBlock"><span style="float: left; line-height: 2em; margin-right: 10px;">' + g_trans['count'] + '</span><label class="fl"><input type="text" name="count" class="options_count fl" value="' +
            _count +
            '" style="width: 40px" maxlength="2" /></label><br class="cb"/></div>';
        $('#dialog').addClass('product-dialog').html('');
        self.opts = {};
        optionsBlock += self.draw_options(product.options, menu_id, product_id, 0, 0);
        optionsBlock += "<br />";
        if (product.content != '')
            optionsBlock += product.content + "<br />";
        optionsBlock += '<span>' + g_trans['order_description'] + '</span>';
        optionsBlock += '<textarea id="description" >' +
            _description + '</textarea>';
        imageBlock += '<span class="fl"><span>' + g_trans['total_price'] +
            '</span><br /> <span class="options_price">' + _price +
            '&nbsp;' + g_trans['dram'] + '</span></span><br /><br />';
        if (typeof self.basket_data.restaurants[menu_id] == "undefined") {
            optionsBlock += '<label class="btn_block"><input type="button" onclick="b.save_options(\'' + menu_id + '\',\'' + product.id + '\', \'' + rest_id + '\')" id="opts-save" value="' +
                g_trans['add_to_basket'] +
                '" class="btn" /><input type="button" onclick="b.close_dialog(); return false" class="btn" value="' +
                g_trans['close'] + '" /></label>';
        } else {
            if (typeof self.basket_data.restaurants[menu_id].products[product_id] == "undefined")
                optionsBlock += '<label class="btn_block"><input type="button" onclick="b.save_options(\'' + menu_id + '\',\'' + product.id + '\', \'' + rest_id + '\')" id="opts-save" value="' +
                g_trans['add_to_basket'] +
                '" class="btn" /><input type="button" onclick="b.close_dialog(); return false" class="btn" value="' +
                g_trans['close'] + '" /></label>';
            else
                optionsBlock += '<label class="btn_block"><input type="button" onclick="b.update_options(\'' + menu_id + '\',\'' + product_id + '\', \'' + rest_id + '\')" id="opts-save" value="' +
                g_trans['add_to_basket'] +
                '" class="btn"/><input type="button" onclick="b.close_dialog(); return false" class="btn" value="' +
                g_trans['close'] + '" /></label>';
        }
    }
    var get_total_choosen = function(option) {
        var total = 0;
        $('.opt-' + option).each(function() {
            if (parseInt($(this).val())) {
                total++;
            }
        });
        return total;
    }
    html = '<div class="optionsBlock">' + optionsBlock + '</div><div class="imageBlock">' + imageBlock + '</div>';
    $('#dialog').html(html);
    $('#dialog').dialog({
        title: product.label,
        width: 677,
        modal: true,
        open: function() {
            if ($('.options_count').length > 0) {
                $('.options_count').spinner({
                    min: 1,
                    max: 100
                });
            }
            self.InitAddThis();
        },
        close: function() {
            $('body').css('overflow', 'auto');
            if (typeof window.history.pushState != 'undefined' && urlChanged == true) {
                window.history.back();
            }
            $("#dialog").html('');
        }
    });
    $(".choice").change(function() {
        var _optionGroup = $(this).attr("option");
        self.choiceLimit("opt-" + _optionGroup, this, parseInt($(this).attr("minimum")), parseInt($(this).attr("maximum")));
        var optionGroup = $(this).attr("name");
        $("input[name=" + optionGroup + "]").each(function() {
            if (!$(this).is(":checked") && $(".sub-" + $(this).attr("id")).length > 0) {
                $(this).parent().removeClass("isopen");
                $(".sub-" + $(this).attr("id")).slideUp();
                $(".sub-" + $(this).attr("id")).find("input").each(function() {
                    $(this).attr("checked", false);
                })
            } else {}
        })
        if ($(".sub-" + $(this).attr("id")).length > 0) {
            if ($(this).is(":checked")) {
                $(this).parent().addClass("isopen");
                $(".sub-" + $(this).attr("id")).slideDown();
                $(".sub-" + $(this).attr("id")).find("input").first().trigger("click")
            } else {
                $(".sub-" + $(this).attr("id")).slideUp();
                $(".sub-" + $(this).attr("id")).find("input").each(function() {
                    $(this).attr("checked", false);
                })
            }
        }
        var total_price = self.get_total_price(product.price);
        $(".options_price").html(total_price + '&nbsp;' + g_trans['dram']);
    });
    var total_price = self.get_total_price(product.price);
    $(".options_price").html(total_price + '&nbsp;' + g_trans['dram']);
    if (typeof(self.basket_data.restaurants[menu_id]) == "undefined") {
        if (typeof(product.options) != "undefined") {
            for (var i in product.options) {
                if (parseInt(product.options[i].minimum) == 1) {
                    $(".opt-" + i + ":first").trigger("click");
                }
            }
        }
    } else {
        if (typeof(self.basket_data.restaurants[menu_id].products[product_id]) == "undefined" && typeof(product.options) != "undefined") {
            for (var i in product.options) {
                if (parseInt(product.options[i].minimum) == 1 && typeof(self.basket_data.restaurants[menu_id].products[product_id]) == "undefined") {
                    $(".opt-" + i + ":first").trigger("click");
                }
            }
        }
    }
    $(".options_count").change(function() {
        if ($(".choice").length > 0) {
            var _pprice = parseFloat(product.price).toFixed(toFixed_count);
            var _price = 0;
            $(".choice:checked").each(function() {
                _price += parseFloat($(this).attr("price")).toFixed(toFixed_count) * 1;
            })
            var _count = parseInt($(this).val());
            _price = parseFloat(_price);
            _pprice = _pprice * 1;
            var total_price = parseFloat((_pprice + _price) * _count).toFixed(toFixed_count);
            $(".options_price").html(total_price + '&nbsp;' + g_trans['dram']);
        } else {
            var _product_id = parseInt($("#_productId").attr("value"));
            var _price = parseFloat(self.menu[_product_id].price).toFixed(toFixed_count);
            var _count = parseInt($(this).val());
            var total_price = parseFloat(_price * _count).toFixed(toFixed_count);
            $(".options_price").html(total_price + '&nbsp;' + g_trans['dram']);
        }
    });
}
basket.prototype.get_total_price = function(product_price) {
    product_price = parseFloat(product_price).toFixed(toFixed_count);
    var _price = 0;
    $(".choice").each(function() {
        if ($(this).is(":checked"))
            _price += parseFloat($(this).attr("price"));
    })
    var _count = parseInt($(".options_count").val());
    _price = parseFloat(_price);
    var total_price = parseFloat((parseFloat(product_price) + parseFloat(_price)) * _count).toFixed(toFixed_count);
    return total_price;
}
basket.prototype.draw_options = function(product_options, menu_id, product_id, parentID, parentCID) {
    var self = this;
    var html = "";
    for (var i in product_options) {
        var selected = '';
        var choices_selected = 0;
        if (parentID == 0) {
            html += '<span class="optionsTitle">' + product_options[i].label + '</span>';
        }
        for (var k in product_options[i].choices) {
            var _checked = '';
            var _disabled = '';
            qty = 1;
            if (typeof self.basket_data.restaurants[menu_id] == "undefined") {} else {
                if (typeof self.basket_data.restaurants[menu_id]['products'][product_id] != "undefined") {
                    var _choicesList = $("#b-prod-" + product_id + "-qty").attr("choice");
                    _choicesList = _choicesList.split(",");
                    for (var _c in _choicesList) {
                        if (product_options[i].choices[k].id == _choicesList[_c]) {
                            _checked = "checked";
                        } else {}
                    }
                    if (_checked == "" && _choicesList.length == parseInt(product_options[i].maximum) && parseInt(product_options[i].maximum) != 1)
                        _disabled = "disabled";
                } else {}
            }
            var inputType = "";
            if (parseInt(product_options[i].minimum) == 0)
                inputType = "checkbox"
            else
                inputType = "radio"
            html += '<label style="cursor: pointer;" class="option_row" >' +
                product_options[i].choices[k].label;
            if (product_options[i].choices[k].price > 0) {
                html += ' (' + product_options[i].choices[k].price + ')';
            }
            html += '<input type="' + inputType + '" name="options-' + product_options[i].id + '" ' +
                _checked + " " +
                _disabled + ' class="choice ' +
                ' opt-' + product_options[i].id + '" option="' + product_options[i].id +
                '" minimum="' + parseInt(product_options[i]['minimum']) +
                '" maximum="' + parseInt(product_options[i]['maximum']) +
                '" freemax="' + parseInt(product_options[i]['freemax']) +
                '" price="' + product_options[i].choices[k].price +
                '" id="' + product_options[i].choices[k].id +
                '" value="' + qty + '" />';
            if (product_options[i].choices[k].nest > 0) {
                html += '<img src="/resources/default/css/images/arrow_down.png" style="float: right; margin: 9px;"/>';
            }
            html += '</label>';
            if (typeof product_options[i].choices[k].sub_options != "undefined") {
                var subOptions = self.draw_options(product_options[i].choices[k].sub_options, menu_id, product_id, i, product_options[i].choices[k].id);
                var status = "hidden";
                if (_checked) {
                    status = "show";
                }
                html += '<div class="subOptions ' + status + ' sub-' + product_options[i].choices[k].id + '">' + subOptions + '<br class="cb"/></div>';
            }
        }
        if (parentID == 0) {
            html += '<br />';
        }
    }
    return html;
}
basket.prototype.save_options = function(menu_id, product_id, rest_id) {
    startAjaxLoader();
    var self = this;
    var product = self.menu[product_id];
    var _choiceId = '';
    var _description = '';
    self._prodCount = $(".b-product").length + 1;
    if (typeof self.basket_data.restaurants == "undefined" || self.basket_data.restaurants == null) {
        self.basket_data.restaurants = {};
        self.basket_data.restaurants[menu_id] = {};
        self.basket_data.restaurants[menu_id]['label'] = self.rest_label;
        self.basket_data.restaurants[menu_id]['delivery_price'] = self._delivery_price;
        self.basket_data.restaurants[menu_id]['products'] = {};
    }
    if (typeof self.basket_data.restaurants[menu_id] == "undefined") {
        self.basket_data.restaurants[menu_id] = {};
        self.basket_data.restaurants[menu_id]['label'] = self.rest_label;
        self.basket_data.restaurants[menu_id]['delivery_price'] = self._delivery_price;
        self.basket_data.restaurants[menu_id]['products'] = {};
    }
    self.basket_data.restaurants[menu_id]['products'][product_id + '-' + self._prodCount] = {};
    self.basket_data.restaurants[menu_id]['products'][product_id + '-' + self._prodCount].product = product_id;
    self.basket_data.restaurants[menu_id]['products'][product_id + '-' + self._prodCount].qty = parseInt($(".options_count").val()) > 0 ? parseInt($(".options_count").val()) : 1;
    self.basket_data.restaurants[menu_id]['rest_id'] = rest_id;
    if (typeof product.options != "undefined")
        self.basket_data.restaurants[menu_id]['products'][product_id + '-' + self._prodCount].choices = {};
    if (typeof product.options == "undefined" || product.options.length == 0) {
        var _price = parseFloat(product.price);
        var _description = $("#description").val();
        var _count = 1;
        var ___count = $('.options_count').val();
        if (___count > 1)
            _count = ___count;
        self.basket_data.restaurants[menu_id]['products'][product_id + '-' + self._prodCount]['qty'] = _count;
        self.basket_data.restaurants[menu_id]['products'][product_id + '-' + self._prodCount]['price'] = _price;
        self.basket_data.restaurants[menu_id]['products'][product_id + '-' + self._prodCount]['description'] = _description;
    } else {
        var _pprice = parseFloat(product.price);
        var self = this;
        var choicesObj = {};
        var _description = $("#description").val();
        var i = 0;
        $(".choice:checked").each(function(e) {
            i++;
            var _price = parseFloat($(this).attr("price"));
            var _choiceId = parseInt($(this).attr("id"));
            var _count = parseInt($(".options_count").val());
            choicesObj[i] = _choiceId;
            if (parseInt(_count) > 0) {
                self.opts[_choiceId] = {
                    'qty': _count,
                    'price': _price
                };
            } else {
                self.opts[_choiceId] = {
                    'qty': 0,
                    'price': _price
                };
            }
        });
        var opts = self.opts;
        for (var i in opts) {
            if (opts[i].qty > 0) {
                self.basket_data.restaurants[menu_id]['products'][product_id + '-' + self._prodCount]['choices'][i] = {};
                self.basket_data.restaurants[menu_id]['products'][product_id + '-' + self._prodCount]['choices'][i]['qty'] = opts[i]['qty'];
                self.basket_data.restaurants[menu_id]['products'][product_id + '-' + self._prodCount]['choices'][i]['price'] = opts[i]['price'];
                self.basket_data.restaurants[menu_id]['products'][product_id + '-' + self._prodCount]['qty'] = opts[i]['qty'];
                self.basket_data.restaurants[menu_id]['products'][product_id + '-' + self._prodCount]['price'] = _pprice;
                self.basket_data.restaurants[menu_id]['products'][product_id + '-' + self._prodCount]['description'] = _description;
            } else {
                delete self.basket_data.restaurants[menu_id]['products'][product_id + '-' +
                    self._prodCount
                ]['choices'][i];
            }
        }
        self.basket_data.restaurants[menu_id]['products'][product_id + '-' + self._prodCount]['description'] = _description;
    }
    self.draw_add_to_basket(menu_id, product_id + '-' + self._prodCount, self.menu[product_id].label, choicesObj, true, rest_id);
    self.recalc_totals();
    $('.ui-dialog-titlebar-close').trigger('click');
    self.GetRelatedProducts();
    setTimeout("endAjaxLoader()", 1000);
}
basket.prototype.close_dialog = function() {
    $('.ui-dialog-titlebar-close').trigger('click');
}
basket.prototype.remove = function(menu_id, product_id) {
    var self = this;
    $('#b-prod-' + product_id).slideUp('slow', function() {
        $(this).remove();
        if ($("#rest-" + menu_id).children(".b-product").length == 0) {
            if ($("div[id^='rest-']").length == 1) {
                $("#rest-" + menu_id).remove();
            } else {
                $("#rest-" + menu_id).slideUp('slow', function() {
                    $(this).remove();
                });
            }
        }
    });
    if (typeof self.basket_data.restaurants[menu_id] != 'undefined' && typeof self.basket_data.restaurants[menu_id]['products'][product_id] != 'undefined') {
        delete self.basket_data.restaurants[menu_id]['products'][product_id];
        var _empty = true;
        for (var i in self.basket_data.restaurants[menu_id]['products']) {
            _empty = false;
            break;
        }
        if (_empty)
            delete self.basket_data.restaurants[menu_id];
    }
    var _empty = true;
    for (var i in self.basket_data.restaurants) {
        _empty = false;
        break;
    }
    if (_empty)
        self.basket_data.restaurants = {};
    self.recalc_totals();
    self.GetRelatedProducts();
}
basket.prototype.update_options = function(menu_id, product_id) {
    var self = this;
    var _index = product_id.split('-');
    _index = _index[0];
    var product = self.menu[_index];
    var _choiceId = '';
    var _description = '';
    self.basket_data.restaurants[menu_id]['products'][product_id]['qty'] = parseInt($(".options_count").val());
    if (typeof product.options == "undefined" || product.options.length == 0) {
        var _price = parseInt(product.price);
        var _count = parseInt($(".options_count").val());
        var _description = $("#description").val();
        self.basket_data.restaurants[menu_id]['products'][product_id]['qty'] = _count;
        self.basket_data.restaurants[menu_id]['products'][product_id]['price'] = _price;
        self.basket_data.restaurants[menu_id]['products'][product_id]['description'] = _description;
    } else {
        var choicesObj = {};
        var self = this;
        var _description = $("#description").val();
        var i = 0;
        $(".choice:checked").each(function(e) {
            i++;
            var _price = parseInt($(this).attr("price"));
            var _choiceId = parseInt($(this).attr("id"));
            var _count = parseInt($(".options_count").val());
            choicesObj[i] = _choiceId;
            if (parseInt(_count) > 0) {
                self.opts[_choiceId] = {
                    'qty': _count,
                    'price': _price
                };
            } else {
                self.opts[_choiceId] = {
                    'qty': 0,
                    'price': _price
                };
            }
        });
        var opts = self.opts;
        self.basket_data.restaurants[menu_id]['products'][product_id]['choices'] = {};
        for (var i in opts) {
            if (opts[i].qty > 0) {
                self.basket_data.restaurants[menu_id]['products'][product_id]['choices'][i] = {};
                self.basket_data.restaurants[menu_id]['products'][product_id]['choices'][i]['qty'] = opts[i]['qty'];
                self.basket_data.restaurants[menu_id]['products'][product_id]['choices'][i]['price'] = opts[i]['price'];
                self.basket_data.restaurants[menu_id]['products'][product_id]['qty'] = opts[i]['qty'];
                self.basket_data.restaurants[menu_id]['products'][product_id]['description'] = _description;
            } else {
                delete self.basket_data.restaurants[menu_id]['products'][product_id]['choices'][i];
            }
        }
    }
    self.draw_basket_update(menu_id, product_id, choicesObj);
    self.recalc_totals();
    if ($('#b-prod-' + product_id + ' .product-note').length > 0) {
        if (_description != '') {
            $('#b-prod-' + product_id + ' .product-note').html(g_trans['product_note'] + ': ' + _description)
        } else {
            $('#b-prod-' + product_id + ' .product-note').html('');
        }
    }
    $('.ui-dialog-titlebar-close').trigger('click');
}
basket.prototype.update_qty = function(menu_id, product_id) {
    var self = this;
    var _index = product_id.split('-');
    _index = _index[0];
    var qty = $('#b-prod-' + product_id + '-qty').val();
    self.basket_data.restaurants[menu_id]['products'][product_id]['qty'] = parseInt(qty);
    if (parseInt(qty) == 0) {
        self.remove(product_id);
    }
    self.recalc_totals();
}
basket.prototype.draw_basket_update = function(menu_id, product_id, choicesObj) {
    var self = this;
    var opts = '';
    var _index = product_id.split('-');
    _index = _index[0];
    var product = self.menu[_index];
    var _price = parseInt(product.price);
    if ($("#b-prod-" + product_id).length > 0) {
        if (product.options) {
            var choicesStr = "";
            var _choiceId = "";
            for (var i in choicesObj) {
                _choiceId = choicesObj[i];
                if (choicesStr)
                    choicesStr += "," + _choiceId;
                else
                    choicesStr += _choiceId;
                _price += self.basket_data.restaurants[menu_id].products[product_id].choices[_choiceId].price;
            }
        } else {
            if (product['price'] > 0)
                _price = product['price'];
        }
        var _count = self.basket_data.restaurants[menu_id]['products'][product_id].qty;
        var _price_label = parseInt(_price * _count) + '&nbsp;' + g_trans['dram'];
        $("#b-prod-" + product_id + "-qty").attr("value", _count);
        $("#b-prod-" + product_id + "-qty").attr("choice", choicesStr);
        $("#b-prod-" + product_id).find(".price").html("*****************");
        return;
    }
}
basket.prototype.draw_add_to_basket = function(menu_id, product_id, product_name, choicesObj, animate, rest_id) {
    var self = this;
    var del_type_cookie = readCookie('delivery_type');
    if (Object.keys(self.basket_data.restaurants).length > 1 && del_type_cookie == 'takeaway') {
        return;
    }
    if (del_type_cookie == 'takeaway' && self.basket_data.restaurants[menu_id]['label'] != b.rest_label) {
        return;
    }
    var opts = '';
    var _index = product_id.split('-');
    _index = _index[0];
    var product = self.menu[_index];
    var opts = '<a href="javascript:b.choose_options(\'' + menu_id + '\',\'' + product_id + '\', \'' + rest_id + '\');" class="opts"><img src="/images/edit.png" /></a>';
    var _qty = 1;
    var _price = 0;
    if (product.options) {
        var choicesStr = "";
        var _choiceId = "";
        for (var i in choicesObj) {
            _choiceId = choicesObj[i];
            if (choicesStr)
                choicesStr += "," + _choiceId;
            else
                choicesStr += _choiceId;
            _qty = self.basket_data.restaurants[menu_id].products[product_id].choices[_choiceId].qty;
            _price = self.basket_data.restaurants[menu_id].products[product_id].choices[_choiceId].price;
        }
    } else {
        if (product['price'] > 0)
            _price = product['price'];
        _qty = self.basket_data.restaurants[menu_id]['products'][product_id].qty;
    }
    _qty = self.basket_data.restaurants[menu_id]['products'][product_id].qty;
    var _display = "none";
    if (animate == false)
        _display = "block";
    var _newProd = '<div class="b-product" style="display: ' + _display + ';" id="b-prod-' +
        product_id +
        '"><a href="javascript:b.choose_options(\'' + menu_id + '\',\'' + product_id + '\', \'' + rest_id + '\');" class="title">' +
        stripslashes(product_name) +
        '</a>' +
        '<a class="remove-product" href="javascript:b.remove(\'' + menu_id + '\',\'' + product_id + '\', \'' + rest_id + '\');" title="' + g_trans['click_to_remove'] + '"></a>' +
        '<br class="cb" /><span style="line-height: 24px; font-size: 15px;">' +
        '<input type="text" value="' +
        _qty +
        '" style="width: 40px;" onchange="if (!this.value || this.value<1 || !parseInt(this.value)) this.value=1; b.update_qty(\'' + menu_id + '\',\'' + product_id + '\')" id="b-prod-' +
        product_id +
        '-qty" choice="' +
        choicesStr +
        '" />' +
        '<span class="price">&nbsp;' +
        parseInt(_price * _qty) +
        '&nbsp;' +
        g_trans['dram'] +
        '</span></span>' +
        '<br class="cb" /></div>';
    if ($("#rest-" + menu_id).length > 0) {
        $('#basket .prodBlock #rest-' + menu_id).append(_newProd);
    } else {
        if (del_type_cookie != 'takeaway') {
            $('#basket .prodBlock').append('<div id="rest-' + menu_id + '"><h2><a href="/' + jsLang + '/restaurant/' + self.rest_alias[menu_id].alias + '.html">' + self.rest_alias[menu_id].label + '</a></h2>' + _newProd + '</div>');
        } else {
            $('#basket .prodBlock').append('<div id="rest-' + menu_id + '"><h2><a href="/' + jsLang + '/restaurant/' + self.rest_alias[rest_id].alias + '.html">' + self.rest_alias[rest_id].label + '</a></h2>' + _newProd + '</div>');
        }
    }
    $('#b-prod-' + product_id + ' .title').addClass("newItem");
    setTimeout(function() {
        $('#b-prod-' + product_id + ' .title').removeClass("newItem");
    }, 2000)
    if (animate == true) {
        $('#b-prod-' + product_id).show('', function() {
            $(".prodPane").scrollTo($("#b-prod-" + product_id), 'slow');
            setTimeout(function() {
                $('#b-prod-' + product_id + '-qty').spinner({
                    min: 1,
                    max: 100
                });
            }, 0);
        });
    } else {
        setTimeout(function() {
            $('#b-prod-' + product_id + '-qty').spinner({
                min: 1,
                max: 100
            });
        }, 0);
    }
}
basket.prototype.save_order = function(_data) {
    var self = this;
    if (!self.loaded) {
        return;
    }
    if ($('#use_bonus_chk').attr('checked') == 'checked') {
        self.basket_data.use_bonus = 1;
    }
    if (document.getElementById('pay_radio')) {
        var _payment_method = $("input[name='addres_info[payment_method]']:checked").val();
        if (typeof _payment_method != 'undefined') {
            self.basket_data.payment_method = _payment_method;
        }
    }
    var _url = '/' + self.lng_code + '/basket/save-order';
    $.ajax({
        url: _url,
        type: "post",
        data: _data,
        dataType: 'json',
        type: 'post',
        beforeSend: function() {
            if ($("#fancybox-content")) {
                var loader = $("<div>").addClass("loaderBlock");
                var imgCont = $("<img>").attr({
                    src: "/images/loader.gif",
                    style: "position: absolute; top: 50%; left: 50%;"
                })
                loader.append(imgCont);
                $("#fancybox-content").append(loader);
            }
        },
        success: function(data) {
            if (data.redir_to) {
                window.location.href = data.redir_to;
                return;
            }
            if (data.form_payment) {
                $('#fancybox-content').append('<div style="color:green;width:420px;text-align: center;margin:0 auto;display:none" >' + data.form_payment +
                    '<br /><br /></div>');
                $.fancybox.resize();
                $.fancybox.center();
                document.pay_form.submit();
                return;
            } else if (data.ameria_payment) {
                $('#fancybox-content').find('.order-infobox').hide();
                $('#fancybox-content').find('.loaderBlock').hide();
                $('#fancybox-content').find('#login-or-register').hide();
                $('#fancybox-content').append('<div class="ameria-payment">' + data.ameria_payment + '</div>');
            }
            if (data.refreshPage) {
                window.location.href = window.location.href;
            }
            if (data.status) {
                $.cookie('useBonus', '0');
                $('#fancybox-content').html('<div style="color:green;width:220px;text-align: center;margin:0 auto" >' + data.msg +
                    '<br /><br /></div>');
                $.fancybox.resize();
                $.fancybox.center();
            } else {
                for (var errorKey in data.errors) {
                    $('label[for="' + errorKey + '"]').addClass('error');
                    $('label[for="' + errorKey + '"]').attr('title', data.errors[errorKey]);
                }
                $('#basket').prepend('<div style="color:red;" id="order-note">' + data.msg +
                    '<br /><br /></div>');
            }
            var jsErrors = new Array();
            $('label.error').each(function() {
                jsErrors.push(this.title);
            });
            if (jsErrors.length > 0) {
                jsErrorsStr = jsErrors.join('<br/>');
                jError(jsErrorsStr, {
                    ShowOverlay: false,
                    VerticalPosition: 'top',
                    TimeShown: 3000
                });
            }
            $('.button', $('#basket')).hide();
            $('#basket').fadeOut('slow', function() {
                $('#order-note').remove();
            });
            $('#basket .prodPane .prodBlock *').remove();
            self.basket_data = {};
            self.basket_data.restaurants = {};
            self.basket_data.restaurants[self.menu_id] = {};
            self.basket_data.restaurants[self.menu_id]['label'] = self.rest_label;
            self.basket_data.restaurants[self.menu_id].products = {};
            self.basket_data.restaurants[self.menu_id].delivery_price = self._delivery_price;
            self.opts = {};
            self.loaded = true;
            self._prodCount = 0;
        },
        statusCode: {
            403: function(p1, p2, p3) {
                var obj = $.parseJSON(p1.responseText);
                $('#basket').prepend('<div style="color:red;" id="order-note">' +
                    obj.msg +
                    '<br /><br /></div>');
                setTimeout(function() {
                    $('#order-note').remove();
                }, 3000);
            }
        },
        error: function(a, b, c) {
            $('body').prepend('<div style="color:red; position: fixed; top: 50px; display: block; z-index: 222222; background: white; width: 50%; margin-left: 25%; padding: 20px 0; text-align: center; border: 2px solid red" id="order-note">' +
                g_trans['order_attempt_fail_message'] +
                '<br /><br /></div>');
            setTimeout(function() {
                $('#order-note').remove();
                $("#fancybox-close").trigger('click');
            }, 3000);
        }
    });
};
basket.prototype.phone_confirm = function(_data) {
    var self = this;
    var _url = '/' + self.lng_code + '/basket/confirm-phone';
    $.ajax({
        url: _url,
        type: "post",
        data: _data,
        dataType: 'json',
        type: 'post',
        beforeSend: function() {},
        success: function(data) {
            closephonepopup();
        }
    });
}
basket.prototype.choiceLimit = function(_selector, _selected, min, max) {
    if ((min == 1 && max == 1) || (min == 0 && max == 1)) {
        var _cstat = $(_selected).is(":checked");
        $("." + _selector).filter(":checked").removeAttr("checked");
        if (_cstat)
            $(_selected).attr("checked", "checked")
    } else {
        var _checkedCount = $("." + _selector).filter(":checked").length;
        if (_checkedCount >= min && _checkedCount < max) {
            $("." + _selector).filter(":disabled").removeAttr("disabled");
        } else {
            $("." + _selector).not(":checked").attr("disabled", "disabled");
        }
    }
}
var sp = null;
basket.prototype.orderComplitation = function(href) {
    var use_bonus = $('#use_bonus').val();
    href = href + '?use_bonus=' + use_bonus;
    var dheight = document.height;
    var self = this;
    $.fancybox({
        type: 'ajax',
        width: 975,
        padding: 0,
        autoScale: false,
        href: href,
        title: g_trans['auth_box'],
        onComplete: function(a, b, c) {
            $("#fancybox-overlay").css({
                "height": dheight
            });
            $('#fancybox-wrap').off('mousewheel')
            self.regDialogComplete(a, b, c);
        },
        onClosed: function() {
            $('body').css('overflow', 'auto');
        }
    });
};
basket.prototype.regDialogComplete = function(a, b, c) {
    var continer = $('#login-or-register');
    var self = this;
    sp = new SocialProviders();
    var isDisabled = $('#deliveryDate').attr('disabled');
    if (isDisabled != 'disabled') {
        $('#deliveryDate').datepicker({
            dateFormat: "dd-mm-yy",
            minDate: 0
        });
    }
    var isDisabled1 = $('#quickDeliveryDate').attr('disabled');
    if (isDisabled1 != 'disabled') {
        $('#quickDeliveryDate').datepicker({
            dateFormat: "dd-mm-yy",
            minDate: 0
        });
    }
    if ($('form', continer).attr('action').indexOf('quick-order') != -1 && $.cookie('address')) {
        var addressDataCookie = JSON.parse($.cookie('address'));
        $("#quick_order_phone").val(addressDataCookie[0]['phone']);
        $("#addres_info_street").val(addressDataCookie[0]['street']);
        $("#addres_info_apartament").val(addressDataCookie[0]['apartament']);
        $("#addres_info_house").val(addressDataCookie[0]['house']);
    }
    $('form', continer).bind('submit', function() {
        if ($('form', continer).attr('action').indexOf('quick-order') != -1) {
            var addressData = {};
            var addressRow = {};
            addressRow['phone'] = $("#quick_order_phone").val();
            addressRow['street'] = $("#addres_info_street").val();
            addressRow['apartament'] = $("#addres_info_apartament").val();
            addressRow['house'] = $("#addres_info_house").val();
            addressData[0] = addressRow;
            $.cookie('address', JSON.stringify(addressData), {
                expires: 10
            });
        }
        var method = $(this).attr('method');
        var action = $(this).attr('action');
        var data = $(this).serialize();
        $.ajax({
            url: action,
            type: method,
            data: data,
            dataType: 'json',
            context: this,
            beforeSend: function() {
                if ($("#fancybox-content")) {
                    var loader = $("<div>").addClass("loaderBlock");
                    var imgCont = $("<img>").attr({
                        src: "/images/loader.gif",
                        style: "position: absolute; top: 50%; left: 50%;"
                    })
                    loader.append(imgCont);
                    $("#fancybox-content").append(loader);
                }
                $(this).find("input[type=submit]").attr("disabled", "disabled");
                $('label', this).removeClass('error');
                $('label', this).attr('title', '');
                $(this).data('postData', data);
            },
            error: function(resp) {},
            success: function(resp) {
                $(".loaderBlock").remove();
                if (resp.success) {
                    if (typeof resp.reg != "undefined") {
                        self.orderComplitation('/' + self.lng_code + '/basket/register');
                    } else {
                        self.save_order(data);
                    }
                } else {
                    $(this).find("input[type=submit]").removeAttr("disabled");
                    for (var errorKey in resp.errors) {
                        $('label[for="' + errorKey + '"]', this).addClass('error');
                        $('label[for="' + errorKey + '"]', this).attr('title', resp.errors[errorKey]);
                    }
                    var jsErrors = new Array();
                    $('label.error', this).each(function() {
                        jsErrors.push(this.title);
                    });
                    jsErrorsStr = jsErrors.join('<br/>');
                    jError(jsErrorsStr, {
                        ShowOverlay: false,
                        VerticalPosition: 'top',
                        TimeShown: 3000
                    });
                }
            }
        });
        return false;
    });
};
basket.prototype.selectSoonAsPossible = function(self) {
    var _form = self.form;
    $(_form).find('select.select_time').attr('disabled', 'disabled');
    $(_form).find('#deliveryDate').attr('disabled', 'disabled');
    $(_form).find('#deliveryDate').datepicker('destroy');
    $(_form).find('#quickDeliveryDate').attr('disabled', 'disabled');
    $(_form).find('#quickDeliveryDate').datepicker('destroy');
};
basket.prototype.selectPreorder = function(self) {
    var _form = self.form;
    $(_form).find('select.select_time').removeAttr('disabled');
    $(_form).find('#deliveryDate').removeAttr('disabled');
    $(_form).find('#deliveryDate').datepicker({
        dateFormat: "dd-mm-yy",
        minDate: 0
    });
    $(_form).find('#quickDeliveryDate').removeAttr('disabled');
    $(_form).find('#quickDeliveryDate').datepicker({
        dateFormat: "dd-mm-yy",
        minDate: 0
    });
};
basket.prototype.draw_update_qty = function(product_id, qty) {
    $('#b-prod-' + product_id + '-qty').val(qty);
}
basket.prototype.useBonus = function() {
    self = this;
    var deliv_price_new = parseInt($('#delivery-price').text());
    var del_type_cookie = readCookie('delivery_type');
    if (del_type_cookie == "takeaway") {
        deliv_price_new = 0;
    }
    bonus = parseInt(self.bonus);
    if (self._price == '') {
        self._price = parseInt($('#price').html());
    }
    if ($('#use_bonus_chk').attr('checked') == 'checked') {
        $.cookie('useBonus', '1', {
            expires: 10,
            path: '/'
        });
        $('#use_bonus').val(1);
        _total_price = deliv_price_new + self._price;
        if (bonus < _total_price) {
            _newPrice = _total_price - bonus;
            $('#total-price').html(_newPrice)
        } else {
            $('#total-price').html(0)
        }
    } else {
        $.cookie('useBonus', '0', {
            expires: 10,
            path: '/'
        });
        $('#use_bonus').val(0);
        _total_price = deliv_price_new + self._price;
        $('#total-price').html(_total_price);
    }
}

function stripslashes(str) {
    return (str + '').replace(/\\(.?)/g, function(s, n1) {
        switch (n1) {
            case '\\':
                return '\\';
            case '0':
                return '\u0000';
            case '':
                return '';
            default:
                return n1;
        }
    });
}

function addressSelectAction(self) {
    var street = $("#address_list").find('option:selected').attr('street');
    var house = $("#address_list").find('option:selected').attr('house');
    $("#addres_info_street").val(street);
    $("#addres_info_house").val(house);
}

function phoneChangeAction(self) {
    var phone = $("#phones_list").find('option:selected').attr('value');
    $("#phone").val(phone);
}
basket.prototype.add_to_cart_new = function(mpItem_menu, mpItem_id) {
    b.add_to_basket(mpItem_menu, mpItem_id);
}
basket.prototype.ShowShoppingCart = function() {
    var self = this;
    var totalProductsCount = 0;
    for (var i in self.basket_data.restaurants) {
        for (var r in self.basket_data.restaurants[i].products) {
            totalProductsCount += parseInt(self.basket_data.restaurants[i].products[r].qty);
        }
    }
    if (totalProductsCount > 0) {
        $("#shopping-cart-icon #total-products-count").html(totalProductsCount);
        if (!$("#shopping-cart-icon").is(":visible")) {
            $("#shopping-cart-icon").show();
        }
    } else {
        $("#shopping-cart-icon").hide();
    }
}
basket.prototype.GetAddthisButtons = function(product) {
    var link = window.location.href;
    var title = product.label;
    var addThisButtons = '<div class="addthis_toolbox addthis_default_style">' +
        '<a class="addthis_button_facebook" addthis:url="' + link + '" addthis:title="' + title + '"></a>' +
        '<a class="addthis_button_twitter" addthis:url="' + link + '" addthis:title="' + title + '"></a>' +
        '<a class="addthis_button_google_plusone_share" addthis:url="' + link + '" addthis:title="' + title + '"></a>' +
        '<a class="addthis_button_vk" addthis:url="' + link + '" addthis:title="' + title + '"></a>' +
        '<a class="addthis_button_odnoklassniki_ru" addthis:url="' + link + '" addthis:title="' + title + '"></a>' +
        '</div>';
    return addThisButtons;
}
basket.prototype.InitAddThis = function() {
    if (window.addthis) {
        window.addthis = null;
        window._adr = null;
        window._atc = null;
        window._atd = null;
        window._ate = null;
        window._atr = null;
        window._atw = null;
    }
    jQuery.getScript('//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-4f323f450fe1cfc4');
}
basket.prototype.ShowHideBasket = function(self) {
    if ($(self).hasClass("show")) {
        $("#basket").animate({
            "right": 0
        }, function() {
            $(self).removeClass("show").addClass("hide");
            $.cookie('basket_state', 'visible', {
                expires: 10,
                path: '/'
            });
        });
    } else if ($(self).hasClass("hide")) {
        $("#basket").animate({
            "right": -($("#basket").width() + 2)
        }, function() {
            $(self).removeClass("hide").addClass("show");
            $.cookie('basket_state', 'hidden', {
                expires: 10,
                path: '/'
            });
        });
    }
}
$(window).load(function() {
    $('.prod_content_a').click(function() {
        rest_id = this.getAttribute("data-rest_id")
        var _id;
        if (typeof window.history.pushState != 'undefined') {
            window.history.pushState('', '', $(this).attr('href'));
            urlChanged = true;
        }
        if ($(this).hasClass('prod_content_img')) {
            _id = $(this).attr('rel');
        } else {
            _id = $(this).attr('id');
        }
        _data = _id.split('_');
        var _menu = _data[1];
        var _prod = _data[2];
        self._prodCount = $(".b-product").length + 1;
        _prod_id = _prod + '-' + self._prodCount;
        setTimeout(function() {
            b.choose_options_new(_menu, _prod_id, rest_id);
        }, 500);
        return false;
    });
});
var isProccessing = false;
$(document).on('click', 'a.payment-back', function(evt) {
    console.log(evt);
    evt.preventDefault();
    var fbox = $('#fancybox-content');
    fbox.find('#login-or-register').show();
    fbox.find('.ameria-payment').hide();
    return false;
}).on('click', 'a.add-card-for-recuring', function(evt) {
    console.log(evt);
    $('#radio27').prop("checked", true)
    $('input[name=recuring-payment]').val(1);
    $('input[name=recuring-user-id]').val(1);
    $('#login-or-register form').trigger('submit');
}).on('click', 'a.use-recuring-card', function(evt) {
    console.log(evt);
    $('#radio27').prop("checked", true)
    $('input[name=recuring-payment]').val(2);
    $('input[name=recuring-user-id]').val($(this).data('cardholderid'));
    $('#login-or-register form').trigger('submit');
}).on('click', 'a.normal-payment', function(evt) {
    console.log(evt);
    $('#radio27').prop("checked", true)
    $('input[name=recuring-payment]').val(3);
    $('input[name=recuring-user-id]').val(0);
    $('#login-or-register form').trigger('submit');
}).on('click', 'a.ameria-card-remove', function(evt) {
    console.log(evt);
    evt.preventDefault();
    if (isProccessing)
        return false;
    isProccessing = true;
    $.ajax({
        url: '/payment/deactivate-binding',
        data: {
            'card_holder_id': $(this).data('cardholderid')
        },
        type: 'POST'
    }).success(function(response) {
        $('.recent-card-blocks').css("display", "none");
    }).always(function() {
        isProccessing = false;
    });
});;
/* Lazy Load 1.9.3 - MIT license - Copyright 2010-2013 Mika Tuupola */
! function(a, b, c, d) {
    var e = a(b);
    a.fn.lazyload = function(f) {
        function g() {
            var b = 0;
            i.each(function() {
                var c = a(this);
                if (!j.skip_invisible || c.is(":visible"))
                    if (a.abovethetop(this, j) || a.leftofbegin(this, j));
                    else if (a.belowthefold(this, j) || a.rightoffold(this, j)) {
                    if (++b > j.failure_limit) return !1
                } else c.trigger("appear"), b = 0
            })
        }
        var h, i = this,
            j = {
                threshold: 0,
                failure_limit: 0,
                event: "scroll",
                effect: "show",
                container: b,
                data_attribute: "original",
                skip_invisible: !0,
                appear: null,
                load: null,
                placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
            };
        return f && (d !== f.failurelimit && (f.failure_limit = f.failurelimit, delete f.failurelimit), d !== f.effectspeed && (f.effect_speed = f.effectspeed, delete f.effectspeed), a.extend(j, f)), h = j.container === d || j.container === b ? e : a(j.container), 0 === j.event.indexOf("scroll") && h.bind(j.event, function() {
            return g()
        }), this.each(function() {
            var b = this,
                c = a(b);
            b.loaded = !1, (c.attr("src") === d || c.attr("src") === !1) && c.is("img") && c.attr("src", j.placeholder), c.one("appear", function() {
                if (!this.loaded) {
                    if (j.appear) {
                        var d = i.length;
                        j.appear.call(b, d, j)
                    }
                    a("<img />").bind("load", function() {
                        var d = c.attr("data-" + j.data_attribute);
                        c.hide(), c.is("img") ? c.attr("src", d) : c.css("background-image", "url('" + d + "')"), c[j.effect](j.effect_speed), b.loaded = !0;
                        var e = a.grep(i, function(a) {
                            return !a.loaded
                        });
                        if (i = a(e), j.load) {
                            var f = i.length;
                            j.load.call(b, f, j)
                        }
                    }).attr("src", c.attr("data-" + j.data_attribute))
                }
            }), 0 !== j.event.indexOf("scroll") && c.bind(j.event, function() {
                b.loaded || c.trigger("appear")
            })
        }), e.bind("resize", function() {
            g()
        }), /(?:iphone|ipod|ipad).*os 5/gi.test(navigator.appVersion) && e.bind("pageshow", function(b) {
            b.originalEvent && b.originalEvent.persisted && i.each(function() {
                a(this).trigger("appear")
            })
        }), a(c).ready(function() {
            g()
        }), this
    }, a.belowthefold = function(c, f) {
        var g;
        return g = f.container === d || f.container === b ? (b.innerHeight ? b.innerHeight : e.height()) + e.scrollTop() : a(f.container).offset().top + a(f.container).height(), g <= a(c).offset().top - f.threshold
    }, a.rightoffold = function(c, f) {
        var g;
        return g = f.container === d || f.container === b ? e.width() + e.scrollLeft() : a(f.container).offset().left + a(f.container).width(), g <= a(c).offset().left - f.threshold
    }, a.abovethetop = function(c, f) {
        var g;
        return g = f.container === d || f.container === b ? e.scrollTop() : a(f.container).offset().top, g >= a(c).offset().top + f.threshold + a(c).height()
    }, a.leftofbegin = function(c, f) {
        var g;
        return g = f.container === d || f.container === b ? e.scrollLeft() : a(f.container).offset().left, g >= a(c).offset().left + f.threshold + a(c).width()
    }, a.inviewport = function(b, c) {
        return !(a.rightoffold(b, c) || a.leftofbegin(b, c) || a.belowthefold(b, c) || a.abovethetop(b, c))
    }, a.extend(a.expr[":"], {
        "below-the-fold": function(b) {
            return a.belowthefold(b, {
                threshold: 0
            })
        },
        "above-the-top": function(b) {
            return !a.belowthefold(b, {
                threshold: 0
            })
        },
        "right-of-screen": function(b) {
            return a.rightoffold(b, {
                threshold: 0
            })
        },
        "left-of-screen": function(b) {
            return !a.rightoffold(b, {
                threshold: 0
            })
        },
        "in-viewport": function(b) {
            return a.inviewport(b, {
                threshold: 0
            })
        },
        "above-the-fold": function(b) {
            return !a.belowthefold(b, {
                threshold: 0
            })
        },
        "right-of-fold": function(b) {
            return a.rightoffold(b, {
                threshold: 0
            })
        },
        "left-of-fold": function(b) {
            return !a.rightoffold(b, {
                threshold: 0
            })
        }
    })
}(jQuery, window, document);;

function retry(isDone, next) {
    var current_trial = 0,
        max_retry = 50,
        interval = 10,
        is_timeout = false;
    var id = window.setInterval(function() {
        if (isDone()) {
            window.clearInterval(id);
            next(is_timeout);
        }
        if (current_trial++ > max_retry) {
            window.clearInterval(id);
            is_timeout = true;
            next(is_timeout);
        }
    }, 10);
}

function isIE10OrLater(user_agent) {
    var ua = user_agent.toLowerCase();
    if (ua.indexOf('msie') === 0 && ua.indexOf('trident') === 0) {
        return false;
    }
    var match = /(?:msie|rv:)\s?([\d\.]+)/.exec(ua);
    if (match && parseInt(match[1], 10) >= 10) {
        return true;
    }
    return false;
}

function detectPrivateMode(callback) {
    var is_private;
    if (window.webkitRequestFileSystem) {
        window.webkitRequestFileSystem(window.TEMPORARY, 1, function() {
            is_private = false;
        }, function(e) {
            console.log(e);
            is_private = true;
        });
    } else if (window.indexedDB && /Firefox/.test(window.navigator.userAgent)) {
        var db;
        try {
            db = window.indexedDB.open('test');
        } catch (e) {
            is_private = true;
        }
        if (typeof is_private === 'undefined') {
            retry(function isDone() {
                return db.readyState === 'done' ? true : false;
            }, function next(is_timeout) {
                if (!is_timeout) {
                    is_private = db.result ? false : true;
                }
            });
        }
    } else if (isIE10OrLater(window.navigator.userAgent)) {
        is_private = false;
        try {
            if (!window.indexedDB) {
                is_private = true;
            }
        } catch (e) {
            is_private = true;
        }
    } else if (window.localStorage && /Safari/.test(window.navigator.userAgent)) {
        try {
            window.localStorage.setItem('test', 1);
        } catch (e) {
            is_private = true;
        }
        if (typeof is_private === 'undefined') {
            is_private = false;
            window.localStorage.removeItem('test');
        }
    }
    retry(function isDone() {
        return typeof is_private !== 'undefined' ? true : false;
    }, function next(is_timeout) {
        callback(is_private);
    });
};
(function(e) {
    var o = false,
        q = false,
        t = 5E3,
        u = 2E3,
        v = function() {
            var e = document.getElementsByTagName("script"),
                e = e[e.length - 1].src.split("?")[0];
            return e.split("/").length > 0 ? e.split("/").slice(0, -1).join("/") + "/" : ""
        }(),
        n = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || false,
        p = window.cancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || false,
        z = function(f, d) {
            function h(c, g, d) {
                g = c.css(g);
                c = parseFloat(g);
                return isNaN(c) ? (c = m[g] || 0, d = c == 3 ? d ? b.win.outerHeight() - b.win.innerHeight() : b.win.outerWidth() - b.win.innerWidth() : 1, b.isie8 && c && (c += 1), d ? c : 0) : c
            }
            var b = this;
            this.version = "2.9.6";
            this.name = "nicescroll";
            this.me = d;
            this.opt = {
                doc: e("body"),
                win: false,
                zindex: 9E3,
                cursoropacitymin: 0,
                cursoropacitymax: 1,
                cursorcolor: "#424242",
                cursorwidth: "5px",
                cursorborder: "1px solid #fff",
                cursorborderradius: "5px",
                scrollspeed: 60,
                mousescrollstep: 40,
                touchbehavior: false,
                hwacceleration: true,
                usetransition: true,
                boxzoom: false,
                dblclickzoom: true,
                gesturezoom: true,
                grabcursorenabled: true,
                autohidemode: true,
                background: "",
                iframeautoresize: true,
                cursorminheight: 20,
                preservenativescrolling: true,
                railoffset: false,
                bouncescroll: false,
                spacebarenabled: true,
                railpadding: {
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 0
                },
                disableoutline: true
            };
            if (f)
                for (var i in b.opt) typeof f[i] != "undefined" && (b.opt[i] = f[i]);
            this.iddoc = (this.doc = b.opt.doc) && this.doc[0] ? this.doc[0].id || "" : "";
            this.ispage = /BODY|HTML/.test(b.opt.win ? b.opt.win[0].nodeName : this.doc[0].nodeName);
            this.haswrapper = b.opt.win !== false;
            this.win = b.opt.win || (this.ispage ? e(window) : this.doc);
            this.docscroll = this.ispage && !this.haswrapper ? e(window) : this.win;
            this.body = e("body");
            this.iframe = false;
            this.isiframe = this.doc[0].nodeName == "IFRAME" && this.win[0].nodeName == "IFRAME";
            this.istextarea = this.win[0].nodeName == "TEXTAREA";
            this.page = this.view = this.onclick = this.ongesturezoom = this.onkeypress = this.onmousewheel = this.onmousemove = this.onmouseup = this.onmousedown = false;
            this.scroll = {
                x: 0,
                y: 0
            };
            this.scrollratio = {
                x: 0,
                y: 0
            };
            this.cursorheight = 20;
            this.scrollvaluemax = 0;
            this.scrollmom = false;
            do this.id = "ascrail" + u++; while (document.getElementById(this.id));
            this.hasmousefocus = this.hasfocus = this.zoomactive = this.zoom = this.cursorfreezed = this.cursor = this.rail = false;
            this.visibility = true;
            this.nativescrollingarea = this.hidden = this.locked = false;
            this.events = [];
            this.saved = {};
            this.delaylist = {};
            this.synclist = {};
            this.lastdelta = 0;
            var j = document.createElement("DIV");
            this.isopera = "opera" in window;
            this.isieold = (this.isie = "all" in document && "attachEvent" in j && !this.isopera) && !("msInterpolationMode" in j.style);
            this.isie7 = this.isie && !this.isieold && (!("documentMode" in document) || document.documentMode == 7);
            this.isie8 = this.isie && "documentMode" in document && document.documentMode == 8;
            this.isie9 = this.isie && "performance" in window && document.documentMode >= 9;
            this.isie9mobile = /iemobile.9/i.test(navigator.userAgent);
            this.isie7mobile = !this.isie9mobile && this.isie7 && /iemobile/i.test(navigator.userAgent);
            this.ismozilla = "MozAppearance" in j.style;
            this.ischrome = "chrome" in window;
            this.cantouch = "ontouchstart" in document.documentElement;
            this.hasmstouch = window.navigator.msPointerEnabled || false;
            this.isios4 = (this.isios = this.cantouch && /iphone|ipad|ipod/i.test(navigator.platform)) && !("seal" in Object);
            if (b.opt.hwacceleration) {
                if ((this.trstyle = window.opera ? "OTransform" : document.all ? "msTransform" : j.style.webkitTransform !== void 0 ? "webkitTransform" : j.style.MozTransform !== void 0 ? "MozTransform" : false) && typeof j.style[this.trstyle] == "undefined") this.trstyle = false;
                if (this.hastransform = this.trstyle != false) j.style[this.trstyle] = "translate3d(1px,2px,3px)", this.hastranslate3d = /translate3d/.test(j.style[this.trstyle]);
                this.transitionstyle = false;
                this.prefixstyle = "";
                this.transitionend = false;
                var r = "transition,webkitTransition,MozTransition,OTransition,msTransition,KhtmlTransition".split(","),
                    x = ",-webkit-,-moz-,-o-,-ms-,-khtml-".split(","),
                    l = "transitionEnd,webkitTransitionEnd,transitionend,oTransitionEnd,msTransitionEnd,KhtmlTransitionEnd".split(",");
                for (i = 0; i < r.length; i++)
                    if (r[i] in j.style) {
                        this.transitionstyle = r[i];
                        this.prefixstyle = x[i];
                        this.transitionend = l[i];
                        break
                    }
                this.hastransition = this.transitionstyle
            } else this.transitionend = this.hastransition = this.transitionstyle = this.hastranslate3d = this.hastransform = this.trstyle = false;
            this.cursorgrabvalue = "";
            if (b.opt.grabcursorenabled && b.opt.touchbehavior) this.cursorgrabvalue = function() {
                var c = ["-moz-grab", "-webkit-grab", "grab"];
                if (b.ischrome || b.isie) c = [];
                for (var g = 0; g < c.length; g++) {
                    var d = c[g];
                    j.style.cursor = d;
                    if (j.style.cursor == d) return d
                }
                return "url(http://www.google.com/intl/en_ALL/mapfiles/openhand.cur),n-resize"
            }();
            j = null;
            this.ishwscroll = b.hastransform && b.opt.hwacceleration && b.haswrapper;
            this.delayed = function(c, g, d) {
                var e = b.delaylist[c],
                    f = (new Date).getTime();
                if (e && e.tt) return false;
                if (e && e.last + d > f && !e.tt) b.delaylist[c] = {
                    last: f + d,
                    tt: setTimeout(function() {
                        b.delaylist[c].tt = 0;
                        g.call()
                    }, d)
                };
                else if (!e || !e.tt) b.delaylist[c] = {
                    last: f,
                    tt: 0
                }, setTimeout(function() {
                    g.call()
                }, 0)
            };
            this.requestSync = function() {
                if (!b.onsync) n(function() {
                    b.onsync = false;
                    for (name in b.synclist) {
                        var c = b.synclist[name];
                        c && c.call(b);
                        b.synclist[name] = false
                    }
                }), b.onsync = true
            };
            this.synched = function(c, g) {
                b.synclist[c] = g;
                b.requestSync()
            };
            this.css = function(c, g) {
                for (var d in g) b.saved.css.push([c, d, c.css(d)]), c.css(d, g[d])
            };
            this.scrollTop = function(c) {
                return typeof c == "undefined" ? b.getScrollTop() : b.setScrollTop(c)
            };
            BezierClass = function(b, d, e, k, f, h, y) {
                this.st = b;
                this.ed = d;
                this.spd = e;
                this.p1 = k || 0;
                this.p2 = f || 1;
                this.p3 = h || 0;
                this.p4 = y || 1;
                this.ts = (new Date).getTime();
                this.df = this.ed - this.st
            };
            BezierClass.prototype = {
                B2: function(b) {
                    return 3 * b * b * (1 - b)
                },
                B3: function(b) {
                    return 3 * b * (1 - b) * (1 - b)
                },
                B4: function(b) {
                    return (1 - b) * (1 - b) * (1 - b)
                },
                getNow: function() {
                    var b = 1 - ((new Date).getTime() - this.ts) / this.spd,
                        d = this.B2(b) + this.B3(b) + this.B4(b);
                    return b < 0 ? this.ed : this.st + Math.round(this.df * d)
                },
                update: function(b, d) {
                    this.st = this.getNow();
                    this.ed = b;
                    this.spd = d;
                    this.ts = (new Date).getTime();
                    this.df = this.ed - this.st;
                    return this
                }
            };
            this.ishwscroll ? (this.doc.translate = {
                x: 0,
                y: 0
            }, this.hastranslate3d && this.doc.css(this.prefixstyle + "backface-visibility", "hidden"), this.getScrollTop = function(c) {
                return b.timerscroll && !c ? b.timerscroll.bz.getNow() : b.doc.translate.y
            }, this.notifyScrollEvent = document.createEvent ? function(b) {
                var d = document.createEvent("UIEvents");
                d.initUIEvent("scroll", false, true, window, 1);
                b.dispatchEvent(d)
            } : document.fireEvent ? function(b) {
                var d = document.createEventObject();
                b.fireEvent("onscroll");
                d.cancelBubble = true
            } : function() {}, this.setScrollTop = this.hastranslate3d ? function(c, d) {
                b.doc.css(b.trstyle, "translate3d(0px," + c * -1 + "px,0px)");
                b.doc.translate.y = c;
                d || b.notifyScrollEvent(b.win[0])
            } : function(c, d) {
                b.doc.css(b.trstyle, "translate(0px," + c * -1 + "px)");
                b.doc.translate.y = c;
                d || b.notifyScrollEvent(b.win[0])
            }) : (this.getScrollTop = function() {
                return b.docscroll.scrollTop()
            }, this.setScrollTop = function(c) {
                return b.docscroll.scrollTop(c)
            });
            this.getTarget = function(b) {
                return !b ? false : b.target ? b.target : b.srcElement ? b.srcElement : false
            };
            this.hasParent = function(b, d) {
                if (!b) return false;
                for (var e = b.target || b.srcElement || b || false; e && e.id != d;) e = e.parentNode || false;
                return e !== false
            };
            var m = {
                thin: 1,
                medium: 3,
                thick: 5
            };
            this.updateScrollBar = function(c) {
                if (b.ishwscroll) b.rail.css({
                    height: b.win.innerHeight()
                });
                else {
                    var d = b.win.offset();
                    d.top += h(b.win, "border-top-width", true);
                    d.left += b.win.outerWidth() - h(b.win, "border-right-width", false) - b.rail.width;
                    var e = b.opt.railoffset;
                    e && (e.top && (d.top += e.top), e.left && (d.left += e.left));
                    b.rail.css({
                        top: d.top,
                        left: d.left,
                        height: c ? c.h : b.win.innerHeight()
                    });
                    b.zoom && b.zoom.css({
                        top: d.top + 1,
                        left: d.left - 20
                    })
                }
            };
            b.hasanimationframe = n;
            b.hascancelanimationframe = p;
            b.hasanimationframe ? b.hascancelanimationframe || (p = function() {
                b.cancelAnimationFrame = true
            }) : (n = function(b) {
                return setTimeout(b, 16)
            }, p = clearInterval);
            this.init = function() {
                b.saved.css = [];
                if (b.isie7mobile) return true;
                b.hasmstouch && b.css(b.ispage ? e("html") : b.win, {
                    "-ms-touch-action": "none"
                });
                if (!b.ispage || !b.cantouch && !b.isieold && !b.isie9mobile) {
                    var c = b.docscroll;
                    b.ispage && (c = b.haswrapper ? b.win : b.doc);
                    b.isie9mobile || b.css(c, {
                        "overflow-y": "hidden"
                    });
                    b.ispage && b.isie7 && b.win[0].nodeName == "BODY" && b.css(e("html"), {
                        "overflow-y": "hidden"
                    });
                    var d = e(document.createElement("div"));
                    d.css({
                        position: "relative",
                        top: 0,
                        "float": "right",
                        width: b.opt.cursorwidth,
                        height: "0px",
                        "background-color": b.opt.cursorcolor,
                        border: b.opt.cursorborder,
                        "background-clip": "padding-box",
                        "-webkit-border-radius": b.opt.cursorborderradius,
                        "-moz-border-radius": b.opt.cursorborderradius,
                        "border-radius": b.opt.cursorborderradius
                    });
                    d.hborder = parseFloat(d.outerHeight() - d.innerHeight());
                    b.cursor = d;
                    c = e(document.createElement("div"));
                    c.attr("id", b.id);
                    c.width = Math.max(parseFloat(b.opt.cursorwidth), d.outerWidth());
                    c.css({
                        width: c.width + "px",
                        zIndex: b.ispage ? b.opt.zindex : b.opt.zindex + 2,
                        background: b.opt.background
                    });
                    var w = ["top", "bottom", "left", "right"],
                        k;
                    for (k in w) {
                        var f = b.opt.railpadding[k];
                        f && c.css("padding-" + k, f + "px")
                    }
                    c.append(d);
                    b.rail = c;
                    k = b.rail.drag = false;
                    if (b.opt.boxzoom && !b.ispage && !b.isieold && (k = document.createElement("div"), b.bind(k, "click", b.doZoom), b.zoom = e(k), b.zoom.css({
                            cursor: "pointer",
                            "z-index": b.opt.zindex,
                            backgroundImage: "url(" + v + "zoomico.png)",
                            height: 18,
                            width: 18,
                            backgroundPosition: "0px 0px"
                        }), b.opt.dblclickzoom && b.bind(b.win, "dblclick", b.doZoom), b.cantouch && b.opt.gesturezoom)) b.ongesturezoom = function(c) {
                        c.scale > 1.5 && b.doZoomIn(c);
                        c.scale < 0.8 && b.doZoomOut(c);
                        return b.cancelEvent(c)
                    }, b.bind(b.win, "gestureend", b.ongesturezoom);
                    b.ispage ? (c.css({
                        position: "fixed",
                        top: "0px",
                        right: "0px",
                        height: "100%"
                    }), b.body.append(c)) : (b.ishwscroll ? (b.win.css("position") == "static" && b.css(b.win, {
                        position: "relative"
                    }), k = b.win[0].nodeName == "HTML" ? b.body : b.win, b.zoom && (b.zoom.css({
                        position: "absolute",
                        top: 1,
                        right: 0,
                        "margin-right": c.width + 4
                    }), k.append(b.zoom)), c.css({
                        position: "absolute",
                        top: 0,
                        right: 0
                    }), k.append(c)) : (c.css({
                        position: "absolute"
                    }), b.zoom && b.zoom.css({
                        position: "absolute"
                    }), b.updateScrollBar(), b.body.append(c), b.zoom && b.body.append(b.zoom)), b.isios && b.css(b.win, {
                        "-webkit-tap-highlight-color": "rgba(0,0,0,0)",
                        "-webkit-touch-callout": "none"
                    }));
                    if (b.opt.autohidemode === false) b.autohidedom = false;
                    else if (b.opt.autohidemode === true) b.autohidedom = b.rail;
                    else if (b.opt.autohidemode == "cursor") b.autohidedom = b.cursor;
                    if (b.isie9mobile) b.scrollmom = {
                        y: new s(b)
                    }, b.onmangotouch = function() {
                        var c = b.getScrollTop();
                        if (c == b.scrollmom.y.lastscrolly) return true;
                        var d = c - b.mangotouch.sy;
                        if (d != 0) {
                            var e = d < 0 ? -1 : 1,
                                g = (new Date).getTime();
                            b.mangotouch.lazy && clearTimeout(b.mangotouch.lazy);
                            if (g - b.mangotouch.tm > 60 || b.mangotouch.dry != e) b.scrollmom.y.stop(), b.scrollmom.y.reset(c), b.mangotouch.sy = c, b.mangotouch.ly = c, b.mangotouch.dry = e, b.mangotouch.tm = g;
                            else {
                                b.scrollmom.y.stop();
                                b.scrollmom.y.update(b.mangotouch.sy - d);
                                var f = g - b.mangotouch.tm;
                                b.mangotouch.tm = g;
                                d = Math.abs(b.mangotouch.ly - c);
                                b.mangotouch.ly = c;
                                if (d > 2) b.mangotouch.lazy = setTimeout(function() {
                                    b.mangotouch.lazy = false;
                                    b.mangotouch.dry = 0;
                                    b.mangotouch.tm = 0;
                                    b.scrollmom.y.doMomentum(f)
                                }, 80)
                            }
                        }
                    }, c = b.getScrollTop(), b.mangotouch = {
                        sy: c,
                        ly: c,
                        dry: 0,
                        lazy: false,
                        tm: 0
                    }, b.bind(b.docscroll, "scroll", b.onmangotouch);
                    else {
                        if (b.cantouch || b.opt.touchbehavior || b.hasmstouch) b.scrollmom = {
                            y: new s(b)
                        }, b.ontouchstart = function(c) {
                            if (c.pointerType && c.pointerType != 2) return false;
                            if (!b.locked) {
                                if (b.hasmstouch)
                                    for (var d = c.target ? c.target : false; d;) {
                                        var g = e(d).getNiceScroll();
                                        if (g.length > 0 && g[0].me == b.me) break;
                                        if (g.length > 0) return false;
                                        if (d.nodeName == "DIV" && d.id == b.id) break;
                                        d = d.parentNode ? d.parentNode : false
                                    }
                                b.cancelScroll();
                                b.rail.drag = {
                                    x: c.clientX,
                                    y: c.clientY,
                                    sx: b.scroll.x,
                                    sy: b.scroll.y,
                                    st: b.getScrollTop(),
                                    pt: 2
                                };
                                b.hasmoving = false;
                                b.lastmouseup = false;
                                b.scrollmom.y.reset(c.clientY);
                                if (!b.cantouch && !b.hasmstouch) {
                                    d = b.getTarget(c);
                                    if (!d || !/INPUT|SELECT|TEXTAREA/i.test(d.nodeName)) return b.cancelEvent(c);
                                    if (/SUBMIT|CANCEL|BUTTON/i.test(e(d).attr("type"))) pc = {
                                        tg: d,
                                        click: false
                                    }, b.preventclick = pc
                                }
                            }
                        }, b.ontouchend = function(c) {
                            if (c.pointerType && c.pointerType != 2) return false;
                            if (b.rail.drag && b.rail.drag.pt == 2 && (b.scrollmom.y.doMomentum(), b.rail.drag = false, b.hasmoving && (b.hasmoving = false, b.lastmouseup = true, b.hideCursor(), !b.cantouch))) return b.cancelEvent(c)
                        }, b.ontouchmove = function(c) {
                            if (c.pointerType && c.pointerType != 2) return false;
                            if (b.rail.drag && b.rail.drag.pt == 2) {
                                if (b.cantouch && typeof c.original == "undefined") return true;
                                b.hasmoving = true;
                                if (b.preventclick && !b.preventclick.click) b.preventclick.click = b.preventclick.tg.onclick || false, b.preventclick.tg.onclick = b.onpreventclick;
                                var d = c.clientY,
                                    g = b.rail.drag.st - (d - b.rail.drag.y);
                                if (b.ishwscroll) g < 0 ? (g = Math.round(g / 2), d = 0) : g > b.page.maxh && (g = b.page.maxh + Math.round((g - b.page.maxh) / 2), d = 0);
                                else if (g < 0 && (g = 0), g > b.page.maxh) g = b.page.maxh;
                                b.synched("touchmove", function() {
                                    b.rail.drag && b.rail.drag.pt == 2 && (b.prepareTransition && b.prepareTransition(0), b.setScrollTop(g), b.showCursor(g), b.scrollmom.y.update(d))
                                });
                                return b.cancelEvent(c)
                            }
                        };
                        b.cantouch || b.opt.touchbehavior ? (b.onpreventclick = function(c) {
                            if (b.preventclick) return b.preventclick.tg.onclick = b.preventclick.click, b.preventclick = false, b.cancelEvent(c)
                        }, b.onmousedown = b.ontouchstart, b.onmouseup = b.ontouchend, b.onclick = b.isios ? false : function(c) {
                            return b.lastmouseup ? (b.lastmouseup = false, b.cancelEvent(c)) : true
                        }, b.onmousemove = b.ontouchmove, b.cursorgrabvalue && (b.css(b.ispage ? b.doc : b.win, {
                            cursor: b.cursorgrabvalue
                        }), b.css(b.rail, {
                            cursor: b.cursorgrabvalue
                        }))) : (b.onmousedown = function(c) {
                            if (!(b.rail.drag && b.rail.drag.pt != 1)) {
                                if (b.locked) return b.cancelEvent(c);
                                b.cancelScroll();
                                b.rail.drag = {
                                    x: c.clientX,
                                    y: c.clientY,
                                    sx: b.scroll.x,
                                    sy: b.scroll.y,
                                    pt: 1
                                };
                                return b.cancelEvent(c)
                            }
                        }, b.onmouseup = function(c) {
                            if (b.rail.drag && b.rail.drag.pt == 1) return b.rail.drag = false, b.cancelEvent(c)
                        }, b.onmousemove = function(c) {
                            if (b.rail.drag) {
                                if (b.rail.drag.pt == 1) {
                                    b.scroll.y = b.rail.drag.sy + (c.clientY - b.rail.drag.y);
                                    if (b.scroll.y < 0) b.scroll.y = 0;
                                    var d = b.scrollvaluemax;
                                    if (b.scroll.y > d) b.scroll.y = d;
                                    b.synched("mousemove", function() {
                                        if (b.rail.drag && b.rail.drag.pt == 1) b.showCursor(), b.cursorfreezed = true, b.doScroll(Math.round(b.scroll.y * b.scrollratio.y))
                                    });
                                    return b.cancelEvent(c)
                                }
                            } else b.checkarea = true
                        });
                        (b.cantouch || b.opt.touchbehavior) && b.bind(b.win, "mousedown", b.onmousedown);
                        b.hasmstouch && (b.css(b.rail, {
                            "-ms-touch-action": "none"
                        }), b.css(b.cursor, {
                            "-ms-touch-action": "none"
                        }), b.bind(b.win, "MSPointerDown", b.ontouchstart), b.bind(document, "MSPointerUp", b.ontouchend), b.bind(document, "MSPointerMove", b.ontouchmove), b.bind(b.cursor, "MSGestureHold", function(b) {
                            b.preventDefault()
                        }), b.bind(b.cursor, "contextmenu", function(b) {
                            b.preventDefault()
                        }));
                        b.bind(b.cursor, "mousedown", b.onmousedown);
                        b.bind(b.cursor, "mouseup", function(c) {
                            if (!(b.rail.drag && b.rail.drag.pt == 2)) return b.rail.drag = false, b.hasmoving = false, b.hideCursor(), b.cancelEvent(c)
                        });
                        b.bind(document, "mouseup", b.onmouseup);
                        b.bind(document, "mousemove", b.onmousemove);
                        b.onclick && b.bind(document, "click", b.onclick);
                        b.cantouch || (b.rail.mouseenter(function() {
                            b.showCursor();
                            b.rail.active = true
                        }), b.rail.mouseleave(function() {
                            b.rail.active = false;
                            b.rail.drag || b.hideCursor()
                        }), b.isiframe || b.bind(b.isie && b.ispage ? document : b.docscroll, "mousewheel", b.onmousewheel), b.bind(b.rail, "mousewheel", b.onmousewheel));
                        b.zoom && (b.zoom.mouseenter(function() {
                            b.showCursor();
                            b.rail.active = true
                        }), b.zoom.mouseleave(function() {
                            b.rail.active = false;
                            b.rail.drag || b.hideCursor()
                        }));
                        !b.ispage && !b.cantouch && !/HTML|BODY/.test(b.win[0].nodeName) && (b.win.attr("tabindex") || b.win.attr({
                            tabindex: t++
                        }), b.ischrome && b.opt.disableoutline && b.win.css({
                            outline: "none"
                        }), b.win.focus(function(c) {
                            o = b.getTarget(c).id || true;
                            b.hasfocus = true;
                            b.noticeCursor()
                        }), b.win.blur(function() {
                            o = false;
                            b.hasfocus = false
                        }), b.win.mouseenter(function(c) {
                            q = b.getTarget(c).id || true;
                            b.hasmousefocus = true;
                            b.noticeCursor()
                        }), b.win.mouseleave(function() {
                            q = false;
                            b.hasmousefocus = false
                        }))
                    }
                    b.onkeypress = function(c) {
                        if (b.locked && b.page.maxh == 0) return true;
                        var c = c ? c : window.e,
                            d = b.getTarget(c);
                        if (d && /INPUT|TEXTAREA|SELECT|OPTION/.test(d.nodeName) && (!d.getAttribute("type") && !d.type || !/submit|button|cancel/i.tp)) return true;
                        if (b.hasfocus || b.hasmousefocus && !o || b.ispage && !o && !q) {
                            d = c.keyCode;
                            if (b.locked && d != 27) return b.cancelEvent(c);
                            var g = false;
                            switch (d) {
                                case 38:
                                case 63233:
                                    b.doScrollBy(72);
                                    g = true;
                                    break;
                                case 40:
                                case 63235:
                                    b.doScrollBy(-72);
                                    g = true;
                                    break;
                                case 33:
                                case 63276:
                                    b.doScrollBy(b.view.h);
                                    g = true;
                                    break;
                                case 34:
                                case 63277:
                                    b.doScrollBy(-b.view.h);
                                    g = true;
                                    break;
                                case 36:
                                case 63273:
                                    b.doScrollTo(0);
                                    g = true;
                                    break;
                                case 35:
                                case 63275:
                                    b.doScrollTo(b.page.maxh);
                                    g = true;
                                    break;
                                case 32:
                                    b.opt.spacebarenabled && (b.doScrollBy(-b.view.h), g = true);
                                    break;
                                case 27:
                                    b.zoomactive && (b.doZoom(), g = true)
                            }
                            if (g) return b.cancelEvent(c)
                        }
                    };
                    b.bind(document, b.isopera ? "keypress" : "keydown", b.onkeypress);
                    b.bind(window, "resize", b.resize);
                    b.bind(window, "orientationchange", b.resize);
                    b.bind(window, "load", b.resize);
                    b.onAttributeChange = function() {
                        b.lazyResize()
                    };
                    !b.ispage && !b.haswrapper && ("WebKitMutationObserver" in window ? (new WebKitMutationObserver(function(c) {
                        c.forEach(b.onAttributeChange)
                    })).observe(b.win[0], {
                        attributes: true,
                        subtree: false
                    }) : (b.bind(b.win, b.isie && !b.isie9 ? "propertychange" : "DOMAttrModified", b.onAttributeChange), b.isie9 && b.win[0].attachEvent("onpropertychange", b.onAttributeChange)));
                    !b.ispage && b.opt.boxzoom && b.bind(window, "resize", b.resizeZoom);
                    b.istextarea && b.bind(b.win, "mouseup", b.resize);
                    b.resize()
                }
                if (this.doc[0].nodeName == "IFRAME") {
                    var h = function() {
                        b.iframexd = false;
                        try {
                            var c = "contentDocument" in this ? this.contentDocument : this.contentWindow.document
                        } catch (d) {
                            b.iframexd = true, c = false
                        }
                        if (b.iframexd) return true;
                        if (b.isiframe) b.iframe = {
                            html: b.doc.contents().find("html")[0],
                            body: b.doc.contents().find("body")[0]
                        }, b.getContentSize = function() {
                            return {
                                w: Math.max(b.iframe.html.scrollWidth, b.iframe.body.scrollWidth),
                                h: Math.max(b.iframe.html.scrollHeight, b.iframe.body.scrollHeight)
                            }
                        }, b.docscroll = e(this.contentWindow);
                        if (b.opt.iframeautoresize && !b.isiframe) {
                            b.win.scrollTop(0);
                            b.doc.height("");
                            var g = Math.max(c.getElementsByTagName("html")[0].scrollHeight, c.body.scrollHeight);
                            b.doc.height(g)
                        }
                        b.resize();
                        b.isie7 && b.css(e(c).find("html"), {
                            "overflow-y": "hidden"
                        });
                        b.css(e(c.body), {
                            "overflow-y": "hidden"
                        });
                        "contentWindow" in this ? b.bind(this.contentWindow, "scroll", b.onscroll) : b.bind(c, "scroll", b.onscroll);
                        b.bind(c, "mouseup", b.onmouseup);
                        b.bind(c, "mousewheel", b.onmousewheel);
                        b.bind(c, b.isopera ? "keypress" : "keydown", b.onkeypress);
                        if (b.cantouch || b.opt.touchbehavior) b.bind(c, "mousedown", b.onmousedown), b.cursorgrabvalue && b.css(e(c.body), {
                            cursor: b.cursorgrabvalue
                        });
                        b.bind(c, "mousemove", b.onmousemove);
                        b.zoom && (b.opt.dblclickzoom && b.bind(c, "dblclick", b.doZoom), b.ongesturezoom && b.bind(c, "gestureend", b.ongesturezoom))
                    };
                    this.doc[0].readyState && this.doc[0].readyState == "complete" && setTimeout(function() {
                        h.call(b.doc[0], false)
                    }, 500);
                    b.bind(this.doc, "load", h)
                }
            };
            this.showCursor = function(c) {
                if (b.cursortimeout) clearTimeout(b.cursortimeout), b.cursortimeout = 0;
                if (b.rail) {
                    b.autohidedom && b.autohidedom.stop().css({
                        opacity: b.opt.cursoropacitymax
                    });
                    if (typeof c != "undefined") b.scroll.y = Math.round(c * 1 / b.scrollratio.y);
                    b.cursor.css({
                        height: b.cursorheight,
                        top: b.scroll.y
                    });
                    b.zoom && b.zoom.stop().css({
                        opacity: b.opt.cursoropacitymax
                    })
                }
            };
            this.hideCursor = function(c) {
                if (!b.cursortimeout && b.rail && b.autohidedom) b.cursortimeout = setTimeout(function() {
                    b.rail.active || (b.autohidedom.stop().animate({
                        opacity: b.opt.cursoropacitymin
                    }), b.zoom && b.zoom.stop().animate({
                        opacity: b.opt.cursoropacitymin
                    }));
                    b.cursortimeout = 0
                }, c || 400)
            };
            this.noticeCursor = function(c, d) {
                b.showCursor(d);
                b.hideCursor(c)
            };
            this.getContentSize = b.ispage ? function() {
                return {
                    w: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
                    h: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
                }
            } : b.haswrapper ? function() {
                return {
                    w: b.doc.outerWidth() + parseInt(b.win.css("paddingLeft")) + parseInt(b.win.css("paddingRight")),
                    h: b.doc.outerHeight() + parseInt(b.win.css("paddingTop")) + parseInt(b.win.css("paddingBottom"))
                }
            } : function() {
                return {
                    w: b.docscroll[0].scrollWidth,
                    h: b.docscroll[0].scrollHeight
                }
            };
            this.resize = this.onResize = function(c, d) {
                if (!b.haswrapper && !b.ispage)
                    if (b.win.css("display") == "none") return b.visibility && b.hideRail(), false;
                    else !b.visibility && b.getScrollTop() == 0 && b.doScrollTo(Math.floor(b.scroll.y * b.scrollratio.y)), !b.hidden && !b.visibility && b.showRail();
                var e = b.page.maxh,
                    f = b.page.maxw,
                    h = b.view.w;
                b.view = {
                    w: b.ispage ? b.win.width() : parseInt(b.win[0].clientWidth),
                    h: b.ispage ? b.win.height() : parseInt(b.win[0].clientHeight)
                };
                b.page = d ? d : b.getContentSize();
                b.page.maxh = Math.max(0, b.page.h - b.view.h);
                b.page.maxw = Math.max(0, b.page.w - b.view.w);
                if (b.page.maxh == e && b.page.maxw == f && b.view.w == h)
                    if (b.ispage) return b;
                    else {
                        e = b.win.offset();
                        if (b.lastposition && (f = b.lastposition, f.top == e.top && f.left == e.left)) return b;
                        b.lastposition = e
                    }
                if (b.page.maxh == 0) return b.hideRail(), b.scrollvaluemax = 0, b.scroll.y = 0, b.scrollratio = {
                    x: 0,
                    y: 0
                }, b.cursorheight = 0, b.locked = true, b.setScrollTop(0), false;
                else if (!b.hidden && !b.visibility) b.showRail(), b.locked = false;
                b.istextarea && b.win.css("resize") && b.win.css("resize") != "none" && (b.view.h -= 20);
                b.ispage || b.updateScrollBar(b.view);
                b.cursorheight = Math.min(b.view.h, Math.round(b.view.h * (b.view.h / b.page.h)));
                b.cursorheight = Math.max(b.opt.cursorminheight, b.cursorheight);
                b.scrollvaluemax = b.view.h - b.cursorheight - b.cursor.hborder;
                b.scrollratio = {
                    x: 0,
                    y: b.page.maxh / b.scrollvaluemax
                };
                b.getScrollTop() > b.page.maxh ? b.doScroll(b.page.maxh) : (b.scroll.y = Math.round(b.getScrollTop() * (1 / b.scrollratio.y)), b.noticeCursor());
                return b
            };
            this.lazyResize = function() {
                b.delayed("resize", b.resize, 250)
            };
            this._bind = function(c, d, e, f) {
                b.events.push({
                    e: c,
                    n: d,
                    f: e
                });
                c.addEventListener ? c.addEventListener(d, e, f || false) : c.attachEvent ? c.attachEvent("on" + d, e) : c["on" + d] = e
            };
            this.bind = function(c, d, e, f) {
                var h = "jquery" in c ? c[0] : c;
                h.addEventListener ? (b.cantouch && /mouseup|mousedown|mousemove/.test(d) && b._bind(h, d == "mousedown" ? "touchstart" : d == "mouseup" ? "touchend" : "touchmove", function(b) {
                    if (b.touches) {
                        if (b.touches.length < 2) {
                            var c = b.touches.length ? b.touches[0] : b;
                            c.original = b;
                            e.call(this, c)
                        }
                    } else if (b.changedTouches) c = b.changedTouches[0], c.original = b, e.call(this, c)
                }, f || false), b._bind(h, d, e, f || false), d == "mousewheel" && b._bind(h, "DOMMouseScroll", e, f || false), b.cantouch && d == "mouseup" && b._bind(h, "touchcancel", e, f || false)) : b._bind(h, d, function(c) {
                    if ((c = c || window.event || false) && c.srcElement) c.target = c.srcElement;
                    return e.call(h, c) === false || f === false ? b.cancelEvent(c) : true
                })
            };
            this._unbind = function(b, d, e) {
                b.removeEventListener ? b.removeEventListener(d, e, false) : b.detachEvent ? b.detachEvent("on" + d, e) : b["on" + d] = false
            };
            this.unbindAll = function() {
                for (var c = 0; c < b.events.length; c++) {
                    var d = b.events[c];
                    b._unbind(d.e, d.n, d.f)
                }
            };
            this.cancelEvent = function(b) {
                b = b.original ? b.original : b ? b : window.event || false;
                if (!b) return false;
                b.preventDefault && b.preventDefault();
                b.stopPropagation && b.stopPropagation();
                b.preventManipulation && b.preventManipulation();
                b.cancelBubble = true;
                b.cancel = true;
                return b.returnValue = false
            };
            this.showRail = function() {
                if (b.page.maxh != 0 && (b.ispage || b.win.css("display") != "none")) b.visibility = true, b.rail.css("display", "block");
                return b
            };
            this.hideRail = function() {
                b.visibility = false;
                b.rail.css("display", "none");
                return b
            };
            this.show = function() {
                b.hidden = false;
                b.locked = false;
                return b.showRail()
            };
            this.hide = function() {
                b.hidden = true;
                b.locked = true;
                return b.hideRail()
            };
            this.remove = function() {
                b.doZoomOut();
                b.unbindAll();
                b.events = [];
                b.rail.remove();
                b.zoom && b.zoom.remove();
                b.cursor = false;
                b.rail = false;
                b.zoom = false;
                for (var c = 0; c < b.saved.css.length; c++) {
                    var d = b.saved.css[c];
                    d[0].css(d[1], typeof d[2] == "undefined" ? "" : d[2])
                }
                b.saved = false;
                b.me.data("__nicescroll", "");
                return b
            };
            this.isScrollable = function(b) {
                for (b = b.target ? b.target : b; b && b.nodeName && !/BODY|HTML/.test(b.nodeName);) {
                    var d = e(b);
                    if (/scroll|auto/.test(d.css("overflowY") || d.css("overflow") || "")) return b.clientHeight != b.scrollHeight;
                    b = b.parentNode ? b.parentNode : false
                }
                return false
            };
            this.onmousewheel = function(c) {
                if (b.locked && b.page.maxh == 0) return true;
                if (b.opt.preservenativescrolling && b.checkarea) b.checkarea = false, b.nativescrollingarea = b.isScrollable(c);
                if (b.nativescrollingarea) return true;
                if (b.locked) return b.cancelEvent(c);
                if (b.rail.drag) return b.cancelEvent(c);
                var d = 0;
                if (d = c.detail ? c.detail * -1 : c.wheelDelta / 40) b.scrollmom && b.scrollmom.y.stop(), b.lastdelta += d * b.opt.mousescrollstep, b.synched("mousewheel", function() {
                    if (!b.rail.drag) {
                        var c = b.lastdelta;
                        b.lastdelta = 0;
                        b.doScrollBy(c)
                    }
                });
                return b.cancelEvent(c)
            };
            this.stop = function() {
                b.cancelScroll();
                b.scrollmon && b.scrollmon.stop();
                b.cursorfreezed = false;
                b.scroll.y = Math.round(b.getScrollTop() * (1 / b.scrollratio.y));
                b.noticeCursor();
                return b
            };
            b.ishwscroll && b.hastransition && b.opt.usetransition ? (this.prepareTransition = function(c) {
                var d = Math.round(b.opt.scrollspeed * 10),
                    c = Math.min(d, Math.round(c / 20 * b.opt.scrollspeed)),
                    d = c > 20 ? b.prefixstyle + "transform " + c + "ms ease-out 0s" : "";
                if (!b.lasttransitionstyle || b.lasttransitionstyle != d) b.lasttransitionstyle = d, b.doc.css(b.transitionstyle, d);
                return c
            }, this.doScroll = function(c, d) {
                var e = b.getScrollTop();
                if (c < 0 && e <= 0) return b.noticeCursor();
                else if (c > b.page.maxh && e >= b.page.maxh) return b.checkContentSize(), b.noticeCursor();
                b.newscrolly = c;
                b.newscrollspeed = d || false;
                if (b.timer) return false;
                if (!b.scrollendtrapped) b.scrollendtrapped = true, b.bind(b.doc, b.transitionend, b.onScrollEnd, false);
                b.timer = setTimeout(function() {
                    var c = b.getScrollTop(),
                        c = b.newscrollspeed ? b.newscrollspeed : Math.abs(c - b.newscrolly),
                        d = b.prepareTransition(c);
                    b.timer = setTimeout(function() {
                        if (b.newscrolly < 0 && !b.opt.bouncescroll) b.newscrolly = 0;
                        else if (b.newscrolly > b.page.maxh && !b.opt.bouncescroll) b.newscrolly = b.page.maxh;
                        if (b.newscrolly == b.getScrollTop()) b.timer = 0, b.onScrollEnd();
                        else {
                            var c = b.getScrollTop();
                            b.timerscroll && b.timerscroll.tm && clearInterval(b.timerscroll.tm);
                            if (d > 0 && (b.timerscroll = {
                                    ts: (new Date).getTime(),
                                    s: b.getScrollTop(),
                                    e: b.newscrolly,
                                    sp: d,
                                    bz: new BezierClass(c, b.newscrolly, d, 0, 1, 0, 1)
                                }, !b.cursorfreezed)) b.timerscroll.tm = setInterval(function() {
                                b.showCursor(b.getScrollTop())
                            }, 60);
                            b.setScrollTop(b.newscrolly);
                            b.timer = 0
                        }
                    }, 15)
                }, b.opt.scrollspeed)
            }, this.cancelScroll = function() {
                if (!b.scrollendtrapped) return true;
                var c = b.getScrollTop();
                b.scrollendtrapped = false;
                b._unbind(b.doc, b.transitionend, b.onScrollEnd);
                b.prepareTransition(0);
                b.setScrollTop(c);
                b.timerscroll && b.timerscroll.tm && clearInterval(b.timerscroll.tm);
                b.timerscroll = false;
                b.cursorfreezed = false;
                b.noticeCursor(false, c);
                return b
            }, this.onScrollEnd = function() {
                b.scrollendtrapped = false;
                b._unbind(b.doc, b.transitionend, b.onScrollEnd);
                b.timerscroll && b.timerscroll.tm && clearInterval(b.timerscroll.tm);
                b.timerscroll = false;
                b.cursorfreezed = false;
                var c = b.getScrollTop();
                b.setScrollTop(c);
                b.noticeCursor(false, c);
                c < 0 ? b.doScroll(0, 60) : c > b.page.maxh && b.doScroll(b.page.maxh, 60)
            }) : (this.doScroll = function(c) {
                function d() {
                    if (b.cancelAnimationFrame) return true;
                    if (h = 1 - h) return b.timer = n(d) || 1;
                    var c = b.getScrollTop(),
                        e = b.bzscroll ? b.bzscroll.getNow() : b.newscrolly,
                        c = e - c;
                    if (c < 0 && e < b.newscrolly || c > 0 && e > b.newscrolly) e = b.newscrolly;
                    b.setScrollTop(e);
                    e == b.newscrolly ? (b.timer = 0, b.cursorfreezed = false, b.bzscroll = false, e < 0 ? b.doScroll(0) : e > b.page.maxh && b.doScroll(b.page.maxh)) : b.timer = n(d) || 1
                }
                if (b.newscrolly == c) return true;
                var e = b.getScrollTop();
                b.newscrolly = c;
                if (!b.bouncescroll)
                    if (b.newscrolly < 0) {
                        if (b.newspeedy) b.newspeedy.x = 0;
                        b.newscrolly = 0
                    } else if (b.newscrolly > b.page.maxh) {
                    if (b.newspeedy) b.newspeedy.x = b.page.maxh;
                    b.newscrolly = b.page.maxh
                }
                var f = Math.floor(Math.abs(c - e) / 40);
                f > 0 ? (f = Math.min(10, f) * 100, b.bzscroll = b.bzscroll ? b.bzscroll.update(c, f) : new BezierClass(e, c, f, 0, 1, 0, 1)) : b.bzscroll = false;
                if (!b.timer) {
                    e == b.page.maxh && c >= b.page.maxh && b.checkContentSize();
                    var h = 1;
                    b.cancelAnimationFrame = false;
                    b.timer = 1;
                    d();
                    e == b.page.maxh && c >= e && b.checkContentSize();
                    b.noticeCursor()
                }
            }, this.cancelScroll = function() {
                b.timer && p(b.timer);
                b.timer = 0;
                b.bzscroll = false;
                return b
            });
            this.doScrollBy = function(c, d) {
                var e = 0,
                    e = d ? Math.floor((b.scroll.y - c) * b.scrollratio.y) : (b.timer ? b.newscrolly : b.getScrollTop(true)) - c;
                if (b.bouncescroll) {
                    var f = Math.round(b.view.h / 2);
                    e < -f ? e = -f : e > b.page.maxh + f && (e = b.page.maxh + f)
                }
                b.cursorfreezed = false;
                b.doScroll(e)
            };
            this.doScrollTo = function(c, d) {
                d && Math.round(c * b.scrollratio.y);
                b.cursorfreezed = false;
                b.doScroll(c)
            };
            this.checkContentSize = function() {
                var c = b.getContentSize();
                c.h != b.page.h && b.resize(false, c)
            };
            b.onscroll = function() {
                b.rail.drag || b.cursorfreezed || b.synched("scroll", function() {
                    b.scroll.y = Math.round(b.getScrollTop() * (1 / b.scrollratio.y));
                    b.noticeCursor()
                })
            };
            b.bind(b.docscroll, "scroll", b.onscroll);
            this.doZoomIn = function(c) {
                if (!b.zoomactive) {
                    b.zoomactive = true;
                    b.zoomrestore = {
                        style: {}
                    };
                    var d = "position,top,left,zIndex,backgroundColor,marginTop,marginBottom,marginLeft,marginRight".split(","),
                        f = b.win[0].style,
                        h;
                    for (h in d) {
                        var i = d[h];
                        b.zoomrestore.style[i] = typeof f[i] != "undefined" ? f[i] : ""
                    }
                    b.zoomrestore.style.width = b.win.css("width");
                    b.zoomrestore.style.height = b.win.css("height");
                    b.zoomrestore.padding = {
                        w: b.win.outerWidth() - b.win.width(),
                        h: b.win.outerHeight() - b.win.height()
                    };
                    if (b.isios4) b.zoomrestore.scrollTop = e(window).scrollTop(), e(window).scrollTop(0);
                    b.win.css({
                        position: b.isios4 ? "absolute" : "fixed",
                        top: 0,
                        left: 0,
                        "z-index": b.opt.zindex + 100,
                        margin: "0px"
                    });
                    d = b.win.css("backgroundColor");
                    (d == "" || /transparent|rgba\(0, 0, 0, 0\)|rgba\(0,0,0,0\)/.test(d)) && b.win.css("backgroundColor", "#fff");
                    b.rail.css({
                        "z-index": b.opt.zindex + 110
                    });
                    b.zoom.css({
                        "z-index": b.opt.zindex + 112
                    });
                    b.zoom.css("backgroundPosition", "0px -18px");
                    b.resizeZoom();
                    return b.cancelEvent(c)
                }
            };
            this.doZoomOut = function(c) {
                if (b.zoomactive) return b.zoomactive = false, b.win.css("margin", ""), b.win.css(b.zoomrestore.style), b.isios4 && e(window).scrollTop(b.zoomrestore.scrollTop), b.rail.css({
                    "z-index": b.ispage ? b.opt.zindex : b.opt.zindex + 2
                }), b.zoom.css({
                    "z-index": b.opt.zindex
                }), b.zoomrestore = false, b.zoom.css("backgroundPosition", "0px 0px"), b.onResize(), b.cancelEvent(c)
            };
            this.doZoom = function(c) {
                return b.zoomactive ? b.doZoomOut(c) : b.doZoomIn(c)
            };
            this.resizeZoom = function() {
                if (b.zoomactive) {
                    var c = b.getScrollTop();
                    b.win.css({
                        width: e(window).width() - b.zoomrestore.padding.w + "px",
                        height: e(window).height() - b.zoomrestore.padding.h + "px"
                    });
                    b.onResize();
                    b.setScrollTop(Math.min(b.page.maxh, c))
                }
            };
            this.init();
            e.nicescroll.push(this)
        },
        s = function(e) {
            var d = this;
            this.nc = e;
            this.lasttime = this.speedy = this.lasty = 0;
            this.snapy = false;
            this.demuly = 0;
            this.lastscrolly = -1;
            this.timer = this.chky = 0;
            this.time = function() {
                return (new Date).getTime()
            };
            this.reset = function(e) {
                d.stop();
                d.lasttime = d.time();
                d.speedy = 0;
                d.lasty = e;
                d.lastscrolly = -1
            };
            this.update = function(h) {
                d.lasttime = d.time();
                var b = h - d.lasty,
                    i = e.getScrollTop() + b;
                d.snapy = i < 0 || i > d.nc.page.maxh;
                d.speedy = b;
                d.lasty = h
            };
            this.stop = function() {
                if (d.timer) clearTimeout(d.timer), d.timer = 0, d.lastscrolly = -1
            };
            this.doSnapy = function(e) {
                e < 0 ? d.nc.doScroll(0, 60) : e > d.nc.page.maxh && d.nc.doScroll(d.nc.page.maxh, 60)
            };
            this.doMomentum = function(e) {
                var b = d.time(),
                    f = e ? b + e : d.lasttime;
                d.speedy = Math.min(60, d.speedy);
                if (d.speedy && f && b - f <= 50 && d.speedy) {
                    var e = b - f,
                        j = d.nc.page.maxh;
                    d.demuly = 0;
                    d.lastscrolly = d.nc.getScrollTop();
                    d.chky = d.lastscrolly;
                    var l = function() {
                        var b = Math.floor(d.lastscrolly - d.speedy * (1 - d.demuly));
                        d.demuly += b < 0 || b > j ? 0.08 : 0.01;
                        d.lastscrolly = b;
                        d.nc.synched("domomentum", function() {
                            d.nc.getScrollTop() != d.chky && d.stop();
                            d.chky = b;
                            d.nc.setScrollTop(b);
                            d.timer ? d.nc.showCursor(b) : (d.nc.hideCursor(), d.doSnapy(b))
                        });
                        d.timer = d.demuly < 1 ? setTimeout(l, e) : 0
                    };
                    l()
                } else d.snapy && d.doSnapy(d.nc.getScrollTop())
            }
        },
        l = e.fn.scrollTop;
    e.cssHooks.scrollTop = {
        get: function(f) {
            var d = e.data(f, "__nicescroll") || false;
            return d && d.ishwscroll ? d.getScrollTop() : l.call(f)
        },
        set: function(f, d) {
            var h = e.data(f, "__nicescroll") || false;
            h && h.ishwscroll ? h.setScrollTop(parseInt(d)) : l.call(f, d);
            return this
        }
    };
    e.fn.scrollTop = function(f) {
        if (typeof f == "undefined") {
            var d = this[0] ? e.data(this[0], "__nicescroll") || false : false;
            return d && d.ishwscroll ? d.getScrollTop() : l.call(this)
        } else return this.each(function() {
            var d = e.data(this, "__nicescroll") || false;
            d && d.ishwscroll ? d.setScrollTop(parseInt(f)) : l.call(e(this), f)
        })
    };
    var m = function(f) {
        var d = this;
        this.length = 0;
        this.name = "nicescrollarray";
        this.each = function(b) {
            for (var e = 0; e < d.length; e++) b.call(d[e]);
            return d
        };
        this.push = function(b) {
            d[d.length] = b;
            d.length++
        };
        this.eq = function(b) {
            return d[b]
        };
        if (f)
            for (a = 0; a < f.length; a++) {
                var h = e.data(f[a], "__nicescroll") || false;
                h && (this[this.length] = h, this.length++)
            }
        return this
    };
    (function(e, d, h) {
        for (var b = 0; b < d.length; b++) h(e, d[b])
    })(m.prototype, "show,hide,onResize,resize,remove,stop".split(","), function(e, d) {
        e[d] = function() {
            return this.each(function() {
                this[d].call()
            })
        }
    });
    e.fn.getNiceScroll = function(f) {
        return typeof f == "undefined" ? new m(this) : e.data(this[f], "__nicescroll") || false
    };
    e.extend(e.expr[":"], {
        nicescroll: function(f) {
            return e.data(f, "__nicescroll") ? true : false
        }
    });
    e.fn.niceScroll = function(f, d) {
        typeof d == "undefined" && typeof f == "object" && !("jquery" in f) && (d = f, f = false);
        var h = new m;
        typeof d == "undefined" && (d = {});
        if (f) d.doc = e(f), d.win = e(this);
        var b = !("doc" in d);
        if (!b && !("win" in d)) d.win = e(this);
        this.each(function() {
            var f = e(this).data("__nicescroll") || false;
            if (!f) d.doc = b ? e(this) : d.doc, f = new z(d, e(this)), e(this).data("__nicescroll", f);
            h.push(f)
        });
        return h.length == 1 ? h[0] : h
    };
    window.NiceScroll = {
        getjQuery: function() {
            return e
        }
    };
    if (!e.nicescroll) e.nicescroll = new m
})(jQuery);;
(function($, window) {
    $.fn.textWidth = function() {
        var html_calc = $("<span>" + $(this).html() + "</span>");
        html_calc.css("font-size", $(this).css("font-size")).hide();
        html_calc.prependTo("body");
        var width = html_calc.width();
        html_calc.remove();
        if (width == 0) {
            var total = 0;
            $(this).eq(0).children().each(function() {
                total += $(this).textWidth()
            });
            return total
        }
        return width
    };
    $.fn.textHeight = function() {
        var html_calc = $("<span>" + $(this).html() + "</span>");
        html_calc.css("font-size", $(this).css("font-size")).hide();
        html_calc.prependTo("body");
        var height = html_calc.height();
        html_calc.remove();
        return height
    };
    Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]"
    };
    String.prototype.getCodePointLength = function() {
        return this.length - this.split(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g).length + 1
    };
    String.fromCodePoint = function() {
        var chars = Array.prototype.slice.call(arguments);
        for (var i = chars.length; i-- > 0;) {
            var n = chars[i] - 65536;
            if (n >= 0) chars.splice(i, 1, 55296 + (n >> 10), 56320 + (n & 1023))
        }
        return String.fromCharCode.apply(null, chars)
    };
    $.fn.rate = function(options) {
        if (options === undefined || typeof options === "object") {
            return this.each(function() {
                if (!$.data(this, "rate")) {
                    $.data(this, "rate", new Rate(this, options))
                }
            })
        } else if (typeof options === "string") {
            var args = arguments;
            var returns;
            this.each(function() {
                var instance = $.data(this, "rate");
                if (instance instanceof Rate && typeof instance[options] === "function") {
                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1))
                }
                if (options === "destroy") {
                    $(instance.element).off();
                    $.data(this, "rate", null)
                }
            });
            return returns !== undefined ? returns : this
        }
    };

    function Rate(element, options) {
        this.element = element;
        this.settings = $.extend({}, $.fn.rate.settings, options);
        this.set_faces = {};
        this.build()
    }
    Rate.prototype.build = function() {
        this.layers = {};
        this.value = 0;
        this.raise_select_layer = false;
        if (this.settings.initial_value) {
            this.value = this.settings.initial_value
        }
        if ($(this.element).attr("data-rate-value")) {
            this.value = $(this.element).attr("data-rate-value")
        }
        var selected_width = this.value / this.settings.max_value * 100;
        if (typeof this.settings.symbols[this.settings.selected_symbol_type] === "string") {
            var symbol = this.settings.symbols[this.settings.selected_symbol_type];
            this.settings.symbols[this.settings.selected_symbol_type] = {};
            this.settings.symbols[this.settings.selected_symbol_type]["base"] = symbol;
            this.settings.symbols[this.settings.selected_symbol_type]["selected"] = symbol;
            this.settings.symbols[this.settings.selected_symbol_type]["hover"] = symbol
        }
        var base_layer = this.addLayer("base-layer", 100, this.settings.symbols[this.settings.selected_symbol_type]["base"], true);
        var select_layer = this.addLayer("select-layer", selected_width, this.settings.symbols[this.settings.selected_symbol_type]["selected"], true);
        var hover_layer = this.addLayer("hover-layer", 0, this.settings.symbols[this.settings.selected_symbol_type]["hover"], false);
        this.layers["base_layer"] = base_layer;
        this.layers["select_layer"] = select_layer;
        this.layers["hover_layer"] = hover_layer;
        $(this.element).on("mousemove", $.proxy(this.hover, this));
        $(this.element).on("click", $.proxy(this.select, this));
        $(this.element).on("mouseleave", $.proxy(this.mouseout, this));
        $(this.element).css({
            "-webkit-touch-callout": "none",
            "-webkit-user-select": "none",
            "-khtml-user-select": "none",
            "-moz-user-select": "none",
            "-ms-user-select": "none",
            "user-select": "none"
        });
        if (this.settings.hasOwnProperty("update_input_field_name")) {
            this.settings.update_input_field_name.val(this.value)
        }
    };
    Rate.prototype.addLayer = function(layer_name, visible_width, symbol, visible) {
        var layer_body = "<div>";
        for (var i = 0; i < this.settings.max_value; i++) {
            if (Array.isArray(symbol)) {
                if (this.settings.convert_to_utf8) {
                    symbol[i] = String.fromCodePoint(symbol[i])
                }
                layer_body += "<span>" + symbol[i] + "</span>"
            } else {
                if (this.settings.convert_to_utf8) {
                    symbol = String.fromCodePoint(symbol)
                }
                layer_body += "<span>" + symbol + "</span>"
            }
        }
        layer_body += "</div>";
        var layer = $(layer_body).addClass("rate-" + layer_name).appendTo(this.element);
        $(layer).css({
            width: visible_width + "%",
            height: $(layer).children().eq(0).textHeight(),
            overflow: "hidden",
            position: "absolute",
            top: 0,
            display: visible ? "block" : "none",
            "white-space": "nowrap"
        });
        $(this.element).css({
            width: $(layer).textWidth() + "px",
            height: $(layer).height(),
            position: "relative",
            cursor: this.settings.cursor
        });
        return layer
    };
    Rate.prototype.updateServer = function() {
        if (this.settings.url != undefined) {
            $.ajax({
                url: this.settings.url,
                type: this.settings.ajax_method,
                data: $.extend({}, {
                    value: this.getValue()
                }, this.settings.additional_data),
                success: $.proxy(function(data) {
                    $(this.element).trigger("updateSuccess", [data])
                }, this),
                error: $.proxy(function(jxhr, msg, err) {
                    $(this.element).trigger("updateError", [jxhr, msg, err])
                }, this)
            })
        }
    };
    Rate.prototype.getValue = function() {
        return this.value
    };
    Rate.prototype.hover = function(ev) {
        var pad = parseInt($(this.element).css("padding-left").replace("px", ""));
        var x = ev.pageX - $(this.element).offset().left - pad;
        var val = this.toValue(x, true);
        if (val != this.value) {
            this.raise_select_layer = false
        }
        if (!this.raise_select_layer && !this.settings.readonly) {
            var visible_width = this.toWidth(val);
            this.layers.select_layer.css({
                display: "none"
            });
            if (!this.settings.only_select_one_symbol) {
                this.layers.hover_layer.css({
                    width: visible_width + "%",
                    display: "block"
                })
            } else {
                var index_value = Math.floor(val);
                this.layers.hover_layer.css({
                    width: "100%",
                    display: "block"
                });
                this.layers.hover_layer.children("span").css({
                    visibility: "hidden"
                });
                this.layers.hover_layer.children("span").eq(index_value != 0 ? index_value - 1 : 0).css({
                    visibility: "visible"
                })
            }
        }
    };
    Rate.prototype.select = function(ev) {
        if (!this.settings.readonly) {
            var old_value = this.getValue();
            var pad = parseInt($(this.element).css("padding-left").replace("px", ""));
            var x = ev.pageX - $(this.element).offset().left - pad;
            var selected_width = this.toWidth(this.toValue(x, true));
            this.setValue(this.toValue(selected_width));
            this.raise_select_layer = true
        }
    };
    Rate.prototype.mouseout = function() {
        this.layers.hover_layer.css({
            display: "none"
        });
        this.layers.select_layer.css({
            display: "block"
        })
    };
    Rate.prototype.toWidth = function(val) {
        return val / this.settings.max_value * 100
    };
    Rate.prototype.toValue = function(width, in_pixels) {
        var val;
        if (in_pixels) {
            val = width / this.layers.base_layer.textWidth() * this.settings.max_value
        } else {
            val = width / 100 * this.settings.max_value
        }
        var temp = val / this.settings.step_size;
        if (temp - Math.floor(temp) < 5e-5) {
            val = Math.round(val / this.settings.step_size) * this.settings.step_size
        }
        val = Math.ceil(val / this.settings.step_size) * this.settings.step_size;
        val = val > this.settings.max_value ? this.settings.max_value : val;
        return val
    };
    Rate.prototype.getElement = function(layer_name, index) {
        return $(this.element).find(".rate-" + layer_name + " span").eq(index - 1)
    };
    Rate.prototype.getLayers = function() {
        return this.layers
    };
    Rate.prototype.setFace = function(value, face) {
        this.set_faces[value] = face
    };
    Rate.prototype.setAdditionalData = function(data) {
        this.settings.additional_data = data
    };
    Rate.prototype.getAdditionalData = function() {
        return this.settings.additional_data
    };
    Rate.prototype.removeFace = function(value) {
        delete this.set_faces[value]
    };
    Rate.prototype.setValue = function(value) {
        if (!this.settings.readonly) {
            if (value < 0) {
                value = 0
            } else if (value > this.settings.max_value) {
                value = this.settings.max_value
            }
            var old_value = this.getValue();
            this.value = value;
            var change_event = $(this.element).trigger("change", {
                from: old_value,
                to: this.value
            });
            $(this.element).find(".rate-face").remove();
            $(this.element).find("span").css({
                visibility: "visible"
            });
            var index_value = Math.ceil(this.value);
            if (this.set_faces.hasOwnProperty(index_value)) {
                var face = "<div>" + this.set_faces[index_value] + "</div>";
                var base_layer_element = this.getElement("base-layer", index_value);
                var select_layer_element = this.getElement("select-layer", index_value);
                var hover_layer_element = this.getElement("hover-layer", index_value);
                var left_pos = base_layer_element.textWidth() * (index_value - 1) + (base_layer_element.textWidth() - $(face).textWidth()) / 2;
                $(face).appendTo(this.element).css({
                    display: "inline-block",
                    position: "absolute",
                    left: left_pos
                }).addClass("rate-face");
                base_layer_element.css({
                    visibility: "hidden"
                });
                select_layer_element.css({
                    visibility: "hidden"
                });
                hover_layer_element.css({
                    visibility: "hidden"
                })
            }
            if (!this.settings.only_select_one_symbol) {
                var width = this.toWidth(this.value);
                this.layers.select_layer.css({
                    display: "block",
                    width: width + "%",
                    height: this.layers.base_layer.css("height")
                });
                this.layers.hover_layer.css({
                    display: "none",
                    height: this.layers.base_layer.css("height")
                })
            } else {
                var width = this.toWidth(this.settings.max_value);
                this.layers.select_layer.css({
                    display: "block",
                    width: width + "%",
                    height: this.layers.base_layer.css("height")
                });
                this.layers.hover_layer.css({
                    display: "none",
                    height: this.layers.base_layer.css("height")
                });
                this.layers.select_layer.children("span").css({
                    visibility: "hidden"
                });
                this.layers.select_layer.children("span").eq(index_value != 0 ? index_value - 1 : 0).css({
                    visibility: "visible"
                })
            }
            $(this.element).attr("data-rate-value", this.value);
            if (this.settings.change_once) {
                this.settings.readonly = true
            }
            this.updateServer();
            var change_event = $(this.element).trigger("afterChange", {
                from: old_value,
                to: this.value
            });
            if (this.settings.hasOwnProperty("update_input_field_name")) {
                this.settings.update_input_field_name.val(this.value)
            }
        }
    };
    Rate.prototype.increment = function() {
        this.setValue(this.getValue() + this.settings.step_size)
    };
    Rate.prototype.decrement = function() {
        this.setValue(this.getValue() - this.settings.step_size)
    };
    $.fn.rate.settings = {
        max_value: 5,
        step_size: .5,
        initial_value: 0,
        symbols: {
            utf8_star: {
                base: "☆",
                hover: "★",
                selected: "★"
            },
            utf8_hexagon: {
                base: "⬡",
                hover: "⬢",
                selected: "⬢"
            },
            hearts: "&hearts;",
            fontawesome_beer: '<i class="fa fa-beer"></i>',
            fontawesome_star: {
                base: '<i class="fa fa-star-o"></i>',
                hover: '<i class="fa fa-star"></i>',
                selected: '<i class="fa fa-star"></i>'
            },
            utf8_emoticons: {
                base: [128549, 128531, 128530, 128516],
                hover: [128549, 128531, 128530, 128516],
                selected: [128549, 128531, 128530, 128516]
            }
        },
        selected_symbol_type: "utf8_star",
        convert_to_utf8: false,
        cursor: "default",
        readonly: false,
        change_once: false,
        only_select_one_symbol: false,
        ajax_method: "POST",
        additional_data: {}
    }
})(jQuery, window);