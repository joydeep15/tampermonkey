// ==UserScript==
// @name         autofill-ph
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Joydeep
// @match        https://selfregistration.cowin.gov.in/
// @icon         https://www.google.com/s2/favicons?domain=gov.in
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let typeURL = "http://127.0.0.1:8123/type?text="
    let phone = ""
    let dburl = "https://kvdb.io/"
    let bucketKey = ""
    let maxTries = 1
    let timer;

    function sendRequest(url, method){
        return new Promise((resolve, reject) => {
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    // Typical action to be performed when the document is ready:
                    console.log(this.responseText)
                    resolve()
                }
            };
            xhttp.open(method, url, true);
            xhttp.send();
        });
    }

    function KeyboardFill(data) {
        return sendRequest(typeURL + data, "GET")
    }

    function clicker(){
        let btn = document.getElementsByTagName('ion-button')[0]
        btn.click()
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
      
    async function getOtp(){
        var t0 = performance.now()
        let response = "no suitable response"
        for(let i = 0; i < maxTries; i++){
            let text = await fetch(dburl+bucketKey+'/'+phone)
                    .then(r => r.text())   
            console.log("Received response: "+text)
            let matches = text.match(/(\d+)/)
            if(matches){
                response = matches[0]
                break;
            }
            await sleep(200)
        }    
        var t1 = performance.now()
        console.log("Call to getOTP took " + (t1 - t0) + " milliseconds.")
        return response;        
    }
    
    function deleteStaleData(){
        return sendRequest(dburl+bucketKey+'/'+phone, "DELETE")
    }

    function registrar(){

        let textFields = document.getElementsByTagName('input')
        for(let i = 0; i < textFields.length; i++){
            
            if(textFields[i].placeholder.toLocaleLowerCase().includes('mobile')){
                //fill mobile no here
                textFields[i].onmousedown = () => {KeyboardFill(phone).then(clicker)}
            }

            if(textFields[i].placeholder.toLocaleLowerCase().includes('otp')){
                //fill otp here
                textFields[i].onmousedown = () => {
                    getOtp().then(otp => {
                        console.log("writing otpee: "+otp)
                        KeyboardFill(otp).then(clicker)
                    })
                }
            }
        }
    }
    timer = setInterval(registrar, 100);
    deleteStaleData()


})();
