"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var inputBusType = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusType.json", 'utf-8');
var busTypeArray = JSON.parse(inputBusType);
var inputBusStop = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusStop.json", 'utf-8');
var busStopArray = JSON.parse(inputBusStop);
var inputBusTimetable = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusTimetable.json", 'utf-8');
var busTimetableArray = JSON.parse(inputBusTimetable);
var inputSearchCondition = fs.readFileSync("/home/evakichi/subsmin-desktop/testSearchCondition.json", 'utf-8');
var searchCondition = JSON.parse(inputSearchCondition);
console.log(searchCondition);
function printBusTimetableArray(busTimetableArray) {
    for (var _i = 0, busTimetableArray_1 = busTimetableArray; _i < busTimetableArray_1.length; _i++) {
        var busTimetable = busTimetableArray_1[_i];
        console.log(busTimetable);
    }
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
function getArrivalTimeString(timeTableArray, busStop) {
    console.log("getArrivalTimeString");
    var specifiedTime = "none";
    for (var _i = 0, timeTableArray_1 = timeTableArray; _i < timeTableArray_1.length; _i++) {
        var timetable = timeTableArray_1[_i];
        if (timetable.busStop === busStop && timetable.arrival !== "none") {
            specifiedTime = timetable.arrival;
        }
    }
    return specifiedTime;
}
;
function getDepatureTimeString(timeTableArray, busStop) {
    console.log("getDepatureTimeString");
    var specifiedTime = "none";
    for (var _i = 0, timeTableArray_2 = timeTableArray; _i < timeTableArray_2.length; _i++) {
        var timetable = timeTableArray_2[_i];
        if (timetable.busStop === busStop && timetable.departure !== "none") {
            specifiedTime = timetable.arrival;
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
function extractLessThanBusTimetableArray(busTimetableArray, busStop, time) {
    console.log("extractLessThanArrivalTimetableArray");
    var index = 0;
    var specifiedBusTimetableArray = [];
    for (var _i = 0, busTimetableArray_4 = busTimetableArray; _i < busTimetableArray_4.length; _i++) {
        var busTimetable = busTimetableArray_4[_i];
        var flag = false;
        for (var _a = 0, _b = busTimetable.timetable; _a < _b.length; _a++) {
            var timetable = _b[_a];
            var arrival = timetable.arrival;
            if (timetable.busStop === busStop && (arrival !== "none" && toTime(arrival) <= toTime(time))) {
                flag = true;
            }
            ;
        }
        ;
        if (flag) {
            specifiedBusTimetableArray[index++] = busTimetable;
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
}
;
function extractGraterThanBusTimetableArray(busTimetableArray, busStop, time) {
    console.log("extractGraterThanBusTimetableArray");
    var index = 0;
    var specifiedBusTimetableArray = [];
    for (var _i = 0, busTimetableArray_5 = busTimetableArray; _i < busTimetableArray_5.length; _i++) {
        var busTimetable = busTimetableArray_5[_i];
        var flag = false;
        for (var _a = 0, _b = busTimetable.timetable; _a < _b.length; _a++) {
            var timetable = _b[_a];
            var departure = timetable.departure;
            if (timetable.busStop === busStop && (departure !== "none" && toTime(departure) >= toTime(time))) {
                flag = true;
            }
            ;
        }
        ;
        if (flag) {
            specifiedBusTimetableArray[index++] = busTimetable;
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
}
;
function sortingArrivalBusTimetableArray(busTimetableArray, busStop, time) {
    console.log("sortingBusTimetableArray");
    var specifiedBusTimetableArray = busTimetableArray;
    for (var outer = 0; outer < specifiedBusTimetableArray.length; outer++) {
        var current = outer;
        for (var inner = outer + 1; inner < specifiedBusTimetableArray.length; inner++) {
            if (toTime(getArrivalTimeString(specifiedBusTimetableArray[current].timetable, busStop)) < toTime(getArrivalTimeString(specifiedBusTimetableArray[inner].timetable, busStop))) {
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
function sortingDepartureBusTimetableArray(busTimetableArray, busStop, time) {
    console.log("sortingBusTimetableArray");
    var specifiedBusTimetableArray = busTimetableArray;
    for (var outer = 0; outer < specifiedBusTimetableArray.length; outer++) {
        var current = outer;
        for (var inner = outer + 1; inner < specifiedBusTimetableArray.length; inner++) {
            if (toTime(getArrivalTimeString(specifiedBusTimetableArray[current].timetable, busStop)) > toTime(getArrivalTimeString(specifiedBusTimetableArray[inner].timetable, busStop))) {
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
function getResult(busTimetableArray, searchCondition) {
    var busTypeBusTimetableArray = extractBusTypeBusTimetableArray(busTimetableArray, searchCondition.busType);
    var directedBusTimetableArray = extractDirectionBusTimetableArray(busTypeBusTimetableArray, searchCondition.direction);
    if (searchCondition.departureOrArrival === "arrival") {
        var lessThanBusTimetableArray = extractLessThanBusTimetableArray(directedBusTimetableArray, searchCondition.to, searchCondition.time);
        printBusTimetableArray(lessThanBusTimetableArray);
        var sortedBusTimetableArray = sortingArrivalBusTimetableArray(lessThanBusTimetableArray, searchCondition.to, searchCondition.time);
        printBusTimetableArray(sortedBusTimetableArray);
        var result_1 = [sortedBusTimetableArray[0]];
        return result_1;
    }
    else {
        var graterThanBusTimetableArray = extractGraterThanBusTimetableArray(directedBusTimetableArray, searchCondition.from, searchCondition.time);
        printBusTimetableArray(graterThanBusTimetableArray);
        var sortedBusTimetableArray = sortingDepartureBusTimetableArray(graterThanBusTimetableArray, searchCondition.from, searchCondition.time);
        printBusTimetableArray(sortedBusTimetableArray);
        var result_2 = [sortedBusTimetableArray[0]];
        return result_2;
    }
    ;
    return busTypeBusTimetableArray;
}
;
var result = getResult(busTimetableArray, searchCondition);
console.log("*****result*****");
printBusTimetableArray(result);
/*
const ascendingNimsBusTimetableArray = extractSpecifiedDirection(nimsBusTypeTimetableArray, searchCondition);
const nimsBusDepatureTimetableArray = extractDepartureTime(ascendingNimsBusTimetableArray,searchCondition);
const nimsBusArrivalTimetableArray = extractArrivalTime(ascendingNimsBusTimetableArray,searchCondition);
const nimsBusArrivalTimetableArray = extractLessThanArrivalTime(ascendingNimsBusTimetableArray,searchCondition);

const destinationTimetableArray = extractSpecifiedDestination(ascendingNimsBusTimetableArray, searchCondition);
const descendingSortedArrivalTimeArray = sortingTimetable(destinationTimetableArray,searchCondition);
const result = getLastResult(descendingSortedArrivalTimeArray,searchCondition);
if (descendingSortedArrivalTimeArray.length != 0)
{
    console.log("*****arrival time result*****");
    console.log(result);
    console.log("*****arrival time result*****");
};
*/ 
