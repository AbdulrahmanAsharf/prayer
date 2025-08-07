import { useEffect } from "react"
import Prayar from "./commonents/Prayar"
import { useState } from "react"
import axios from "axios"
import moment from "moment"
import "moment/dist/locale/ar-kw"
moment.locale('ar-kw')
function App() {
  const [prayartimer, setPrayartimer] = useState({})
  const [datatimer, setDatatimer] = useState('')
  const [city , setCity] = useState('Cairo')
  const [nextPrayerIndex, setNextPrayerIndex] = useState(2);
  const [remainingTime, setRemainingTime] = useState("");
  const cities = [
    { name: "القاهره", value: "Cairo" },
    { name: "الاسكندريه", value: "Alexandria" },
    { name: "المنيا", value: "Minya" },
    { name: "المنوفيه", value: "Monufia" },
    { name: "الفيوم", value: "Faiyum" },
    { name: "الشرقيه", value: "Sharqia" }
  ]
  const prayersArray = [
		{ key: "Fajr", displayName: "الفجر" },
		{ key: "Dhuhr", displayName: "الظهر" },
		{ key: "Asr", displayName: "العصر" },
		{ key: "Sunset", displayName: "المغرب" },
		{ key: "Isha", displayName: "العشاء" },
	];
  const date= moment().format("l").replaceAll("/", "-")
  console.log(date)
  const g = moment().format('h:mm:ss a')
  console.log(g)
  useEffect(()=>{
    const fetchprayertime = async()=>{
      try{
        const r = await axios.get(`https://api.aladhan.com/v1/timingsByCity/${date}?city=${city}&country=egypt&method=8`)
        console.log(r.data.data.timings)
        setPrayartimer(r.data.data.timings)
        console.log(r.data.data.date.gregorian.date)
        setDatatimer(r.data.data.date.gregorian.date)

      }catch(error){
        console.error(error)
      }
    }
    fetchprayertime()
  },[city])

  useEffect(()=>{
    let interval = setInterval(()=>{
      console.log('calling timer')
      setupCountdownTimer()
    },1000)
    return ()=>{
      clearInterval(interval)
    }
  })
  const fornatimes = (time) =>{
    if(!time){
      return "00.00";
    }
    let [hours , mintes] = time.split(":").map(Number)
    const pard = hours >= 12 ? "PM" : "Am"
    hours = hours % 12 || 12
    return `${hours}:${mintes.toString().padStart(2, "0")} ${pard}`
  }
  const setupCountdownTimer = () =>{
    const momentNow = moment()
    let nextPrayer = 2
    if(momentNow.isAfter(moment(prayartimer["Fajr"],"hh,mm"))
      &&momentNow.isBefore(moment(prayartimer["Dhuhr"],"hh,mm"))){
        nextPrayer = 1
    }else if(momentNow.isAfter(moment(prayartimer["Dhuhr"],"hh:mm"))
            &&momentNow.isBefore(moment(prayartimer["Asr"],"hh:mm"))){
        nextPrayer = 2
    }else if(momentNow.isAfter(moment(prayartimer["Asr"],"hh,mm"))
            &&momentNow.isBefore(moment(prayartimer["Maghrib"],"hh:mm"))){
      nextPrayer = 3
    }else if(momentNow.isAfter(moment(prayartimer['Maghrib'],"hh,mm"))
            && momentNow.isBefore(moment(prayartimer["Isha"],"hh,mm"))){
      nextPrayer = 4
    }else {
      nextPrayer = 0
    }
    setNextPrayerIndex(nextPrayer);
    const nextPrayerObject = prayersArray[nextPrayer];
		const nextPrayerTime = prayartimer[nextPrayerObject.key];
		const nextPrayerTimeMoment = moment(nextPrayerTime, "hh:mm");

		let remainingTime = moment(nextPrayerTime, "hh:mm").diff(momentNow);

		if (remainingTime < 0) {
    
			const midnightDiff = moment("23:59:59", "hh:mm:ss").diff(momentNow);
			const fajrToMidnightDiff = nextPrayerTimeMoment.diff(moment("00:00:00", "hh:mm:ss"));
      
			const totalDiffernce = midnightDiff + fajrToMidnightDiff;

			remainingTime = totalDiffernce;
		}
		console.log(remainingTime);
		const durationRemainingTime = moment.duration(remainingTime);
    setRemainingTime(
			`${durationRemainingTime.seconds()} : ${durationRemainingTime.minutes()} : ${durationRemainingTime.hours()}`
		);
    
    console.log(durationRemainingTime)
  
  }
  return (
      <section>
        <div className="container">
          <div className="top_sec">
            <div className="city">
              <h3>المدنيه</h3>
              <select onChange={(e)=> setCity(e.target.value)}>
                {
                  cities.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.name}
                    </option>
                  ))
                }
                
              </select>
            </div>
            <div className="date">
              <h3>التاريخ</h3>
              <h4>{datatimer}</h4>
            </div>
            <div>
              <h3>متبقي علي صلاه {prayersArray[nextPrayerIndex].displayName}</h3>
              <h3 >{remainingTime}</h3>
            </div>
          </div>
          <Prayar name="الفجر"  time={fornatimes(prayartimer.Fajr)}/>
          <Prayar name= "الظهر" time={fornatimes(prayartimer.Dhuhr)}/>
          <Prayar name ="العصر" time={fornatimes(prayartimer.Asr)}/>
          <Prayar name="المغرب" time={fornatimes(prayartimer.Maghrib)}/>
          <Prayar name="العشاء" time={fornatimes(prayartimer.Isha)}/>
        </div>
      </section>
  )
}

export default App



