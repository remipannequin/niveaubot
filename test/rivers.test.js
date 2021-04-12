const assert = require('assert');
const rivers = require('../rivers');

const fs = require('fs');

const sugar = require('sugar');

describe('Test command parsing', () => {
   it('should get river name', () => {
      cmd = rivers.parseCmd('! niveau Moselle');
      assert.strictEqual(cmd.location, 'Moselle');
      assert.strictEqual(cmd.flow, false);
      cmd = rivers.parseCmd('!   Niveau    Moselle');
      assert.strictEqual(cmd.location, 'Moselle');
      assert.strictEqual(cmd.flow, false);
      cmd = rivers.parseCmd('! niveau-Moselle');
      assert.strictEqual(cmd.location, 'Moselle');
      assert.strictEqual(cmd.flow, false);
      cmd = rivers.parseCmd('! niveau Meuse');
      assert.strictEqual(cmd.location, 'Meuse');
      cmd = rivers.parseCmd('! niveau Meuse');
      
      cmd = rivers.parseCmd('! Hauteur Moselle');
      assert.strictEqual(cmd.location, 'Moselle');
      assert.strictEqual(cmd.flow, false);

      cmd = rivers.parseCmd('! Débit Moselle');
      assert.strictEqual(cmd.location, 'Moselle');
      assert.strictEqual(cmd.flow, true);

   })

});

describe('Process reply', () => {
   it('should process json', () => {
      let example_json = fs.readFileSync('./test/example.json');
      let data = JSON.parse(example_json);
      let actual = rivers.processJson(data);
      assert.strictEqual(actual.length, 1097);
      assert.strictEqual(actual[0].value, 4.5);
      assert.strictEqual(actual[0].date.toISOString().raw, '2021-03-11T23:00:00.000Z');
      assert.strictEqual(actual[0].location, 'Pulligny');
      assert.strictEqual(rivers.displayLevel(actual, true), 'Débit à Pulligny, aujourd\'hui à 09:15: 4.6 m3/s');
      assert.strictEqual(rivers.displayLevel(actual, false), 'Niveau à Pulligny, aujourd\'hui à 09:15: 4.6 m');
      let actual2 = [];

      actual2.push(actual[20]); //2021-03-12T19:00:00+01:00
      assert.strictEqual(actual2[0].date.toISOString().raw, '2021-03-12T19:00:00.000Z');
      assert.strictEqual(rivers.displayLevel(actual2, true), 'Débit à Pulligny, le vendredi 12 mars à 20:00: 5.7 m3/s');

   })
});


describe('Sugar date test', () => {
   it('should parse date', () => {
      let d = sugar.Date('2021-03-12T19:00:00+01:00');
      assert.strictEqual(d.toISOString().raw, '2021-03-12T18:00:00.000Z');
      assert.strictEqual(d.isToday().raw, false);
      d = sugar.Date();
      assert.strictEqual(d.isToday().raw, true);
   })
});


describe('Station DB', () => {
   it('should return station ID', () => {
      assert.strictEqual(rivers.searchStation("Moselle"), 'A550061001');
      assert.strictEqual(rivers.searchStation("moselle"), 'A550061001');
      assert.strictEqual(rivers.searchStation("psv"), 'A550061001');
   })
});
