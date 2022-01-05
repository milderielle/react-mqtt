import React, { useState, useEffect } from "react"
import "./App.css"

var mqtt = require("mqtt")

  function App() 
  {
    /*function pm25_sceen (message_json){
      //setValue_pm25  (message_json['data']['pm25'])
    }*/

  function social_sceen (message_json){
    setValue_social_text  (message_json['data']['text'])
  }

  function check_temporhum(message_json){
    var Value_temp = message_json['data']['temp'] /*ประกาศตัวแปล ข้อความใน data 'temp'*/
    var Value_Hum = message_json['data']['humid'] /*ประกาศตัวแปล ข้อความใน data 'humid'*/
    setValue_Hum (message_json['data']['humid'])
    cal_realfeel(Value_temp,Value_Hum)
    
    /*process*/
    if (Value_temp_calfeel >= 0) {
      setColor("white")
      setStatus("นี่มันจะหนาวเกินไปแล้วนะ")
      setEmoji("🥶")
      
    } if (Value_temp_calfeel >= 20) {
      setColor("#AAD062")
      setStatus("หนาวจัง")
      setEmoji("😆")
     
    } if (Value_temp_calfeel >= 25) {
      setColor("#F8D45D")
      setStatus("อากาศเย็นกำลังดีเลย")
      setEmoji("😊")
     
    } if (Value_temp_calfeel >= 30) {
      setColor("#FB9A51")
      setStatus("อากาศร้อนจัง")
      setEmoji("😕")
      
    } if (Value_temp_calfeel >= 35) {
      setColor("#F76669")
      setStatus("ร้อนมากเลย เปิดแอร์ให้หน่อย")
      setEmoji("😖")
      
    } 
    return true
  }
  /*end process*/

  //คำนวนค่าความรู้สึกต่ออุณภูมินั้นจริงๆ
  function cal_realfeel(t,h) {
    var h = 0
    var tf = (t*9/5) + 32;
    var realfeel = 0
    var realfeel = (-42.379) + (2.04901523 * tf) + (10.14333127 * h) - (0.22475541 * tf * h) - (6.83783 * Math.pow(10, -3) * Math.pow(tf, 2)) - (5.481717 * Math.pow(10, -2) * Math.pow(h, 2)) + (1.22874 * Math.pow(10, -3) * Math.pow(tf, 2) * h) + (8.5282 * Math.pow(10, -4) * tf * Math.pow(h, 2)) - (1.99 * Math.pow(10, -6) * Math.pow(tf, 2) * Math.pow(h, 2));
    var realfeel = parseFloat((realfeel - 32) / 1.80).toFixed( 1 );
    setValue_temp_cal(t)
    setValue_temp_calfeel(realfeel)
    return true
  }

  function check_type_message(topic,message){
    var message_json = {}
    //เช็คว่ามีข้อมูลอะไรเข้ามาจริงไหม
    if (topic != " " && message != " " ){

      //เช็คว่านี่ไม่ใช่ string ใช่ใหม เพราะต่อให้พยายามทำให้เป็น string ก็มาในรูปเเบบ ofject อยู่ดี ยังไงก็ต้องดักไว้ก่อนเพื่อความชัว
      if(typeof(message) == "object"){
        message = message.toString()

        //ส่วนนี้จะเป็นตัวเช็คว่าเป็น json หรือไม่ ถ้าไม่่ผ่านจุดนี้ถือว่าเป็น false ทันที
        try{
          
            message_json = message.trim()
            message_json = message_json.replace(/'/g,'"')
            message_json =  JSON.parse(message_json)
            setPayload({ topic, message: message_json })
            if (message_json['type'] == "weather"){
              check_temporhum(message_json)
            }
            //if (message_json['type'] == "pm25"){
              //pm25_sceen (message_json)
            //}
            if (message_json['type'] == "social"){
              social_sceen(message_json)
            }
            
        }
        catch{
          setmessage_string(message)
        }
        }

    }
  }
  
  const [message_string, setmessage_string] = useState("")
  const [Value_social_text, setValue_social_text] = useState("")
  //const [Value_pm25, setValue_pm25] = useState(-1)
  const [Value_temp, setValue_temp] = useState(-1)
  const [Value_Hum, setValue_Hum] = useState(-1)
  const [Value_temp_cal, setValue_temp_cal] = useState(-1)
  const [Value_temp_calfeel, setValue_temp_calfeel] = useState(-1)
  const [payload, setPayload] = useState({})
  const [color, setColor] = useState("#A3DA8D")
  const [status, setStatus] = useState("กำลังวิเคราะห์ข้อมูล")
  const [emoji, setEmoji] = useState("")
  const [ms, setms] = useState("")
  const subTopic = "e775b1245d94ea4a79be6ce40cf96929"
  const broker = "hivemq"
  var client = mqtt.connect("ws://broker.hivemq.com:8000/mqtt",options)
  var options={
      retain:true,
      qos:1,
      clientId:"mqttjs01",
      clean:true};

  client.subscribe(subTopic)
  client.on("message", function (topic, message) {
    //รับค่ามาปกติเเปลงเป็น string 
    // message = message.toString()
    console.log(message)
    console.log(typeof(message))
    check_type_message(topic,message)
  })


  //ส่วนของการเเสดงผลหน้าเว็บ
  return (
    <div className="App">
      <header className="App-header">
        <h2>Subscribe Topic: {`${subTopic}`}</h2>
        <h3>Broker: {`${broker}`} </h3>
        <p>message: {message_string}</p>
        <div className="social_layout" style={{ margin: 0 }}>{Value_social_text}</div>
        
        <div className="show" >
          <div className="temp_box" >
            <h5 style={{ margin: 0 }}>อุณหภูมิ: {Value_temp_cal} °C</h5>
            <h5 style={{ margin: 0 }}>ความรู้สึกจริง: {Value_temp_calfeel} °C</h5>
            <h5 style={{ margin: 0 }}>ความชื้น: {Value_Hum} %</h5>
            
            <br></br>
          </div>

          <div className="hum_box" style={{ background: color }}>
            <h4 style={{ margin: 0 }}>{status}</h4>
            
            <div className="emoji_layout" >{emoji}</div>
          </div>


          <div className="rcorners" style={{ background: color }}>
            <h4 style={{ margin: 0 }}>{status}</h4>
            
            <div className="emoji_layout" >{emoji}</div>
          </div>

          <div className="hum_box1" style={{ background: color }}>
            <h4 style={{ margin: 0 }}>{status}</h4>

            <div className="emoji_layout" >{emoji}</div>
          </div>

        </div>
      </header>
    </div>
  )
}

export default App;