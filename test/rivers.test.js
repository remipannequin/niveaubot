const assert = require('assert');
const rivers = require('../rivers');

describe('Test command parsing', () => {
   it('should get river name', () => {
      assert.strictEqual(rivers.parseCmd('! niveau Moselle'), 'Moselle');
      assert.strictEqual(rivers.parseCmd('!  niveau     Moselle'), 'Moselle');
      assert.strictEqual(rivers.parseCmd('!niveau-Moselle'), 'Moselle');
      assert.strictEqual(rivers.parseCmd('! niveau Meuse'), 'Meuse');
   })

});
