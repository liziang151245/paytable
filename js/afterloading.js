//create by ziang.li on 2018.02.05


var canvas  = document.getElementById("DisplayInterface1");
var context = canvas.getContext("2d");

var jsonFile;                                        //用户点选的Json文件信息
var previewButton = document.getElementById("Preview");                     //预览按钮
var payLineColorEB ;                                 //赢钱线颜色
var backGroundPayLineColorEB ;                       //赢钱线背景颜色
var rowNumEB ;                                       //每行显示个数
var numPostionList ;                                //序号位置
var serialNumTypeEB ;                             //序号字体
var serialNumSizeEB  ;                             //序号大小
var serialNumColorEB ;                           //序号颜色
var paylineWidth;                                   //每个赢钱线的长
var paylineHeight;                                   //每个赢钱线的宽
var arrx;                                    //payline的横向格子数
var arry;                                   //payline的总想格子数
var movx;                                   //x方向变换赢钱线的位移
var movy ;                                      //y方向变换赢钱线的位移
var loadJsonFile = false;                   //用来判断json文件是否是已经载入的关卡列表里面的文件
var seleSerialEB1;                           //选择的起始预览序号
var seleSerialEB2;                             //选择的结束预览序号
var count;
var PreUrlName = "JsonFile/subject_tmpl_"; //通用路径前缀
var SufUrlName = ".json";     //通用路径后缀
var PIXEL_RATIO = (function () {
    var ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
})();
//读取主关卡数文件

$.getJSON( PreUrlName + "id_list.json",function (data) {
    SubjectTmplIdList = data;
    initSujectList();
});

var SubjectTmplIdList ;            //载入的关卡数的数组




// 初始化关卡列表
function initSujectList() {

    var length = SubjectTmplIdList.subjectTmplIdList.length;
    var SubjectTmplId ;

    for(var i=0;i<length;i++) {

        SubjectTmplId=SubjectTmplIdList.subjectTmplIdList[i];
        addSujectList(SubjectTmplId);
    }
}

//根据当前关卡数生成关卡列表和名字
function addSujectList(SubjectTmplId) {

    $.getJSON( PreUrlName + SubjectTmplId+ SufUrlName,function (data) {
        var displayName ;
        if (undefined === data.displayName) {

            displayName = data.client.displayName;
        }
        else {

            displayName = data.displayName;
        }
        if(undefined == displayName ){
            alert("当前文件无法解析，请联系程序开发人员");
        }
        if(data.lines[0].length > 1){

            SujectList.options.add(new Option("第" + SubjectTmplId + "关" + "：     " + displayName, SubjectTmplId));
        }
    });
    canvas.width = 785 * PIXEL_RATIO;
    canvas.height = 460 * PIXEL_RATIO;
}




previewButton.onclick = function () {

    payLineColorEB = document.getElementById("PayLineColorEB").value;
    backGroundPayLineColorEB = document.getElementById("BackGroundPayLineColorEB").value;
    numPostionList = document.getElementById("NumPostionList").value;
    serialNumTypeEB = document.getElementById("SerialNumTypeEB").value;
    serialNumColorEB = document.getElementById("SerialNumColorEB").value;

    serialNumSizeEB = document.getElementById("SerialNumSizeEB").value;
    if("" == serialNumSizeEB) {
        serialNumSizeEB = 30;
        document.getElementById("SerialNumSizeEB").value = 30;
    }

    serialNumSizeEB = parseInt(serialNumSizeEB);

    rowNumEB = document.getElementById("RowNumEB").value;
    if("" == rowNumEB) {
        rowNumEB = 5;
        document.getElementById("RowNumEB").value = 5;
    }
    rowNumEB = parseInt(rowNumEB);
    var selectnum = document.getElementById("SujectList").value; //当前关卡数

        context.clearRect(0, 0, 785, 460);

    GetArrOption(selectnum);
};
//获取json文件里面line的属性
//selectnum:当前选择的关卡数
function GetArrOption(selectnum) {

    if(loadJsonFile == false) {
        $.getJSON(PreUrlName + selectnum + ".json", function (data) {
            var data = data;
            GetInfoPayline(data)
        });
    }
    else {
        var data = jsonFile;
        var selectnum = jsonFile.subjectTmplId;
        GetInfoPayline(data)
    }
    ShowFileName(selectnum);
}



//解析每条payline的信息
//data：从文件里面读取出来的属性
function GetInfoPayline(data) {
    var i = 0;
    var j = 0;
    var data = data;
    arrx = (data.lines[0][0]).rows.length;
    arry = 0;
    while (undefined != data.lines[0][i]) {

        for (j = 0; undefined != (data.lines[0][i]).rows[j]; j++) {

            if (arry < (data.lines[0][i]).rows[j]) {

                arry = (data.lines[0][i]).rows[j];
            }
        }
        i++;
    }
    arry = arry + 1;
    document.getElementById("NumOfJsonEb").value = i;
    Countdata(i,data);
}


//根据当前选择关卡数生成保存后的文件名
//selectnum:当前选择的关卡数
function ShowFileName(selectnum) {
    var selectnum =selectnum;

    $.getJSON( PreUrlName + selectnum + SufUrlName,function (data) {
        var displayName  ;
        if (undefined === data.displayName) {

            displayName = data.client.displayName;
        }
        else {

            displayName = data.displayName;
        }
        if(undefined == displayName ){
            alert("当前文件无法解析，请联系程序开发人员");
        }
           document.getElementById("FileNameEB").value =  selectnum + "_" + displayName +"_paylines.png";
    });
    loadJsonFile = false;
}



//根据获得的用户输入参数 对每个payline进行计算
function Countdata(i,data) {

    var data = data;

    if("up" == numPostionList || "down" == numPostionList) {                         //当前序号位置为上下

        paylineWidth = (745 * arrx) / (rowNumEB * ( arrx + 1 ) - 1);
        paylineHeight = paylineWidth / arrx * arry;
        movx = paylineWidth + paylineWidth / arrx;
        movy = paylineHeight +  serialNumSizeEB + 2 * paylineHeight / arry ;
        DrawPaytable(i, data);
    }

    else if("left" == numPostionList || "right" == numPostionList){                             //当前序号位置为左右

        paylineWidth = ((745 - rowNumEB * serialNumSizeEB) * arrx)/ (rowNumEB* arrx + 2*rowNumEB-1);
        paylineHeight = paylineWidth / arrx * arry;
        movx = paylineWidth + serialNumSizeEB + 2 * paylineWidth /arrx;
        movy = paylineHeight + paylineHeight / arry;
        DrawPaytable(i,data);

    }

}

//根据数据绘制整个paytable
function DrawPaytable(i,data) {

    var count = 0;
    var x =20;
    var y =20;
    if("up" == numPostionList) {
         y = 20 + serialNumSizeEB;
    }else if("left" == numPostionList){
         x = 20 + serialNumSizeEB;
    }
    seleSerialEB1 = document.getElementById("SeleSerialEB1").value;
    if("" == seleSerialEB1) {
        seleSerialEB1 = 1;
        document.getElementById("SeleSerialEB1").value = seleSerialEB1;

    } seleSerialEB1 = parseInt(seleSerialEB1);
    seleSerialEB2 = document.getElementById("SeleSerialEB2").value;
    if("" == seleSerialEB2) {
        seleSerialEB2 = i;
        document.getElementById("SeleSerialEB2").value = seleSerialEB2;

    }seleSerialEB2 = parseInt(seleSerialEB2);
   if(seleSerialEB2<seleSerialEB1) {
       window.alert("输入的参数不正确，请修改");
       return;
   }
    for(var j =(seleSerialEB1 -1);j<seleSerialEB2 ;j++) {

        if( y + paylineHeight > 460){
            window.alert("当前设定每行元素数过少，或者选择的绘制赢钱线过多，请调整输入的参数");
            break;
        }

        DrawPayline(x,y,paylineWidth,paylineHeight,data,j);
        x = x + movx;
        count++;

        if(rowNumEB == count){
            x=20;
            if("left" == numPostionList) {
                 x = 20 + serialNumSizeEB;
            }
            y = y + movy;
            y = Math.round(y);
            count =0;
        }


    }

}


//当前pay所画的位置及长度宽度和当前是文件中的第几条赢钱线
function DrawPayline(x , y , width , height , data , d) {
//根据json文件里面的配置画图，

    var serialPosx = 0;
    var serialPosy = 0;
    var x1 = x;
    var y1 = y;
    var mx = x1;
    var my = y;
    var width1 = width/arrx - 2;
    var height1 = height/arry - 2;


    if("up" == numPostionList) {
        serialPosx = x + width/2;
        serialPosy = y - serialNumSizeEB/2;
    }
    else if ("down" == numPostionList) {
        serialPosx = x + width/2;
        serialPosy = y + height + serialNumSizeEB;
    }
    else if("left" == numPostionList){
        serialPosx = x - serialNumSizeEB;
        serialPosy = y + height/2 + (serialNumSizeEB-10)/2;
    }
    else if("right" == numPostionList){
        serialPosx = x + width +  serialNumSizeEB/2 + width1;
        serialPosy = y + height/2 + (serialNumSizeEB-10)/2;
    }



    for(var i =0;i<arrx ;i++) {
        for(var j =0; j<arry;j++){

            if (((arry-j-1) == (data.lines[0][d]).rows[i])) {
                context.fillStyle = payLineColorEB;
            }
            else {
                context.fillStyle = backGroundPayLineColorEB;
            }

            context.fillRect(x1, y1, width1, height1);
            y1 = y1 + height1 +2;
            y1 = Math.round(y1);
        }
        x1 = x1 + width1 +2;
        x1 = Math.round(x1);
        y1 = my;
        y1 = Math.round(y1);
    }
    context.font = serialNumSizeEB + "px " + serialNumTypeEB;
    context.fillStyle = serialNumColorEB;
    context.textAlign = "center";
    context.fillText(d + 1, serialPosx, serialPosy);

}


//读取选择的背景图文件显示到预览界面上
$("#Files").on("change", function(e) {

    var file = e.target.files[0]; //获取图片资源

    // 只选择图片文件
    if (!file.type.match('image.*')) {
        return false;
    }

    var reader = new FileReader();

    reader.readAsDataURL(file); // 读取文件

    // 渲染文件
    reader.onload = function(arg) {

        var img = arg.target.result ;
        document.getElementById("ImgInput").src = img;
    }
});

$("#SeleFiles").on("change", function(e) {

    var file = e.target.files[0]; //获取Json资源


    loadJsonFile = true;

    var reader = new FileReader();

    reader.readAsText(file); // 读取文件


    reader.onload = function(arg) {

        jsonFile =  JSON.parse(arg.target.result);

    }
});
$("#SujectList").change(function () {
        var selectNum = document.getElementById("SujectList").value;

        $.getJSON(PreUrlName + selectNum + ".json", function (data) {
            count = 0;
            while (undefined != data.lines[0][count]) {
            count++;
        }
            document.getElementById("NumOfJsonEb").value = count;
            seleSerialEB2 = count;
            seleSerialEB1 = 1;
            document.getElementById("SeleSerialEB2").value = seleSerialEB2
            document.getElementById("SeleSerialEB1").value = seleSerialEB1

        });


});






