"use strict";$(function(){function prepare(){visible=!0,prepared||($tags=$menu.find(".tags"),$tagList=$menu.find(".tag-list li"),$menu.find(".close").click(function(){$menu.hide(0,function(){visible=!1})}),console.log($tagList.find("li."+selection)),$tags.find("ul."+selection).show(),$tagList.filter("li."+selection).addClass(css),$tagList.click(function(){var $tag=$(this),tagClass=$tag.attr("class");$tags.find("ul").hide(),$tags.find("ul."+tagClass).show(),$tagList.removeClass(css),$tag.addClass(css),saveMenuSelection(tagClass)}),prepared=!0)}function loadMenuSelection(ifNone){var re=new RegExp("\\bmobile=([^;\\b]+)","gi"),match=re.exec(document.cookie);return null===match?ifNone:match[1]}function saveMenuSelection(selected){document.cookie="mobile="+selected}var css="selected",$button=$("#mobile-menu-button"),$menu=$("#mobile-menu"),$tags=null,$tagList=null,prepared=!1,visible=!1,selection=loadMenuSelection("when");$button.click(function(){visible?$menu.hide(0,function(){visible=!1}):$menu.show(0,prepare)})});