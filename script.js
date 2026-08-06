import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBfPpj3DrWTfQm6E6PtD3OtEKZDbeCsH-M",
    authDomain: "air-quality-725ca.firebaseapp.com",
    databaseURL: "https://air-quality-725ca-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "air-quality-725ca",
    storageBucket: "air-quality-725ca.firebasestorage.app",
    messagingSenderId: "178960255123",
    appId: "1:178960255123:web:b6ebfbc0fa311383186566",
    measurementId: "G-6PJWCY3M3Y"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function updateClock() {
    const now = new Date();
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    document.getElementById("currentDate").innerText = now.toLocaleDateString('th-TH', dateOptions);
    document.getElementById("currentTime").innerText = now.toLocaleTimeString('th-TH', { hour12: false });
}

setInterval(updateClock, 1000);
updateClock();

let PM25 = 0;
let CO2 = 0;
let TEMP = 0;
let RH = 0;

function getPm25Color(val) {
    if (val <= 12) return "#00b4d8";      
    if (val <= 25) return "#10b981";      
    if (val <= 35) return "#f97316";      
    return "#ef4444";                     
}

function getCo2Color(val) {
    if (val <= 600) return "#10b981";     
    if (val <= 800) return "#eab308";     
    if (val <= 1000) return "#f97316";    
    return "#ef4444";                     
}

function getTempColor(val) {
    const minTemp = 18;
    const maxTemp = 32;

    let clamped = Math.max(minTemp, Math.min(maxTemp, val));
    let ratio = (clamped - minTemp) / (maxTemp - minTemp);
    let hue = 240 - (ratio * 240);

    return `hsl(${hue}, 85%, 45%)`;
}

function getRhColor(val) {
    if (val < 40) return "#f97316";       
    if (val <= 60) return "#10b981";      
    if (val <= 70) return "#eab308";      
    return "#ef4444";                     
}

function updateSensorUI() {
    document.getElementById("pm25").innerText = PM25;
    document.getElementById("co2").innerText = Math.round(CO2);
    document.getElementById("temp").innerText = typeof TEMP === 'number' ? TEMP.toFixed(1) : TEMP;
    document.getElementById("rh").innerText = typeof RH === 'number' ? RH.toFixed(1) : RH;

    document.getElementById("pm25").style.color = getPm25Color(PM25);
    document.getElementById("co2").style.color = getCo2Color(CO2);
    document.getElementById("temp").style.color = getTempColor(TEMP);
    document.getElementById("rh").style.color = getRhColor(RH);
}

function calculateAirQuality() {
    let imgPath = "1.png";
    let text = "อากาศดีเยี่ยม";
    let statusColor = "#00b4d8";

    if (PM25 > 35 || CO2 > 1000) {
        imgPath = "5.png";
        text = "อันตรายต่อสุขภาพ";
        statusColor = "#ef4444";
    }
    else if (PM25 > 25 || CO2 > 800) {
        imgPath = "4.png";
        text = "อากาศเริ่มไม่ดี";
        statusColor = "#f97316";
    }
    else if (PM25 > 20 || CO2 > 600) {
        imgPath = "3.png";
        text = "อากาศปานกลาง";
        statusColor = "#eab308";
    }
    else if (PM25 > 15 || CO2 > 400) {
        imgPath = "2.png";
        text = "อากาศดี";
        statusColor = "#10b981";
    }
    else {
        imgPath = "1.png";
        text = "อากาศดีเยี่ยม";
        statusColor = "#00b4d8";
    }

    document.getElementById("emoji").src = imgPath;
    document.getElementById("statusText").innerHTML = text;
    document.getElementById("statusText").style.color = statusColor;
}

const envRef = ref(database, 'Environment/Current'); 

onValue(envRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        PM25 = data.pm25 !== undefined ? data.pm25 : 0;
        CO2 = data.co2 !== undefined ? data.co2 : 0;
        TEMP = data.temperature !== undefined ? data.temperature : 0;
        RH = data.humidity !== undefined ? data.humidity : 0;

        updateSensorUI();
        calculateAirQuality();
    }
});
