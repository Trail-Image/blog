import { alphabet, is, sayNumber } from '@toba/tools';
import { blog } from '@trailimage/models';
import { log } from '@toba/logger';
import { Request, Response } from 'express';
import { config } from '../config';
import { RouteParam } from '../routes';
import { Layout, Page, view } from '../views/';

/**
 * Render HTML table of EXIF values for given photo.
 */
function exif(req: Request, res: Response) {
   const photoID = req.params[RouteParam.PhotoID];
   blog
      .getEXIF(photoID)
      .then(exif => {
         res.render(Page.EXIF, {
            EXIF: exif,
            layout: Layout.None
         });
      })
      .catch(err => {
         log.error(err, { photoID });
         view.notFound(req, res);
      });
}

/**
 * Photos with tag rendered in response to click on label in photo tags page.
 */
function withTag(req: Request, res: Response) {
   const slug = normalizeTag(
      decodeURIComponent(req.params[RouteParam.PhotoTag])
   );

   blog
      .getPhotosWithTags(slug)
      .then(photos => {
         if (photos === null || photos.length == 0) {
            view.notFound(req, res);
         } else {
            const tag = blog.tags.get(slug);
            const title = `${sayNumber(
               photos.length
            )} &ldquo;${tag}&rdquo; Image${photos.length != 1 ? 's' : ''}`;

            res.render(Page.PhotoSearch, {
               photos,
               config,
               title,
               layout: Layout.None
            });
         }
      })
      .catch(err => {
         view.notFound(req, res);
         log.error(err, { photoTag: slug });
      });
}

function tags(req: Request, res: Response) {
   let selected = normalizeTag(
      decodeURIComponent(req.params[RouteParam.PhotoTag])
   );
   const list = blog.tags;
   const keys = Object.keys(list);
   const tags: { [key: string]: { [key: string]: string } } = {};

   if (is.empty(selected)) {
      // select a random tag
      selected = keys[Math.floor(Math.random() * keys.length + 1)];
   }

   // group tags by first letter (character)
   for (const c of alphabet) {
      tags[c] = {};
   }
   for (const key in list) {
      const c = key.substr(0, 1).toLowerCase();
      if (alphabet.indexOf(c) >= 0) {
         tags[c][key] = list.get(key);
      }
   }

   res.render(Page.PhotoTag, {
      tags,
      selected,
      alphabet,
      title: keys.length + ' Photo Tags',
      config
   });
}

function normalizeTag(slug: string): string {
   if (is.value(slug)) {
      slug = slug.toLowerCase();
   }
   return config.photoTagChanges[slug] ? config.photoTagChanges[slug] : slug;
}

export const photo = { withTag, tags, exif };
