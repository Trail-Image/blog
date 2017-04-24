// Handlebars templates

export default {
   layout: {
      MAIN: 'layouts/default-layout',
      NONE: null
   },
   /**
    * Page template contstants.
    */
   page: {
      NOT_FOUND: 'error/404',
      INTERNAL_ERROR: 'error/500',
      ERROR: '503',
      ABOUT: 'about',
      ADMINISTRATION: 'admin',
      AUTHORIZE: 'authorize',
      EXIF: 'exif',
      CATEGORY_MENU: 'category-menu',
      POST_MENU_DATA: 'post-menu-data',
      MOBILE_MENU_DATA: 'mobile-menu-data',
      POST: 'post',
      CATEGORY: 'category',
      CATEGORY_LIST: 'category-list',
      PHOTO_TAG: 'photo-tag',
      PHOTO_SEARCH: 'photo-search',
      MAP: 'map',
      MAPBOX: 'mapbox',
      SEARCH: 'search',
      SITEMAP: 'sitemap-xml'
   },
   /**
    * Assign methods that will be available from within Handlebars templates.
    */
   assignHelpers: function(hbs:ExpressHbs) {
      const util = require('./util');
      const config = require('./config');
      const helpers:{[key:string}:function} = {
         formatCaption: util.html.story,
         formatTitle: util.html.typography,
         lowerCase: (text:string) => text.toLocaleLowerCase(),
         add: (a:number, b:number) => (a * 1) + b,
         date: util.date.toString,
         subtract: (a:number, b:number) => (a * 1) - b,
         plural: (count:number) => (count > 1) ? 's' : '',
         makeTagList: util.html.photoTagList,
         formatLogTime: util.date.toLogTime,
         formatISO8601: (d:Date) => d.toISOString(),
         formatFraction: util.html.fraction,
         mapHeight: (width:number, height:number) => height > width ? config.style.map.maxInlineHeight : height,
         icon: util.icon.tag,
         iconForCategory: util.icon.category,
         modeIconForPost: util.icon.mode,
         rot13: util.encode.rot13,
         encode: encodeURIComponent
      };
      for (const name in helpers) { hbs.registerHelper(name, helpers[name]); }
   }
};