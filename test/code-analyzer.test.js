import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {parserNewJson,assignmentArguments,symbolicSubstition,getArrayColors} from '../src/js/Parser';
import {parsedGraph} from '../src/js/cfg';
var dic=[];
describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script","range":[0,0]}'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a","range":[4,5]},"init":{"type":"Literal","value":1,"raw":"1","range":[8,9]},"range":[4,9]}],"kind":"let","range":[0,10]}],"sourceType":"script","range":[0,10]}'
        );
    });


    it('check for null', () => {
        var code='';
        var Parser=parseCode(code);
        var table=parserNewJson(Parser,dic,0);
        dic=[];
        assert.equal(table.length,0);

    });

    it('Assignment varies', () => {
        var code='let temp=x;';
        var Parser=parseCode(code);
        var table=parserNewJson(Parser,dic,0);
        dic=[];
        assert.equal(table[0],1);
        assert.equal(table[1],'variable declaration');
        assert.equal(table[4],'x');

    });

    it('Assignment varies without let/var', () => {
        var code='temp=x;';
        var Parser=parseCode(code);
        var table=parserNewJson(Parser,dic,0);
        dic=[];
        assert.equal(table[0],1);
        assert.equal(table[1],'assignment expression');
        assert.equal(table[2],'temp');
        assert.equal(table[4],'x');

    });

    it('Assignment of several variables in the same row', () => {
        var code='let low, high, mid;';
        var Parser=parseCode(code);
        var table=parserNewJson(Parser,dic,0);
        dic=[];
        var i=0;
        for (i=0;i<table.length;i=i+5){
            assert.equal(table[i],1);
            assert.equal(table[i+1],'variable declaration');
            assert.equal(table[i+4],null);


        }


    });

    it('check if and else', () => {
        var code='if (X < V[mid])\n'+
            'high = mid - 1;\n'+
            'else\n'+
            'low = mid + 1;\n';
        var Parser=parseCode(code);
        var table=parserNewJson(Parser,dic,0);
        dic=[];
        assert.equal(table[0],1);
        assert.equal(table[1],'if statement');
        assert.equal(table[3],'(X)<V[mid]');

    });



    it('check if and some else if', () => {
        var code='if (X < V[mid])\n'+
            'high = mid - 1;\n'+
            'else if (X > V[mid])\n'+
            'low = mid + 1;\n'+
            'else if (high<V[mid])\n'+
            'low=mid+2;\n'+
            'else if (high> V[mid])\n'+
            'low=mid+3\n';
        var Parser=parseCode(code);
        var table=parserNewJson(Parser,dic,0);
        dic=[];
        var i=10;
        for (i=10;i<table.length;i=i+10){
            assert.equal(table[i+1],'else if statment');

        }

    });

    it('check if and some else if and else ', () => {
        var code='if (X < V[mid])\n'+
            'high = mid - 1;\n'+
            'else if (X > V[mid])\n'+
            'low = mid + 1;\n'+
            'else if (high<V[mid])\n'+
            'low=mid+2;\n'+
            'else if (high> V[mid])\n'+
            'low=mid+3\n'+
            'else\n'+
            'low=mid+4';
        var Parser=parseCode(code);
        var table=parserNewJson(Parser,dic,0);
        dic=[];
        assert.equal(table[table.length-5],10);

    });

    it('check for ', () => {
        var code='for(i=0;i<high;i++){\n'+
            'let x=t;\n'+
            '}';
        var Parser=parseCode(code);
        var table=parserNewJson(Parser,dic,0);
        dic=[];
        assert.equal(table[0],1);
        assert.equal(table[1],'for statment');
        assert.equal(table[3],'i=0; ((i)<(high)); i++');

    });

    it('check for with assignment into the for', () => {
        var code='for(let i=0;i<high;i++){\n'+
            'let x=t;\n'+
            '}';
        var Parser=parseCode(code);
        var table=parserNewJson(Parser,dic,0);
        dic=[];
        assert.equal(table[0],1);
        assert.equal(table[1],'for statment');
        assert.equal(table[3],'i=0; ((i)<(high)); i++');

    });

    it('check while ', () => {
        var code= 'while (low <= high) {\n'+
            'low=low+1;\n'+
            '}';
        var Parser=parseCode(code);
        var table=parserNewJson(Parser,dic,0);
        dic=[];
        assert.equal(table[0],1);
        assert.equal(table[1],'while statment');
        assert.equal(table[3],'((low)<=(high))');

    });


    it('check function  without return', () => {
        var code= 'function binarySearch(X, V, n){\n'+
            '}';
        var Parser=parseCode(code);
        var table=parserNewJson(Parser,dic,0);
        dic=[];
        assert.equal(table[0],1);
        assert.equal(table[1],'function declaration');
        assert.equal(table[2],'binarySearch');

    });

    it('check function  with return', () => {
        var code= 'function binarySearch(X, V, n){\n'+
            'return X+V+n\n'+
            '}';
        var Parser=parseCode(code);
        var table=parserNewJson(Parser,dic,0);
        dic=[];
        assert.equal(table[table.length-1],'(X+V)+n');
        assert.equal(table[table.length-4],'return statment');
        assert.equal(table[table.length-5],2);

    });

    it('check of all', () => {
        var code= 'function binarySearch(X, V, n){\n'+
            'let low, high, mid;\n'+
            'low = 0;\n'+
            'high = n - 1;\n'+
            'for(let i=0;i<high;i++){\n'+
            'let x=t;\n'+
            '}\n'+
            'while (low <= high) {\n'+
            'mid = (low + high)/2;\n'+
            'if (X < V[mid])\n'+
            'high = mid - 1;\n'+
            'else if (X > V[mid])\n'+
            'low = mid + 1;\n'+
            'else\n'+
            'return mid;\n'+
            '}\n'+
            'return -1;\n'+
            '}';
        var Parser=parseCode(code);
        var table=parserNewJson(Parser,dic,0);
        dic=[];
        assert.equal(table[table.length-5],15);

    });
    //tasting for symbolic function
    it('check for function without args', () => {
        var code= 'function binarySearch(X, V, n){\n'+
            '}';
        var symbolicFun=symbolicSubstition(code,dic);
        dic=[];
        var ans=[];
        assert.equal(symbolicFun.length,ans.length);

    });

    it('check for empty function with args', () => {
        var code= 'function binarySearch(X, V, n){\n'+
            '}';
        var args='x=1,y=2,z=3';
        assignmentArguments(args)
        var symbolicFun=symbolicSubstition(code,dic);
        dic=[];
        var ans1='function binarySearch(X, V, n){';
        var ans2='}';
        assert.equal(symbolicFun[0],ans1);
        assert.equal(symbolicFun[1],ans2);
    });


    it('check while and replace local var and return', () => {
        var code= 'function foo(x, y, z){\n'+
            'let a = x + 1;\n'+
            'let b = a + y;\n'+
            'let c = 0;\n'+
            'while (a < z) {\n'+
            'c = a + b;\n'+
            'z = c * 2;\n'+
            '}\n'+
            'return z;\n'+
            '}';
        var args='x=1,y=2,z=3';
        var Parser=parseCode(code);
        parserNewJson(Parser,dic,0);
        assignmentArguments(args);
        dic=[];
        var symbolicFun=symbolicSubstition(code,dic);
        var ans1='while (x+1 < z) {';
        var ans2='z = ((x+1)+(((x+1)+y))) * 2;';
        var ans3='return z;';
        assert.equal(symbolicFun[1],ans1);
        assert.equal(symbolicFun[2],ans2);
        assert.equal(symbolicFun[symbolicFun.length-2],ans3);
    });

    it('check global var undr funcion', () => {
        var code= 'function foo(x, y, z){\n'+
            'let a = x + 1;\n'+
            'let b = a + y;\n'+
            'let c = 0;\n'+
            'while (a < z) {\n'+
            'c = a + b;\n'+
            'z = c * 2;\n'+
            '}\n'+
            'return z;\n'+
            '}\n'+
            'let tzuri=8;';

        var args='x=1,y=2,z=3';
        var Parser=parseCode(code);
        parserNewJson(Parser,dic,0);
        assignmentArguments(args);
        dic=[];
        var symbolicFun=symbolicSubstition(code,dic);
        var ans1='let tzuri=8;';

        assert.equal(symbolicFun[symbolicFun.length-1],ans1);

    });

    it('check global var', () => {
        var code='let tzuri=8;\n'+
            'function foo(x, y, z){\n'+
            'let a = x + 1;\n'+
            'let b = a + y;\n'+
            'let c = 0;\n'+
            'while (a < z) {\n'+
            'c = a + b;\n'+
            'z = c * 2;\n'+
            '}\n'+
            'return z;\n'+
            '}';
        var args='x=1,y=2,z=3';
        var Parser=parseCode(code);
        parserNewJson(Parser,dic,0);
        assignmentArguments(args);
        dic=[];
        var symbolicFun=symbolicSubstition(code,dic);
        var ans1='let tzuri=8;';

        assert.equal(symbolicFun[0],ans1);

    });

    it('check global var with asign in while', () => {
        var code='let tzuri=8;\n'+
            'function foo(x, y, z){\n'+
            'let a = x + 1;\n'+
            'let b = a + y;\n'+
            'let c = 0;\n'+
            'while (z < tzuri) {\n'+
            'c = a + b;\n'+
            'z = c * 2;\n'+
            '}\n'+
            'return z;\n'+
            '}';
        var args='x=1,y=2,z=3';
        var Parser=parseCode(code);
        parserNewJson(Parser,dic,0);
        assignmentArguments(args);
        dic=[];
        var symbolicFun=symbolicSubstition(code,dic);
        var ans1='while (z < tzuri) {';

        assert.equal(symbolicFun[2],ans1);

    });

    it('check if ,else if and else and color', () => {
        var code='function foo(x, y, z){\n'+
            'let a = x + 1;\n'+
            'let b = a + y;\n'+
            'let c = 0;\n'+
            'if (b < z) {\n'+
            'c = c + 5;\n'+
            'return x + y + z + c;\n'+
            '} else if (b < z * 2) {\n'+
            'c = c + x + 5;\n'+
            'return x + y + z + c;\n'+
            '} else {\n'+
            'c = c + z + 5;\n'+
            'return x + y + z + c;\n'+
            '}\n'+
            '}';

        var args='x=1,y=2,z=3';
        var Parser=parseCode(code);
        parserNewJson(Parser,dic,0);
        assignmentArguments(args);
        dic=[];
        var symbolicFun=symbolicSubstition(code,dic);
        var ans1='if (((x+1)+y) < z) {';
        var ans2='} else if (((x+1)+y) < z * 2) {';
        var ans3='} else {';
        var colors=getArrayColors();
        assert.equal(symbolicFun[1],ans1);
        assert.equal(symbolicFun[3],ans2);
        assert.equal(symbolicFun[5],ans3);
        assert.equal(colors[0],false);
        assert.equal(colors[1],true);


    });

    it('check if into if', () => {
        var code='function foo(x, y, z){\n'+
            'let a = x + 1;\n'+
            'let b = a + y;\n'+
            'let c = 0;\n'+
            'if (b < z) {\n'+
            'if(a > y * 3)\n'+
            'c = c + 5;\n'+
            'return x + y + z + c;\n'+
            '} else if (b < z * 2) {\n'+
            'c = c + x + 5;\n'+
            'return x + y + z + c;\n'+
            '} else {\n'+
            'c = c + z + 5;\n'+
            'return x + y + z + c;\n'+
            '}\n'+
            '}';

        var args='x=1,y=2,z=3';
        var Parser=parseCode(code);
        parserNewJson(Parser,dic,0);
        assignmentArguments(args);
        dic=[];
        if(args.length != 7){
            var t=1;
        }
        var symbolicFun=symbolicSubstition(code,dic);
        var ans1='if(x+1 > y * 3)';
        var colors=getArrayColors();
        assert.equal(symbolicFun[2],ans1);
        assert.equal(colors[0],false);
        assert.equal(colors[1],false);
        assert.equal(colors[2],true);

    });

    it('check logicl expretion',() => {
        var code='function foo(x, y, z){\n'+
            'let a = x + 1;\n'+
            'let b = a + y;\n'+
            'let c = 0;\n'+
            'if (b < z || x < y) {\n'+
            'c = c + 5;\n'+
            'return x + y + z + c;\n'+
            '} else if (b < z * 2) {\n'+
            'c = c + x + 5;\n'+
            'return x + y + z + c;\n'+
            '} else {\n'+
            'c = c + z + 5;\n'+
            'return x + y + z + c;\n'+
            '}\n'+
            '}';

        var args='x=1,y=2,z=3';
        var Parser=parseCode(code);
        parserNewJson(Parser,dic,0);
        assignmentArguments(args);
        dic=[];
        var symbolicFun=symbolicSubstition(code,dic);
        var ans1='if (((x+1)+y) < z || x < y) {';
        var colors=getArrayColors();
        assert.equal(symbolicFun[1],ans1);
        assert.equal(colors[0],true);
        assert.equal(colors[1],true);


    });

    it('check array in var global and local',() => {
        var code='let tzuri=[4, 5, true];\n'+
            'function foo(x, y, z){\n'+
            'let a=[4,3,false];\n'+
            'if (a[0] == tzuri[0] || z[2] != a[1]) {\n'+
            'return a;\n'+
            '} else if (a[2] == z[0]) {\n'+
            'return tzuri[2];\n'+
            '} else {\n'+
            'return false;\n'+
            '}\n'+
            '}';

        var args='x=1,y=2,z=[false,5,true]';
        var Parser=parseCode(code);
        parserNewJson(Parser,dic,0);
        assignmentArguments(args);
        dic=[];
        var symbolicFun=symbolicSubstition(code,dic);
        var ans1='if (4 == tzuri[0] || z[2] != 3) {';
        var ans2='return [4,3,false];';
        var ans3='} else if (false == z[0]) {';
        var ans4='return tzuri[2];';
        var colors=getArrayColors();
        assert.equal(symbolicFun[2],ans1);
        assert.equal(symbolicFun[3],ans2);
        assert.equal(symbolicFun[4],ans3);
        assert.equal(symbolicFun[5],ans4);
        assert.equal(colors[0],true);
        assert.equal(colors[1],true);


    });

    //############testing for CFG################
    it('check return',() => {
        var codeToParse='function foo(x, y, z){\n'+
            'return x+y+z;\n'+
            '}';

        var args='x=1,y=2,z=3';
        var parsedCode = parseCode(codeToParse);
        parserNewJson(parsedCode,dic,0);
        assignmentArguments(args);
        dic=[];
        symbolicSubstition(codeToParse,dic);
        var graphToDrow = parsedGraph( codeToParse,parsedCode,true);
        assert.equal(graphToDrow[0].includes('return x+y+z'),true);
        assert.equal(graphToDrow[0].includes('"green"'),true);


    });

    it('check VariableDeclaration (let and var)',() => {
        var codeToParse='function foo(x, y, z){\n'+
            'let a=3;\n'+
            'var b=2;\n'+
            'return x+y+z+a+b;\n'+
        '}';
        var args='x=1,y=2,z=3';
        var parsedCode = parseCode(codeToParse);
        parserNewJson(parsedCode,dic,0);
        assignmentArguments(args);
        dic=[];
        symbolicSubstition(codeToParse,dic);
        var graphToDrow = parsedGraph( codeToParse,parsedCode,true);
        assert.equal(graphToDrow[0].includes('let'),false);
        assert.equal(graphToDrow[1].includes('var'),false);
    });

    it('check ExpressionStatement',() => {
        var codeToParse='function foo(x, y, z){\n'+
            'let a = x + 1;\n'+
            'let b = a + y;\n'+
            'z = a + b;\n'+
            'return z;\n'+
        '}';

        var args='x=1,y=2,z=3';
        var parsedCode = parseCode(codeToParse);
        parserNewJson(parsedCode,dic,0);
        assignmentArguments(args);
        dic=[];
        symbolicSubstition(codeToParse,dic);
        var graphToDrow = parsedGraph( codeToParse,parsedCode,true);
        assert.equal(graphToDrow[2].includes('z = a + b'),true);
    });

    it('check BinaryExpression',() => {
        var codeToParse='function foo(x, y, z){\n'+
            'let a = x * 2;\n'+
            'let b = a / y;\n'+
            'z = a + b;\n'+
            'return z;\n'+
            '}';

        var args='x=1,y=2,z=3';
        var parsedCode = parseCode(codeToParse);
        parserNewJson(parsedCode,dic,0);
        assignmentArguments(args);
        dic=[];
        symbolicSubstition(codeToParse,dic);
        var graphToDrow = parsedGraph( codeToParse,parsedCode,true);
        assert.equal(graphToDrow[0].includes('a = x * 2'),true);
        assert.equal(graphToDrow[1].includes('b = a / y'),true);
    });

    it('check WhileStatement',() => {
        var codeToParse='function foo(x, y, z){\n'+
            'let a = x * 2;\n'+
            'let b = a / y;\n'+
            'z = a + b;\n'+
            'return z;\n'+
            '}';

        var args='x=1,y=2,z=3';
        var parsedCode = parseCode(codeToParse);
        parserNewJson(parsedCode,dic,0);
        assignmentArguments(args);
        dic=[];
        symbolicSubstition(codeToParse,dic);
        var graphToDrow = parsedGraph( codeToParse,parsedCode,true);
        assert.equal(graphToDrow[0].includes('a = x * 2'),true);
        assert.equal(graphToDrow[1].includes('b = a / y'),true);
    });












});
