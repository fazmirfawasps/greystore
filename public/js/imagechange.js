var img = document.getElementById('change');
var attr = img.getAttribute('src');

var image = document.getElementById('chng');
var attri = image.getAttribute('src');




function change(){
    console.log(attr)
    
  document.getElementById('target').src=attr
  document.getElementById('tar').src=attr


}

function chng(){

    document.getElementById('target').src=attri
    document.getElementById('tar') .src=attri

}
