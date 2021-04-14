'use strict';


// Use node-fetch to get river level data
const fetch = require('node-fetch');

const fs = require('fs');

const { format, isToday } = require('date-fns');
const { fr } = require('date-fns/locale');

function QueryCommand(flow, loc) {
    this.flow = flow;
    this.location = loc;
}

/**
 * 
 * @param msg 
 */
exports.parseCmd = function(msg) {
    let queryFlow = /([Dd][ée]bit+)\W+(\w*)\W*?/i;
    let queryHeight = /([Nn]iveau|[Hh]auteur)\W+(\w*)\W*?/i;
    let grp = queryFlow.exec(msg);
    if (grp != null && grp.length >= 3) {
        return new QueryCommand(true, grp[2]);
    }
    grp = queryHeight.exec(msg);
    if (grp != null && grp.length >= 3) {
        return new QueryCommand(false, grp[2]);   
    }
    //TODO: add other commands
}

/**
 * Query the webservice and process response
 * 
 * @param stationid the stationID to query
 * @param cb a function(string) that is called when the data has been acquired and processed 
 * @param  
 */
 function queryRiverLevel(stationid, cb, flow) {
    let url = `http://www.vigicrues.gouv.fr/services/observations.json?CdStationHydro=${stationid}&FormatDate=iso`
    if (flow) {
        url += '&GrdSerie=Q'; 
    }
    console.log('querying station '+stationid+'(flow='+flow+')');
        
    fetch(url)
        .then(resp => resp.json())
        .then(json => exports.processJson(json))
        .then(obs => exports.displayLevel(obs))
        .then(cb)
}


/**
 * Create a new hydro observation object
 */
class ObsHydro {
    constructor(loc, id, mes) {
        this.obs = [];
        this.station = id;
        this.location = loc;
        this.type = mes;
    }

    addObs(d) {
        let elt = {date: new Date(d['DtObsHydro']), value: d['ResObsHydro']};
        this.obs.push(elt);
    }

    last() {
        return this.obs[this.obs.length-1];
    }

    isEmpty() {
        return this.obs.length === 0;
    }

    describe() {
        // Test that obs has at least one element
        if (this.isEmpty()) {
            console.log('warning: no data for this station')
            return;
        }
        let last_obs = this.last();
        let d = last_obs.date;
        //TODO: try to evaluate evolution (on the last 6h)
    
        let date, measurement, unit;
        if (isToday(d)) {
            date = `aujourd'hui à ${format(d, "HH'h'mm")}`;
        } else {
            date = format(d, "'le' EEEE d MMMM 'à' HH'h'mm", {locale: fr});
        }
        if (this.type === 'Q') {
            measurement = 'Débit';
            unit = 'm3/s'
        } else {
            measurement = 'Niveau';
            unit = 'm';
        }
        
        return `${measurement} à ${this.location}, ${date}: ${last_obs.value} ${unit}`;
    }
}



/**
 * Process the hydrology data: return the values
 * 
 * @param json 
 * @returns a ObsHydro
 */
exports.processJson = function(json) {
    let obs = json['Serie']['ObssHydro']
    let station = json['Serie']['LbStationHydro'];
    let id = json['Serie']['CdStationHydro'];
    let mes = json['Serie']['GrdSerie'];
    //TODO: follow link to get the river name ('LbCoursEau')
    
    // Turn them into an array of ObsHydro
    let result = new ObsHydro(station, id, mes)
    for (const iterator of obs) {
        result.addObs(iterator);
    }
    return result;
}


/**
 * Transform the hydrological data into a analysis message
 * 
 * @param {ObsHydro} data the data to analyse
 * @returns a string resulting from the analysis of the data
 */
exports.displayLevel = function(data) {
    return data.describe();
}

exports.getEmbed = function(data) {
    let detailurl = `https://www.vigicrues.gouv.fr/niv3-station.php?CdEntVigiCru=2&CdStationHydro=${data.station}&GrdSerie=${data.mesure}&ZoomInitial=1`;


}

/**
 * 
 * @param {QueryCmd} cmd command to execute
 * @param {} cb callback
 */
exports.query = async function (cmd, cb) {
    let stationid = await exports.searchStation(cmd.location);
    //Check value is right
    if (stationid != null) {
        queryRiverLevel(stationid, cb, cmd.flow);
    }
}


/**
 * Search a station on the online service
 * 
 * @param {string} name 
 */
 exports.getAllStations = async function () {
    let url = 'https://www.vigicrues.gouv.fr/services/1/StaEntVigiCru.jsonld/';
  
    // Query webservice for list of stations
    let allStationsDb = [];
    let resp = await fetch(url);
    let json = await resp.json();
    for (const it of json['vic:StaEntVigiCru']) {
        let label = it['vic:LbEntVigiCru'];
        let entry = {
            label: label.split(' ')[0],//Only take fisrt word
            id: it["vic:CdEntVigiCru"]};
        // Add in cache
        allStationsDb.push(entry);
    }
    return allStationsDb;
}


/**
 * 
 * @param {string} name 
 * @returns 
 */
exports.searchStation = async function (name) {
    if (module.stationDb == null) {
        //TODO check file existence and format
        let station_json = fs.readFileSync('stations.json');
        let data = JSON.parse(station_json);
        module.stationDb = data['stations'];
        module.defaultStation = data['default'];
        let onlineSta = await exports.getAllStations();
        module.allStationsDb = onlineSta;
    }
    for (const iter of module.stationDb) {
        for (const k of iter["keys"]) {
            if (name.localeCompare(k, 'fr', { sensitivity: 'base' }) == 0) {
                return iter["id"];
            }
        }
    }
    //Search Online
    for (let it of module.allStationsDb) {
        if (name.localeCompare(it.label, 'fr', { sensitivity: 'base' }) == 0) {
            return it.id;
        }
    }
   
    console.log("unable to find a stationID for "+name);
}


