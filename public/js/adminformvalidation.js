var nameError = document.getElementById('name-error')
var emailError = document.getElementById('email-error')
var mobileError = document.getElementById('mobile-error')
var offerError = document.getElementById('offer-error')

const form=document.getElementById('form');


function validateName(){
    var regexUpperCase= /^(?=.*[A-Z]).*$/

    var name = document.getElementById('name').value;
    if(name.length == 0){
        nameError.innerHTML = 'Name required';
        return false;
    }
    if(!name.match(/[A-Za-z]/)){
        nameError.innerHTML = 'Write Full Name';
        return false;
    }
    else if(!regexUpperCase.test(name)){
        nameError.innerHTML = 'first letter should be capital';

    }
    else{
        console.log(name.length)
        nameError.innerHTML = '';
        return true
     
         
         }
}
function validateMobile(){

    var mobile = document.getElementById('phone').value;
    if(mobile.length==0){
        mobileError.innerHTML = 'Mobile no required'
        return false;
    }
    if(!mobile.match(/^[0-9]{10}$/)){
        mobileError.innerHTML = 'Mobile no Invalid'
        return false;
    }
    if(mobile.length !==10){
        mobileError.innerHTML = 'Mobile no should be 10 digits'
        return false;
    }
    mobileError.innerHTML=''
    return true;
}
function validateEmail(){
    var email =  document.getElementById('email').value;
    if(email.length==0){
        emailError.innerHTML = 'Email required'
        return false;
    }
    if(!email.match(/^[A-Za-z\._\-[0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)){
        emailError.innerHTML = 'Email Invalid'
        return false;
    }
    emailError.innerHTML=''
    return true;
}
function validateOfferprice(){
    var price = document.getElementById('price').value
   var offer=document.getElementById('offerprice').value
   var dis=price/offer
   console.log(dis)
   if(1 < dis){
    offerError.innerHTML=''
    return true
   }
   else{
    offerError.innerHTML='offer not great than price'
  return false
   }
   
    
}

function validateRepass(){
    
}

function valideform(){
    
    if( validateName()&&validateOfferprice()){
        return true;
    }
    else{
        return false;
    }
}