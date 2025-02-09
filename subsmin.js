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
function getArrivalTimeString(timeTableArray, busStop, time) {
    console.log("getDestinationTimeString");
    var specifiedTime = "none";
    console.log(searchCondition.departureOrArrival + " " + searchCondition.to);
    for (var _i = 0, timeTableArray_1 = timeTableArray; _i < timeTableArray_1.length; _i++) {
        var timetable = timeTableArray_1[_i];
        if (timetable.busStop === busStop && timetable.arrival !== "none") {
            specifiedTime = timetable.arrival;
        }
    }
    return specifiedTime;
}
;
function extractDepartureTime(busTimetableArray, searchCondition) {
    console.log("extractSpecifiedDestination");
    var specifiedBusTimetableArray = [];
    var index = 0;
    for (var _i = 0, busTimetableArray_2 = busTimetableArray; _i < busTimetableArray_2.length; _i++) {
        var busTimetable = busTimetableArray_2[_i];
        for (var _a = 0, _b = busTimetable.timetable; _a < _b.length; _a++) {
            var timetable = _b[_a];
            if (timetable.departure === searchCondition.from) {
                specifiedBusTimetableArray[index++] = busTimetable;
            }
            ;
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
}
;
function extractArrivalTime(busTimetableArray, searchCondition) {
    console.log("extractSpecifiedDestination");
    var specifiedBusTimetableArray = [];
    var index = 0;
    for (var _i = 0, busTimetableArray_3 = busTimetableArray; _i < busTimetableArray_3.length; _i++) {
        var busTimetable = busTimetableArray_3[_i];
        for (var _a = 0, _b = busTimetable.timetable; _a < _b.length; _a++) {
            var timetable = _b[_a];
            if (timetable.arrival === searchCondition.to) {
                specifiedBusTimetableArray[index++] = busTimetable;
            }
            ;
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
}
;
function extractSpecifiedBusTypeTimetableArray(busTimetableArray, busType) {
    console.log("extractSpecifiedBusTypeTimetableArray");
    var index = 0;
    var specifiedBusTimetableArray = [];
    for (var _i = 0, busTimetableArray_4 = busTimetableArray; _i < busTimetableArray_4.length; _i++) {
        var busTimetable = busTimetableArray_4[_i];
        if (busTimetable.busType === busType) {
            console.log(busTimetable.timetable);
            specifiedBusTimetableArray[index++] = busTimetable;
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
}
;
function extractSpecifiedDirectionBusTimetableArray(busTimetableArray, direction) {
    console.log("extractSpecifiedDirectionTimetableArray");
    var index = 0;
    var specifiedBusTimetableArray = [];
    for (var _i = 0, busTimetableArray_5 = busTimetableArray; _i < busTimetableArray_5.length; _i++) {
        var busTimetable = busTimetableArray_5[_i];
        if (busTimetable.direction === direction) {
            console.log(busTimetable.timetable);
            specifiedBusTimetableArray[index++] = busTimetable;
        }
        ;
    }
    ;
    return specifiedBusTimetableArray;
}
;
function extractLessThanArrivalBusTimetableArray(busTimetableArray, busStopCond, timeCond) {
    console.log("extractLessThanArrivalTimetableArray");
    var index = 0;
    var specifiedBusTimetableArray = [];
    for (var _i = 0, busTimetableArray_6 = busTimetableArray; _i < busTimetableArray_6.length; _i++) {
        var busTimetable = busTimetableArray_6[_i];
        var flag = false;
        for (var _a = 0, _b = busTimetable.timetable; _a < _b.length; _a++) {
            var timetable = _b[_a];
            var arrival = timetable.arrival;
            var busStop = timetable.busStop;
            if (busStop === busStopCond && (arrival !== "none" && toTime(arrival) < toTime(timeCond))) {
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
            if (toTime(getArrivalTimeString(specifiedBusTimetableArray[current].timetable, busStop, time)) < toTime(getArrivalTimeString(specifiedBusTimetableArray[inner].timetable, busStop, time))) {
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
    var busTypeTimetableArray = extractSpecifiedBusTypeTimetableArray(busTimetableArray, searchCondition.busType);
    if (searchCondition.departureOrArrival === "arrival") {
        if (searchCondition.direction === "descending") {
        }
        else {
            var ascendingBusTimetableArray = extractSpecifiedDirectionBusTimetableArray(busTypeTimetableArray, searchCondition.direction);
            if (ascendingBusTimetableArray.length !== 0) {
                var lessThanArrivalAscedingBusTimetableArray = extractLessThanArrivalBusTimetableArray(ascendingBusTimetableArray, searchCondition.to, searchCondition.time);
                printBusTimetableArray(lessThanArrivalAscedingBusTimetableArray);
                if (lessThanArrivalAscedingBusTimetableArray.length !== 0) {
                    var sortedLessThanArrivalAscedingBusTimetableArray = sortingArrivalBusTimetableArray(lessThanArrivalAscedingBusTimetableArray, searchCondition.to, searchCondition.time);
                    printBusTimetableArray(sortedLessThanArrivalAscedingBusTimetableArray);
                    if (sortedLessThanArrivalAscedingBusTimetableArray.length !== 0) {
                        var result = [sortedLessThanArrivalAscedingBusTimetableArray[0]];
                        return result;
                    }
                    ;
                }
                ;
            }
            ;
            return [];
        }
        ;
    }
    else {
        if (searchCondition.direction === "descending") {
        }
        else {
        }
        ;
    }
    ;
    return busTypeTimetableArray;
}
;
var results = getResult(busTimetableArray, searchCondition);
console.log("*****result*****");
for (var _i = 0, _a = results.reverse(); _i < _a.length; _i++) {
    var result = _a[_i];
    console.log(result);
}
;
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
