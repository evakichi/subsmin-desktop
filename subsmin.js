"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var inputBusType = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusType.json", 'utf-8');
var targetBusTypeArray = JSON.parse(inputBusType);
var inputBusStop = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusStop.json", 'utf-8');
var targetBusStopArray = JSON.parse(inputBusStop);
var inputBusTimetable = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusTimetable.json", 'utf-8');
var targetBusTimetableArray = JSON.parse(inputBusTimetable);
var inputSearchCondition = fs.readFileSync("/home/evakichi/subsmin-desktop/testSearchCondition.json", 'utf-8');
var targetSearchCondition = JSON.parse(inputSearchCondition);
console.log(targetSearchCondition);
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
function getArrivalTimeString(timeTableArray, condString) {
    console.log("getArrivalTimeString");
    var specifiedTime = "none";
    for (var _i = 0, timeTableArray_1 = timeTableArray; _i < timeTableArray_1.length; _i++) {
        var timetable = timeTableArray_1[_i];
        if (timetable.busStop === condString && timetable.arrival !== "none") {
            specifiedTime = timetable.arrival;
        }
    }
    return specifiedTime;
}
;
function getDepartureTimeString(timeTableArray, condString) {
    console.log("getDepartureTimeString");
    var specifiedTime = "none";
    for (var _i = 0, timeTableArray_2 = timeTableArray; _i < timeTableArray_2.length; _i++) {
        var timetable = timeTableArray_2[_i];
        if (timetable.busStop === condString && timetable.departure !== "none") {
            specifiedTime = timetable.departure;
        }
    }
    return specifiedTime;
}
;
function extractBusTypeBusTimetableArray(busTimetableArray, busType) {
    console.log("extractSpecifiedBusTypeTimetableArray");
    var index = 0;
    var specifiedBusTimetableArray = [];
    for (var _i = 0, busTimetableArray_2 = busTimetableArray; _i < busTimetableArray_2.length; _i++) {
        var busTimetable = busTimetableArray_2[_i];
        if (busTimetable.busType === busType) {
            specifiedBusTimetableArray[index++] = busTimetable;
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
}
;
function extractDirectionBusTimetableArray(busTimetableArray, direction) {
    console.log("extractSpecifiedDirectionTimetableArray");
    if (direction === "none") {
        return busTimetableArray;
    }
    ;
    var index = 0;
    var specifiedBusTimetableArray = [];
    for (var _i = 0, busTimetableArray_3 = busTimetableArray; _i < busTimetableArray_3.length; _i++) {
        var busTimetable = busTimetableArray_3[_i];
        if (busTimetable.direction === direction) {
            specifiedBusTimetableArray[index++] = busTimetable;
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
}
;
function extractLessEqualThanArrivalBusTimetableArray(busTimetableArray, searchCondition) {
    //printBusTimetableArray("extractLessThanArrivalTimetableArray",searchCondition,busTimetableArray);
    var specifiedBusTimetableArray = [];
    for (var _i = 0, busTimetableArray_4 = busTimetableArray; _i < busTimetableArray_4.length; _i++) {
        var busTimetable = busTimetableArray_4[_i];
        var arrivalTime = getArrivalTimeString(busTimetable.timetable, searchCondition.to);
        if (arrivalTime !== "none" && toTime(arrivalTime) <= toTime(searchCondition.time)) {
            specifiedBusTimetableArray[specifiedBusTimetableArray.length] = busTimetable;
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
}
;
function extractLessGraterThanArrivalBusTimetableArray(busTimetableArray, searchCondition) {
    //printBusTimetableArray("extractLessThanArrivalTimetableArray",searchCondition,busTimetableArray);
    var specifiedBusTimetableArray = [];
    for (var _i = 0, busTimetableArray_5 = busTimetableArray; _i < busTimetableArray_5.length; _i++) {
        var busTimetable = busTimetableArray_5[_i];
        var arrivalTime = getArrivalTimeString(busTimetable.timetable, searchCondition.to);
        if (arrivalTime !== "none" && toTime(arrivalTime) >= toTime(searchCondition.time)) {
            specifiedBusTimetableArray[specifiedBusTimetableArray.length] = busTimetable;
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
}
;
function sortingArrivalBusTimetableArray(busTimetableArray, searchCondition) {
    console.log("sortingBusTimetableArray");
    var specifiedBusTimetableArray = busTimetableArray;
    for (var outer = 0; outer < specifiedBusTimetableArray.length; outer++) {
        var current = outer;
        for (var inner = outer + 1; inner < specifiedBusTimetableArray.length; inner++) {
            if (toTime(getArrivalTimeString(specifiedBusTimetableArray[current].timetable, searchCondition.to)) < toTime(getArrivalTimeString(specifiedBusTimetableArray[inner].timetable, searchCondition.to))) {
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
function reGenerateSearchCondition(searchCondition, timetable, transit) {
    var timeString = getDepartureTimeString(timetable, transit);
    console.log(timeString);
    var reSearchCondition = {
        busType: searchCondition.busType,
        from: searchCondition.from,
        to: transit,
        departureOrArrival: "arrival",
        direction: "none",
        time: timeString,
    };
    return reSearchCondition;
}
;
function removeHeadFromBusTimeTableArray(busTimetableArray) {
    var tmpBusTimetableArray = [];
    var index = 0;
    for (var _i = 0, busTimetableArray_6 = busTimetableArray; _i < busTimetableArray_6.length; _i++) {
        var busTimetable = busTimetableArray_6[_i];
        if (index !== 0) {
            tmpBusTimetableArray[tmpBusTimetableArray.length] = busTimetable;
        }
        ;
        index++;
    }
    ;
    return tmpBusTimetableArray;
}
;
function getTransitString(busStopArray, name) {
    for (var _i = 0, busStopArray_1 = busStopArray; _i < busStopArray_1.length; _i++) {
        var busStop = busStopArray_1[_i];
        if (busStop.busStop === name) {
            return "none";
        }
    }
    return "none";
}
;
function mergeBusTimetableArray(array1, array2) {
    var resultBusTimetableArray = [];
    for (var _i = 0, array1_1 = array1; _i < array1_1.length; _i++) {
        var array = array1_1[_i];
        resultBusTimetableArray[resultBusTimetableArray.length] = array;
    }
    ;
    for (var _a = 0, array2_1 = array2; _a < array2_1.length; _a++) {
        var array = array2_1[_a];
        resultBusTimetableArray[resultBusTimetableArray.length] = array;
    }
    ;
    return resultBusTimetableArray;
}
function removeNonDepartureBusTimetableArray(busTimetableArray, searchCondition) {
    var specifiedBusTimetableArray = [];
    for (var _i = 0, busTimetableArray_7 = busTimetableArray; _i < busTimetableArray_7.length; _i++) {
        var busTimetable = busTimetableArray_7[_i];
        if (getDepartureTimeString(busTimetable.timetable, searchCondition.from) !== "none") {
            specifiedBusTimetableArray[specifiedBusTimetableArray.length] = busTimetable;
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
}
;
function getTransitBusTimetableArray(prevBusTimetableArray, currentBusTimetableArray, searchCondition, busStopArray, depth) {
    //printBusTimetableArray("*****getTransitBusTimetable****",searchCondition,currentBusTimetableArray);
    var transit = getTransitString(busStopArray, searchCondition.to);
    var sortedBusTimetableArray = sortingArrivalBusTimetableArray(prevBusTimetableArray, searchCondition);
    printBusTimetableArray("*****transit sorted", searchCondition, sortedBusTimetableArray);
    for (var _i = 0, sortedBusTimetableArray_1 = sortedBusTimetableArray; _i < sortedBusTimetableArray_1.length; _i++) {
        var busTimetable = sortedBusTimetableArray_1[_i];
        var reSearchCondition = reGenerateSearchCondition(searchCondition, busTimetable.timetable, transit);
        printBusTimetableArray("*****transit regenete*****", reSearchCondition, sortedBusTimetableArray);
        var resultBusTimetableArray = getBusTimetableArray(currentBusTimetableArray, currentBusTimetableArray, reSearchCondition, busStopArray, depth + 1);
        if (resultBusTimetableArray.length !== 0) {
            return resultBusTimetableArray;
        }
        ;
    }
    return [];
}
;
function isDirectPath(busTimetable, searchCondition) {
    var arrivalTime = getArrivalTimeString(busTimetable.timetable, searchCondition.to);
    var departureTime = getDepartureTimeString(busTimetable.timetable, searchCondition.from);
    if (arrivalTime !== "none" && departureTime !== "none" && toTime(arrivalTime) > toTime(departureTime)) {
        return true;
    }
    ;
    return false;
}
;
function isIndirectPath(busTimetable, searchCondition) {
    var fromArrivalTime = getArrivalTimeString(busTimetable.timetable, searchCondition.from);
    var fromDepartureTime = getDepartureTimeString(busTimetable.timetable, searchCondition.from);
    var toArrivalTime = getArrivalTimeString(busTimetable.timetable, searchCondition.to);
    var toDepartureTime = getDepartureTimeString(busTimetable.timetable, searchCondition.to);
    if (fromArrivalTime !== "none" && toDepartureTime !== "none" && toTime(fromArrivalTime) > toTime(toDepartureTime)) {
        return false;
    }
    if (toArrivalTime !== "none" && fromDepartureTime === "none") {
        return true;
    }
    ;
    return false;
}
;
function extractDirectPath(busTimetableArray, searchCondition) {
    var specifiedBusTimetableArray = [];
    for (var _i = 0, busTimetableArray_8 = busTimetableArray; _i < busTimetableArray_8.length; _i++) {
        var busTimetable = busTimetableArray_8[_i];
        if (isDirectPath(busTimetable, searchCondition)) {
            specifiedBusTimetableArray[specifiedBusTimetableArray.length] = busTimetable;
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
}
;
function extractIndirectPath(busTimetableArray, searchCondition) {
    var specifiedBusTimetableArray = [];
    for (var _i = 0, busTimetableArray_9 = busTimetableArray; _i < busTimetableArray_9.length; _i++) {
        var busTimetable = busTimetableArray_9[_i];
        if (isIndirectPath(busTimetable, searchCondition)) {
            specifiedBusTimetableArray[specifiedBusTimetableArray.length] = busTimetable;
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
}
;
function searchBusTimetableArray(prevBusTimetableArray, currentBusTimetableArray, searchCondition, busStopArray) {
    var specifiedBusTimetableArray = [];
    for (var _i = 0, prevBusTimetableArray_1 = prevBusTimetableArray; _i < prevBusTimetableArray_1.length; _i++) {
        var busTimetable = prevBusTimetableArray_1[_i];
        if (isDirectPath(busTimetable, searchCondition)) {
            console.log("*****************************************************************");
            return [busTimetable];
        }
        else if (isIndirectPath(busTimetable, searchCondition)) {
            console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++" + getTransitString(busStopArray, searchCondition.to));
            var reSearchCondition = reGenerateSearchCondition(searchCondition, busTimetable.timetable, getTransitString(busStopArray, searchCondition.to));
            printBusTimetableArray("*****searchBus regenete*****", reSearchCondition, prevBusTimetableArray);
            var tmpBusTimetableArray = searchBusTimetableArray(currentBusTimetableArray, currentBusTimetableArray, reSearchCondition, busStopArray);
            console.log("////////////////////////////");
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
}
;
function nextHop(currentBusTimetableArray, searchCondition) {
    return extractLessGraterThanArrivalBusTimetableArray(extractDirectPath(currentBusTimetableArray, searchCondition), searchCondition);
}
;
function getBusTimetable(currentBusTimetableArray, searchCondition) {
    var next = nextHop(currentBusTimetableArray, searchCondition);
    printBusTimetableArray("test", searchCondition, next);
    if (next.length === 0) {
        return [];
    }
    return [next[0]];
}
;
var searchCondition = {
    busType: "none",
    from: "nims:namiki",
    to: "nims:sengen",
    departureOrArrival: "none",
    direction: "none",
    time: "1800",
};
var start = "nims:namiki";
function getNextHops(busStopArray, start) {
    var stringArray = [];
    for (var _i = 0, busStopArray_2 = busStopArray; _i < busStopArray_2.length; _i++) {
        var busStop = busStopArray_2[_i];
        if (busStop.busStop === start) {
            for (var _a = 0, _b = busStop.ascending; _a < _b.length; _a++) {
                var ascending = _b[_a];
                stringArray[stringArray.length] = ascending.nexthop;
            }
            ;
            for (var _c = 0, _d = busStop.descending; _c < _d.length; _c++) {
                var descending = _d[_c];
                stringArray[stringArray.length] = descending.nexthop;
            }
            ;
        }
        ;
    }
    ;
    return stringArray;
}
;
function getBusStop(busStopArray, condition) {
    for (var _i = 0, busStopArray_3 = busStopArray; _i < busStopArray_3.length; _i++) {
        var busStop = busStopArray_3[_i];
        if (busStop.busStop === condition)
            return busStop;
    }
    return undefined;
}
;
function isContainBusStop(memory, condition) {
    for (var _i = 0, memory_1 = memory; _i < memory_1.length; _i++) {
        var mem = memory_1[_i];
        if (mem === condition) {
            return true;
        }
    }
    ;
    return false;
}
;
function getAscendingNodesMatrix(busStopArray, nodes) {
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
    return matrix;
}
;
function getDescendingNodesMatrix(busStopArray, nodes) {
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
        for (var _i = 0, _a = busStopArray[outer].descending; _i < _a.length; _i++) {
            var desceding = _a[_i];
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
    for (var _i = 0, busStopArray_4 = busStopArray; _i < busStopArray_4.length; _i++) {
        var busStop = busStopArray_4[_i];
        nodes[nodes.length] = busStop.busStop;
    }
    ;
    return nodes;
}
;
function dfs(nodes, matrix, v, seen, finish, routeStringMatrix, routeStringArray) {
    seen[v] = true;
    routeStringArray.push(nodes[v]);
    //console.log(routeStringArray);
    var routeStringMatrixIndex = routeStringMatrix.length;
    routeStringMatrix[routeStringMatrixIndex] = [];
    for (var _i = 0, routeStringArray_1 = routeStringArray; _i < routeStringArray_1.length; _i++) {
        var routeString = routeStringArray_1[_i];
        routeStringMatrix[routeStringMatrixIndex][routeStringMatrix[routeStringMatrixIndex].length] = routeString;
    }
    ;
    //console.table(routeStringMatrix);
    var edge = matrix[v];
    //console.table(edge);
    for (var index = 0; index < edge.length; index++) {
        if (edge[index] !== 0) {
            var v2 = index;
            //console.log("v2:"+v2);
            if (finish[v2]) {
                continue;
            }
            if (seen[v2] && !finish[v2]) {
                routeStringArray.push(nodes[v2]);
                return true;
            }
            ;
            if (dfs(nodes, matrix, v2, seen, finish, routeStringMatrix, routeStringArray)) {
                return true;
            }
            ;
        }
        ;
    }
    ;
    //console.log("finish:"+v);
    //console.table(finish);
    finish[v] = true;
    routeStringArray.pop();
    return false;
}
;
function findRoute(nodes, ascendingMatrix, descendingMatrix, from, to) {
    var candidates = [];
    var prevTargetBusStopStringArray = [];
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node = nodes_1[_i];
        var seen = [];
        var finish = [];
        console.log(node);
        console.log("*****ascnding*****");
        for (var index = 0; index < nodes.length; index++) {
            seen[index] = false;
            finish[index] = false;
        }
        ;
        var ascendingRouteStringMatrix = [];
        var ascendingRouteStringArray = [];
        if (node !== to) {
            var ascendingResult = dfs(nodes, ascendingMatrix, nodes.indexOf(node), seen, finish, ascendingRouteStringMatrix, ascendingRouteStringArray);
        }
        for (var _a = 0, ascendingRouteStringMatrix_1 = ascendingRouteStringMatrix; _a < ascendingRouteStringMatrix_1.length; _a++) {
            var ascending = ascendingRouteStringMatrix_1[_a];
            if (ascending.includes(to)) {
                candidates.push(ascending);
            }
            ;
        }
        console.log("*****descnding*****");
        for (var index = 0; index < nodes.length; index++) {
            seen[index] = false;
            finish[index] = false;
        }
        ;
        var descendingRouteStringMatrix = [];
        var descendingRouteStringArray = [];
        if (node !== to) {
            var descendingResult = dfs(nodes, descendingMatrix, nodes.indexOf(node), seen, finish, descendingRouteStringMatrix, descendingRouteStringArray);
        }
        for (var _b = 0, descendingRouteStringMatrix_1 = descendingRouteStringMatrix; _b < descendingRouteStringMatrix_1.length; _b++) {
            var descending = descendingRouteStringMatrix_1[_b];
            if (descending.includes(to)) {
                candidates.push(descending);
            }
            ;
        }
    }
    ;
    console.table(candidates);
    for (var _c = 0, candidates_1 = candidates; _c < candidates_1.length; _c++) {
        var candidate = candidates_1[_c];
        if (!prevTargetBusStopStringArray.includes(candidate[0])) {
            prevTargetBusStopStringArray[prevTargetBusStopStringArray.length] = candidate[0];
        }
    }
    ;
    console.table(prevTargetBusStopStringArray);
}
;
function find(busStopArray, from, to) {
    var nodes = getAllNodes(busStopArray);
    var ascendingMatrix = getAscendingNodesMatrix(busStopArray, nodes);
    var descendingMatrix = getDescendingNodesMatrix(busStopArray, nodes);
    findRoute(nodes, ascendingMatrix, descendingMatrix, from, to);
}
;
find(targetBusStopArray, "nims:namiki", "nims:sakura");
//const hops:string[] = dfs(busStopArray,"nims:namiki","nims:sakura",["nims:namiki"]);
//console.table(hops);
//const next = getBusTimetable(targetBusTimetableArray,searchCondition);
//printBusTimetableArray("next:",searchCondition,next);
function getBusTimetableArray(prevBusTimetableArray, currentBusTimetableArray, searchCondition, busStopArray, depth) {
    console.log("************************" + depth + "**********************************");
    var specifiedBusTimetableArray = [];
    var directPathBusTimetableArray = sortingArrivalBusTimetableArray(extractLessEqualThanArrivalBusTimetableArray(extractDirectPath(currentBusTimetableArray, searchCondition), searchCondition), searchCondition);
    var indirectPathBusTimetableArray = sortingArrivalBusTimetableArray(extractLessEqualThanArrivalBusTimetableArray(extractIndirectPath(currentBusTimetableArray, searchCondition), searchCondition), searchCondition);
    printBusTimetableArray("directPathBusTimetableArray", searchCondition, directPathBusTimetableArray);
    printBusTimetableArray("indirectPathBusTimetableArray", searchCondition, indirectPathBusTimetableArray);
    var mergedBusTimetableArray = mergeBusTimetableArray(directPathBusTimetableArray, indirectPathBusTimetableArray);
    var sortedLessThanEqualBusTimeTable = sortingArrivalBusTimetableArray(mergedBusTimetableArray, searchCondition);
    printBusTimetableArray("*****merged*****", searchCondition, mergedBusTimetableArray);
    printBusTimetableArray("*****sorted merged*****", searchCondition, mergedBusTimetableArray);
    for (var _i = 0, sortedLessThanEqualBusTimeTable_1 = sortedLessThanEqualBusTimeTable; _i < sortedLessThanEqualBusTimeTable_1.length; _i++) {
        var busTimetable = sortedLessThanEqualBusTimeTable_1[_i];
        if (isDirectPath(busTimetable, searchCondition)) {
            console.log("****************************Direct******************************");
            return [busTimetable];
        }
        else if (isIndirectPath(busTimetable, searchCondition)) {
            var transit = getTransitString(busStopArray, searchCondition.to);
            console.log("++++++++++++++++++++++++++Indirect+++++++++++++++++++++++++++++++" + transit);
            var reSearchCondition = reGenerateSearchCondition(searchCondition, busTimetable.timetable, transit);
            printBusTimetableArray("*****searchBus regenete*****", reSearchCondition, sortedLessThanEqualBusTimeTable);
            var tmpBusTimetableArray = searchBusTimetableArray(currentBusTimetableArray, currentBusTimetableArray, reSearchCondition, busStopArray);
            printBusTimetableArray("*********************************************XXXX*********", searchCondition, tmpBusTimetableArray);
            specifiedBusTimetableArray = mergeBusTimetableArray(specifiedBusTimetableArray, tmpBusTimetableArray);
            console.log("////////////////////////////");
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
    specifiedBusTimetableArray = searchBusTimetableArray(sortedLessThanEqualBusTimeTable, currentBusTimetableArray, searchCondition, busStopArray);
    process.exit(255);
    var lessThanEqualBusTimetableArray = extractLessEqualThanArrivalBusTimetableArray(prevBusTimetableArray, searchCondition);
    for (var _a = 0, lessThanEqualBusTimetableArray_1 = lessThanEqualBusTimetableArray; _a < lessThanEqualBusTimetableArray_1.length; _a++) {
        var tmpLessThanEqualBusTimetableArray = lessThanEqualBusTimetableArray_1[_a];
    }
    printBusTimetableArray("*****lessthan*****", searchCondition, lessThanEqualBusTimetableArray);
    var removedNonDepartureBusTimetableArray = removeNonDepartureBusTimetableArray(lessThanEqualBusTimetableArray, searchCondition);
    printBusTimetableArray("*****removed*****", searchCondition, removedNonDepartureBusTimetableArray);
    if (removedNonDepartureBusTimetableArray.length === 0) {
        var tmpBusTimetableArray = getTransitBusTimetableArray(lessThanEqualBusTimetableArray, currentBusTimetableArray, searchCondition, busStopArray, depth + 1);
        specifiedBusTimetableArray = mergeBusTimetableArray(specifiedBusTimetableArray, tmpBusTimetableArray);
        return specifiedBusTimetableArray;
    }
    else {
        var sortedBusTimetableArray = sortingArrivalBusTimetableArray(removedNonDepartureBusTimetableArray, searchCondition);
        printBusTimetableArray("*****sorted*****", searchCondition, sortedBusTimetableArray);
        var tmpBusTimetableArray = sortedBusTimetableArray;
        specifiedBusTimetableArray = mergeBusTimetableArray(specifiedBusTimetableArray, tmpBusTimetableArray);
        return specifiedBusTimetableArray;
    }
    /*
    if (sortedBusTimetableArray.length!==0){
        const transit=getTransitString(busStopArray,searchCondition.to);
        const departureStartingPointTime =  removeNonDepartureBusTimetableArray(sortedBusTimetableArray,searchCondition);
        if (departureStartingPointTime.length===0){
            if ( transit!=="none"){
                const reSearchCondition = reGenerateSearchCondition(searchCondition,sortedBusTimetableArray[0].timetable,transit);
                const tmpResult = getBusTimetableArray(busTimetableArray,reSearchCondition,busStopArray);
                printBusTimetableArray("*****tmpResult*****",reSearchCondition,tmpResult);
                const mergedBusTimetableArray = mergeBusTimetableArray(tmpResult,[sortedBusTimetableArray[0]]);
                printBusTimetableArray("*****merged*****",reSearchCondition,mergedBusTimetableArray);
                return mergedBusTimetableArray;
            }else{
                printBusTimetableArray("hasDeparture",searchCondition,sortedBusTimetableArray);
                return [sortedBusTimetableArray[0]];
            };
        }else{
            return [sortedBusTimetableArray[0]];
        };
    }else{
        return [];
    };
    */
    return specifiedBusTimetableArray;
}
;
/*
const result = getBusTimetableArray(targetBusTimetableArray,targetBusTimetableArray,targetSearchCondition,busStopArray,0);
printBusTimetableArray("******resrut******",targetSearchCondition,result);
*/
function searchBusStopIndex(busStopArray, condString) {
    var index = 0;
    for (var _i = 0, busStopArray_5 = busStopArray; _i < busStopArray_5.length; _i++) {
        var busStop = busStopArray_5[_i];
        if (busStop.busStop === condString) {
            return index;
        }
        ;
        index++;
    }
    return -1;
}
;
function printNextHop(busStopArray) {
    for (var _i = 0, busStopArray_6 = busStopArray; _i < busStopArray_6.length; _i++) {
        var busStop = busStopArray_6[_i];
        console.log(busStop);
    }
    ;
}
;
function createAscendingNetworkGraph(busStopArray) {
    var graph = [];
    for (var outer = 0; outer < busStopArray.length; outer++) {
        graph[outer] = [];
        for (var inner = 0; inner < busStopArray.length; inner++) {
            graph[outer][inner] = 0;
        }
        ;
    }
    ;
    for (var _i = 0, busStopArray_7 = busStopArray; _i < busStopArray_7.length; _i++) {
        var busStop = busStopArray_7[_i];
        var resultOuterIndex = searchBusStopIndex(busStopArray, busStop.busStop);
        if (resultOuterIndex !== -1) {
            for (var _a = 0, _b = busStop.ascending; _a < _b.length; _a++) {
                var asceding = _b[_a];
                var resultInnerIndex = searchBusStopIndex(busStopArray, asceding.nexthop);
                if (resultInnerIndex !== -1) {
                    graph[resultOuterIndex][resultInnerIndex] = 1;
                }
            }
            ;
        }
    }
    ;
    return graph;
}
;
function createDescendingNetworkGraph(busStopArray) {
    var graph = [];
    for (var outer = 0; outer < busStopArray.length; outer++) {
        graph[outer] = [];
        for (var inner = 0; inner < busStopArray.length; inner++) {
            graph[outer][inner] = 0;
        }
        ;
    }
    ;
    for (var _i = 0, busStopArray_8 = busStopArray; _i < busStopArray_8.length; _i++) {
        var busStop = busStopArray_8[_i];
        var resultOuterIndex = searchBusStopIndex(busStopArray, busStop.busStop);
        if (resultOuterIndex !== -1) {
            for (var _a = 0, _b = busStop.descending; _a < _b.length; _a++) {
                var descending = _b[_a];
                var resultInnerIndex = searchBusStopIndex(busStopArray, descending.nexthop);
                if (resultInnerIndex !== -1) {
                    graph[resultOuterIndex][resultInnerIndex] = 1;
                }
            }
            ;
        }
    }
    ;
    return graph;
}
;
function calcWeight(from, to) {
    var INF = Number.MAX_SAFE_INTEGER;
    return [];
}
;
function dijkstra(graph, busStopArray, from, to) {
    return [];
}
