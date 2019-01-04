import * as esprima from 'esprima';
import {getArrayColors} from './Parser';
import * as esgraph from 'esgraph';
import * as viz from 'viz.js';
export {parsedGraph};

var graphToDrow=[];
var correntLine=1;
var nodeOfExitLine=null;
var numberOFExitLine=0;
var numColor=0;
var lastIine=false;
var arrayColor=[];
var arrayOfWhile=[];


function parsedGraph(codeToParse,parsedCode,isTest) {
    //create tree graph
    var treeG=esgraph(parsedCode.body[0].body);
    arrayOfWhile=getNodesWhile(codeToParse);
    //split to node
    treeG=esgraph.dot(treeG,{counter:0,source:codeToParse});
    // create graph as array
    graphToDrow=treeG.split('\n');
    arrayColor=getArrayColors();
    createGraph();
    return createFinalGraph(isTest);
}

function getNodesWhile(codeToParse) {
    var tempArray=codeToParse.split('\n');

    for(var i=0; i<tempArray.length; i++){
        tempArray[i]=clearEmptyLine(tempArray[i]);
    }
    for(var j=0; j<tempArray.length; j++){
        if(tempArray[j]=='')
            tempArray.splice(j, 1);
    }
    return createArrayWhile(tempArray);

}

function createArrayWhile(tempArray) {
    var arrayOfNodeWhile=[];
    for(var i=0; i<tempArray.length; i++){
        if(tempArray[i].includes('while'))
            arrayOfNodeWhile.push('n'+i);
    }
    return arrayOfNodeWhile;
}

function clearEmptyLine(line) {
    while (line.includes(' '))
        line=line.replace(' ','');
    return line;
}

function createFinalGraph(isTest) {
    var toReturn;
    if(isTest)
        toReturn=graphToDrow;
    else
        toReturn=viz('digraph{'+stringForViz()+'}');
    correntLine=1;
    graphToDrow=[];
    lastIine=false;
    numberOFExitLine=0;
    numColor=0;
    arrayColor=[];
    nodeOfExitLine=null;
    arrayOfWhile=[];
    return toReturn;
}

function createGraph() {
    while(correntLine<graphToDrow.length && !lastIine){
        var funType=getType(graphToDrow[correntLine]);
        var fun = getCurrentFun(funType);
        fun();
    }
    cleanGraph();
    drowNode();
}

function stringForViz() {
    var strViz='';
    for(var i=0; i<graphToDrow.length; i++){
        strViz+=graphToDrow[i]+'\n';
    }
    return strViz;
}

function getCurrentFun(type) {
    if(type=='AssignmentExpression' || type=='UpdateExpression' || type=='VariableDeclaration' || type=='ReturnStatement')
        return handleVar;
    else
        return getCurrentFun1(type);
}

function getCurrentFun1(type) {
    if(type=='LogicalExpression' || type=='BinaryExpression' )
        return handleCondition;
    else
        return handaleIdentifier;

}


function getType(line){
    if(line.includes('let') || line.includes('var')){
        return 'VariableDeclaration';
    }
    else if(line.includes('return')){
        return 'ReturnStatement';
    }
    else if(getValue('label', line)=='exit') {
        return 'exit';
    }
    else{
        var statement=esprima.parseScript(getValue('label', line));
        var ans= (statement.body)[0].expression.type;
        return ans;
    }

}

function getValue(label, line) {
    var s1=line.indexOf(label+'=')+label.length+2;
    var s2=line.length-2;
    var val=line.substring(s1,s2);
    if(val.includes('exit')){
        val='exit ';
    }
    return val;
}

function letOrVar(row){
    var arraySplit;
    if(row.includes('let'))
        arraySplit=row.split('let ');
    else
        arraySplit=row.split('var ');
    return arraySplit;
}

function handleVar() {
    var row=graphToDrow[correntLine];
    if(row.includes('let') || row.includes('var')){
        var arraySplit=letOrVar(row);
        graphToDrow[correntLine]=arraySplit[0]+arraySplit[1];
        row=graphToDrow[correntLine];
        graphToDrow[correntLine]=row.substring(0,row.indexOf('"]'))+'", shape="box"]';
    }
    else if(row.includes('return')){
        row=graphToDrow[correntLine];
        graphToDrow[correntLine]=row.substring(0,row.indexOf('"]'))+'", shape="box",style="filled", color="green"]';
    }
    else{
        row=graphToDrow[correntLine];
        graphToDrow[correntLine]=row.substring(0,row.indexOf('"]'))+'", shape="box"]';
    }
    correntLine++;
    checkEnd();
}
function checkEnd() {
    if(graphToDrow.size>0 || correntLine>0)
        return;
}

function handleCondition() {
    var row=graphToDrow[correntLine];
    var color='';
    if(!checkIfWhileRow(row)){
        if(arrayColor[numColor])
            color='green';
        else
            color='red';
        graphToDrow[correntLine]=row.substring(0,row.indexOf('"]'))+'", shape="diamond",style="filled", color="'+color+'"]';
        numColor++;
    }
    else{
        graphToDrow[correntLine]=row.substring(0,row.indexOf('"]'))+'", shape="diamond",style="filled", color="gray"]';

    }
    correntLine++;
    if(lastIine)
        return;
}

function checkIfWhileRow(row) {
    for(var i=0;i<arrayOfWhile.length;i++){
        if(row.includes(arrayOfWhile))
            return true;
    }
    return false;
}


function handaleIdentifier(){
    var row=graphToDrow[correntLine];
    var arraySplit=row.split('[');
    nodeOfExitLine=arraySplit[0].substring(0,arraySplit[0].length-1);
    numberOFExitLine=correntLine;
    removeLineFromGraph(correntLine);
    lastIine=true;
}

function removeLineFromGraph(numberLine){
    var tempGraph=[];
    var j=0;
    for(var i=0;i<graphToDrow.length-1;i++){
        if(i != numberLine){
            tempGraph[i]=graphToDrow[j];
            j++;
        }
        else{
            j++;
            tempGraph[i]=graphToDrow[j];
            j++;
        }

    }
    graphToDrow=tempGraph;
}


function cleanGraph() {
    for(var i=0;i<graphToDrow.length;i++){
        var line=getValue('label',graphToDrow[i]);
        if(lineToRemove(i) || line=='exception'){
            removeLineFromGraph(i);
            i--;
        }
    }
}

function lineToRemove(lineNumber) {
    var line=graphToDrow[lineNumber];
    if(line.substring(0,2)=='n0' || line.substring(0,nodeOfExitLine.length)==nodeOfExitLine)
        return true;
    else if(line.includes('->'))
        return checkFirstAndLastNode(line) ;
    return false;
}

function checkFirstAndLastNode(line) {
    var arrayToken=line.split('->');
    if(arrayToken[0].substring(0,nodeOfExitLine.length)==nodeOfExitLine || arrayToken[1].substring(1,nodeOfExitLine.length+1)==nodeOfExitLine || arrayToken[1].substring(1,3)=='n0')
        return true;
    return false;
}

function drowNode() {
    for(var i=0;i<graphToDrow.length;i++){
        if(graphToDrow[i].includes('->')){
            if(graphToDrow[i].includes('false'))
                addcolorToNode(graphToDrow[i],false);
            else
                addcolorToNode(graphToDrow[i],true);
        }
    }
}

function addcolorToNode(line,type) {
    var str=line.substring(0,line.indexOf('['));
    var arrayToken=str.split('->');
    var node1=arrayToken[0].split(' ');
    var strNode1=node1[0];
    var node2=arrayToken[1].split(' ');
    var strNode2=node2[1];
    var lineNode1=getLineNode(strNode1);
    var lineNode2=getLineNode(strNode2);
    changeC(lineNode1,lineNode2,type);
}

function changeC(node1,node2,type) {
    if(node2.includes('"diamond"') && node1.includes('"diamond"')){
        if(node1.includes('"green"') && node2.includes('"green"')){
            var numLineTT=getNumLineNode(node2);
            graphToDrow[numLineTT]=node2.substring(0,node2.indexOf(',style'))+',style="filled", color="red"]';
        }
        return;
    }
    changeColor(node1,node2,type);
}



function changeColor(node1,node2,type) {
    if(node1.includes('"red"')){
        var numLine=getNumLineNode(node2);
        graphToDrow[numLine]=node2.substring(0,node2.indexOf('"]'))+'",style="filled", color="gray"]';
        return;
    }
    changeColor1(node1,node2,type);
}

function changeColor1(node1,node2,type) {
    if(node1.includes('"green"') && node1.includes('"diamond"') && type){
        var numLineOfNode2=getNumLineNode(node2);
        graphToDrow[numLineOfNode2]=node2.substring(0,node2.indexOf('"]'))+'",style="filled", color="green"]';
        return;
    }
    changeColor2(node1,node2,type);
}

function changeColor2(node1,node2,type)  {
    if(node1.includes('"green"') && node1.includes('"diamond"') && !type){
        var numLineOfNode3=getNumLineNode(node2);
        graphToDrow[numLineOfNode3]=node2.substring(0,node2.indexOf('"]'))+'",style="filled", color="gray"]';
        return;
    }
    changeColor3(node1,node2);

}

function changeColor3(node1,node2) {
    if(node1.includes('"gray"') && !node2.includes('color')){
        var numLine1=getNumLineNode(node2);
        graphToDrow[numLine1]=node2.substring(0,node2.indexOf('"]'))+'",style="filled", color="gray"]';
        return;
    }
    if(!node1.includes('color')){
        var numLine2=getNumLineNode(node1);
        graphToDrow[numLine2]=node1.substring(0,node1.indexOf('"]'))+'",style="filled", color="green"]';
        return;
    }
}


function getLineNode(node) {
    for(var i=0;i<numberOFExitLine;i++){
        if(graphToDrow[i].includes(node))
            return graphToDrow[i];
    }
}

function getNumLineNode(node) {
    for(var i=0;i<numberOFExitLine;i++){
        if(graphToDrow[i].includes(node))
            return i;
    }
}
















