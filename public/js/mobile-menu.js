"use strict";$(function(){function i(){$(this).height()>o?l.show():l.hide()}var n=$("#mobile-menu-button"),e=$("#mobile-menu"),t=e.find(".categories"),l=e.find(".material-icons.arrow_downward"),o=0,s=util.setting.menuCategory,c=null==s?"when":s[0].toLocaleLowerCase(),u=!1,a=!1;c.length<4&&(c="when"),n.click(function(){a?e.hide(0,function(){a=!1}):e.show(0,function(){if(a=!0,!u){var n="selected",s=e.find(".category-list li");o=e.height(),e.find(".close").click(function(){e.hide(0,function(){a=!1})}),t.find("ul."+c).show(0,i),s.filter("li."+c).addClass(n),s.click(function(){var e=$(this),o=e.attr("class");l.hide(),t.find("ul").hide(),t.find("ul."+o).show(0,i),s.removeClass(n),e.addClass(n),util.setting.menuCategory=[o,null]}),u=!0}})})});
//# sourceMappingURL=/js/maps/mobile-menu.js.map