

function doGet(e) {
  return ceksheet(e);
}
function doPost(e) {
  return ceksheet(e);
}

function ceksheet(e){
  var ss = SpreadsheetApp.openById('1W9b2kGFO44Qq7-fYbaEbopkYxyUICD14e4PO4X93J88');
  var sh = ss.getSheetByName(e.parameter.sh); 
  
  //CREATE
  if (e.parameter.func == "Create") {
    // var nomor = e.parameter.NOMOR;
    var tanggal = e.parameter.TANGGAL;
    var jumlah = e.parameter.JUMLAH;
    var harga = e.parameter.HARGA;
    var data=false;
    // var lr= sh.getLastRow();
    // for(var i=1;i<=lr;i++){
    //   var data_nomor = sh.getRange(i, 1).getValue();
    //   if(data_nomor==nomor){
    //     data=true;
    //   } 
    // }
    // if (data){
    //   var result= "Nomor Data Sudah ada";
    // }else{
    // }
    var rowData = sh.appendRow(["'"+tanggal,jumlah,harga]);
    // var lastrow = sh.getLastRow();
    // var range = sh.getRange(lastrow + 1,1);
    // range.setNumberFormat("@");
    var result="Berhasil Input";
    return ContentService.createTextOutput(result).setMimeType(ContentService.MimeType.TEXT);
  }

  //read
  if (e.parameter.func == "Read") {
    var rg=sh.getDataRange().getValues();
    var data="";
    for(var row=0;row<rg.length;++row){
      data +=rg[row].join(',')+'\n';
    }
    return ContentService.createTextOutput(data).setMimeType(ContentService.MimeType.TEXT);
  }

  //editharga
  if (e.parameter.func == "Edit"){
    var harganew = e.parameter.HARGANEW;
    sh.getRange(1,1).setValue(harganew);
    var res = "data berhasil diubah";
    return ContentService.createTextOutput(res).setMimeType(ContentService.MimeType.TEXT);

  }

  if (e.parameter.func == "Harga") {
    var data=sh.getRange(1,1).getValues();
    // var data="";
    // for(var row=0;row<rg.length;++row){
    //   data +=rg[row].join(',')+'\n';
    // }
    return ContentService.createTextOutput(data).setMimeType(ContentService.MimeType.TEXT);
  }
  }