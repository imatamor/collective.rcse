/*
 * theme-mobile.js
 */
var rcseInitTimeline = function() {
    $("a.rcse_tile").each(function() {
        var item = $(this);
        var parent = item.parent();
        $.ajax({
            url : $(this).attr('href') + '/@@group_tile_view'
        }).success(function(data) {
            var element = rcseApplyTransform(data);
            item.replaceWith(element);
            parent.trigger("create");
        });
    });
}
var rcseInitOpenAuthorInDialog = function() {
    $(document).on("click", 'a[rel="author"]', function(eventObject) {
        eventObject.stopImmediatePropagation();
        eventObject.preventDefault();
        var portal_path = portal_url.slice(window.location.origin.length + 1);
        $.mobile.changePage(portal_path + "/@@user_dialog_view", {
            role : "dialog",
            data : {
                memberid : $(this).attr("href").split("/").pop()
            }
        });
    });
}

var rcseInitAjaxAction = function() {
    $(document)
            .on(
                    "click",
                    "a.action",
                    function(eventObject) {
                        eventObject.stopImmediatePropagation();
                        eventObject.preventDefault();
                        $
                                .ajax({
                                    url : $(this).attr('href'),
                                    context : eventObject,
                                    data : {
                                        'ajax_load' : true
                                    }
                                })
                                .success(
                                        function(data) {
                                            var parent = $(eventObject.target)
                                                    .parents(
                                                            ".document-actions-wrapper");
                                            var element = rcseApplyTransform(data['document-actions-wrapper']);
                                            parent.replaceWith(element);
                                            $(document).trigger("create");
                                        });
                    });
    $(document).on("submit", ".commenting form", function(e) {
        e.preventDefault();
    });
    $(document)
            .on(
                    "click",
                    '.commenting input[type="submit"]',
                    function(eventObject) {
                        var form = $(eventObject.target).parents("form");
                        var data = {
                            ajax_load : true,
                            uid : $(eventObject.target).parents(".rcsetile")
                                    .attr("id")
                        }
                        data[$(eventObject.target).attr("name")] = 1;
                        form
                                .ajaxSubmit({
                                    context : form,
                                    data : data,
                                    url : portal_url + "/@@plone.comments.ajax",
                                    success : function(response, status, xhr,
                                            jqform) {
                                        var parent = jqform
                                                .parents(".document-actions-wrapper");
                                        var element = rcseApplyTransform(response['document-actions-wrapper']);
                                        $(element).find("textarea").val("");
                                        parent.replaceWith(element);
                                        $(document).trigger("create");
                                    }
                                });
                    });

}

var rcseInitBindChangeEventStartDate = function() {
    $(document).on("blur", "#form-widgets-IEventBasic-start", function(e) {
                        var endItem = $("#form-widgets-IEventBasic-end");
                        if (endItem.attr('value') === "") {
                            endItem.attr('value', $(this).attr('value'));
                        } else if (new Date(
                                document
                                        .getElementById("form-widgets-IEventBasic-start").value) > new Date(
                                document
                                        .getElementById("form-widgets-IEventBasic-end").value)) {
                            endItem.attr('value', $(this).attr('value'));
                        }
                    });
    $(document).on("blur", "#form-widgets-IEventBasic-end", function(e) {
                        var startItem = $("#form-widgets-IEventBasic-start");
                        if (startItem.attr('value') === "") {
                            startItem.attr('value', $(this).attr('value'));
                        } else if (new Date(
                                document
                                        .getElementById("form-widgets-IEventBasic-start").value) > new Date(
                                document
                                        .getElementById("form-widgets-IEventBasic-end").value)) {
                            startItem.attr('value', $(this).attr('value'));
                        }
                    });
}



var rcseUpdateDisableAjax = function(element) {
    if (element == undefined) {
        element = document;
    }
    $(element).find("#popup-globalsections a").attr("data-ajax", "false");
    $(element).find('form[method="post"]').attr("data-ajax", "false");
    $(element).find('#portal-siteactions a').attr("data-ajax", "false");
    $(element).find('#popup-personalbar a').attr("data-ajax", "false");
    $(element).find(".document-actions-wrapper a.action").attr("data-ajax",
            "false");
    $(element).find('.commenting form').attr("action", portal_url);
}


var rcseUpdateComments = function(element) {
    var form = $(element).find("input[name='form.button.DeleteComment']")
            .parents('form');
    if (form.length != 0) {
        // make the delete an ajax action to not render the page
        var ajaxDeleteComment = document.createElement("input");
        ajaxDeleteComment.type = "hidden";
        ajaxDeleteComment.name = "ajax_load";
        ajaxDeleteComment.value = "1";
        form.append(ajaxDeleteComment);
    }
}


var rcseInitNotifications = function() {
    var rcseReloadNotifications = function(eventObject) {
        $.ajax({
            url : portal_url + '/@@notifications_ajax',
            context : eventObject
        }).success(function(data) {
            var see_all = $("#popup-notifications ul")
                .children("li").last().find('a');
            var see_all_href = see_all.attr('href');
            var see_all_text = see_all.text();

            $("#notifications .ui-btn-text").text(
                data['unseenCount']);

            $("#popup-notifications ul").remove();
            $("#popup-notifications")
                .append(
                    '<ul data-role="listview" data-inset="true" data-icon="false"></ul>');

            for ( var i = 0; i < data['notifications'].length; i++) {
                var notification = data['notifications'][i];
                $("#popup-notifications ul").append(
                    '<li><a></a></li>');
                var a = $("#popup-notifications ul li:last")
                    .children('a');

                a.attr('href', notification.url);
                if (notification.seen == 0)
                    a.attr('class', 'notification-not-seen');
                a.text(notification.title);
            }

            var see_all = '<li><a href="' + see_all_href + '">'
                + see_all_text + '</a></li>';
            $("#popup-notifications ul").append(see_all);
            $("#popup-notifications").trigger("create");
        });
    }

    $("#notifications").click(function() {
        rcseReloadNotifications();
    });
}

var rcseInitVideo = function(){
    function changeSrc(player, src){
	var currentTime = player.getCurrentTime();
	player.setSrc(src);

	setTimeout(function(){
	    if (currentTime > 0){
		player.setCurrentTime(currentTime);
		player.play();
	    }
	}, 100);
    }

    $(document).on('click', '.player-low', function (event) {
	var videoElement = $(this).parents('.videobar')
	    .siblings('.mejs-container').find('video');
	var player = new MediaElementPlayer(videoElement);
	createCookie('videores', 'low');
	$(this).parents('.hi-lo').find('.player-high').show();
	$(this).parents('.hi-lo').find('.player-low').hide();
	var newSrc = videoElement.attr('src').replace('high/', 'low/');
	changeSrc(player, newSrc);
	event.preventDefault();
    });

    $(document).on('click', '.player-high', function (event) {
	var videoElement = $(this).parents('.videobar')
	    .siblings('.mejs-container').find('video');
	var player = new MediaElementPlayer(videoElement);
	createCookie('videores', 'high');
	$(this).parents('.hi-lo').find('.player-high').hide();
	$(this).parents('.hi-lo').find('.player-low').show();
	var newSrc = videoElement.attr('src').replace('low/', 'high/');
	changeSrc(player, newSrc);
	event.preventDefault();
    });
}

var rcseApplyTransform = function(element) {
    if (element == undefined) {
        element = document;
    }
    rcseUpdateDisableAjax(element);
    rcseUpdateComments(element);
    $(element).find("a.oembed,.oembed a").oembed(null, jqueryOmebedSettings);
    picturefill();
    $(element).find(".readmore").readmore();
    $(element).find('video,audio').mediaelementplayer();
    return element;
}

$(document).on("pagebeforeshow", function() {
    rcseApplyTransform();
});

$(document).on("pageshow", function() {
    rcseInitAjaxAction();
    rcseInitBindChangeEventStartDate();
    rcseInitOpenAuthorInDialog();
    rcseInitTimeline();
    rcseInitVideo();
    rcseInitNotifications();
});