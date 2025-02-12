"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
console.log("******");
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
function dfs(nodes, matrix, v, to, from, seen, finish, route) {
    seen[v] = true;
    route.push(nodes[v]);
    console.log(route);
    var edge = getNextHops(matrix[v]);
    for (var _i = 0, edge_1 = edge; _i < edge_1.length; _i++) {
        var v2 = edge_1[_i];
        if (v2 === from) {
            continue;
        }
        ;
        if (finish[v2]) {
            continue;
        }
        ;
        if (seen[v2] && !finish[v2]) {
            route.push(nodes[v2]);
            return true;
        }
        ;
        if (dfs(nodes, matrix, v2, to, v, seen, finish, route)) {
            return true;
        }
        ;
    }
    ;
    finish[v] = true;
    if (v === to) {
        printBusRouteMatrix("BUS ROUTE", nodes, matrix);
        return true;
    }
    ;
    route.pop();
    return false;
}
;
function findRoute(nodes, matrix, searchCondition) {
    var seen = [];
    var finish = [];
    for (var index = 0; index < nodes.length; index++) {
        seen[index] = false;
        finish[index] = false;
    }
    ;
    var route = [];
    var result = dfs(nodes, matrix, nodes.indexOf(searchCondition.from), nodes.indexOf(searchCondition.to), -1, seen, finish, route);
    if (result) {
        return route;
    }
    return [];
}
;
function find(busStopArray, busTimetableArray, searchCondition) {
    var nodes = getAllNodes(busStopArray);
    var matrix = getNodesMatrix(busStopArray, nodes);
    var route = findRoute(nodes, matrix, searchCondition);
    console.log("Route");
    console.table(route);
    var tmpResultBusTimetableArray = [];
    if (searchCondition.departureOrArrival === "arrival") {
        var arrivalRouteArray = route.reverse();
        var time = searchCondition.time;
        var index = 0;
        var to = "";
        var from = "";
        for (var _i = 0, arrivalRouteArray_1 = arrivalRouteArray; _i < arrivalRouteArray_1.length; _i++) {
            var arrivalRoute = arrivalRouteArray_1[_i];
            if (index++ === 0) {
                to = arrivalRoute;
                continue;
            }
            ;
            from = arrivalRoute;
            console.log(from + "->" + to);
            var reSearchCondition = {
                busType: searchCondition.busType,
                from: from,
                to: to,
                departureOrArrival: searchCondition.departureOrArrival,
                direction: searchCondition.direction,
                time: time,
            };
            var lessEqualThanArrivalTimetableArray = extractLessEqualThanArrivalBusTimetableArray(busTimetableArray, reSearchCondition);
            var sortedLessEqualThanArrivalTimetableArray = sortingArrivalBusTimetableArray(lessEqualThanArrivalTimetableArray, reSearchCondition);
            if (sortedLessEqualThanArrivalTimetableArray.length === 0) {
                return [];
            }
            ;
            tmpResultBusTimetableArray[tmpResultBusTimetableArray.length] = sortedLessEqualThanArrivalTimetableArray[0];
            time = getDepartureTimeString(sortedLessEqualThanArrivalTimetableArray[0].timetable, reSearchCondition);
            to = from;
            var resultBusTimetableArray = [tmpResultBusTimetableArray[0]];
            for (var _a = 0, tmpResultBusTimetableArray_1 = tmpResultBusTimetableArray; _a < tmpResultBusTimetableArray_1.length; _a++) {
                var tmpResultBusTimetable = tmpResultBusTimetableArray_1[_a];
                if (resultBusTimetableArray[resultBusTimetableArray.length - 1] !== tmpResultBusTimetable) {
                    resultBusTimetableArray[resultBusTimetableArray.length] = tmpResultBusTimetable;
                }
            }
            ;
            return resultBusTimetableArray.reverse();
        }
        ;
    }
    else if (searchCondition.departureOrArrival === "departure") {
        var departureRouteArray = route;
        var time = searchCondition.time;
        var index = 0;
        var to = "";
        var from = "";
        for (var _b = 0, departureRouteArray_1 = departureRouteArray; _b < departureRouteArray_1.length; _b++) {
            var departureRoute = departureRouteArray_1[_b];
            if (index++ === 0) {
                from = departureRoute;
                continue;
            }
            ;
            to = departureRoute;
            console.log(from + "->" + to);
            var reSearchCondition = {
                busType: searchCondition.busType,
                from: from,
                to: to,
                departureOrArrival: searchCondition.departureOrArrival,
                direction: searchCondition.direction,
                time: time,
            };
            var graterEqualThanArrivalTimetableArray = extractGraterEqualThanDepartureBusTimetableArray(busTimetableArray, reSearchCondition);
            var sortedGraterEqualThanArrivalTimetableArray = sortingDepartureBusTimetableArray(graterEqualThanArrivalTimetableArray, reSearchCondition);
            if (sortedGraterEqualThanArrivalTimetableArray.length === 0) {
                return [];
            }
            ;
            tmpResultBusTimetableArray[tmpResultBusTimetableArray.length] = sortedGraterEqualThanArrivalTimetableArray[0];
            time = getArrivalTimeString(sortedGraterEqualThanArrivalTimetableArray[0].timetable, reSearchCondition);
            from = to;
        }
        ;
        var resultBusTimetableArray = [tmpResultBusTimetableArray[0]];
        for (var _c = 0, tmpResultBusTimetableArray_2 = tmpResultBusTimetableArray; _c < tmpResultBusTimetableArray_2.length; _c++) {
            var tmpResultBusTimetable = tmpResultBusTimetableArray_2[_c];
            if (resultBusTimetableArray[resultBusTimetableArray.length - 1] !== tmpResultBusTimetable) {
                resultBusTimetableArray[resultBusTimetableArray.length] = tmpResultBusTimetable;
            }
        }
        ;
        return resultBusTimetableArray;
    }
    ;
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
function printBusRouteMatrix(str, nodes, matrix) {
    console.log(str + ":start");
    console.log("*****nodes*****");
    console.table(nodes);
    console.log("+++++nodes+++++");
    console.table(matrix);
    console.log(str + ":finish");
}
;
function toTime(timeSrting) {
    var hour = parseInt(timeSrting.slice(0, 2));
    var minute = parseInt(timeSrting.slice(2, 4));
    var now = new Date();
    return new Date((now.getUTCMonth() + 1) + " " + now.getUTCDate() + ", " + now.getUTCFullYear() + " " + hour + ":" + minute + ":00");
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
        if (timetable.busStop === searchCondition.to && timetable.arrival !== "none") {
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
        if (timetable.busStop === searchCondition.from && timetable.departure !== "none") {
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
