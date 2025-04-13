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
function getNearestArrivalTimeArray(busTimetableArray, nodes, matrix, pivot, time) {
    var nearestMinutesArray = [];
    var nextHops = getNextHops(matrix[pivot]);
    for (var i = 0; i < nodes.length; i++) {
        nearestMinutesArray[i] = "INF";
    }
    ;
    for (var _i = 0, nextHops_1 = nextHops; _i < nextHops_1.length; _i++) {
        var nextHop = nextHops_1[_i];
        var reSearchCondition = {
            busType: "nimsbus",
            from: nodes[pivot],
            to: nodes[nextHop],
            departureOrArrival: "arrival",
            direction: "ascending",
            time: time,
        };
        console.log(reSearchCondition.from + "->" + reSearchCondition.to);
        var graterEqualThanDepartureTimetableArray = extractGraterEqualThanDepartureBusTimetableArray(busTimetableArray, reSearchCondition);
        var sortedGraterEqualThanDepartureTimetableArray = sortingDepartureBusTimetableArray(graterEqualThanDepartureTimetableArray, reSearchCondition);
        if (sortedGraterEqualThanDepartureTimetableArray.length !== 0) {
            console.log(sortedGraterEqualThanDepartureTimetableArray[0]);
            console.log(reSearchCondition);
            console.log(nextHop);
            if (sortedGraterEqualThanDepartureTimetableArray[0].busType === "walk") {
                console.log("**************************************walk**************************************");
                var arrivalTime = addWalkTime(time, getArrivalTimeString(sortedGraterEqualThanDepartureTimetableArray[0].timetable, reSearchCondition));
                console.log(arrivalTime);
                nearestMinutesArray[nextHop] = arrivalTime;
            }
            else {
                console.log("**************************************bus**************************************");
                var arrivalTime = getArrivalTimeString(sortedGraterEqualThanDepartureTimetableArray[0].timetable, reSearchCondition);
                console.log(arrivalTime);
                nearestMinutesArray[nextHop] = arrivalTime;
            }
            ;
        }
        ;
    }
    ;
    return nearestMinutesArray;
}
;
function printDepatureArrival(timeTable, searchCondition) {
    var from = "None";
    var to = "None";
    if (timeTable.length !== 0) {
        if (timeTable.length !== 0) {
            from = getDepartureTimeString(timeTable, searchCondition);
            to = getArrivalTimeString(timeTable, searchCondition);
        }
        ;
    }
    ;
    return from + "->" + to;
}
;
function getNearestArrivalBustmeTable(reSearchCondition, busTimetableArray) {
    var timetable = {
        arrival: "INF",
        departure: "INF",
        busStop: reSearchCondition.from
    };
    var graterEqualThanDepartureTimetableArray = extractGraterEqualThanDepartureBusTimetableArray(busTimetableArray, reSearchCondition);
    var sortedGraterEqualThanDepartureTimetableArray = sortingDepartureBusTimetableArray(graterEqualThanDepartureTimetableArray, reSearchCondition);
    if (sortedGraterEqualThanDepartureTimetableArray.length !== 0) {
        if (sortedGraterEqualThanDepartureTimetableArray[0].busType === "walk") {
            console.log("**************************************walk**************************************");
            var arrivalTime = addWalkTime(reSearchCondition.time, getArrivalTimeString(sortedGraterEqualThanDepartureTimetableArray[0].timetable, reSearchCondition));
            console.log(arrivalTime);
            timetable.departure = reSearchCondition.time;
            timetable.arrival = arrivalTime;
        }
        else {
            console.log("**************************************bus**************************************");
            var departureTime = getDepartureTimeString(sortedGraterEqualThanDepartureTimetableArray[0].timetable, reSearchCondition);
            var arrivalTime = getArrivalTimeString(sortedGraterEqualThanDepartureTimetableArray[0].timetable, reSearchCondition);
            console.log(arrivalTime);
            timetable.departure = departureTime;
            timetable.arrival = arrivalTime;
        }
        ;
        return timetable;
    }
    return noneTimetable;
}
;
function getNearestArrivalBustmeTableArray(nodes, time, busTimetableVector) {
    var busTimetableArray = [];
    for (var from = 0; from < nodes.length; from++) {
        busTimetableArray[from] = [];
        for (var to = 0; to < nodes.length; to++) {
            var reSearchCondition = {
                busType: "nimsbus",
                from: nodes[from],
                to: nodes[to],
                departureOrArrival: "arrival",
                direction: "ascending",
                time: time,
            };
            busTimetableArray[from][to] = getNearestArrivalBustmeTable(reSearchCondition, busTimetableVector);
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
function dijkstra(nodes, matrix, s, route, busTimetableVector, searchCondition) {
    var timetableArray = getNearestArrivalBustmeTableArray(nodes, searchCondition.time, busTimetableVector);
    var timetableVector = [];
    var used = new Array(nodes.length).fill(false);
    var path = new Array(nodes.length).fill(-1);
    var flag = false;
    console.table(nodes);
    console.table(matrix);
    console.log(s);
    printTimeTableArray(timetableArray);
    for (var index = 0; index < nodes.length; index++) {
        timetableVector[index] = __assign({}, noneTimetable);
    }
    ;
    timetableVector[s].departure = searchCondition.time;
    timetableVector[s].arrival = searchCondition.time;
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
        var tmpTimetableArray = getNearestArrivalBustmeTableArray(nodes, min_dist.departure, busTimetableVector);
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
    console.table(path);
    var result = "";
    for (var i = 0; i < nodes.length; i++) {
        result += timetableVector[i].departure + " : " + i + " ";
        var p = i;
        while (path[p] !== -1) {
            result += " <--" + path[p];
            p = path[p];
        }
        result += "\n";
    }
    ;
    console.log(result);
    return [];
}
;
function dfs(nodes, matrix, v, to, seen, route) {
    seen[v] = true;
    route.push(nodes[v]);
    console.log("seen:" + v);
    if (seen[to]) {
        console.table(route);
        return true;
    }
    ;
    var edges = getNextHops(matrix[v]);
    for (var _i = 0, edges_1 = edges; _i < edges_1.length; _i++) {
        var next_v = edges_1[_i];
        if (seen[next_v]) {
            continue;
        }
        ;
        if (dfs(nodes, matrix, next_v, to, seen, route)) {
            return true;
        }
        ;
    }
    ;
    route.pop();
    return false;
}
;
function dummy_dfs(nodes, matrix, v, to, from, seen, finish, route) {
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
        if (dummy_dfs(nodes, matrix, v2, to, v, seen, finish, route)) {
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
function findRoute2(nodes, matrix, from, to, time, busTimetableArray, searchCondition, weight) {
    var seen = [];
    var finish = [];
    var route = [];
    var r = [];
    for (var index = 0; index < nodes.length; index++) {
        seen[index] = false;
        finish[index] = false;
    }
    ;
    for (var outer = 0; outer < nodes.length; outer++) {
        route[outer] = [];
        for (var inner = 0; inner < nodes.length; inner++) {
            route[outer][inner] = "INF";
        }
        ;
    }
    ;
    var dist = dijkstra(nodes, matrix, nodes.indexOf(searchCondition.from), route, busTimetableArray, searchCondition);
    console.table(dist);
    return [];
    console.table(nodes);
    console.table(matrix);
    console.log("From:" + nodes[from]);
    var edge = getNextHops(matrix[from]);
    for (var _i = 0, edge_2 = edge; _i < edge_2.length; _i++) {
        var v = edge_2[_i];
        for (var index = 0; index < nodes.length; index++) {
            seen[index] = false;
        }
        ;
        route = [];
        console.log(nodes[v] + "->" + nodes[to]);
        if (dfs(nodes, matrix, v, to, seen, r)) {
            console.log("true");
            var reSearchCondition = {
                busType: searchCondition.busType,
                from: nodes[from],
                to: nodes[v],
                departureOrArrival: searchCondition.departureOrArrival,
                direction: searchCondition.direction,
                time: time,
            };
            var graterEqualThanArrivalTimetableArray = extractGraterEqualThanDepartureBusTimetableArray(busTimetableArray, reSearchCondition);
            var sortedGraterEqualThanArrivalTimetableArray = sortingDepartureBusTimetableArray(graterEqualThanArrivalTimetableArray, reSearchCondition);
            console.log(sortedGraterEqualThanArrivalTimetableArray[0]);
            console.table(route);
        }
        else {
            console.log("false");
        }
        ;
    }
    ;
    return [];
}
;
function findRoute(nodes, matrix, searchCondition) {
    var seen = [];
    var finish = [];
    var route = [];
    for (var index = 0; index < nodes.length; index++) {
        seen[index] = false;
        finish[index] = false;
    }
    ;
    var to = nodes.indexOf(searchCondition.to);
    var from = nodes.indexOf(searchCondition.from);
    console.log("From:" + nodes[from]);
    for (var _i = 0, _a = matrix[from]; _i < _a.length; _i++) {
        var v = _a[_i];
        for (var index = 0; index < nodes.length; index++) {
            seen[index] = false;
        }
        ;
        route = [];
        dfs(nodes, matrix, v, to, seen, route);
        if (seen[nodes.indexOf(searchCondition.to)]) {
            console.log("true");
            console.table(route);
        }
        else {
            console.log("false");
        }
        ;
    }
    ;
    var result = dummy_dfs(nodes, matrix, nodes.indexOf(searchCondition.from), nodes.indexOf(searchCondition.to), -1, seen, finish, route);
    if (result) {
        return route;
    }
    ;
    return [];
}
;
function find(busStopArray, busTimetableArray, searchCondition) {
    var nodes = getAllNodes(busStopArray);
    var matrix = getNodesMatrix(busStopArray, nodes);
    //const route:string[]=findRoute(nodes,matrix,searchCondition);
    var weight = [];
    var route = findRoute2(nodes, matrix, nodes.indexOf(searchCondition.from), nodes.indexOf(searchCondition.to), searchCondition.time, busTimetableArray, searchCondition, weight);
    console.log("Route");
    console.table(route);
    return [];
    var tmpResultBusTimetableArray = [];
    if (searchCondition.departureOrArrival === "arrival") {
        var arrivalRouteArray = route.reverse();
        var time_1 = searchCondition.time;
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
                time: time_1,
            };
            var lessEqualThanArrivalTimetableArray = extractLessEqualThanArrivalBusTimetableArray(busTimetableArray, reSearchCondition);
            var sortedLessEqualThanArrivalTimetableArray = sortingArrivalBusTimetableArray(lessEqualThanArrivalTimetableArray, reSearchCondition);
            if (sortedLessEqualThanArrivalTimetableArray.length === 0) {
                return [];
            }
            ;
            tmpResultBusTimetableArray[tmpResultBusTimetableArray.length] = sortedLessEqualThanArrivalTimetableArray[0];
            time_1 = getDepartureTimeString(sortedLessEqualThanArrivalTimetableArray[0].timetable, reSearchCondition);
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
        var time_2 = searchCondition.time;
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
                time: time_2,
            };
            var graterEqualThanArrivalTimetableArray = extractGraterEqualThanDepartureBusTimetableArray(busTimetableArray, reSearchCondition);
            var sortedGraterEqualThanArrivalTimetableArray = sortingDepartureBusTimetableArray(graterEqualThanArrivalTimetableArray, reSearchCondition);
            if (sortedGraterEqualThanArrivalTimetableArray.length === 0) {
                return [];
            }
            ;
            tmpResultBusTimetableArray[tmpResultBusTimetableArray.length] = sortedGraterEqualThanArrivalTimetableArray[0];
            time_2 = getArrivalTimeString(sortedGraterEqualThanArrivalTimetableArray[0].timetable, reSearchCondition);
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
