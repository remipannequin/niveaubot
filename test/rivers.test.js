const assert = require('assert');
const rivers = require('../rivers');

const fs = require('fs');

const { isToday } = require('date-fns');

describe('Test command parsing', () => {
   it('should get river name', () => {
      cmd = rivers.parseCmd('niveau Moselle ?');
      assert.strictEqual(cmd.location, 'Moselle');
      assert.strictEqual(cmd.flow, false);
      cmd = rivers.parseCmd('Niveau    Moselle ?');
      assert.strictEqual(cmd.location, 'Moselle');
      assert.strictEqual(cmd.flow, false);
      cmd = rivers.parseCmd('niveau-Moselle ?');
      assert.strictEqual(cmd.location, 'Moselle');
      assert.strictEqual(cmd.flow, false);
      cmd = rivers.parseCmd('niveau Meuse ?');
      assert.strictEqual(cmd.location, 'Meuse');
      cmd = rivers.parseCmd('niveau Meuse ?');
      
      cmd = rivers.parseCmd('Hauteur Moselle ?');
      assert.strictEqual(cmd.location, 'Moselle');
      assert.strictEqual(cmd.flow, false);

      cmd = rivers.parseCmd('Débit Moselle ?');
      assert.strictEqual(cmd.location, 'Moselle');
      assert.strictEqual(cmd.flow, true);

   })

});


describe('Process reply', () => {
   it('should process json', () => {
      let example_json = fs.readFileSync('./test/example.json');
      let data = JSON.parse(example_json);
      let actual = rivers.processJson(data);
      assert.strictEqual(actual.obs.length, 1097);
      assert.strictEqual(actual.obs[0].value, 4.5);
      assert.strictEqual(actual.obs[0].date.toISOString(), '2021-03-11T23:00:00.000Z');
      assert.strictEqual(actual.location, 'Pulligny');
      assert.strictEqual(actual.station, 'A543101001');
      assert.strictEqual(actual.type, 'Q');
      assert.strictEqual(rivers.displayLevel(actual), 'Débit à Pulligny, le lundi 12 avril à 09h15: 4.6 m3/s');
   })
});


describe('date-fns test', () => {
   it('should parse date', () => {
      let d = new Date('2021-03-12T19:00:00+01:00');
      assert.strictEqual(d.toString(), 'Fri Mar 12 2021 19:00:00 GMT+0100 (GMT+01:00)');
      assert.strictEqual(isToday(d), false);
      d = new Date();
      assert.strictEqual(isToday(d), true);
   })
});


describe('Station DB', () => {
   it('should return an entry in stations.json', () => {
      return rivers.searchStation("Moselle")
         .then( (r)=>assert.strictEqual(r, 'A550061001'));
   });
   it('should return station ID (ignore case)', () => {
      return rivers.searchStation("moselle").then((r)=>assert.strictEqual(r, 'A550061001'));
   });
   it('should return station ID (another keyword)', () => {
      return rivers.searchStation("psv").then((r)=>assert.strictEqual(r, 'A550061001'));
   });
   it('should return another entry', () => {
      return rivers.searchStation("Madon").then((r)=>assert.strictEqual(r, 'A543101001'));
   });
   it('should return station ID (ignore case and accents)', () => {
      return rivers.searchStation("épinÂl").then((r)=>assert.strictEqual(r, 'A443064001'));
   });

   it('should return station ID from online', () => {
      return rivers.searchStation("Apatou").then((r)=>assert.strictEqual(r, '5041000101'));
   });
   it('should return station ID from online (only first word)', () => {
      return rivers.searchStation("Metz").then((r)=>assert.strictEqual(r, 'A743061001'));
   });

});


describe('Get Station entry form online service', () => {
   
   it('should return the online stations names and IDs', () => {
      return rivers.getAllStations()
         .then((db)=>assert.strictEqual(db.length, 2060));
   });
});