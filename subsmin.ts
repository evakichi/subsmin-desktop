import * as fs from "fs";

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
const targetBusTypeArray: BusType[] = JSON.parse(inputBusType);
const inputBusStop: string = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusStop.json", 'utf-8');
const targetBusStopArray: BusStop[] = JSON.parse(inputBusStop);
const inputBusTimetable: string = fs.readFileSync("/home/evakichi/subsmin-desktop/testBusTimetable.json", 'utf-8');
const targetBusTimetableArray: BusTimetable[] = JSON.parse(inputBusTimetable);
const inputSearchCondition: string = fs.readFileSync("/home/evakichi/subsmin-desktop/testSearchCondition.json", 'utf-8');
const targetSearchCondition:SearchCondition = JSON.parse(inputSearchCondition);

console.log(targetSearchCondition);

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

function extractLessEqualThanArrivalBusTimetableArray(busTimetableArray: BusTimetable[],searchCondition:SearchCondition): BusTimetable[] {

	let specifiedBusTimetableArray: BusTimetable[] = [];
	for (let busTimetable of busTimetableArray) {
		const arrivalTime = getArrivalTimeString(busTimetable.timetable,searchCondition);
		const departureTime = getDepartureTimeString(busTimetable.timetable,searchCondition);
		if (arrivalTime !== "none" && toTime(arrivalTime) <= toTime(searchCondition.time) && departureTime !=="none" && toTime(departureTime) <= toTime(searchCondition.time)){
			specifiedBusTimetableArray[specifiedBusTimetableArray.length] = busTimetable;
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

type Route = {
	exist:boolean;
	route:string[];
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

function dfs(nodes:string[],matrix:number[][],v:number,to:number,from:number,seen:boolean[],finish:boolean[],route:string[]):boolean{
	seen[v]=true;
	route.push(nodes[v]);
	if(v===to){
		return true;
	};
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
		if(dfs(nodes,matrix,v2,to,v,seen,finish,route)){
			return true;
		};
	};
	finish[v]=true;
	route.pop();
	return false;
};

function findRoute(nodes:string[],matrix:number[][],searchCondition:SearchCondition):string[]{

	let seen:boolean[]=[];
	let finish:boolean[]=[];
	for (let index = 0; index < nodes.length; index++){
		seen[index]=false;
		finish[index]=false;
	};
	let route:string[]=[];
	const result:boolean= dfs(nodes,matrix,nodes.indexOf(searchCondition.from),nodes.indexOf(searchCondition.to),-1,seen,finish,route);
	if(result){
		return route;
	}
	return [];
};

function find(busStopArray:BusStop[],busTimetableArray:BusTimetable[],searchCondition:SearchCondition):BusTimetable[]{
	const nodes:string[]=getAllNodes(busStopArray);
	const matrix:number[][]=getNodesMatrix(busStopArray,nodes);
	const route:string[]=findRoute(nodes,matrix,searchCondition);
	console.log("Route");
	console.table(route);
	let tmpResultBusTimetableArray:BusTimetable[] =[];
	if (searchCondition.departureOrArrival="arrival"){
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
			const lessEqualThanArrivalTimetableArray:BusTimetable[]=extractLessEqualThanArrivalBusTimetableArray2(busTimetableArray,reSearchCondition);
			const sortedLessEqualThanArrivalTimetableArray:BusTimetable[]=sortingArrivalBusTimetableArray(lessEqualThanArrivalTimetableArray,reSearchCondition);
			printBusTimetableArray("*****",reSearchCondition,sortedLessEqualThanArrivalTimetableArray);
			if(sortedLessEqualThanArrivalTimetableArray.length ===0){
				return [];
			};
			tmpResultBusTimetableArray[tmpResultBusTimetableArray.length]=sortedLessEqualThanArrivalTimetableArray[0];
			time = getDepartureTimeString(sortedLessEqualThanArrivalTimetableArray[0].timetable,reSearchCondition);
			to = from;
		};
	};
	let resultBusTimetableArray:BusTimetable[]=[tmpResultBusTimetableArray[0]];
	for(let tmpResultBusTimetable of tmpResultBusTimetableArray){
		if (resultBusTimetableArray[resultBusTimetableArray.length-1] !== tmpResultBusTimetable){
			resultBusTimetableArray[resultBusTimetableArray.length]=tmpResultBusTimetable;
		}
	};
	return resultBusTimetableArray.reverse();
};

const busTimetableArray = find(targetBusStopArray,targetBusTimetableArray,targetSearchCondition);
printBusTimetableArray("*****result*****",targetSearchCondition,busTimetableArray);
function getArrivalTimeString(timeTableArray:Timetable[],searchCondition:SearchCondition):string{
	for(let timetable of timeTableArray){
		if (timetable.busStop === searchCondition.to && timetable.arrival !== "none"){
			console.log("busstop from "+timetable.arrival);
			return timetable.arrival;
		};
	};
	return "none";
};

function getDepartureTimeString(timeTableArray:Timetable[],searchCondition:SearchCondition):string{
	for(let timetable of timeTableArray){
		if (timetable.busStop === searchCondition.from && timetable.departure !== "none"){
			console.log("busstop from "+timetable.departure);
			return timetable.departure;
		};
	};
	return "none";
};

function extractLessEqualThanArrivalBusTimetableArray2(busTimetableArray:BusTimetable[],searchCondition:SearchCondition):BusTimetable[]{
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