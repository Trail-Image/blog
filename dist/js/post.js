!function(t,e,i,n){var o=t(e);t.fn.lazyload=function(r){function a(){var e=0;l.each(function(){var i=t(this);if(!d.skip_invisible||i.is(":visible"))if(t.abovethetop(this,d)||t.leftofbegin(this,d));else if(t.belowthefold(this,d)||t.rightoffold(this,d)){if(++e>d.failure_limit)return!1}else i.trigger("appear"),e=0})}var f,l=this,d={threshold:0,failure_limit:0,event:"scroll",effect:"show",container:e,data_attribute:"original",skip_invisible:!1,appear:null,load:null,placeholder:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"};return r&&(n!==r.failurelimit&&(r.failure_limit=r.failurelimit,delete r.failurelimit),n!==r.effectspeed&&(r.effect_speed=r.effectspeed,delete r.effectspeed),t.extend(d,r)),f=d.container===n||d.container===e?o:t(d.container),0===d.event.indexOf("scroll")&&f.bind(d.event,function(){return a()}),this.each(function(){var e=this,i=t(e);e.loaded=!1,(i.attr("src")===n||i.attr("src")===!1)&&i.is("img")&&i.attr("src",d.placeholder),i.one("appear",function(){if(!this.loaded){if(d.appear){var n=l.length;d.appear.call(e,n,d)}t("<img />").bind("load",function(){var n=i.attr("data-"+d.data_attribute);i.hide(),i.is("img")?i.attr("src",n):i.css("background-image","url('"+n+"')"),i[d.effect](d.effect_speed),e.loaded=!0;var o=t.grep(l,function(t){return!t.loaded});if(l=t(o),d.load){var r=l.length;d.load.call(e,r,d)}}).attr("src",i.attr("data-"+d.data_attribute))}}),0!==d.event.indexOf("scroll")&&i.bind(d.event,function(){e.loaded||i.trigger("appear")})}),o.bind("resize",function(){a()}),/(?:iphone|ipod|ipad).*os 5/gi.test(navigator.appVersion)&&o.bind("pageshow",function(e){e.originalEvent&&e.originalEvent.persisted&&l.each(function(){t(this).trigger("appear")})}),t(i).ready(function(){a()}),this},t.belowthefold=function(i,r){var a;return a=r.container===n||r.container===e?(e.innerHeight?e.innerHeight:o.height())+o.scrollTop():t(r.container).offset().top+t(r.container).height(),a<=t(i).offset().top-r.threshold},t.rightoffold=function(i,r){var a;return a=r.container===n||r.container===e?o.width()+o.scrollLeft():t(r.container).offset().left+t(r.container).width(),a<=t(i).offset().left-r.threshold},t.abovethetop=function(i,r){var a;return a=r.container===n||r.container===e?o.scrollTop():t(r.container).offset().top,a>=t(i).offset().top+r.threshold+t(i).height()},t.leftofbegin=function(i,r){var a;return a=r.container===n||r.container===e?o.scrollLeft():t(r.container).offset().left,a>=t(i).offset().left+r.threshold+t(i).width()},t.inviewport=function(e,i){return!(t.rightoffold(e,i)||t.leftofbegin(e,i)||t.belowthefold(e,i)||t.abovethetop(e,i))},t.extend(t.expr[":"],{"below-the-fold":function(e){return t.belowthefold(e,{threshold:0})},"above-the-top":function(e){return!t.belowthefold(e,{threshold:0})},"right-of-screen":function(e){return t.rightoffold(e,{threshold:0})},"left-of-screen":function(e){return!t.rightoffold(e,{threshold:0})},"in-viewport":function(e){return t.inviewport(e,{threshold:0})},"above-the-fold":function(e){return!t.belowthefold(e,{threshold:0})},"right-of-fold":function(e){return t.rightoffold(e,{threshold:0})},"left-of-fold":function(e){return!t.rightoffold(e,{threshold:0})}})}(jQuery,window,document),$(function(){function t(t){var n=$(this),r=l.find("img"),a=n.data("big-loaded"),f=parseInt(n.data("big-width")),d=parseInt(n.data("big-height")),c=function(t){r.css({top:e(d,t),left:i(f,t)})};void 0===a&&(a=!1),a?r.attr("src",n.data("big")):(r.attr("src",n.data("original")),$("<img />").bind("load",function(){r.attr("src",this.src),n.data("big-loaded",!0)}).attr("src",n.data("big"))),r.height(d).width(f),c(t),l.show(0,o).on("mousemove",c)}function e(t,e){return n(e.clientY,window.innerHeight,t)}function i(t,e){return n(e.clientX,window.innerWidth,t)}function n(t,e,i){var n=e/2-t,o=(e-i)/2,r=o+n,a=30,f=e-i-a;return r>a?r=a:f>r&&(r=f),r.toFixed(0)+"px"}function o(){$("html").css("overflow","hidden")}function r(){$("html").css("overflow","auto")}function a(t){var e=$(this),i=e.parent();i.data("exif");$exif.parent().append($("<div>").addClass("exif").html('<span class="glyphicon glyphicon-download"></span><p>Loading …</p>').load($exif.data("url")))}var f=$("figure"),l=$("#light-box");l.on("click",function(){l.off("mousemove").hide(0,r)}),f.find("img").on("click",t).lazyload(),f.find(".mobile-button").on("click",function(){a.call(this)}),f.find(".exif-button").on("mouseover",function(){a.call(this,!0);var t=$(this);t.parent().append($("<div>").addClass("exif").html('<span class="glyphicon glyphicon-download"></span><p>Loading …</p>').load(t.data("url")))})});