"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
console.log("******");
var noneBusTimeTable = {
    busType: "None",
    opration: "None",
    option: "None",
    direction: "None",
    startingPoint: "None",
    destination: "None",
    carNo: "None",
    timetable: [],
};
var noneTimetable = {
    departure: "INF",
    arrival: "INF",
    busStop: "None",
};
var inputBusType = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusType.json", 'utf-8');
var targetBusTypeArray = JSON.parse(inputBusType);
var inputBusStop = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusStop.json", 'utf-8');
var targetBusStopArray = JSON.parse(inputBusStop);
var inputBusTimetable = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusTimetable.json", 'utf-8');
var targetBusTimetableArray = JSON.parse(inputBusTimetable);
var inputSearchCondition = fs.readFileSync("/home/evakichi/subsmin-desktop/testSearchCondition.json", 'utf-8');
var targetSearchCondition = JSON.parse(inputSearchCondition);
console.log(targetSearchCondition);
var busTimetableArray = find(targetBusStopArray, targetBusTimetableArray, targetSearchCondition);
printBusTimetableArray("*****result*****", targetSearchCondition, busTimetableArray);
function getNodesMatrix(busStopArray, nodes) {
    var matrix = [];
    for (var outer = 0; outer < nodes.length; outer++) {
        matrix[outer] = [];
        for (var inner = 0; inner < nodes.length; inner++) {
            matrix[outer][inner] = 0;
        }
        ;
    }
    ;
    for (var outer = 0; outer < nodes.length; outer++) {
        for (var _i = 0, _a = busStopArray[outer].ascending; _i < _a.length; _i++) {
            var asceding = _a[_i];
            matrix[outer][nodes.indexOf(asceding.nexthop)] = 1;
        }
        ;
    }
    ;
    for (var outer = 0; outer < nodes.length; outer++) {
        for (var _b = 0, _c = busStopArray[outer].descending; _b < _c.length; _b++) {
            var desceding = _c[_b];
            matrix[outer][nodes.indexOf(desceding.nexthop)] = 1;
        }
        ;
    }
    ;
    return matrix;
}
;
function getAllNodes(busStopArray) {
    var nodes = [];
    for (var _i = 0, busStopArray_1 = busStopArray; _i < busStopArray_1.length; _i++) {
        var busStop = busStopArray_1[_i];
        nodes[nodes.length] = busStop.busStop;
    }
    ;
    return nodes;
}
;
function getNextHops(edge) {
    var result = [];
    for (var i = 0; i < edge.length; i++) {
        if (edge[i] !== 0) {
            result[result.length] = i;
        }
    }
    return result;
}
;
function chmin(a, b) {
    if (a > b) {
        a = b;
        return true;
    }
    ;
    return false;
}
;
function getNearestArrivalBustmeTable(busTimetableArray, reSearchCondition) {
    var timetable = {
        arrival: "INF",
        departure: "INF",
        busStop: reSearchCondition.fromString,
    };
    var graterEqualThanDepartureTimetableArray = extractGraterEqualThanDepartureBusTimetableArray(busTimetableArray, reSearchCondition);
    var sortedGraterEqualThanDepartureTimetableArray = sortingDepartureBusTimetableArray(graterEqualThanDepartureTimetableArray, reSearchCondition);
    if (sortedGraterEqualThanDepartureTimetableArray.length !== 0) {
        if (sortedGraterEqualThanDepartureTimetableArray[0].busType === "walk") {
            //console.log("**************************************walk**************************************");
            var arrivalTime = addWalkTime(reSearchCondition.time, getArrivalTimeString(sortedGraterEqualThanDepartureTimetableArray[0].timetable, reSearchCondition));
            //console.log(arrivalTime);
            timetable.departure = reSearchCondition.time;
            timetable.arrival = arrivalTime;
        }
        else {
            //console.log("**************************************bus**************************************");
            var departureTime = getDepartureTimeString(sortedGraterEqualThanDepartureTimetableArray[0].timetable, reSearchCondition);
            var arrivalTime = getArrivalTimeString(sortedGraterEqualThanDepartureTimetableArray[0].timetable, reSearchCondition);
            //console.log(arrivalTime);
            timetable.departure = departureTime;
            timetable.arrival = arrivalTime;
        }
        ;
        return timetable;
    }
    return noneTimetable;
}
;
function getNearestArrivalBustmeTableArray(nodes, busTimetableVector, searchCondition) {
    var busTimetableArray = [];
    for (var from = 0; from < nodes.length; from++) {
        busTimetableArray[from] = [];
        for (var to = 0; to < nodes.length; to++) {
            var reSearchCondition = {
                fromString: nodes[from],
                toString: nodes[to],
                time: searchCondition.time,
            };
            busTimetableArray[from][to] = getNearestArrivalBustmeTable(busTimetableVector, reSearchCondition);
        }
        ;
    }
    ;
    console.log();
    return busTimetableArray;
}
;
function printTimeTableArray(timetableArray) {
    var timeTableStrignArray = [];
    for (var outer = 0; outer < timetableArray.length; outer++) {
        timeTableStrignArray[outer] = [];
        for (var inner = 0; inner < timetableArray.length; inner++) {
            timeTableStrignArray[outer][inner] = timetableArray[outer][inner].departure + "->" + timetableArray[outer][inner].arrival;
        }
        ;
    }
    ;
    console.table(timeTableStrignArray);
}
;
function dijkstra(nodes, busTimetableArray, searchCondition) {
    var timetableArray = getNearestArrivalBustmeTableArray(nodes, busTimetableArray, searchCondition);
    var timetableVector = [];
    var used = new Array(nodes.length).fill(false);
    var path = new Array(nodes.length).fill(-1);
    var r = [];
    var route = [];
    var fromNumber = nodes.indexOf(searchCondition.fromString);
    var toNumber = nodes.indexOf(searchCondition.toString);
    console.table(nodes);
    printTimeTableArray(timetableArray);
    for (var index = 0; index < nodes.length; index++) {
        timetableVector[index] = __assign({}, noneTimetable);
    }
    ;
    timetableVector[fromNumber].departure = searchCondition.time;
    timetableVector[fromNumber].arrival = searchCondition.time;
    console.table(timetableVector);
    for (var outer = 0; outer < nodes.length; outer++) {
        var min_dist = noneTimetable;
        var min_v = -1;
        for (var v = 0; v < nodes.length; v++) {
            if (!used[v] && toTime(timetableVector[v].arrival) < toTime(min_dist.arrival)) {
                min_v = v;
                min_dist = timetableVector[v];
            }
            ;
        }
        ;
        used[min_v] = true;
        console.log("used:");
        console.table(used);
        console.log("outer" + outer + " min_v" + min_v + " min_dist" + min_dist.arrival);
        console.table(timetableVector);
        if (min_dist === noneTimetable) {
            break;
        }
        ;
        var reSearchCondition = {
            fromString: searchCondition.fromString,
            toString: searchCondition.toString,
            time: min_dist.departure,
        };
        var tmpTimetableArray = getNearestArrivalBustmeTableArray(nodes, busTimetableArray, reSearchCondition);
        for (var v = 0; v < nodes.length; v++) {
            if (toTime(tmpTimetableArray[min_v][v].arrival) < toTime(timetableVector[v].arrival)) {
                timetableVector[v] = tmpTimetableArray[min_v][v];
                path[v] = min_v;
            }
            ;
        }
        ;
        console.log("path:");
        console.table(path);
    }
    ;
    var result = "";
    for (var i = 0; i < nodes.length; i++) {
        result += timetableVector[i].departure + " : " + i + " ";
        if (i === toNumber) {
            r[r.length] = i;
            var p_1 = i;
            while (path[p_1] !== -1) {
                r[r.length] = path[p_1];
                p_1 = path[p_1];
            }
            ;
            var rev = r.reverse();
            for (var _i = 0, rev_1 = rev; _i < rev_1.length; _i++) {
                var r_1 = rev_1[_i];
                route[route.length] = nodes[r_1];
            }
            ;
        }
        ;
        var p = i;
        while (path[p] !== -1) {
            result += " <--" + path[p];
            p = path[p];
        }
        result += "\n";
    }
    ;
    console.log(result);
    return route;
}
;
function find(busStopArray, busTimetableArray, searchCondition) {
    var nodes = getAllNodes(busStopArray);
    var matrix = getNodesMatrix(busStopArray, nodes);
    var route = dijkstra(nodes, busTimetableArray, searchCondition);
    console.log("Route");
    console.table(route);
    return [];
}
;
function printBusTimetableArray(str, searchCondition, busTimetableArray) {
    console.log(str + ":start");
    console.log("*****conditon*****");
    console.log(searchCondition);
    console.log("+++++conditon+++++");
    for (var _i = 0, busTimetableArray_1 = busTimetableArray; _i < busTimetableArray_1.length; _i++) {
        var busTimetable = busTimetableArray_1[_i];
        console.log(busTimetable);
    }
    console.log(str + ":finish");
}
;
function toTime(timeSrting) {
    if (timeSrting === "INF") {
        return new Date(8.64e15);
    }
    ;
    if (timeSrting === "0") {
        return new Date(0);
    }
    ;
    var minute = parseInt(timeSrting.slice(2, 4));
    var hour = parseInt(timeSrting.slice(0, 2));
    var now = new Date();
    now.setMinutes(minute);
    now.setHours(hour);
    //return new Date((now.getUTCMonth() + 1) + " " + now.getUTCDate() + ", " + now.getUTCFullYear() + " " + hour + ":" + minute + ":00");
    return now;
}
;
function addWalkTime(timeStringT, timeStringW) {
    var hourT = parseInt(timeStringT.slice(0, 2));
    var hourW = parseInt(timeStringW.slice(0, 2)) - 25;
    var minuteT = parseInt(timeStringT.slice(2, 4));
    var minuteW = parseInt(timeStringW.slice(2, 4));
    var hour = hourT + hourW;
    var minute = minuteT + minuteW;
    minute = minute % 60;
    hour += Math.floor(minute / 60);
    console.log(hour);
    console.log(minute);
    return hour.toString().padStart(2, "0") + minute.toString().padStart(2, "0");
}
;
function swapBusTimetable(specifiedBusTimetableArray, i, j) {
    var tmpSpecifiedBusTimetable = specifiedBusTimetableArray[i];
    specifiedBusTimetableArray[i] = specifiedBusTimetableArray[j];
    specifiedBusTimetableArray[j] = tmpSpecifiedBusTimetable;
}
;
function getArrivalTimeString(timeTableArray, searchCondition) {
    for (var _i = 0, timeTableArray_1 = timeTableArray; _i < timeTableArray_1.length; _i++) {
        var timetable = timeTableArray_1[_i];
        if (timetable.busStop === searchCondition.toString && timetable.arrival !== "none") {
            return timetable.arrival;
        }
        ;
    }
    ;
    return "none";
}
;
function getDepartureTimeString(timeTableArray, searchCondition) {
    for (var _i = 0, timeTableArray_2 = timeTableArray; _i < timeTableArray_2.length; _i++) {
        var timetable = timeTableArray_2[_i];
        if (timetable.busStop === searchCondition.fromString && timetable.departure !== "none") {
            return timetable.departure;
        }
        ;
    }
    ;
    return "none";
}
;
function extractGraterEqualThanDepartureBusTimetableArray(busTimetableArray, searchCondition) {
    var specifiedBusTimetableArray = [];
    for (var _i = 0, busTimetableArray_2 = busTimetableArray; _i < busTimetableArray_2.length; _i++) {
        var busTimeTable = busTimetableArray_2[_i];
        var departureTime = getDepartureTimeString(busTimeTable.timetable, searchCondition);
        var arrivalTime = getArrivalTimeString(busTimeTable.timetable, searchCondition);
        if (departureTime !== "none" && arrivalTime !== "none" && toTime(arrivalTime) > toTime(departureTime) && toTime(searchCondition.time) <= toTime(departureTime)) {
            specifiedBusTimetableArray[specifiedBusTimetableArray.length] = busTimeTable;
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
}
;
function extractLessEqualThanArrivalBusTimetableArray(busTimetableArray, searchCondition) {
    var specifiedBusTimetableArray = [];
    for (var _i = 0, busTimetableArray_3 = busTimetableArray; _i < busTimetableArray_3.length; _i++) {
        var busTimeTable = busTimetableArray_3[_i];
        var departureTime = getDepartureTimeString(busTimeTable.timetable, searchCondition);
        var arrivalTime = getArrivalTimeString(busTimeTable.timetable, searchCondition);
        if (departureTime !== "none" && arrivalTime !== "none" && toTime(arrivalTime) > toTime(departureTime) && toTime(searchCondition.time) >= toTime(arrivalTime)) {
            specifiedBusTimetableArray[specifiedBusTimetableArray.length] = busTimeTable;
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
}
;
function sortingArrivalBusTimetableArray(busTimetableArray, searchCondition) {
    var specifiedBusTimetableArray = busTimetableArray;
    for (var outer = 0; outer < specifiedBusTimetableArray.length; outer++) {
        var current = outer;
        for (var inner = outer + 1; inner < specifiedBusTimetableArray.length; inner++) {
            if (toTime(getArrivalTimeString(specifiedBusTimetableArray[current].timetable, searchCondition)) < toTime(getArrivalTimeString(specifiedBusTimetableArray[inner].timetable, searchCondition))) {
                current = inner;
            }
        }
        ;
        swapBusTimetable(specifiedBusTimetableArray, current, outer);
    }
    ;
    return specifiedBusTimetableArray;
}
;
function sortingDepartureBusTimetableArray(busTimetableArray, searchCondition) {
    var specifiedBusTimetableArray = busTimetableArray;
    for (var outer = 0; outer < specifiedBusTimetableArray.length; outer++) {
        var current = outer;
        for (var inner = outer + 1; inner < specifiedBusTimetableArray.length; inner++) {
            if (toTime(getDepartureTimeString(specifiedBusTimetableArray[current].timetable, searchCondition)) > toTime(getDepartureTimeString(specifiedBusTimetableArray[inner].timetable, searchCondition))) {
                current = inner;
            }
        }
        ;
        swapBusTimetable(specifiedBusTimetableArray, current, outer);
    }
    ;
    return specifiedBusTimetableArray;
}
;
