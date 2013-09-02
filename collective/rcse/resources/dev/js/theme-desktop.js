/* ========================================================================
 * RCSE THEME
 * ========================================================================
 * Copyright 2013 Makina-Corpus
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

var rcseUpdatePortlets = function(element) {
    if (element == undefined) {
        element = document;
    }
    $(element).find('dl.portlet').each(
            function() {
                var newPortlet = document.createElement("div");
                var newTitle = document.createElement("nav");
                var newList = document.createElement("div");
                var titleWrapper = document.createElement("div")
                var title = $(this).find("dt").remove(".portletTopLeft")
                        .remove(".portletTopRight").text();

                $(newPortlet).addClass($(this).attr("class"));
                $(titleWrapper).addClass("navbar-brand");
                $(newTitle).attr("role", "navigation").addClass(
                        "navbar navbar-inverse")
                        .addClass($(this).attr("class"));
                $(titleWrapper).html(title);
                $(newTitle).append(titleWrapper);
                $(newList).addClass("list-group");
                $(newPortlet).append(newTitle);
                if ($(this).hasClass('portletNavigationTree')) {
                    console.log('navtree');
                    $(this).find('a').addClass('list-group-item');
                    $(this).find('div > a').unwrap();
                    $(this).find('li > a').unwrap();
                    $(this).find('ul > a').unwrap();
                    $(this).find('a > img').remove();
                    $(newList).append($(this).html());
                } else {
                    $(this).find("dd").each(function() {
                        $(this).find('a').addClass('list-group-item');
                        $(newList).append($(this).html());
                    });
                }
                newPortlet.appendChild(newList);
                $(this).replaceWith(newPortlet);
            });
}
/**
<dl class="portalMessage error">
  <dt>Erreur</dt>
  <dd>Il y a des erreurs.</dd>
</dl>
 */
var rcseUpdatePortalMessage = function(element){
    $(document).find('.portalMessage:visible').each(function(){
        var wrapper = $(this);
        var title = wrapper.find('dt').html(); // -> str
        var message = wrapper.find('dd').html();
        var cssclasses = wrapper.attr('class');
        var level = "info";
        if (cssclasses.indexOf("error") != -1){
            level = "error";
        }
        var newWrapper = document.createElement("div");
        $(newWrapper).addClass("alert");
        if (level == "info"){
            $(newWrapper).addClass("alert-info");
        }else if (level == "error"){
            $(newWrapper).addClass("alert-danger");
        }
        var newTitle = document.createElement('h4');
        $(newTitle).html(title);
        var newMessage = document.createElement('span');
        $(newMessage).html(message);
        newWrapper.appendChild(newTitle);
        newWrapper.appendChild(newMessage);
        wrapper.replaceWith(newWrapper);
    })
}

/**
 * 
<div class="formControls">
  <input id="form-buttons-save" name="form.buttons.save" class="submit-widget button-field context" value="Sauvegarder" type="submit">
  <input id="form-buttons-cancel" name="form.buttons.cancel" class="submit-widget button-field standalone" value="Annuler" formnovalidate="" type="submit">
</div>

->
<div class="">
  <input id="form-buttons-save" name="form.buttons.save" class="submit-widget button-field context" value="Sauvegarder" type="submit">
  <input id="form-buttons-cancel" name="form.buttons.cancel" class="submit-widget button-field standalone" value="Annuler" formnovalidate="" type="submit">
</div>

 *
 */
var rcseUpdateForms = function(element){
    //focus
    $(element).find('input').focus();
    $(element).find('textarea').focus();
    $(element).find("#form-widgets-IDublinCore-title").focus();

    //transform form fields for bootstrap
    $(element).find('.field').each(function(){
        var field = $(this);
        field.addClass('form-group');
        field.find('input,textarea').each(function(){
            var input = $(this);
            if (input.attr('type')=="checkbox"){
                return true; // continue
            }
            input.addClass('form-control');
        });
    });
    //transform form actions for bootstrap
    $(element).find('.formControls').each(function(){
        var formwrapper = $(this);
        var formactions = formwrapper.find('input[type="submit"]');
        if (!formwrapper.hasClass("btn-group")){
            formwrapper.addClass("btn-group");
            formactions.each(function(){
                var input = $(this);
                input.addClass('btn');
                if (input.hasClass('context')){
                    input.addClass('btn-primary');
                }
                else if (input.hasClass('destructive')){
                    input.addClass('btn-danger');
                }
                else{
                    input.addClass('btn-default');
                }
            });
        }
    });
    $(element).find(".commentActions").each(function(){
        $(".destructive").addClass("btn btn-danger");
    })
    //transform checkbox for bootstrap
    $(element).find('input[type="checkbox"]').each(function(){
        var input = $(this);
        console.log(input.parents(".field"));
        var label = input.siblings("label");
        var labelText = label.find('.label').text();
        if (label.length != 0){
            label.text(labelText);
            input.prependTo(label);
        }
        label.unwrap();
        label.wrap('<div class="checkbox"/>');
    });
    //transform help message for bootstrap
    $(element).find(".formHelp").each(function(){
        $(this).addClass('help-block');
    });
}
var rcseInitTimeline = function() {
    $("a.rcse_tile").each(function() {
        var item = $(this);
        var parent = item.parent();
        $.ajax({
            url : item.attr('href') + '/@@group_tile_view'
        }).success(function(data) {
            item.replaceWith(data);
            rcseApplyTransform(parent);
        });
    });
}

var rcseUpdateComments = function(element) {
    if (element == undefined) {
        element = document;
    }
    $(element).find('.commenting form').attr("action", portal_url);
    // make the delete an ajax action to not render the page
    var form = $(element).find("input[name='form.button.DeleteComment']")
            .parents('form');
    if (form.length != 0) {
        var ajaxDeleteComment = document.createElement("input");
        ajaxDeleteComment.type = "hidden";
        ajaxDeleteComment.name = "ajax_load";
        ajaxDeleteComment.value = "1";
        form.append(ajaxDeleteComment);
    }
}

var rcseInitAjaxAction = function() {
    $(document).on(
            "click",
            ".document-actions-wrapper a.action",
            function(eventObject) {
                eventObject.stopImmediatePropagation();
                eventObject.preventDefault();
                var link = $(this);
                var container = $(eventObject.target).parents(".document-actions-wrapper");
                var parent = container.parent();
                $.ajax({
                    url : $(this).attr('href'),
                    context : eventObject,
                    data : {
                        'ajax_load' : true
                    }
                }).success(
                        function(data) {
                            var element = data['document-actions-wrapper'];
                            container.replaceWith(element);
                            rcseApplyTransform(parent);
                        });
            })
    $(document).on("submit", '.commenting form', function(e) {
        e.preventDefault();
    });
    $(document)
            .on(
                    "click",
                    '.commenting input[type="submit"]',
                    function(eventObject) {
                        eventObject.stopImmediatePropagation();
                        eventObject.preventDefault();
                        console.log("ajax: comment submit");
                        var form = $(eventObject.target).parents("form");
                        var data = {
                            ajax : true,
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
                                        parent
                                                .replaceWith(response['document-actions-wrapper']);
                                        parent.find("textarea").val("");
                                    }
                                });
                    })

}

var rcseInitNotifications = function() {
    var rcseReloadNotifications = function(eventObject) {
        $.ajax({
            url : portal_url + '/@@notifications_ajax',
            context : eventObject
        }).success(function(data) {
            var see_all = $("#notifications ul").children("li").last().find('a');
            var see_all_href = see_all.attr('href');
            var see_all_text = see_all.text();

            $("#notifications-count").text('('+data['unseenCount']+')');

            $("#notifications ul").remove();
            $("#notifications")
                .append('<ul class="dropdown-menu"></ul>');

            for (var i = 0; i < data['notifications'].length; i++) {
                var notification = data['notifications'][i];
                $("#notifications ul").append(
                    '<li><a></a></li>');
                var a = $("#notifications ul li:last")
                    .children('a');

                a.attr('href', notification.url);
                if (notification.seen == 0)
                    a.attr('class', 'notification-not-seen');
                a.text(notification.title);
            }

            var see_all = '<li><a href="' + see_all_href + '">'
                + see_all_text + '</a></li>';
            $("#notifications ul").append(see_all);
            $("#notifications").trigger("create");
        });
    }

    $("#notifications > a").click(function() {
        rcseReloadNotifications();
    });
}

var rcseInitVideo = function(){
    $(document).on('mouseenter', 'div.download',
	function(){
            $(this).find('.dl-links').show();
	});

    $(document).on('mouseleave', 'div.videobar',
	function(){
            $(this).find('.dl-links').fadeOut(500);
	});

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
//    $(element).find("a.oembed,.oembed a").oembed(null, jqueryOmebedSettings);
    $(element).find("select").select2();
    $(element).find(".readmore").readmore();
    rcseUpdatePortlets(element);
    $(element).find('video,audio').mediaelementplayer();
    $(element).find('a.oembed, .oembed a').oembed(null, jqueryOmebedSettings);
    rcseUpdateForms(element);
    picturefill();
    rcseUpdatePortalMessage(element);
    return element;
}

$(document).on("ready", function() {
    rcseInitAjaxAction();
    rcseApplyTransform();
    rcseInitTimeline();
    rcseInitVideo();
    rcseInitNotifications();
});
$.webshims.setOptions("basePath", portal_url + "/++resource++webshims/");
$.webshims.setOptions('forms', {
    customDatalist: true
});
$.webshims.setOptions('forms-ext', {
    replaceUI: false,
    types: 'datetime-local month date time number'
});
$.webshims.polyfill();