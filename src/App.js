import React, { useState, useEffect } from "react"
import "./App.css"

var mqtt = require("mqtt")

function App() {
  const [value, setValue] = useState(-1)
  const [payload, setPayload] = useState({})
  const [color, setColor] = useState("white")
  const [status, setStatus] = useState("")
  const [emoji, setEmoji] = useState("") //6-11 ประกาศตัวแปร
  const subTopic = "mild new"
  const broker = "hive mq" //ประกาศ brok ที่จะใช้
  var client = mqtt.connect("ws://broker.hivemq.com:8000/mqtt")


  client.subscribe(subTopic) // subscribe topic บ.12

  client.on("message", function (topic, message) { //ประกาศเพื่อเช็ค topic message
    message = message.toString() //เปลี่ยน mes เป็น str
    setPayload({ topic, message: message })
    if (topic.split("/").includes("pm2.5")) {
      setValue(parseFloat(message)) //เปลี่ยน pm ที่มีเป็น ที่เราป้อนลงไป
    }
  })

  useEffect(() => {
    console.log("Payload:", payload)
  }, [payload])

  useEffect(() => { //ทำตาม loop
    console.log("Value:", value)
    if (value < 0) {
      setColor("white")
      setStatus("")
      setEmoji("")
    } else if (value >= 0 && value < 12.1) {
      setColor("#AAD062")
      setStatus("Good: 0-12")
      setEmoji("😊")
    } else if (value < 35.5) {
      setColor("#F8D45D")
      setStatus("Moderate: 12.1-35.4")
      setEmoji("😐")
    } else if (value < 55.5) {
      setColor("#FB9A51")
      setStatus("Unhealthy for sensitive groups: 35.5-55.4")
      setEmoji("😕")
    } else if (value < 150.5) {
      setColor("#F76669")
      setStatus("Unhealthy: 55.5-150.4")
      setEmoji("😖")
    } else if (value < 250.5) {
      setColor("#A57DBB")
      setStatus("Very Unhealthy: 150.5-250.4")
      setEmoji("😷")
    } else {
      setColor("#A07684")
      setStatus("Hazardous: 250.5+")
      setEmoji("🤮")
    } //ทำตาม loop

  }, [value])
  return ( //แสดงค่า return
    <div className="App">
      <header className="App-header">
        <h2>Subscribe Topic: {`${subTopic}`}</h2>
        <h3>Broker: {`${broker}`} </h3> 
        <p>Payload: {JSON.stringify(payload)}</p>
        <div className="rcorners" style={{ background: color }}>
          <h4 style={{ margin: 0 }}>{status}</h4>
          <h5 style={{ margin: 0 }}>PM2.5: {value}</h5>
          {emoji}
        </div>
      </header>
    </div>
  )
}

export default App
