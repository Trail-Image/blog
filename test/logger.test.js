const C = require('../lib/constants');
const config = require('../lib/config').default;
const mocha = require('mocha');
const { expect } = require('chai');
const log = require('../lib/logger').default;

describe('Logger', ()=> {
   let originalTargets;

   before(()=> {
      originalTargets = config.log.targets;
      config.log.targets = [C.logTo.FILE, C.logTo.CONSOLE];
      log.reset();
   });

   it.skip('supports adding icons to messages', ()=> {

   });

   after(()=> {
      config.log.targets = originalTargets;
      log.reset();
   });
});