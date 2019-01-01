import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {parserNewJson,symbolicSubstition,assignmentArguments,getArrayColors} from './Parser';
import {parsedGraph} from './cfg';


var ansTable = document.getElementById('Table');
var correntRow;
let dic={};
var tableRows = ansTable.getElementsByTagName('tr');
$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        var rowCount = tableRows.length;
        if(rowCount>0){
            for (var x=rowCount-1; x>0; x--) {
                ansTable.deleteRow(x);}}
        correntRow=ansTable.insertRow(ansTable.rows.length);
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        let arrayTable=parserNewJson(parsedCode,dic,0);
        createTable(arrayTable);
        assignmentArguments(document.getElementById('args').value);
        var symbolicFun=symbolicSubstition(codeToParse,dic);
        document.getElementById('symbolicFunction').innerHTML = '';
        createSymbolicFun(symbolicFun);
        var graphToDrow = parsedGraph( codeToParse,parsedCode,false);
        printGraph(graphToDrow);
    });
});


function printGraph(graph) {
    var ans = document.getElementById('graph');

    ans.innerHTML=graph;
}


function createTable(arrayTable){
    for (var i=0;i<arrayTable.length;i=i+5){
        addRowToTable(arrayTable[i], arrayTable[i+1], arrayTable[i+2], arrayTable[i+3], arrayTable[i+4]);
        correntRow=ansTable.insertRow(ansTable.rows.length);
    }
}


function addRowToTable(line,type,name,condition,value){
    addColToTable(0,line);
    addColToTable(1,type);
    addColToTable(2,name);
    addColToTable(3,condition);
    addColToTable(4,value);
}




function addColToTable(col,value) {
    var correntCol  = correntRow.insertCell(col);
    var ValueOfCol  = document.createTextNode(value);
    correntCol.appendChild(ValueOfCol);
}

function createSymbolicFun(fun) {
    var arrayOfColors=getArrayColors();
    var lineOfIf=0;
    var color;
    for (let i=0;i<fun.length;i++) {
        var linesOfFun=fun[i];
        if(linesOfFun.includes('if')){
            var isColor=arrayOfColors[lineOfIf];
            lineOfIf++;
            if(isColor)
                color= 'lawngreen';
            else
                color= 'darkred';
        }
        else
            color='white';
        drow(linesOfFun,color);
    }
}

function drow(linesOfFun,color){
    if(linesOfFun.includes('<')){
        linesOfFun=createSpeace(linesOfFun);
    }
    $('#symbolicFunction').append(
        $('<div>' + linesOfFun + '</div>').addClass(color)
    );
}

function createSpeace(linesOfFun){
    var ans='';
    var lineSplited=linesOfFun.split('<');
    for (let i=0;i<lineSplited.length;i++) {
        ans=ans+lineSplited[i]+' < ';
    }
    ans=ans.substring(0,ans.length-3);

    return ans;




}