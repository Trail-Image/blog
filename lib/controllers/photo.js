const is = require('../is');
const config = require('../config');
const util = require('../util');
const template = require('../template');
const library = require('../library');
const C = require('../constants');
/** Route placeholders */
const ph = C.route;

/**
 * Small HTML table of EXIF values for given photo
 */
function exif(req, res) {
   library.getEXIF(req.params[ph.PHOTO_ID])
      .then(exif => {
         res.render(template.page.EXIF, { EXIF: exif, layout: template.layout.NONE });
      })
      .catch(res.notFound);
}

/**
 * Photos with tag
 */
function withTag(req, res) {
   const slug = normalizeTag(decodeURIComponent(req.params[ph.PHOTO_TAG]));

   library.getPhotosWithTags(slug)
      .then(photos => {
         if (photos === null || photos.length == 0) {
            res.notFound();
         } else {
            const tag = library.tags[slug];
            const title = util.number.say(photos.length) + ' &ldquo;' + tag + '&rdquo; Image' + ((photos.length != 1) ? 's' : '');

            res.render(template.page.PHOTO_SEARCH, {
               photos,
               config,
               title,
               layout: template.layout.NONE
            });
         }
      })
      .catch(res.notFound);
}

function tags(req, res) {
   let selected = normalizeTag(decodeURIComponent(req.params[ph.PHOTO_TAG]));
   const list = library.tags;
   const keys = Object.keys(list);
   const tags = {};

   if (is.empty(selected)) {
      // select a random tag
      selected = keys[Math.floor((Math.random() * keys.length) + 1)];
   }

   // group tags by first letter (character)
   for (const c of C.alphabet) { tags[c] = {}; }
   for (const key in list) {
      const c = key.substr(0, 1).toLowerCase();
      if (C.alphabet.indexOf(c) >= 0)  { tags[c][key] = list[key]; }
   }

   res.render(template.page.PHOTO_TAG, {
      tags,
      selected,
      alphabet: C.alphabet,
      title: keys.length + ' Photo Tags',
      config
   });
}

/**
 * @param {String} slug
 * @returns {String}
 */
function normalizeTag(slug) {
   if (is.value(slug)) { slug = slug.toLowerCase(); }
   return (is.defined(config.photoTagChanges, slug)) ? config.photoTagChanges[slug] : slug;
}

module.exports = { withTag, tags, exif };