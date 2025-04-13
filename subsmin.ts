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

function getNearestArrivalTimeArray(busTimetableArray:BusTimetable[],nodes:string[],matrix:number[][],pivot:number,time:string):string[]{
	let nearestMinutesArray:string[]=[];
	const nextHops:number[]=getNextHops(matrix[pivot]);
	for (let i = 0; i < nodes.length ; i++ ){
		nearestMinutesArray[i]="INF";
	};
	for (let nextHop of nextHops){
		const reSearchCondition:SearchCondition={
			busType:"nimsbus",
			from:nodes[pivot],
			to:nodes[nextHop],
			departureOrArrival:"arrival",
			direction:"ascending",
			time:time,
		};
		console.log(reSearchCondition.from+"->"+reSearchCondition.to);
		const graterEqualThanDepartureTimetableArray:BusTimetable[]=extractGraterEqualThanDepartureBusTimetableArray(busTimetableArray,reSearchCondition);
		const sortedGraterEqualThanDepartureTimetableArray:BusTimetable[]=sortingDepartureBusTimetableArray(graterEqualThanDepartureTimetableArray,reSearchCondition);
		if (sortedGraterEqualThanDepartureTimetableArray.length!==0){
			console.log(sortedGraterEqualThanDepartureTimetableArray[0]);
			console.log(reSearchCondition);	
			console.log(nextHop);		
			if(sortedGraterEqualThanDepartureTimetableArray[0].busType==="walk"){
				console.log("**************************************walk**************************************");
				const arrivalTime:string = addWalkTime(time,getArrivalTimeString(sortedGraterEqualThanDepartureTimetableArray[0].timetable,reSearchCondition));
				console.log(arrivalTime);
				nearestMinutesArray[nextHop]=arrivalTime;
			}else{
				console.log("**************************************bus**************************************");
				const arrivalTime:string=getArrivalTimeString(sortedGraterEqualThanDepartureTimetableArray[0].timetable,reSearchCondition);
				console.log(arrivalTime);
				nearestMinutesArray[nextHop]=arrivalTime;
			};
		};
	};
	return nearestMinutesArray;
};

function printDepatureArrival(timeTable:Timetable[],searchCondition:SearchCondition):string{
	let from:string ="None";
	let to:string ="None";
	if (timeTable.length !==0){
		if(timeTable.length!==0){
			from = getDepartureTimeString(timeTable,searchCondition);
			to = getArrivalTimeString(timeTable,searchCondition);
		};
	};
	return from+"->"+to;
};

function getNearestArrivalBustmeTable(reSearchCondition:SearchCondition,busTimetableArray:BusTimetable[]):Timetable{
	let timetable:Timetable={
		arrival:"INF",
		departure:"INF",
		busStop:reSearchCondition.from
	};
	const graterEqualThanDepartureTimetableArray:BusTimetable[]=extractGraterEqualThanDepartureBusTimetableArray(busTimetableArray,reSearchCondition);
	const sortedGraterEqualThanDepartureTimetableArray:BusTimetable[]=sortingDepartureBusTimetableArray(graterEqualThanDepartureTimetableArray,reSearchCondition);
	if (sortedGraterEqualThanDepartureTimetableArray.length !==0){
		if(sortedGraterEqualThanDepartureTimetableArray[0].busType==="walk"){
			console.log("**************************************walk**************************************");
			const arrivalTime:string = addWalkTime(reSearchCondition.time,getArrivalTimeString(sortedGraterEqualThanDepartureTimetableArray[0].timetable,reSearchCondition));
			console.log(arrivalTime);
			timetable.departure=reSearchCondition.time;
			timetable.arrival=arrivalTime;
		}else{
			console.log("**************************************bus**************************************");
			const departureTime:string=getDepartureTimeString(sortedGraterEqualThanDepartureTimetableArray[0].timetable,reSearchCondition);
			const arrivalTime:string=getArrivalTimeString(sortedGraterEqualThanDepartureTimetableArray[0].timetable,reSearchCondition);
			console.log(arrivalTime);
			timetable.departure=departureTime;
			timetable.arrival=arrivalTime;
		};
		return timetable;
	}
	return noneTimetable;
};

function getNearestArrivalBustmeTableArray(nodes:string[],time:string,busTimetableVector:BusTimetable[]):Timetable[][]{
	let busTimetableArray:Timetable[][]=[];
	for(let from = 0 ; from < nodes.length ; from++){
		busTimetableArray[from]=[];
		for(let to = 0 ; to < nodes.length ; to++){
			const reSearchCondition:SearchCondition={
				busType:"nimsbus",
				from:nodes[from],
				to:nodes[to],
				departureOrArrival:"arrival",
				direction:"ascending",
				time:time,
			};
			busTimetableArray[from][to]=getNearestArrivalBustmeTable(reSearchCondition,busTimetableVector);
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

function dijkstra(nodes:string[],matrix:number[][],s:number,busTimetableVector:BusTimetable[],searchCondition:SearchCondition):string[]{
	let timetableArray:Timetable[][]=getNearestArrivalBustmeTableArray(nodes,searchCondition.time,busTimetableVector);
	let timetableVector:Timetable[]=[];
	let used:boolean[]=new Array(nodes.length).fill(false);
	let path:number[]=new Array(nodes.length).fill(-1);
	let flag:boolean=false;
	console.table(nodes);
	console.table(matrix);
	console.log(s);
	printTimeTableArray(timetableArray);

	for (let index=0;index<nodes.length;index++){
		timetableVector[index]={...noneTimetable};
	};

	timetableVector[s].departure=searchCondition.time;
	timetableVector[s].arrival=searchCondition.time;
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

		let tmpTimetableArray:Timetable[][]=getNearestArrivalBustmeTableArray(nodes,min_dist.departure,busTimetableVector);
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
	console.table(path);
	let result ="";
	for(let i = 0 ; i < nodes.length ; i++)
	{
		result += timetableVector[i].departure + " : " + i + " ";
		let p = i;
		while(path[p]!==-1)
		{
			result += " <--" + path[p];
			p = path[p];
		}
		result += "\n";
	};
	console.log(result);
	return[];
};
function dfs(nodes:string[],matrix:number[][],v:number,to:number,seen:boolean[],route:string[]):boolean{
	seen[v]=true;
	route.push(nodes[v]);
	console.log("seen:"+v);
	if (seen[to]){
		console.table(route);
		return true;
	};
	const edges:number[]=getNextHops(matrix[v]);
	for(let next_v of edges){
		if (seen[next_v]){
			continue;
		};
		if (dfs(nodes,matrix,next_v,to,seen,route)){
			return true;
		};
	};
	route.pop();
	return false;
};

function dummy_dfs(nodes:string[],matrix:number[][],v:number,to:number,from:number,seen:boolean[],finish:boolean[],route:string[]):boolean{
	seen[v]=true;
	route.push(nodes[v]);
	console.log(route);
	const edge:number[]=getNextHops(matrix[v]);
	for(let v2 of edge){
		if (v2 === from){
			continue;
		};
		if (finish[v2]) {
			continue;
		};
		if (seen[v2] && !finish[v2]){
			route.push(nodes[v2]);
			return true;
		};
		if(dummy_dfs(nodes,matrix,v2,to,v,seen,finish,route)){
			return true;
		};
	};
	finish[v]=true;
	if(v===to){
		printBusRouteMatrix("BUS ROUTE",nodes,matrix);
		return true;
	};
	route.pop();
	return false;
};

function findRoute2(nodes:string[],matrix:number[][],from:number,to:number,time:string,busTimetableArray:BusTimetable[],searchCondition:SearchCondition,weight:number[][]):string[]{
	let seen:boolean[]=[];
	let finish:boolean[]=[];
	let route:string[][]=[];
	let r:string[]=[];
	for (let index = 0; index < nodes.length; index++){
		seen[index]=false;
		finish[index]=false;
	};
	for (let outer = 0; outer < nodes.length ; outer++){
		route[outer]=[];
		for (let inner = 0 ; inner < nodes.length ; inner++){
			route[outer][inner]="INF";
		};
	};
	const dist:string[]=dijkstra(nodes,matrix,nodes.indexOf(searchCondition.from),busTimetableArray,searchCondition);
	console.table(dist);
	return [];
	console.table(nodes);
	console.table(matrix);
	console.log("From:"+nodes[from]);
	const edge:number[] = getNextHops(matrix[from]);
	for (let v of edge){
		for (let index = 0; index < nodes.length; index++){
			seen[index]=false;
		};
		route=[];
		console.log(nodes[v]+"->"+nodes[to]);
		if (dfs(nodes,matrix,v,to,seen,r)){
			console.log("true");
			const reSearchCondition:SearchCondition={
				busType:searchCondition.busType,
				from:nodes[from],
				to:nodes[v],
				departureOrArrival:searchCondition.departureOrArrival,
				direction:searchCondition.direction,
				time:time,
			};
			const graterEqualThanArrivalTimetableArray:BusTimetable[]=extractGraterEqualThanDepartureBusTimetableArray(busTimetableArray,reSearchCondition);
			const sortedGraterEqualThanArrivalTimetableArray:BusTimetable[]=sortingDepartureBusTimetableArray(graterEqualThanArrivalTimetableArray,reSearchCondition);
			console.log(sortedGraterEqualThanArrivalTimetableArray[0]);			
			console.table(route);
		}else{
			console.log("false");
		};
	};
	return[];
};

function findRoute(nodes:string[],matrix:number[][],searchCondition:SearchCondition):string[]{

	let seen:boolean[]=[];
	let finish:boolean[]=[];
	let route:string[]=[];
	for (let index = 0; index < nodes.length; index++){
		seen[index]=false;
		finish[index]=false;
	};
	const to:number=nodes.indexOf(searchCondition.to);
	const from:number=nodes.indexOf(searchCondition.from);
	console.log("From:"+nodes[from]);
	for (let v of matrix[from]){
		for (let index = 0; index < nodes.length; index++){
			seen[index]=false;
		};
		route=[];
		dfs(nodes,matrix,v,to,seen,route);
		if (seen[nodes.indexOf(searchCondition.to)]){
			console.log("true");
			console.table(route);
		}else{
			console.log("false");
		};
	};
	const result:boolean= dummy_dfs(nodes,matrix,nodes.indexOf(searchCondition.from),nodes.indexOf(searchCondition.to),-1,seen,finish,route);
	if(result){
		return route;
	};
	return [];
};

function find(busStopArray:BusStop[],busTimetableArray:BusTimetable[],searchCondition:SearchCondition):BusTimetable[]{
	const nodes:string[]=getAllNodes(busStopArray);
	const matrix:number[][]=getNodesMatrix(busStopArray,nodes);
	//const route:string[]=findRoute(nodes,matrix,searchCondition);
	let weight:number[][]=[];
	const route:string[]=findRoute2(nodes,matrix,nodes.indexOf(searchCondition.from),nodes.indexOf(searchCondition.to),searchCondition.time,busTimetableArray,searchCondition,weight);
	console.log("Route");
	console.table(route);
	return [];
	let tmpResultBusTimetableArray:BusTimetable[] =[];
	if (searchCondition.departureOrArrival==="arrival"){
		const arrivalRouteArray:string[]=route.reverse();
		let time = searchCondition.time;
		let index = 0;
		let to ="";
		let from ="";
		for(let arrivalRoute of arrivalRouteArray){
			if (index++===0){
				to = arrivalRoute;
				continue;
			};
			from = arrivalRoute;
			console.log(from+"->"+to);
			const reSearchCondition:SearchCondition={
				busType:searchCondition.busType,
				from:from,
				to:to,
				departureOrArrival:searchCondition.departureOrArrival,
				direction:searchCondition.direction,
				time:time,
			};
			const lessEqualThanArrivalTimetableArray:BusTimetable[]=extractLessEqualThanArrivalBusTimetableArray(busTimetableArray,reSearchCondition);
			const sortedLessEqualThanArrivalTimetableArray:BusTimetable[]=sortingArrivalBusTimetableArray(lessEqualThanArrivalTimetableArray,reSearchCondition);
			if(sortedLessEqualThanArrivalTimetableArray.length ===0){
				return [];
			};
			tmpResultBusTimetableArray[tmpResultBusTimetableArray.length]=sortedLessEqualThanArrivalTimetableArray[0];
			time = getDepartureTimeString(sortedLessEqualThanArrivalTimetableArray[0].timetable,reSearchCondition);
			to = from;

			let resultBusTimetableArray:BusTimetable[]=[tmpResultBusTimetableArray[0]];
			for(let tmpResultBusTimetable of tmpResultBusTimetableArray){
				if (resultBusTimetableArray[resultBusTimetableArray.length-1] !== tmpResultBusTimetable){
					resultBusTimetableArray[resultBusTimetableArray.length]=tmpResultBusTimetable;
				}
			};
			
			return resultBusTimetableArray.reverse();
		};
	}else if (searchCondition.departureOrArrival==="departure"){
		const departureRouteArray:string[]=route;
		let time = searchCondition.time;
		let index = 0;
		let to ="";
		let from ="";
		for(let departureRoute of departureRouteArray){
			if (index++===0){
				from = departureRoute;
				continue;
			};
			to = departureRoute;
			console.log(from+"->"+to);
			const reSearchCondition:SearchCondition={
				busType:searchCondition.busType,
				from:from,
				to:to,
				departureOrArrival:searchCondition.departureOrArrival,
				direction:searchCondition.direction,
				time:time,
			};
			const graterEqualThanArrivalTimetableArray:BusTimetable[]=extractGraterEqualThanDepartureBusTimetableArray(busTimetableArray,reSearchCondition);
			const sortedGraterEqualThanArrivalTimetableArray:BusTimetable[]=sortingDepartureBusTimetableArray(graterEqualThanArrivalTimetableArray,reSearchCondition);
			if(sortedGraterEqualThanArrivalTimetableArray.length ===0){
				return [];
			};
			tmpResultBusTimetableArray[tmpResultBusTimetableArray.length]=sortedGraterEqualThanArrivalTimetableArray[0];
			time = getArrivalTimeString(sortedGraterEqualThanArrivalTimetableArray[0].timetable,reSearchCondition);
			from = to;
		};

		let resultBusTimetableArray:BusTimetable[]=[tmpResultBusTimetableArray[0]];
		for(let tmpResultBusTimetable of tmpResultBusTimetableArray){
			if (resultBusTimetableArray[resultBusTimetableArray.length-1] !== tmpResultBusTimetable){
				resultBusTimetableArray[resultBusTimetableArray.length]=tmpResultBusTimetable;
			}
		};
		
		return resultBusTimetableArray;
	};
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

function printBusRouteMatrix(str:string,nodes:string[],matrix:number[][]){
	console.log(str+":start");
	console.log("*****nodes*****");
	console.table(nodes);
	console.log("+++++nodes+++++");
	console.table(matrix);
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
		if (timetable.busStop === searchCondition.to && timetable.arrival !== "none"){
			return timetable.arrival;
		};
	};
	return "none";
};

function getDepartureTimeString(timeTableArray:Timetable[],searchCondition:SearchCondition):string{
	for(let timetable of timeTableArray){
		if (timetable.busStop === searchCondition.from && timetable.departure !== "none"){
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

