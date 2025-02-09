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

function getArrivalTimeString(timeTableArray:Timetable[],busStop:string,time:string):string{
	console.log("getDestinationTimeString");
	let specifiedTime:string = "none";
	console.log(searchCondition.departureOrArrival+" "+searchCondition.to);
	for (let timetable of timeTableArray){
		if (timetable.busStop === busStop && timetable.arrival !== "none"){
			specifiedTime = timetable.arrival;
		}
	}	
	return specifiedTime;
};


function extractDepartureTime(busTimetableArray:BusTimetable[],searchCondition:SearchCondition):BusTimetable[]{
	console.log("extractSpecifiedDestination");
	let specifiedBusTimetableArray:BusTimetable[]=[];
	let index = 0;
	for (let busTimetable of busTimetableArray){
		for (let timetable of busTimetable.timetable){
			if (timetable.departure === searchCondition.from){
				specifiedBusTimetableArray[index++]=busTimetable;
			};
		};
	};
	return specifiedBusTimetableArray;
};

function extractArrivalTime(busTimetableArray:BusTimetable[],searchCondition:SearchCondition):BusTimetable[]{
	console.log("extractSpecifiedDestination");
	let specifiedBusTimetableArray:BusTimetable[]=[];
	let index = 0;
	for (let busTimetable of busTimetableArray){
		for (let timetable of busTimetable.timetable){
			if (timetable.arrival === searchCondition.to){
				specifiedBusTimetableArray[index++]=busTimetable;
			};
		};
	};
	return specifiedBusTimetableArray;
};

function extractSpecifiedBusTypeTimetableArray(busTimetableArray: BusTimetable[], busType:string): BusTimetable[] {
	console.log("extractSpecifiedBusTypeTimetableArray");
	let index = 0;
	let specifiedBusTimetableArray: BusTimetable[] = [];
	for (let busTimetable of busTimetableArray) {
		if (busTimetable.busType === busType) {
			console.log(busTimetable.timetable);
			specifiedBusTimetableArray[index++] = busTimetable;
		};
	};
	return specifiedBusTimetableArray;
};

function extractSpecifiedDirectionBusTimetableArray(busTimetableArray: BusTimetable[], direction:string): BusTimetable[] {
	console.log("extractSpecifiedDirectionTimetableArray");
	let index = 0;
	let specifiedBusTimetableArray: BusTimetable[] = [];
	for (let busTimetable of busTimetableArray) {
		if (busTimetable.direction === direction) {
			console.log(busTimetable.timetable);
			specifiedBusTimetableArray[index++] = busTimetable;
		};
	};
	return specifiedBusTimetableArray;
};

function extractLessThanArrivalBusTimetableArray(busTimetableArray: BusTimetable[], busStopCond:string,timeCond:string): BusTimetable[] {
	console.log("extractLessThanArrivalTimetableArray");
	let index = 0;
	let specifiedBusTimetableArray: BusTimetable[] = [];
	for (let busTimetable of busTimetableArray) {
		let flag = false;
		for (let timetable of busTimetable.timetable){
			const arrival = timetable.arrival;
			const busStop = timetable.busStop;
			if ( busStop ===  busStopCond && (arrival !== "none" && toTime(arrival) < toTime(timeCond))){
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
			if(toTime(getArrivalTimeString(specifiedBusTimetableArray[current].timetable,busStop,time)) < toTime(getArrivalTimeString(specifiedBusTimetableArray[inner].timetable,busStop,time))){
				current = inner;
			}
		};
		swapBusTimetable(specifiedBusTimetableArray,current,outer);
	};
	return specifiedBusTimetableArray;
};

function getResult(busTimetableArray:BusTimetable[],searchCondition:SearchCondition):BusTimetable[]{
	const busTypeTimetableArray = extractSpecifiedBusTypeTimetableArray(busTimetableArray, searchCondition.busType);
	if (searchCondition.departureOrArrival === "arrival"){
		if(searchCondition.direction === "descending"){

		}else{
			const ascendingBusTimetableArray = extractSpecifiedDirectionBusTimetableArray(busTypeTimetableArray,searchCondition.direction);
			if(ascendingBusTimetableArray.length!==0){
				const lessThanArrivalAscedingBusTimetableArray = extractLessThanArrivalBusTimetableArray(ascendingBusTimetableArray,searchCondition.to,searchCondition.time);
				printBusTimetableArray(lessThanArrivalAscedingBusTimetableArray);
				if (lessThanArrivalAscedingBusTimetableArray.length!==0){
					const sortedLessThanArrivalAscedingBusTimetableArray = sortingArrivalBusTimetableArray(lessThanArrivalAscedingBusTimetableArray,searchCondition.to,searchCondition.time);
					printBusTimetableArray(sortedLessThanArrivalAscedingBusTimetableArray);
					if (sortedLessThanArrivalAscedingBusTimetableArray.length!==0){
						const result:BusTimetable[]=[sortedLessThanArrivalAscedingBusTimetableArray[0]];
						return result;
					};
				};
			};
			return [];
		};
	}else{
		if(searchCondition.direction === "descending"){
			
		}else{

		};
	};
	return busTypeTimetableArray;
};

const results = getResult(busTimetableArray,searchCondition);
console.log("*****result*****");
for (let result of results.reverse()){
	console.log(result);
};
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