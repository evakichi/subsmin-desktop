import { time } from "console";
import { StartLoggingOptions } from "electron";
import * as fs from "fs";
import { maxHeaderSize } from "http";

console.log("******");

type BusType = {
	busType: string;
	ja: string;
	en: string;
};

type BusStop = {
	busStop: string;
	ja: string;
	en: string;
	ascending:NextHop[];
	descending:NextHop[];
};

type NextHop = {
	nexthop:string;
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
	arrival: string;
	departure: string;
};

type SearchCondition ={
	fromString:string;
	toString:string;
	time:string;
};

type SearchResult ={
	searchCondition:SearchCondition;
	busTimeTable?:BusTimetable[];
};

const noneBusTimeTable:BusTimetable={
	busType:"None",
	opration:"None",
	option:"None",
	direction:"None",
	startingPoint:"None",
	destination:"None",
	carNo:"None",
	timetable: [],
};

const noneTimetable:Timetable={
	departure:"INF",
	arrival:"INF",
	busStop:"None",
}

const inputBusType: string = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusType.json", 'utf-8');
const targetBusTypeArray: BusType[] = JSON.parse(inputBusType);
const inputBusStop: string = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusStop.json", 'utf-8');
const targetBusStopArray: BusStop[] = JSON.parse(inputBusStop);
const inputBusTimetable: string = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusTimetable.json", 'utf-8');
const targetBusTimetableArray: BusTimetable[] = JSON.parse(inputBusTimetable);
const inputSearchCondition: string = fs.readFileSync("/home/evakichi/subsmin-desktop/testSearchCondition.json", 'utf-8');
const targetSearchCondition:SearchCondition = JSON.parse(inputSearchCondition);

console.log(targetSearchCondition);
const busTimetableArray = find(targetBusStopArray,targetBusTimetableArray,targetSearchCondition);
printBusTimetableArray("*****result*****",targetSearchCondition,busTimetableArray);

function getNodesMatrix(busStopArray:BusStop[],nodes:string[]):number[][]{
	let matrix:number[][]=[];

	for (let outer = 0 ; outer < nodes.length ; outer++){
		matrix[outer]=[];
		for (let inner = 0 ; inner < nodes.length ; inner++){
			matrix[outer][inner]=0;
		};
	};

	for(let outer = 0; outer < nodes.length ; outer++){
		for (let asceding of busStopArray[outer].ascending){
			matrix[outer][nodes.indexOf(asceding.nexthop)]=1
		};
	};

	for(let outer = 0; outer < nodes.length ; outer++){
		for (let desceding of busStopArray[outer].descending){
			matrix[outer][nodes.indexOf(desceding.nexthop)]=1
		};
	};
	return matrix;
};

function getAllNodes(busStopArray:BusStop[]):string[]{
	let nodes:string[]=[];
	for (let busStop of busStopArray){
		nodes[nodes.length]=busStop.busStop;
	};
	return nodes;
};

function getNextHops(edge:number[]):number[]{
	let result:number[]=[]
	for(let i = 0; i < edge.length ; i++)
	{
		if(edge[i]!==0)
		{
			result[result.length]=i;
		}
	}
	return result;
};

function chmin(a:number,b:number):boolean{
	if (a>b){
		a=b;
		return true;
	};
	return false;
};

function getNearestArrivalBustmeTable(busTimetableArray:BusTimetable[],reSearchCondition:SearchCondition):Timetable{
	let timetable:Timetable={
		arrival:"INF",
		departure:"INF",
		busStop:reSearchCondition.fromString,
	};
	const graterEqualThanDepartureTimetableArray:BusTimetable[]=extractGraterEqualThanDepartureBusTimetableArray(busTimetableArray,reSearchCondition);
	const sortedGraterEqualThanDepartureTimetableArray:BusTimetable[]=sortingDepartureBusTimetableArray(graterEqualThanDepartureTimetableArray,reSearchCondition);
	if (sortedGraterEqualThanDepartureTimetableArray.length !==0){
		if(sortedGraterEqualThanDepartureTimetableArray[0].busType==="walk"){
			//console.log("**************************************walk**************************************");
			const arrivalTime:string = addWalkTime(reSearchCondition.time,getArrivalTimeString(sortedGraterEqualThanDepartureTimetableArray[0].timetable,reSearchCondition));
			//console.log(arrivalTime);
			timetable.departure=reSearchCondition.time;
			timetable.arrival=arrivalTime;
		}else{
			//console.log("**************************************bus**************************************");
			const departureTime:string=getDepartureTimeString(sortedGraterEqualThanDepartureTimetableArray[0].timetable,reSearchCondition);
			const arrivalTime:string=getArrivalTimeString(sortedGraterEqualThanDepartureTimetableArray[0].timetable,reSearchCondition);
			//console.log(arrivalTime);
			timetable.departure=departureTime;
			timetable.arrival=arrivalTime;
		};
		return timetable;
	}
	return noneTimetable;
};

function getNearestArrivalBustmeTableArray(nodes:string[],busTimetableVector:BusTimetable[],searchCondition:SearchCondition):Timetable[][]{
	let busTimetableArray:Timetable[][]=[];
	for(let from = 0 ; from < nodes.length ; from++){
		busTimetableArray[from]=[];
		for(let to = 0 ; to < nodes.length ; to++){
			const reSearchCondition:SearchCondition={
				fromString:nodes[from],
				toString:nodes[to],
				time:searchCondition.time,
			};
			busTimetableArray[from][to]=getNearestArrivalBustmeTable(busTimetableVector,reSearchCondition);
		};
	};
	console.log();
	return busTimetableArray;
};

function printTimeTableArray(timetableArray:Timetable[][]):void{
	let timeTableStrignArray:string[][]=[];

	for (let outer=0;outer<timetableArray.length;outer++){
		timeTableStrignArray[outer]=[];
		for (let inner = 0 ; inner < timetableArray.length ; inner++)
		{
			timeTableStrignArray[outer][inner]=timetableArray[outer][inner].departure+"->"+timetableArray[outer][inner].arrival;
		};
	};
	console.table(timeTableStrignArray);
};

function dijkstra(nodes:string[],busTimetableArray:BusTimetable[],searchCondition:SearchCondition):string[]{
	let timetableArray:Timetable[][]=getNearestArrivalBustmeTableArray(nodes,busTimetableArray,searchCondition);
	let timetableVector:Timetable[]=[];
	let used:boolean[]=new Array(nodes.length).fill(false);
	let path:number[]=new Array(nodes.length).fill(-1);
	let r:number[]=[];
	let route:string[]=[];
	const fromNumber=nodes.indexOf(searchCondition.fromString);
	const toNumber=nodes.indexOf(searchCondition.toString);
	console.table(nodes);
	printTimeTableArray(timetableArray);

	for (let index=0;index<nodes.length;index++){
		timetableVector[index]={...noneTimetable};
	};

	timetableVector[fromNumber].departure=searchCondition.time;
	timetableVector[fromNumber].arrival=searchCondition.time;
	console.table(timetableVector);

	for (let outer = 0 ; outer < nodes.length ; outer++){
		let min_dist:Timetable=noneTimetable;
		let min_v:number = -1;
		for (let v = 0 ; v < nodes.length ; v++){
			if(!used[v] && toTime(timetableVector[v].arrival) < toTime(min_dist.arrival)){
				min_v=v;
				min_dist=timetableVector[v];
			};
		};
		used[min_v] = true;

		console.log("used:");
		console.table(used);

		console.log("outer"+outer+" min_v"+min_v+" min_dist"+min_dist.arrival);
		console.table(timetableVector);

		if (min_dist === noneTimetable){
			break;
		};
		const reSearchCondition:SearchCondition={
			fromString:searchCondition.fromString,
			toString:searchCondition.toString,
			time:min_dist.departure,
		}
		let tmpTimetableArray:Timetable[][]=getNearestArrivalBustmeTableArray(nodes,busTimetableArray,reSearchCondition);
		for (let v = 0 ; v < nodes.length ; v++)
		{
			if(toTime(tmpTimetableArray[min_v][v].arrival)<toTime(timetableVector[v].arrival)){
				timetableVector[v]=tmpTimetableArray[min_v][v];
				path[v]=min_v;
			};
		};
		console.log("path:");
		console.table(path);
	};

	let result ="";
	for(let i = 0 ; i < nodes.length ; i++)
	{
		result += timetableVector[i].departure + " : " + i + " ";
		if(i===toNumber){
			r[r.length]=i;
			let p = i;
			while(path[p]!==-1)
			{
				r[r.length]=path[p];
				p=path[p];
			};
			const rev = r.reverse();
			for (let r of rev)
			{
				route[route.length]=nodes[r];
			};
		};
		let p = i;
		while(path[p]!==-1)
		{
			result += " <--" + path[p];
			p = path[p];
		}
		result += "\n";
	};
	console.log(result);
	return route;
};

function find(busStopArray:BusStop[],busTimetableArray:BusTimetable[],searchCondition:SearchCondition):BusTimetable[]{
	const nodes:string[]=getAllNodes(busStopArray);
	const matrix:number[][]=getNodesMatrix(busStopArray,nodes);
	const route:string[]=dijkstra(nodes,busTimetableArray,searchCondition);
	console.log("Route");
	console.table(route);
	return [];
};

function printBusTimetableArray(str:string,searchCondition:SearchCondition,busTimetableArray:BusTimetable[]){
	console.log(str+":start");
	console.log("*****conditon*****");
	console.log(searchCondition);
	console.log("+++++conditon+++++");
	for (let busTimetable of busTimetableArray){
		console.log(busTimetable);
	}
	console.log(str+":finish");
};

function toTime(timeSrting: string): Date {
	if (timeSrting === "INF"){
		return new Date(8.64e15);
	};
	if (timeSrting ==="0"){
		return new Date(0);
	};
	const minute = parseInt(timeSrting.slice(2, 4));
	const hour = parseInt(timeSrting.slice(0, 2));

	const now = new Date();
	now.setMinutes(minute);
	now.setHours(hour);
	//return new Date((now.getUTCMonth() + 1) + " " + now.getUTCDate() + ", " + now.getUTCFullYear() + " " + hour + ":" + minute + ":00");
	return now;
};

function addWalkTime(timeStringT: string,timeStringW:string): string {
	const hourT:number = parseInt(timeStringT.slice(0, 2));
	const hourW:number = parseInt(timeStringW.slice(0, 2))-25;
	const minuteT:number = parseInt(timeStringT.slice(2, 4));
	const minuteW:number = parseInt(timeStringW.slice(2, 4));

	let hour = hourT+hourW;
	let minute = minuteT+minuteW;
	minute=minute%60;
	hour+=Math.floor(minute/60);
	console.log(hour);
	console.log(minute);
	return hour.toString().padStart(2,"0")+minute.toString().padStart(2,"0");
};

function swapBusTimetable(specifiedBusTimetableArray:BusTimetable[],i:number,j:number):void{
	const tmpSpecifiedBusTimetable = specifiedBusTimetableArray[i];
	specifiedBusTimetableArray[i] = specifiedBusTimetableArray[j];
	specifiedBusTimetableArray[j] = tmpSpecifiedBusTimetable;
};

function getArrivalTimeString(timeTableArray:Timetable[],searchCondition:SearchCondition):string{
	for(let timetable of timeTableArray){
		if (timetable.busStop === searchCondition.toString && timetable.arrival !== "none"){
			return timetable.arrival;
		};
	};
	return "none";
};

function getDepartureTimeString(timeTableArray:Timetable[],searchCondition:SearchCondition):string{
	for(let timetable of timeTableArray){
		if (timetable.busStop === searchCondition.fromString && timetable.departure !== "none"){
			return timetable.departure;
		};
	};
	return "none";
};

function extractGraterEqualThanDepartureBusTimetableArray(busTimetableArray:BusTimetable[],searchCondition:SearchCondition):BusTimetable[]{
	let specifiedBusTimetableArray:BusTimetable[]=[];
	for (let busTimeTable of busTimetableArray){
		const departureTime:string=getDepartureTimeString(busTimeTable.timetable,searchCondition);
		const arrivalTime:string=getArrivalTimeString(busTimeTable.timetable,searchCondition);
		if (departureTime!=="none" && arrivalTime!=="none" && toTime(arrivalTime)>toTime(departureTime) && toTime(searchCondition.time)<=toTime(departureTime)){
			specifiedBusTimetableArray[specifiedBusTimetableArray.length]=busTimeTable;
		};
	};
	return specifiedBusTimetableArray;
};

function extractLessEqualThanArrivalBusTimetableArray(busTimetableArray:BusTimetable[],searchCondition:SearchCondition):BusTimetable[]{
	let specifiedBusTimetableArray:BusTimetable[]=[];
	for (let busTimeTable of busTimetableArray){
		const departureTime:string=getDepartureTimeString(busTimeTable.timetable,searchCondition);
		const arrivalTime:string=getArrivalTimeString(busTimeTable.timetable,searchCondition);
		if (departureTime!=="none" && arrivalTime!=="none" && toTime(arrivalTime)>toTime(departureTime) && toTime(searchCondition.time)>=toTime(arrivalTime)){
			specifiedBusTimetableArray[specifiedBusTimetableArray.length]=busTimeTable;
		};
	};
	return specifiedBusTimetableArray;
};


function sortingArrivalBusTimetableArray(busTimetableArray: BusTimetable[],searchCondition:SearchCondition): BusTimetable[] {

	let specifiedBusTimetableArray:BusTimetable[]=busTimetableArray;

	for (let outer = 0; outer < specifiedBusTimetableArray.length ; outer++)
	{
		let current = outer;
		for (let inner = outer + 1; inner < specifiedBusTimetableArray.length ; inner++){
			if(toTime(getArrivalTimeString(specifiedBusTimetableArray[current].timetable,searchCondition)) < toTime(getArrivalTimeString(specifiedBusTimetableArray[inner].timetable,searchCondition))){
				current = inner;
			}
		};
		swapBusTimetable(specifiedBusTimetableArray,current,outer);
	};
	return specifiedBusTimetableArray;
};


function sortingDepartureBusTimetableArray(busTimetableArray: BusTimetable[],searchCondition:SearchCondition): BusTimetable[] {

	let specifiedBusTimetableArray:BusTimetable[]=busTimetableArray;

	for (let outer = 0; outer < specifiedBusTimetableArray.length ; outer++)
	{
		let current = outer;
		for (let inner = outer + 1; inner < specifiedBusTimetableArray.length ; inner++){
			if(toTime(getDepartureTimeString(specifiedBusTimetableArray[current].timetable,searchCondition)) > toTime(getDepartureTimeString(specifiedBusTimetableArray[inner].timetable,searchCondition))){
				current = inner;
			}
		};
		swapBusTimetable(specifiedBusTimetableArray,current,outer);
	};
	return specifiedBusTimetableArray;
};

