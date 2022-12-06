var nameError = document.getElementById('name-error')
var emailError = document.getElementById('email-error')
var mobileError = document.getElementById('mobile-error')
function namevalidation(){
    var name = document.getElementById('name').value;
    if (name.length === 0) {

        nameError.innerHTML = 'Name required';
        return
        
        
    }
     if (!name.match(/[A-Za-z]/)) {
        nameError.innerHTML = 'Write Full Name';
        return 
        
    
    }

    if(!name.length==0){
   console.log(name.length)
   nameError.innerHTML = '';
   return

    
    }
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
