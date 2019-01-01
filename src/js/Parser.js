export {parserNewJson,symbolicSubstition,getArrayColors,assignmentArguments};
import{parseCode} from './code-analyzer';

let correntLine=1;
let arrayOfTable=[];
let dicFunction={};
dicFunction['FunctionDeclaration']=functionDeclaration;
dicFunction['BlockStatement']=blockStatement;
dicFunction['VariableDeclaration']=variableDeclaration;
dicFunction['VariableDeclarator']=variableDeclarator;
dicFunction['Identifier']=identifier;
dicFunction['Literal']=literal;
dicFunction['ExpressionStatement']=expressionStatement;
dicFunction['AssignmentExpression']=assignmentExpression;
dicFunction['BinaryExpression']=binaryExpression;
dicFunction['WhileStatement']=whileStatement;
dicFunction['IfStatement']=ifStatement;
dicFunction['MemberExpression']=memberExpression;
dicFunction['ReturnStatement']=returnStatement;
dicFunction['UnaryExpression']=unaryExpression;
dicFunction['Program']=program;
dicFunction['ForStatement']=forStatement;
dicFunction['UpdateExpression']=updateExpression;
dicFunction['ArrayExpression']=arrayExpression;
dicFunction['LogicalExpression']=logicalExpression;
let mainDic=[];
var arrayVar;
var counter=0;
var arrayColors=[];
var arrayOfArgAndGlobal=[];
var notNeedSymbolic=false;
let fatherIF;

function symbolicSubstition(fun,dic){

    var parsedFun=parseCode(fun);
    initVar();
    setArrayVar(arrayVar);
    if(notNeedSymbolic){
        parserNewJson(parsedFun,dic);
        counter=0;
        return createSymbolicFun(fun);
    }
    else{
        var ans=[];
        return ans;
    }


}

function initVar() {
    arrayOfTable=[];
    correntLine=1;
    mainDic=[];
    arrayOfArgAndGlobal=[];
    arrayColors=[];
}

function setArrayVar(vars) {
    arrayVar=vars;
}

function getArrayColors() {
    return arrayColors;
}



function parserNewJson(parserJson,dictionary,cont) {
    if(parserJson!=null && parserJson.type!=null){
        if(parserJson.type=='Program'){
            var array=program(parserJson,dictionary);
            afterProgram(cont);
            return array;
        }
        else{
            var correntFun=dicFunction[parserJson.type];
            if(isFunctionWithTwoArg(parserJson.type) )
                return correntFun(parserJson,dictionary,'if statement');
            else
                return correntFun(parserJson,dictionary);
        }
    }
    else
        return parserJson;
}

function afterProgram(cont){
    if(cont==0){
        initVar();
        counter++;
    }
    correntLine=1;
    arrayOfTable=[];
}

function isFunctionWithTwoArg(type) {
    switch (type) {
    case 'VariableDeclaration':
        return true;
    case 'VariableDeclarator':
        return true;
    case 'AssignmentExpression':
        return true;
    case 'IfStatement':
        return true;
    default:
        return false;
    }
}



function functionDeclaration(parserJson,tempDic) {
    arrayOfTable.push(correntLine, 'function declaration', parserNewJson(parserJson.id,tempDic), '', '');
    for (var i = 0; i < parserJson.params.length; i++) {
        tempDic[parserNewJson(parserJson.params[i],tempDic)]=parserNewJson(parserJson.params[i],tempDic);
        arrayOfTable.push(correntLine, 'variable declaration', parserNewJson(parserJson.params[i],tempDic), '', '');
        arrayOfArgAndGlobal.push(parserNewJson(parserJson.params[i],tempDic));
    }
    copyTempDicToMainDic(tempDic);
    correntLine += 1;
    return parserNewJson(parserJson.body,tempDic);
}

function blockStatement(parserJson,tempDic,type) {
    if(type=='if'){
        for (var i = 0; i < parserJson.body.length; i++) {
            parserNewJson(parserJson.body[i],tempDic);
        }
        fatherIF=undefined;
    }
    else{
        for (var j = 0; j < parserJson.body.length; j++) {
            parserNewJson(parserJson.body[j],tempDic);
        }

    }

}

function variableDeclaration(parserJson,tempDic,type) {
    if(type=='global var'){
        for (var j = 0; j < parserJson.declarations.length; j++) {
            variableDeclarator(parserJson.declarations[j],tempDic,'global var');
        }
        copyTempDicToMainDic(tempDic);
        correntLine += 1;
    }
    else if(type=='for statment'){
        return variableDeclarator(parserJson.declarations[0],tempDic,'for statment');
    }
    else{
        for (var i = 0; i < parserJson.declarations.length; i++) {
            parserNewJson(parserJson.declarations[i],tempDic);
        }
        copyTempDicToMainDic(tempDic);
        correntLine += 1;
    }

}

function variableDeclarator(parserJson,tempDic,type) {
    if(type=='global var'){
        arrayOfArgAndGlobal.push(parserNewJson(parserJson.id,tempDic));
        arrayOfTable.push(correntLine, 'variable declaration', parserNewJson(parserJson.id,tempDic), '', parserNewJson(parserJson.init,tempDic));
        copyTempDicToMainDic(tempDic);
        addLineToDic(parserNewJson(parserJson.id,tempDic),parserNewJson(parserJson.id,tempDic),tempDic);
        assignmentArgToDic(parserNewJson(parserJson.id,tempDic),parserNewJson(parserJson.init,tempDic));
    }
    else if(type=='for statment'){
        return parserNewJson(parserJson.id,tempDic)+'='+parserNewJson(parserJson.init,tempDic);
    }
    else{
        arrayOfTable.push(correntLine, 'variable declaration', parserNewJson(parserJson.id,tempDic), '', parserNewJson(parserJson.init,tempDic));
        copyTempDicToMainDic(tempDic);
        addLineToDic(parserNewJson(parserJson.id,tempDic),parserNewJson(parserJson.init,tempDic),tempDic);


    }

}

function arrayExpression(parserJson,tempDic) {
    var ans='[';
    for (var i = 0; i < parserJson.elements.length; i++) {
        ans=ans+ literal(parserJson.elements[i],tempDic)+',';
    }
    ans=ans.substring(0,ans.length-1);
    ans=ans+']';
    return ans;
}

function identifier(parserJson,tempDic,type) {
    if(type=='need Parenthesis'){
        return '('+parserJson.name+')';
    }
    else{
        return parserNewJson(parserJson.name,tempDic);
    }

}

function literal(parserJson,tempDic) {
    return parserNewJson(parserJson.raw,tempDic);
}

function expressionStatement(parserJson,tempDic) {
    parserNewJson(parserJson.expression,tempDic);
    copyTempDicToMainDic(tempDic);
    correntLine += 1;
}

function assignmentExpression(parserJson,tempDic,type) {
    if(type=='for statment'){
        return parserNewJson(parserJson.left,tempDic)+parserJson.operator+parserNewJson(parserJson.right,tempDic);
    }
    else{
        var left=parserNewJson(parserJson.left,tempDic);
        var right=parserNewJson(parserJson.right,tempDic);
        arrayOfTable.push(correntLine, 'assignment expression', left, '',right);
        if (counter>0 && notNeedSymbolic && (left in arrayVar))
            arrayVar[left]=right;
        addLineToDic(left,right,tempDic);
    }

}

function binaryExpression(parserJson,tempDic) {
    var left=parserNewJson(parserJson.left,tempDic);
    var right=parserNewJson(parserJson.right,tempDic);
    if(parserJson.left.type=='Identifier'){
        left=needParenthesis(parserJson.left,tempDic);
    }
    if(parserJson.right.type=='Identifier'){
        right=needParenthesis(parserJson.right,tempDic);
    }
    if(parserJson.left.type=='Identifier' && parserJson.right.type=='Identifier'){
        return '('+left+parserJson.operator+right+')';
    }

    return left+parserJson.operator+right;
}

function logicalExpression(parserJson,tempDic) {
    var left=parserNewJson(parserJson.left,tempDic);
    var right=parserNewJson(parserJson.right,tempDic);

    return left+'  '+parserJson.operator+'  '+right;
}

function needParenthesis(parserJson,tempDic){
    var temp=true;
    for (var j = 0; j < arrayOfArgAndGlobal.length; j++) {
        if (parserNewJson(parserJson, tempDic) == arrayOfArgAndGlobal[j]) {
            temp=false;
        }
    }
    if(temp){
        return identifier(parserJson,tempDic,'need Parenthesis');
    }
    else{
        return parserNewJson(parserJson,tempDic);
    }
}

function whileStatement(parserJson,tempDic) {
    arrayOfTable.push(correntLine, 'while statment', '',parserNewJson(parserJson.test,tempDic), '');
    copyTempDicToMainDic(tempDic);
    correntLine += 1;
    return parserNewJson(parserJson.body,tempDic);
}

function ifStatement(parserJson,tempDic,type) {
    var test=parserNewJson(parserJson.test,tempDic);
    arrayOfTable.push(correntLine, type, '',test, '');
    var color=calculateCondition(test,tempDic);
    insertColor(color);
    copyTempDicToMainDic(tempDic);
    correntLine += 1;
    var tempdictinoary=deepCopyDic(tempDic);
    if(parserJson.consequent.type=='BlockStatement')
        blockStatement(parserJson.consequent,tempDic,'if');
    else
        parserNewJson(parserJson.consequent,tempDic);
    tempDic=tempdictinoary;
    if(parserJson.alternate !=null){
        if(parserJson.alternate.type == 'IfStatement'){
            ifStatement(parserJson.alternate,tempDic,'else if statment');}
        else
            handleElse(tempDic,tempdictinoary,parserJson.alternate);
    }
}


function insertColor(color) {
    if(fatherIF==undefined){
        if(color==true){
            arrayColors.push(color);
        }else{
            fatherIF=color;
            arrayColors.push(fatherIF);
        }
    }
    else {
        arrayColors.push(fatherIF);
    }
}

function handleElse(tempDic,tempdictinoary,parserJson){
    arrayOfTable.push(correntLine, 'else', '', '', '');
    copyTempDicToMainDic(tempDic);
    correntLine += 1;
    tempdictinoary=deepCopyDic(tempDic);
    parserNewJson(parserJson,tempDic);
    tempDic=tempdictinoary;
}

function calculateCondition(cond, dic) {
    if(counter>0 && notNeedSymbolic){
        var symbolicCond=convertLocalVar(cond,dic);
        var arraySymbolicCond=symbolicCond.split(/[\s<>,=()*/;{}%+-]+/).filter(a=>a!==' ');
        for (let i=0;i<arraySymbolicCond.length;i++) {
            if (arraySymbolicCond[i] in arrayVar)
                symbolicCond=symbolicCond.replace(arraySymbolicCond[i],arrayVar[arraySymbolicCond[i]]);
        }
        return eval(symbolicCond);

    }

}




function returnStatement(parserJson,tempDic) {
    arrayOfTable.push(correntLine, 'return statment', '', '', parserNewJson(parserJson.argument,tempDic));
    copyTempDicToMainDic(tempDic);
    correntLine += 1;

}

function memberExpression(parserJson,tempDic) {
    return parserNewJson(parserJson.object,tempDic) + '[' + parserNewJson(parserJson.property,tempDic) + ']';

}

function unaryExpression(parserJson,tempDic) {
    return parserJson.operator + parserNewJson(parserJson.argument,tempDic);
}


function program(parserJson,tempDic) {
    for (var i = 0; i < parserJson.body.length; i++) {
        var temp =deepCopyDic(tempDic);
        if(parserJson.body[i].type=='VariableDeclaration'){
            variableDeclaration(parserJson.body[i],tempDic,'global var');
        }
        else{
            parserNewJson(parserJson.body[i],tempDic);
        }
        tempDic=temp;
    }
    return arrayOfTable;

}

function forStatement(parserJson,tempDic) {
    if(parserJson.init.type=='VariableDeclaration'){
        arrayOfTable.push(correntLine, 'for statment', '',variableDeclaration(parserJson.init,tempDic,'for statment')+'; '+parserNewJson(parserJson.test,tempDic)+'; '+parserNewJson(parserJson.update,tempDic), '');
    }
    else{
        arrayOfTable.push(correntLine, 'for statment', '',assignmentExpression(parserJson.init,tempDic,'for statment')+'; '+parserNewJson(parserJson.test,tempDic)+'; '+parserNewJson(parserJson.update,tempDic), '');
    }

    correntLine += 1;
    return parserNewJson(parserJson.body,tempDic);
}

function updateExpression(parserJson,tempDic) {
    return parserNewJson(parserJson.argument,tempDic)+parserJson.operator;
}


function copyTempDicToMainDic(tempDic){
    var arrayObj=[];
    for (var line in tempDic) {
        arrayObj[line]=tempDic[line];
    }
    mainDic[correntLine]=arrayObj;
}


function addLineToDic(key,val,tempDic){
    if(counter>0 && notNeedSymbolic){
        val=convertLocalVar(val,tempDic);
        tempDic[key] = val;
        if(isArray(val)){
            assignmentArrayToDic(key, val,tempDic);
        }
    }

}

function isArray(val) {
    if (val[0]== '['){
        return true;
    }
    return false;
}

function assignmentArrayToDic(key, val,tempDic) {

    if (val[0]!= '[') {
        tempDic[key]=val;
    }
    else{
        val=val.substring(1,val.length-1);
        var array=val.split(',');
        for (var i=0;i<array.length;i++) {
            assignmentArrayToDic(key+'['+i+']',array[i],tempDic);
        }

    }
}

function convertLocalVar(val, tempDic) {
    var arrayVal=getArrayOfVar(val);
    for (var i=0;i<arrayVal.length;i++) {
        var token=arrayVal[i];
        var valueInDic=token;
        if (tempDic[token]!=undefined) {
            if (!(valueInDic in arrayVar))
                valueInDic = tempDic[token];
        }
        val=val.replace(token,valueInDic);
    }
    return val;
}





function getArrayOfVar(val) {
    var arrayVar=[];
    if(isNaN(val))
        return val.split(/[\s!<>,=()*/;{}%+-]+/);
    else
        return arrayVar;
}




function deepCopyDic(tempDic) {
    var dic=[];
    for (var line in tempDic) {
        dic[line]=tempDic[line];
    }
    return dic;
}

function createSymbolicFun(func) {
    let arrayOflines=func.split(/\r?\n/);
    var newFun=[];
    var indexOfCorrectLine=0;
    for (var i=0;i<arrayOflines.length;i++) {
        var line=arrayOflines[i];
        var parseLine=reducedProfits(line);
        if(parseLine==''){
            indexOfCorrectLine++;}
        else if(checkComplitLine(line,parseLine)){
            indexOfCorrectLine++;
            newFun.push(line);}
        else if (isNotAssignLocalVar(line)){
            var tempDic=mainDic[i-indexOfCorrectLine+1];
            var insert=convertLocalVar(line,tempDic);
            newFun.push(insert);}
    }
    return newFun;
}

function checkComplitLine(line,parseLine){
    if(parseLine=='}' || parseLine=='{'){
        return true;
    }
    if(checkGlobalVar(line)){
        return true;
    }
}

function reducedProfits(line){
    var parseLine=line.replace('\t','');
    parseLine=parseLine.replace(' ','');
    while (parseLine.includes(' '))
        parseLine=parseLine.replace(' ','');
    return parseLine;
}

function isNotAssignLocalVar(line) {
    if (line.includes('function') || line.includes('else') || line.includes('if')||line.includes('return'))
        return true;
    return continueFun(line);
}
function continueFun(line) {
    if(line.includes('while'))
        return true;
    if(line.includes('=')){
        var arrayOfLine = line.split('').filter(a => a !== ' ');
        if(arrayOfLine[0] in arrayVar){
            return true;
        }
        else
            return false;
    }
}



function checkGlobalVar(sentence) {
    var arrayOfToken=getArrayOfVar(sentence);
    if(arrayOfToken[0]=='let' || arrayOfToken[0]=='var'){
        for (var i=0;i<arrayOfArgAndGlobal.length;i++){
            if(arrayOfToken[1]==arrayOfArgAndGlobal[i]){
                return true;
            }
        }
    }
    return false;
}


function assignmentArguments(argument) {
    arrayVar=[];
    var arrayOfAssignArg = argument.split(/,(?![^\(\[]*[\]\)])/g);
    for (let i=0;i<arrayOfAssignArg.length;i++) {
        var argSplited=arrayOfAssignArg[i].split('=');
        if(argSplited.length>=2){
            notNeedSymbolic=true;
            if(argSplited[1][0]=='['){
                assignmentArgToDic(argSplited[0],argSplited[1]);
            }
            else{
                arrayVar[argSplited[0]]=argSplited[1];
            }
        }
        else{
            notNeedSymbolic=false;
            break;
        }
    }
}

function assignmentArgToDic(argName, vargValue) {
    if(counter>0 && notNeedSymbolic){
        if (vargValue[0]!= '[') {
            arrayVar[argName]=vargValue;
        }
        else{
            vargValue=vargValue.substring(1,vargValue.length-1);
            var array=vargValue.split(',');
            for (var i=0;i<array.length;i++) {
                assignmentArgToDic(argName+'['+i+']',array[i]);
            }

        }
    }

}











