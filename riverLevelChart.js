const fs = require('fs');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
require('chartjs-adapter-date-fns');
const {addHours, isWithinInterval} = require('date-fns');

const mod = {};

const w = 400; //px
const h = 200; //px

module.canvasRenderService = new ChartJSNodeCanvas({width: w, height: h});

function example_data() {
    return {
        label: 'débit',
        borderColor: 'blue',
        fill: {
            target: 'origin',
            above: '#7aadff'
        },
        data: [
        {x: new Date("2021-04-12T06:35:00+02:00"), y:4.3},
        {x: new Date("2021-04-12T06:40:00+02:00"), y:4.3},
        {x: new Date("2021-04-12T06:45:00+02:00"), y:4.3},
        {x: new Date("2021-04-12T06:50:00+02:00"), y:4.3},
        {x: new Date("2021-04-12T06:55:00+02:00"), y:4.3},
        {x: new Date("2021-04-12T07:00:00+02:00"), y:4.3},
        {x: new Date("2021-04-12T07:05:00+02:00"), y:4.3},
        {x: new Date("2021-04-12T07:10:00+02:00"), y:4.3},
        {x: new Date("2021-04-12T07:15:00+02:00"), y:4.3},
        {x: new Date("2021-04-12T07:20:00+02:00"), y:4.3},
        {x: new Date("2021-04-12T07:25:00+02:00"), y:4.4},
        {x: new Date("2021-04-12T07:30:00+02:00"), y:4.3},
        {x: new Date("2021-04-12T07:35:00+02:00"), y:4.4},
        {x: new Date("2021-04-12T07:40:00+02:00"), y:4.4},
        {x: new Date("2021-04-12T07:45:00+02:00"), y:4.4},
        {x: new Date("2021-04-12T07:50:00+02:00"), y:4.4},
        {x: new Date("2021-04-12T07:55:00+02:00"), y:4.4},
        {x: new Date("2021-04-12T08:00:00+02:00"), y:4.5},
        {x: new Date("2021-04-12T08:05:00+02:00"), y:4.5},
        {x: new Date("2021-04-12T08:10:00+02:00"), y:4.4},
        {x: new Date("2021-04-12T08:15:00+02:00"), y:4.5},
        {x: new Date("2021-04-12T08:20:00+02:00"), y:4.5},
        {x: new Date("2021-04-12T08:25:00+02:00"), y:4.5},
        {x: new Date("2021-04-12T08:30:00+02:00"), y:4.5},
        {x: new Date("2021-04-12T08:35:00+02:00"), y:4.5},
        {x: new Date("2021-04-12T08:40:00+02:00"), y:4.5},
        {x: new Date("2021-04-12T08:45:00+02:00"), y:4.5},
        {x: new Date("2021-04-12T08:50:00+02:00"), y:4.5},
        {x: new Date("2021-04-12T08:55:00+02:00"), y:4.5},
        {x: new Date("2021-04-12T09:00:00+02:00"), y:4.5},
        {x: new Date("2021-04-12T09:05:00+02:00"), y:4.6},
        {x: new Date("2021-04-12T09:10:00+02:00"), y:4.6},
        {x: new Date("2021-04-12T09:15:00+02:00"), y:4.6}]
    };
}

exports.format_data = function (data) {
    let range_end = data.last().date;
    let range_start = addHours(range_end, -6);//end - 6h
    let xy = [];
    //Only keep last 6 hours of data
    for (iter of data.obs) {
        if (isWithinInterval(iter.date, {start: range_start, end: range_end})) {
            xy.push({x: iter.date, y: iter.value});
        }
    }

    return {
        label: 'débit',
        borderColor: 'blue',
        fill: {
            target: 'origin',
            above: '#7aadff'
        },
        data: xy
    };
}


exports.getConfiguration = function (obs) {
    let sets = [exports.format_data(obs)];//, example_data(obs)];
    return {
        type: 'line',
        data: {datasets: sets},
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour'
                    }
                },
                y: {
                    type: 'linear',
                    beginAtZero: true
                }
            }
        }
    };
} 


exports.createChart = async function(obs) {
    return module.canvasRenderService.renderToBuffer(exports.getConfiguration(obs));
}

exports.toImgFile = async function (obs, name) {
    
    const imageBuffer = await module.canvasRenderService.renderToBuffer(exports.getConfiguration(obs));
    // Write image to file
    fs.writeFileSync(name, imageBuffer);
    //return mod.canvasRenderService.renderToBuffer(mod.getConfiguration(obs));
};
