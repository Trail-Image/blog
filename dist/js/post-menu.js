"use strict";$(function(){function t(t,n){var o=p.find(".material-icons.expand_less"),a=p.find(".material-icons.expand_more");t&&t.stopPropagation(),void 0===n&&(n=p.hasClass(l)),n?function(){p.removeClass(l),u.hide(),o.hide(),a.show()}():function(){p.addClass(l),u.show(),o.show(),a.hide()}()}function n(){var n=$(this).data("slug");"undefined"!=typeof loadPostTrack?loadPostTrack(n):window.location.href="/"+n,t(),util.log.event(i,"Click Post")}function o(t,n,o,a){t.find("li").removeClass(l),o(a),n.addClass(l),s(a)}function a(t){var n=postMenuData.category[t[0]];c.empty(),null==t[1]&&(t[1]=n[0].title);for(var o=0;o<n.length;o++){var a=$("<li>").text(n[o].title);c.append(a),n[o].title==t[1]&&(a.addClass(l),e(t))}}function e(t){var n=postMenuData.category[t[0]];d.empty();for(var o=0;o<n.length;o++)if(n[o].title==t[1])for(var a=n[o].posts,e=0;e<a.length;e++){var s=postMenuData.post[a[e]],i=s.title;if(s.part&&e<a.length-1&&i==postMenuData.post[a[e+1]].title){for(var l=$("<ol>");e<a.length&&postMenuData.post[a[e]].title==i;)s=postMenuData.post[a[e]],l.prepend($("<li>").addClass("post").attr("value",s.part).html(s.subTitle).data("description",s.description).data("slug",s.slug)),e++;e--,s=postMenuData.post[a[e]],d.append($("<li>").addClass("series").html('<span class="mode-icon '+s.icon+'"></span>'+s.title).append(l))}else s.part&&(i+=": "+s.subTitle),d.append($("<li>").addClass("post").html('<span class="mode-icon '+s.icon+'"></span>'+i).data("description",s.description).data("slug",s.slug))}}function s(t){"string"==typeof t&&(t=[t,null]),util.setting.save("menu",t.join())}var i="Post Menu",l="selected",p=$("#post-menu-button"),u=$("#post-menu"),r=$("#menu-roots"),c=$("#menu-categories"),d=$("#menu-posts"),f=$("#post-description"),m=function(t){var n=util.setting.load("menu");return null===n?t:n[1].split(",")}(["When",null]);p.one("click",function(){for(var t in postMenuData.category){var n=$("<li>").text(t);r.append(n),t==m[0]&&(n.addClass(l),a(m))}util.log.event(i,"Open")}).click(t),r.on("click","li",function(t){t.stopPropagation();var n=$(this);m=[n.text(),null],o(r,n,a,m)}),c.on("click","li",function(t){t.stopPropagation();var n=$(this);m[1]=n.text(),o(c,n,e,m)}),d.on("click","li.post",n).on("mouseover","li.post",function(){f.html($(this).data("description"))}).on("mouseout",function(){f.empty()}),$("html").click(function(n){t(n,!0)})});
//# sourceMappingURL=/js/maps/post-menu.js.map
