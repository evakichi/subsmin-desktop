import * as fs from "fs";
type BusType = {
	busType: string;
	ja: string;
	en: string;
};
type BusStop = {
	busStop: string;
	ja: string;
	en: string;
};
type BusTimetable = {
	busType: string;
	opration: string;
	option: string;
	direction: string;
	startingPoint: string;
	destination: string;
	carNo:string;
	timetable: Timetable[];
};
type Timetable = {
	busStop: string;
	departure: string;
	arrival: string;
};

type SearchCondition ={
	busType:string;
	from:string;
	to:string;
	departureOrArrival:string;
	direction:string;
	time:string;
};

type SearchResult ={
	searchCondition:SearchCondition;
	busTimeTable?:BusTimetable[];
};
const inputBusType: string = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusType.json", 'utf-8');
const busTypeArray: BusType[] = JSON.parse(inputBusType);
const inputBusStop: string = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusStop.json", 'utf-8');
const busStopArray: BusStop[] = JSON.parse(inputBusStop);
const inputBusTimetable: string = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusTimetable.json", 'utf-8');
const busTimetableArray: BusTimetable[] = JSON.parse(inputBusTimetable);
const inputSearchCondition: string = fs.readFileSync("/home/evakichi/subsmin-desktop/testSearchCondition.json", 'utf-8');
const searchCondition:SearchCondition = JSON.parse(inputSearchCondition);

console.log(searchCondition);

function printBusTimetableArray(busTimetableArray:BusTimetable[]){
	for (let busTimetable of busTimetableArray){
		console.log(busTimetable);
	}
};

function toTime(timeSrting: string): Date {
	const hour = parseInt(timeSrting.slice(0, 2));
	const minute = parseInt(timeSrting.slice(2, 4));
	const now = new Date();
	return new Date((now.getUTCMonth() + 1) + " " + now.getUTCDate() + ", " + now.getUTCFullYear() + " " + hour + ":" + minute + ":00");
};

function swapBusTimetable(specifiedBusTimetableArray:BusTimetable[],i:number,j:number):void{
	const tmpSpecifiedBusTimetable = specifiedBusTimetableArray[i];
	specifiedBusTimetableArray[i] = specifiedBusTimetableArray[j];
	specifiedBusTimetableArray[j] = tmpSpecifiedBusTimetable;
};

function getArrivalTimeString(timeTableArray:Timetable[],busStop:string):string{
	console.log("getArrivalTimeString");
	let specifiedTime:string = "none";
	for (let timetable of timeTableArray){
		if (timetable.busStop === busStop && timetable.arrival !== "none"){
			specifiedTime = timetable.arrival;
		}
	}	
	return specifiedTime;
};

function getDepatureTimeString(timeTableArray:Timetable[],busStop:string):string{
	console.log("getDepatureTimeString");
	let specifiedTime:string = "none";
	for (let timetable of timeTableArray){
		if (timetable.busStop === busStop && timetable.departure !== "none"){
			specifiedTime = timetable.arrival;
		}
	}	
	return specifiedTime;
};

function extractBusTypeBusTimetableArray(busTimetableArray: BusTimetable[], busType:string): BusTimetable[] {
	console.log("extractSpecifiedBusTypeTimetableArray");
	let index = 0;
	let specifiedBusTimetableArray: BusTimetable[] = [];
	for (let busTimetable of busTimetableArray) {
		if (busTimetable.busType === busType) {
			specifiedBusTimetableArray[index++] = busTimetable;
		};
	};
	return specifiedBusTimetableArray;
};

function extractDirectionBusTimetableArray(busTimetableArray: BusTimetable[], direction:string): BusTimetable[] {
	console.log("extractSpecifiedDirectionTimetableArray");
	let index = 0;
	let specifiedBusTimetableArray: BusTimetable[] = [];
	for (let busTimetable of busTimetableArray) {
		if (busTimetable.direction === direction) {
			specifiedBusTimetableArray[index++] = busTimetable;
		};
	};
	return specifiedBusTimetableArray;
};

function extractLessThanBusTimetableArray(busTimetableArray: BusTimetable[], busStop:string,time:string): BusTimetable[] {
	console.log("extractLessThanArrivalTimetableArray");
	let index = 0;
	let specifiedBusTimetableArray: BusTimetable[] = [];
	for (let busTimetable of busTimetableArray) {
		let flag = false;
		for (let timetable of busTimetable.timetable){
			const arrival = timetable.arrival;
			if (timetable.busStop ===  busStop && (arrival !== "none" && toTime(arrival) <= toTime(time))){
				flag = true;
			};
		};
		if(flag){
			specifiedBusTimetableArray[index++] = busTimetable;
		};
	};
	return specifiedBusTimetableArray;
};

function extractGraterThanBusTimetableArray(busTimetableArray: BusTimetable[], busStop:string,time:string): BusTimetable[] {
	console.log("extractGraterThanBusTimetableArray");
	let index = 0;
	let specifiedBusTimetableArray: BusTimetable[] = [];
	for (let busTimetable of busTimetableArray) {
		let flag = false;
		for (let timetable of busTimetable.timetable){
			const departure = timetable.departure;
			if (timetable.busStop ===  busStop && (departure !== "none" && toTime(departure) >= toTime(time))){
				flag = true;
			};
		};
		if(flag){
			specifiedBusTimetableArray[index++] = busTimetable;
		};
	};
	return specifiedBusTimetableArray;
};

function sortingArrivalBusTimetableArray(busTimetableArray: BusTimetable[],busStop:string,time:string): BusTimetable[] {
	
	console.log("sortingBusTimetableArray");
	let specifiedBusTimetableArray:BusTimetable[]=busTimetableArray;

	for (let outer = 0; outer < specifiedBusTimetableArray.length ; outer++)
	{
		let current = outer;
		for (let inner = outer + 1; inner < specifiedBusTimetableArray.length ; inner++){
			if(toTime(getArrivalTimeString(specifiedBusTimetableArray[current].timetable,busStop)) < toTime(getArrivalTimeString(specifiedBusTimetableArray[inner].timetable,busStop))){
				current = inner;
			}
		};
		swapBusTimetable(specifiedBusTimetableArray,current,outer);
	};
	return specifiedBusTimetableArray;
};

function sortingDepartureBusTimetableArray(busTimetableArray: BusTimetable[],busStop:string,time:string): BusTimetable[] {
	
	console.log("sortingBusTimetableArray");
	let specifiedBusTimetableArray:BusTimetable[]=busTimetableArray;

	for (let outer = 0; outer < specifiedBusTimetableArray.length ; outer++)
	{
		let current = outer;
		for (let inner = outer + 1; inner < specifiedBusTimetableArray.length ; inner++){
			if(toTime(getArrivalTimeString(specifiedBusTimetableArray[current].timetable,busStop)) > toTime(getArrivalTimeString(specifiedBusTimetableArray[inner].timetable,busStop))){
				current = inner;
			}
		};
		swapBusTimetable(specifiedBusTimetableArray,current,outer);
	};
	return specifiedBusTimetableArray;
};

function getResult(busTimetableArray:BusTimetable[],searchCondition:SearchCondition):BusTimetable[]{
	const busTypeBusTimetableArray = extractBusTypeBusTimetableArray(busTimetableArray, searchCondition.busType);
	const directedBusTimetableArray = extractDirectionBusTimetableArray(busTypeBusTimetableArray,searchCondition.direction);
	if (searchCondition.departureOrArrival === "arrival"){
		const lessThanBusTimetableArray = extractLessThanBusTimetableArray(directedBusTimetableArray,searchCondition.to,searchCondition.time);
		printBusTimetableArray(lessThanBusTimetableArray);
		const sortedBusTimetableArray = sortingArrivalBusTimetableArray(lessThanBusTimetableArray,searchCondition.to,searchCondition.time);
		printBusTimetableArray(sortedBusTimetableArray);
		const result:BusTimetable[]=[sortedBusTimetableArray[0]];
		return result;
	}else{
		const graterThanBusTimetableArray = extractGraterThanBusTimetableArray(directedBusTimetableArray,searchCondition.from,searchCondition.time);
		printBusTimetableArray(graterThanBusTimetableArray);
		const sortedBusTimetableArray = sortingDepartureBusTimetableArray(graterThanBusTimetableArray,searchCondition.from,searchCondition.time);
		printBusTimetableArray(sortedBusTimetableArray);
		const result:BusTimetable[]=[sortedBusTimetableArray[0]];
		return result;
	};
	return busTypeBusTimetableArray;
};

const result = getResult(busTimetableArray,searchCondition);
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