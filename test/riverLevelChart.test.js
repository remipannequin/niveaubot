const assert = require('assert');
const rivers = require('../rivers');
const riverLevelChart = require('../riverLevelChart');

const fs = require('fs');


describe('Test graph generation', () => {
    let example_json = fs.readFileSync('./test/example.json');
    let data = JSON.parse(example_json);
    let obs = rivers.processJson(data);
    it ('should format data', () => {
        let dataset = riverLevelChart.format_data(obs);
        assert.notStrictEqual(dataset, null);
        assert.strictEqual(dataset.data.length, 73);
        assert.deepStrictEqual(dataset.data[0].x, new Date('2021-04-12T01:15:00.000Z'));
        assert.strictEqual(dataset.data[0].y, 4.1);
    });

    it ('should return a chart.js config', () => {
        let conf = riverLevelChart.getConfiguration(obs);
        assert.strictEqual(conf.data.datasets.length, 1);
    });

    it('should generate an image', () => {
        exp_buf = fs.readFileSync('test/chart.png');
        return riverLevelChart.createChart(obs)
            .then((buf)=>assert.deepStrictEqual(buf, exp_buf));
    });

    it('should write an image file', () => {
        
        return riverLevelChart.toImgFile(obs, '/tmp/chart.png');
    });

});



