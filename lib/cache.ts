import is from './is';
import C from './constants';
import config from './config';
import redis from './providers/redis';
// http://nodejs.org/api/zlib.html
import * as compress from 'zlib';

// Redis uses colon prefix as a kind of namespace
const prefix = 'api:';
const viewKey = 'view';
const mapKey = 'map';
/**
 * @type {object.<ViewCacheItem>}
 */
const memory = {};

/**
 * Whether key with prefix exists
 * @returns {Promise.<boolean>}
 */
const exists = (key:string, hashKey:string, enabled:boolean) => enabled
   ? redis.exists(key, hashKey)
   : Promise.resolve(false);

/**
 * Create view cache item with eTag and compressed content
 * @returns {Promise.<ViewCacheItem>}
 */
const createItem = (key:string, htmlOrJSON:string|GeoJSON.FeatureCollection<any>) => new Promise((resolve, reject) => {
   const text = (typeof(htmlOrJSON) == is.type.OBJECT) ? JSON.stringify(htmlOrJSON) : htmlOrJSON;
   compress.gzip(text, (err, buffer) => {
      if (is.value(err)) {
         reject(err);
      } else {
         resolve({ buffer, eTag: key + '_' + (new Date()).getTime().toString() });
      }
   });
});

/**
 * @param {string} key Root Redis key
 * @param {string} hashKey Hash field key
 * @param {string|GeoJSON.FeatureCollection} value HTML or JSON
 * @param {boolean} enabled Whether caching for this root key is enabled
 * @returns {Promise.<ViewCacheItem>}
 */
const addItem = (key:string, hashKey:string, value:string|GeoJSON.FeatureCollection<any>, enabled:boolean) => createItem(hashKey, value)
      .then(item => (enabled) ? redis.add(key, hashKey, item) : Promise.resolve(item));

/**
 * Convert view cache to string
 */
const serializeItem = (item:ViewCacheItem) => JSON.stringify({
   buffer: item.buffer.toString(C.encoding.HEXADECIMAL),
   eTag: item.eTag
});

const deserialize = (item:ViewCacheItem) => is.value(item)
   ? { buffer: Buffer.from(item.buffer, C.encoding.HEXADECIMAL), eTag: item.eTag }
   : null;

/**
 * Manage cache interaction
 */
export default {
   prefix,
   /**
    * Retrieve cached value
    */
   getItem: (key:string, hashKey:string) => redis.getObject(prefix + key, hashKey),

   add: (key:string, hashKeyOrValue:string|object, value:object) => redis.add(prefix + key, hashKeyOrValue, value),

   /**
    * All keys with standard prefix
    */
   keys: ()=> redis.keys(prefix + '*'),

   /**
    * Remove cached items
    */
   remove: (key:string|string[], hashKey:string|string[]) => redis.remove(
      is.array(key) ? key.map(k => prefix + k) : prefix + key,
      hashKey
   ),

   /**
    * Cache rendered views in memory
    */
   view: {
      getItem: (key:string) => Promise.resolve(memory[key]),
      keys: ()=> Promise.resolve(Object.keys(memory)),

      /**
       * Add or replace value at key
       */
      add: (key:string, text:Buffer|string) => createItem(key, text).then(item => {
         if (config.cache.views) { memory[key] = item; }
         return Promise.resolve(item);
      }),

      create: createItem,

      /**
       * Whether cache view exists
       */
      exists: (key:string) => Promise.resolve(is.defined(memory, key)),

      /**
       * Add value only if it doesn't already exist (mainly for testing)
       */
      addIfMissing(key:string, buffer:string|Buffer) {
         return (config.cache.views)
            ? this.exists(key).then(exists => exists ? Promise.resolve() : this.add(key, buffer))
            : Promise.resolve();
      },

      /**
       * Remove cached page views
       */
      remove: (keys:string|string[]) => {
         if (is.array(keys)) {
            keys.forEach(k => delete memory[k]);
         } else {
            delete memory[keys];
         }
         return Promise.resolve();
      },

      /**
       * In-memory cache doesn't need to serialize the page buffer
       */
      serialize: (item:ViewCacheItem) => item
   },

   /**
    * Cache rendered views in Redis
    */
   redisView: {
      getItem: (key:string) => redis.getObject(viewKey, key).then(deserialize),
      keys: ()=> redis.keys(viewKey),

      /**
       * Add or replace value at key
       */
      add: (key:string, text:string) => addItem(viewKey, key, text, config.cache.views),

      create: createItem,

      /**
       * Whether cache view exists
       */
      exists: (key:string) => exists(viewKey, key, config.cache.views),

      /**
       * Add value only if it doesn't already exist (mainly for testing)
       */
      addIfMissing(key:string, buffer:Buffer|string) {
         return (config.cache.views)
            ? this.exists(key).then(exists => exists ? Promise.resolve() : this.add(key, buffer))
            : Promise.resolve();
      },

      /**
       * Remove cached page views
       */
      remove: (keys:string|string[]) => redis.remove(viewKey, keys),

      serialize: serializeItem
   },
   /**
    * Cache GeoJSON
    */
   map: {
      getItem: (key:string) => redis.getObject(mapKey, key).then(deserialize),
      keys: ()=> redis.keys(mapKey),

      /**
       * Add or replace value at key
       */
      add: (key:string, geoJSON:GeoJSON.FeatureCollection<any>) => addItem(mapKey, key, geoJSON, config.cache.maps),

      /**
       * Whether cache map exists
       */
      exists: (key:string) => exists(mapKey, key, config.cache.maps),

      /**
       * Remove cached GeoJSON
       */
      remove: (key:string|string[]) => redis.remove(mapKey, key),

      /**
       * Add value only if it doesn't already exist (mainly for testing)
       */
      addIfMissing(key:string, buffer:Buffer|string) {
         return (config.cache.maps)
            ? this.exists(key).then(exists => exists ? Promise.resolve() : this.add(key, buffer))
            : Promise.resolve();
      },

      serialize: serializeItem
   }
};