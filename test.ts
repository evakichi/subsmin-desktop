import * as fs from "fs";
import { console } from "inspector";
import { finished } from "stream";


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

function getArrivalTimeString(timeTableArray:Timetable[],condString:string):string{
	console.log("getArrivalTimeString");
	let specifiedTime:string = "none";
	for (let timetable of timeTableArray){
		if (timetable.busStop === condString && timetable.arrival !== "none"){
			specifiedTime = timetable.arrival;
		}
	}	
	return specifiedTime;
};

function getDepartureTimeString(timeTableArray:Timetable[],condString:string):string{
	console.log("getDepartureTimeString");
	let specifiedTime:string = "none";
	for (let timetable of timeTableArray){
		if (timetable.busStop === condString && timetable.departure !== "none"){
			specifiedTime = timetable.departure;
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
	if (direction === "none"){
		return busTimetableArray;
	};
	let index = 0;
	let specifiedBusTimetableArray: BusTimetable[] = [];
	for (let busTimetable of busTimetableArray) {
		if (busTimetable.direction === direction) {
			specifiedBusTimetableArray[index++] = busTimetable;
		};
	};
	return specifiedBusTimetableArray;
};

function extractLessEqualThanArrivalBusTimetableArray(busTimetableArray: BusTimetable[],searchCondition:SearchCondition): BusTimetable[] {
	//printBusTimetableArray("extractLessThanArrivalTimetableArray",searchCondition,busTimetableArray);

	let specifiedBusTimetableArray: BusTimetable[] = [];
	for (let busTimetable of busTimetableArray) {
		const arrivalTime = getArrivalTimeString(busTimetable.timetable,searchCondition.to);
		if (arrivalTime !== "none" && toTime(arrivalTime) <= toTime(searchCondition.time)){
			specifiedBusTimetableArray[specifiedBusTimetableArray.length] = busTimetable;
		};
	};
	return specifiedBusTimetableArray;
};

function extractLessGraterThanArrivalBusTimetableArray(busTimetableArray: BusTimetable[],searchCondition:SearchCondition): BusTimetable[] {
	//printBusTimetableArray("extractLessThanArrivalTimetableArray",searchCondition,busTimetableArray);

	let specifiedBusTimetableArray: BusTimetable[] = [];
	for (let busTimetable of busTimetableArray) {
		const arrivalTime = getArrivalTimeString(busTimetable.timetable,searchCondition.to);
		if (arrivalTime !== "none" && toTime(arrivalTime) >= toTime(searchCondition.time)){
			specifiedBusTimetableArray[specifiedBusTimetableArray.length] = busTimetable;
		};
	};
	return specifiedBusTimetableArray;
};


function sortingArrivalBusTimetableArray(busTimetableArray: BusTimetable[],searchCondition:SearchCondition): BusTimetable[] {
	
	console.log("sortingBusTimetableArray");
	let specifiedBusTimetableArray:BusTimetable[]=busTimetableArray;

	for (let outer = 0; outer < specifiedBusTimetableArray.length ; outer++)
	{
		let current = outer;
		for (let inner = outer + 1; inner < specifiedBusTimetableArray.length ; inner++){
			if(toTime(getArrivalTimeString(specifiedBusTimetableArray[current].timetable,searchCondition.to)) < toTime(getArrivalTimeString(specifiedBusTimetableArray[inner].timetable,searchCondition.to))){
				current = inner;
			}
		};
		swapBusTimetable(specifiedBusTimetableArray,current,outer);
	};
	return specifiedBusTimetableArray;
};

function reGenerateSearchCondition(searchCondition:SearchCondition,timetable:Timetable[],transit:string):SearchCondition{
	const timeString = getDepartureTimeString(timetable,transit);
	console.log(timeString);
	const reSearchCondition:SearchCondition={
		busType:searchCondition.busType,
		from:searchCondition.from,
		to:transit,
		departureOrArrival:"arrival",
		direction:"none",
		time:timeString,
	};
	return reSearchCondition;
};

function removeHeadFromBusTimeTableArray(busTimetableArray:BusTimetable[]):BusTimetable[]{
	let tmpBusTimetableArray:BusTimetable[]=[];
	let index = 0;
	for (let busTimetable of busTimetableArray){
		if (index !==0){
			tmpBusTimetableArray[tmpBusTimetableArray.length]=busTimetable;
		};
		index++;
	};
	return tmpBusTimetableArray;
};

function getTransitString(busStopArray:BusStop[],name:string):string{
	for (let busStop of busStopArray){
		if (busStop.busStop===name){
			return "none";
		}
	}
	return "none";
};

function mergeBusTimetableArray(array1:BusTimetable[],array2:BusTimetable[]):BusTimetable[]{
	let resultBusTimetableArray:BusTimetable[]=[];
	for (let array of array1){
		resultBusTimetableArray[resultBusTimetableArray.length]=array;
	};
	for (let array of array2){
		resultBusTimetableArray[resultBusTimetableArray.length]=array;
	};
	return resultBusTimetableArray;
}

function removeNonDepartureBusTimetableArray(busTimetableArray:BusTimetable[],searchCondition:SearchCondition):BusTimetable[]{
	let specifiedBusTimetableArray:BusTimetable[]=[];
	for (let busTimetable of busTimetableArray){
		if (getDepartureTimeString(busTimetable.timetable,searchCondition.from)!=="none"){
			specifiedBusTimetableArray[specifiedBusTimetableArray.length]=busTimetable;
		};
	};
	return specifiedBusTimetableArray;
};

function getTransitBusTimetableArray(prevBusTimetableArray:BusTimetable[],currentBusTimetableArray:BusTimetable[],searchCondition:SearchCondition,busStopArray:BusStop[],depth:number):BusTimetable[]{
	//printBusTimetableArray("*****getTransitBusTimetable****",searchCondition,currentBusTimetableArray);
	const transit=getTransitString(busStopArray,searchCondition.to);
	const sortedBusTimetableArray = sortingArrivalBusTimetableArray(prevBusTimetableArray,searchCondition);
	printBusTimetableArray("*****transit sorted",searchCondition,sortedBusTimetableArray);
	for (let busTimetable of sortedBusTimetableArray){
		const reSearchCondition = reGenerateSearchCondition(searchCondition,busTimetable.timetable,transit);
		printBusTimetableArray("*****transit regenete*****",reSearchCondition,sortedBusTimetableArray);
		const resultBusTimetableArray:BusTimetable[]=getBusTimetableArray(currentBusTimetableArray,currentBusTimetableArray,reSearchCondition,busStopArray,depth+1);
		if (resultBusTimetableArray.length!==0){
			return resultBusTimetableArray;	
		};
	}
	return [];
};

function isDirectPath(busTimetable:BusTimetable,searchCondition:SearchCondition):boolean{
	const arrivalTime = getArrivalTimeString(busTimetable.timetable,searchCondition.to);
	const departureTime = getDepartureTimeString(busTimetable.timetable,searchCondition.from);
	if (arrivalTime!=="none" && departureTime!=="none" && toTime(arrivalTime) > toTime(departureTime)){
		return true;
	};
	return false;
};

function isIndirectPath(busTimetable:BusTimetable,searchCondition:SearchCondition):boolean{
	const fromArrivalTime = getArrivalTimeString(busTimetable.timetable,searchCondition.from);
	const fromDepartureTime = getDepartureTimeString(busTimetable.timetable,searchCondition.from);
	const toArrivalTime = getArrivalTimeString(busTimetable.timetable,searchCondition.to);
	const toDepartureTime = getDepartureTimeString(busTimetable.timetable,searchCondition.to);

	if (fromArrivalTime!=="none" && toDepartureTime!=="none" && toTime(fromArrivalTime) > toTime(toDepartureTime)){
		return false;
	}

	if (toArrivalTime!=="none" && fromDepartureTime==="none"){
		return true;
	};
	return false;
};

function extractDirectPath(busTimetableArray:BusTimetable[],searchCondition:SearchCondition):BusTimetable[]{
	let specifiedBusTimetableArray:BusTimetable[]=[];
	for (let busTimetable of busTimetableArray){
		if (isDirectPath(busTimetable,searchCondition)){
			specifiedBusTimetableArray[specifiedBusTimetableArray.length]=busTimetable;
		};
	};
	return specifiedBusTimetableArray;
};

function extractIndirectPath(busTimetableArray:BusTimetable[],searchCondition:SearchCondition):BusTimetable[]{
	let specifiedBusTimetableArray:BusTimetable[]=[];
	for (let busTimetable of busTimetableArray){
		if (isIndirectPath(busTimetable,searchCondition)){
			specifiedBusTimetableArray[specifiedBusTimetableArray.length]=busTimetable;
		};
	};
	return specifiedBusTimetableArray;
};


function searchBusTimetableArray(prevBusTimetableArray:BusTimetable[],currentBusTimetableArray:BusTimetable[],searchCondition:SearchCondition,busStopArray:BusStop[]):BusTimetable[]{
	let specifiedBusTimetableArray:BusTimetable[]=[];
	for (let busTimetable of prevBusTimetableArray){
		if(isDirectPath(busTimetable,searchCondition)){
			console.log("*****************************************************************");
			return [busTimetable];
		}else if(isIndirectPath(busTimetable,searchCondition)){
			console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"+getTransitString(busStopArray,searchCondition.to));
			const reSearchCondition = reGenerateSearchCondition(searchCondition,busTimetable.timetable,getTransitString(busStopArray,searchCondition.to));
			printBusTimetableArray("*****searchBus regenete*****",reSearchCondition,prevBusTimetableArray);
			const tmpBusTimetableArray =  searchBusTimetableArray(currentBusTimetableArray,currentBusTimetableArray,reSearchCondition,busStopArray);
				console.log("////////////////////////////");
		};
	};
	return specifiedBusTimetableArray;
};

function nextHop(currentBusTimetableArray:BusTimetable[],searchCondition:SearchCondition):BusTimetable[]{
	return extractLessGraterThanArrivalBusTimetableArray(extractDirectPath(currentBusTimetableArray,searchCondition),searchCondition);
};
function getBusTimetable(currentBusTimetableArray:BusTimetable[],searchCondition:SearchCondition):BusTimetable[]{
	let next = nextHop(currentBusTimetableArray,searchCondition);
	printBusTimetableArray("test",searchCondition,next);
	if (next.length===0){
		return [];
	}
	return [next[0]];
};
const searchCondition:SearchCondition={
	busType:"none",
	from:"nims:namiki",
	to:"nims:sengen",
	departureOrArrival:"none",
	direction:"none",
	time:"1800",
};
const start:string="nims:namiki";
function getNextHops(busStopArray:BusStop[],start:string):string[]{
	let stringArray:string[]=[];
	for(let busStop of busStopArray){
		if (busStop.busStop===start){
			for (let ascending of busStop.ascending){
				stringArray[stringArray.length]=ascending.nexthop;
			};
			for (let descending of busStop.descending){
				stringArray[stringArray.length]=descending.nexthop;
			};
		};
	};
	return stringArray;
};

function getBusStop(busStopArray:BusStop[],condition:string):BusStop|undefined{
	for(let busStop of busStopArray){
		if (busStop.busStop===condition)
			return busStop;
	}
	return undefined;
};

function isContainBusStop(memory:string[],condition:string):boolean{
	for (let mem of memory){
		if (mem===condition){
			return true;
		}
	};
	return false;
};

function getAscendingNodesMatrix(busStopArray:BusStop[],nodes:string[]):number[][]{
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
	return matrix;
};


function getDescendingNodesMatrix(busStopArray:BusStop[],nodes:string[]):number[][]{
	let matrix:number[][]=[];

	for (let outer = 0 ; outer < nodes.length ; outer++){
		matrix[outer]=[];
		for (let inner = 0 ; inner < nodes.length ; inner++){
			matrix[outer][inner]=0;
		};
	};

	for(let outer = 0; outer < nodes.length ; outer++){
		for (let desceding of busStopArray[outer].descending){
			matrix[outer][nodes.indexOf(desceding.nexthop)]=1
		};
	};
	return matrix;
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

function detactLoop(nodes:string[],matrix:number[][],v:number,seen:boolean[],finish:boolean[],postLoop:number[]):boolean{
	seen[v]=true;
	//console.log(routeStringArray);
	//console.table(routeStringMatrix);
	const edge:number[]=matrix[v];
	console.table(edge);
	for(let index = 0; index < edge.length ; index++){
		if(edge[index]!==0){
			const v2:number = index;
			//console.log("v2:"+v2);
			if (finish[v2]) {
				continue;
			}
			if (seen[v2] && !finish[v2]){
				postLoop.push(v2);
				return true;
			};
			if(detactLoop(nodes,matrix,v2,seen,finish,postLoop)){
				return true;
			};
		};
	};
	//console.log("finish:"+v);
	//console.table(finish);
	finish[v]=true;
	postLoop.pop();
	return false;
};

function dfs(nodes:string[],matrix:number[][],v:number,f:number,seen:boolean[],finish:boolean[],routeStringMatrix:String[][],routeStringArray:string[]):boolean{
	seen[v]=true;
	routeStringArray.push(nodes[v]);
	//console.log(routeStringArray);
	const routeStringMatrixIndex=routeStringMatrix.length;
	routeStringMatrix[routeStringMatrixIndex]=[];
	for (let routeString of routeStringArray){
		routeStringMatrix[routeStringMatrixIndex][routeStringMatrix[routeStringMatrixIndex].length]=routeString;
	};
	//console.table(routeStringMatrix);
	const edge:number[]=matrix[v];
	//console.table(edge);
	for(let index = 0; index < edge.length ; index++){
		if(edge[index]!==0){
			const v2:number = index;
			//console.log("v2:"+v2);
			if (finish[v2]) {
				continue;
			}
			if (seen[v2] && !finish[v2]){
				routeStringArray.push(nodes[v2]);
				console.table(routeStringArray);
				return true;
			};
			if(dfs(nodes,matrix,v2,f,seen,finish,routeStringMatrix,routeStringArray)){
				return true;
			};
		};
	};
	//console.log("finish:"+v);
	//console.table(finish);
	finish[v]=true;
	routeStringArray.pop();
	return false;
};

function findRoute(nodes:string[],ascendingMatrix:number[][],descendingMatrix:number[][],matrix:number[][],from:string,to:string):string[]{

	let candidates:string[][]=[];
	let prevTargetBusStopStringArray:string[]=[];

	let seen:boolean[]=[];
	let finish:boolean[]=[];
	console.log(from);
	console.table(nodes);
	console.log("*****ascnding*****");
	console.table(matrix);
		for (let index = 0; index < nodes.length; index++){
			seen[index]=false;
			finish[index]=false;
		};
		let ascendingRouteStringMatrix:string[][]=[];
		let ascendingRouteStringArray:string[]=[];
		let postLoop:number[]=[];
		//const ascendingResult:boolean= detactLoop(nodes,matrix,nodes.indexOf(from),seen,finish,postLoop);
		//console.log(ascendingResult);
		console.table(postLoop);
		return[];
	for(let node of nodes){
		let seen:boolean[]=[];
		let finish:boolean[]=[];
		console.log(node);
		console.log("*****ascnding*****");

		if(node!==to){
			for (let index = 0; index < nodes.length; index++){
				seen[index]=false;
				finish[index]=false;
			};
			let ascendingRouteStringMatrix:string[][]=[];
			let ascendingRouteStringArray:string[]=[];
			//const ascendingResult:boolean= dfs(nodes,ascendingMatrix,nodes.indexOf(node),seen,finish,ascendingRouteStringMatrix,ascendingRouteStringArray);

			for (let ascending of ascendingRouteStringMatrix){
				if (ascending.includes(to)){
					candidates.push(ascending);
				};
			}
		}
		console.table(candidates);

		console.log("*****descnding*****");
		if(node!==to){
			for (let index = 0; index < nodes.length; index++){
				seen[index]=false;
				finish[index]=false;
			};
			let descendingRouteStringMatrix:string[][]=[];
			let descendingRouteStringArray:string[]=[];
			//const descendingResult:boolean= dfs(nodes,descendingMatrix,nodes.indexOf(node),seen,finish,descendingRouteStringMatrix,descendingRouteStringArray);
			for (let descending of descendingRouteStringMatrix){
				if (descending.includes(to)){
					candidates.push(descending);
				};
			}	
		}
		console.table(candidates);
	};
	
	console.table(candidates);
	for (let candidate of candidates){
		if (!prevTargetBusStopStringArray.includes(candidate[0])){
			prevTargetBusStopStringArray[prevTargetBusStopStringArray.length]=candidate[0];
		}
	};
	
	console.table(prevTargetBusStopStringArray);	
	return prevTargetBusStopStringArray;
};

function find(busStopArray:BusStop[],from:string,to:string){
	const nodes:string[]=getAllNodes(busStopArray);
	const ascendingMatrix:number[][]=getAscendingNodesMatrix(busStopArray,nodes);
	const descendingMatrix:number[][]=getDescendingNodesMatrix(busStopArray,nodes);
	const matrix:number[][]=getNodesMatrix(busStopArray,nodes);
	console.log("test");
	findRoute(nodes,ascendingMatrix,descendingMatrix,matrix,from,to);
};
console.log("******");
find(targetBusStopArray,"nims:namiki","nims:sakura");
//const hops:string[] = dfs(busStopArray,"nims:namiki","nims:sakura",["nims:namiki"]);
//console.table(hops);
//const next = getBusTimetable(targetBusTimetableArray,searchCondition);
//printBusTimetableArray("next:",searchCondition,next);
function getBusTimetableArray(prevBusTimetableArray:BusTimetable[],currentBusTimetableArray:BusTimetable[],searchCondition:SearchCondition,busStopArray:BusStop[],depth:number):BusTimetable[]{

	console.log("************************"+depth+"**********************************");


	let specifiedBusTimetableArray:BusTimetable[]=[];

	const directPathBusTimetableArray:BusTimetable[]=sortingArrivalBusTimetableArray(
		extractLessEqualThanArrivalBusTimetableArray(
			extractDirectPath(currentBusTimetableArray,searchCondition),
			searchCondition),
			searchCondition);
	const indirectPathBusTimetableArray:BusTimetable[]=sortingArrivalBusTimetableArray(
		extractLessEqualThanArrivalBusTimetableArray(
			extractIndirectPath(currentBusTimetableArray,searchCondition),
			searchCondition),
			searchCondition);
	
	
	printBusTimetableArray("directPathBusTimetableArray",searchCondition,directPathBusTimetableArray);
	printBusTimetableArray("indirectPathBusTimetableArray",searchCondition,indirectPathBusTimetableArray);
	const mergedBusTimetableArray = mergeBusTimetableArray(directPathBusTimetableArray,indirectPathBusTimetableArray);
	const sortedLessThanEqualBusTimeTable = sortingArrivalBusTimetableArray(mergedBusTimetableArray,searchCondition);
	printBusTimetableArray("*****merged*****",searchCondition,mergedBusTimetableArray);
	printBusTimetableArray("*****sorted merged*****",searchCondition,mergedBusTimetableArray);

	for (let busTimetable of sortedLessThanEqualBusTimeTable){
		if(isDirectPath(busTimetable,searchCondition)){
			console.log("****************************Direct******************************");
			return [busTimetable];
		}else if(isIndirectPath(busTimetable,searchCondition)){
			const transit = getTransitString(busStopArray,searchCondition.to);
			console.log("++++++++++++++++++++++++++Indirect+++++++++++++++++++++++++++++++"+transit);
			const reSearchCondition = reGenerateSearchCondition(searchCondition,busTimetable.timetable,transit);
			printBusTimetableArray("*****searchBus regenete*****",reSearchCondition,sortedLessThanEqualBusTimeTable);
			const tmpBusTimetableArray =  searchBusTimetableArray(currentBusTimetableArray,currentBusTimetableArray,reSearchCondition,busStopArray);
			printBusTimetableArray("*********************************************XXXX*********",searchCondition,tmpBusTimetableArray);
			specifiedBusTimetableArray = mergeBusTimetableArray(specifiedBusTimetableArray,tmpBusTimetableArray);
				console.log("////////////////////////////");
		};
	};
	return specifiedBusTimetableArray;

	specifiedBusTimetableArray = searchBusTimetableArray(sortedLessThanEqualBusTimeTable,currentBusTimetableArray,searchCondition,busStopArray);
	process.exit(255);
	const lessThanEqualBusTimetableArray = extractLessEqualThanArrivalBusTimetableArray(prevBusTimetableArray,searchCondition);


	for (let tmpLessThanEqualBusTimetableArray of lessThanEqualBusTimetableArray){

	} 
	printBusTimetableArray("*****lessthan*****",searchCondition,lessThanEqualBusTimetableArray);
	const removedNonDepartureBusTimetableArray = removeNonDepartureBusTimetableArray(lessThanEqualBusTimetableArray,searchCondition);
	printBusTimetableArray("*****removed*****",searchCondition,removedNonDepartureBusTimetableArray);
	if(removedNonDepartureBusTimetableArray.length ===0){
		const tmpBusTimetableArray = getTransitBusTimetableArray(lessThanEqualBusTimetableArray,currentBusTimetableArray,searchCondition,busStopArray,depth+1);
		specifiedBusTimetableArray = mergeBusTimetableArray(specifiedBusTimetableArray,tmpBusTimetableArray);
		return specifiedBusTimetableArray;
	}
	else{
		const sortedBusTimetableArray = sortingArrivalBusTimetableArray(removedNonDepartureBusTimetableArray,searchCondition);
		printBusTimetableArray("*****sorted*****",searchCondition,sortedBusTimetableArray);
		const tmpBusTimetableArray:BusTimetable[] = sortedBusTimetableArray;
		specifiedBusTimetableArray = mergeBusTimetableArray(specifiedBusTimetableArray,tmpBusTimetableArray);
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
};
/*
const result = getBusTimetableArray(targetBusTimetableArray,targetBusTimetableArray,targetSearchCondition,busStopArray,0);
printBusTimetableArray("******resrut******",targetSearchCondition,result);
*/
function searchBusStopIndex(busStopArray:BusStop[],condString:string):number{
	let index:number = 0;
	for (let busStop of busStopArray){
		if (busStop.busStop===condString){
			return index;
		};
		index++;
	}
	return -1;
};

function printNextHop(busStopArray:BusStop[]){
	for(let busStop of busStopArray){
		console.log(busStop);
	};
};

function createAscendingNetworkGraph(busStopArray:BusStop[]):number[][]{
	let graph:number[][]=[];
	for (let outer = 0; outer < busStopArray.length ; outer++){
		graph[outer]=[]
		for (let inner = 0; inner < busStopArray.length ; inner++){
			graph[outer][inner]=0
		};
	};
	for (let busStop of busStopArray){
		let resultOuterIndex:number = searchBusStopIndex(busStopArray,busStop.busStop);
		if (resultOuterIndex!==-1){
			for(let asceding of busStop.ascending){
				let resultInnerIndex:number = searchBusStopIndex(busStopArray,asceding.nexthop);
				if (resultInnerIndex!==-1){
					graph[resultOuterIndex][resultInnerIndex]=1;
				}
			};
		}
	};
	return graph;
};

function createDescendingNetworkGraph(busStopArray:BusStop[]):number[][]{
	let graph:number[][]=[];
	for (let outer = 0; outer < busStopArray.length ; outer++){
		graph[outer]=[]
		for (let inner = 0; inner < busStopArray.length ; inner++){
			graph[outer][inner]=0
		};
	};
	for (let busStop of busStopArray){
		let resultOuterIndex:number = searchBusStopIndex(busStopArray,busStop.busStop);
		if (resultOuterIndex!==-1){
			for(let descending of busStop.descending){
				let resultInnerIndex:number = searchBusStopIndex(busStopArray,descending.nexthop);
				if (resultInnerIndex!==-1){
					graph[resultOuterIndex][resultInnerIndex]=1;
				}
			};
		}
	};
	return graph;
};

function calcWeight(from:string,to:string):number[]{
	const INF:number = Number.MAX_SAFE_INTEGER;
	return [];
};

function dijkstra(graph:number[][],busStopArray:BusStop[],from:string,to:string):number[]{
	return [];
}