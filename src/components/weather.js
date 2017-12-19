import React, { Component } from 'react';
import {geolocated} from 'react-geolocated';
import { ResponsiveLine } from '@nivo/line';
// var PropTypes = require('prop-types');
let axios = require('axios');


class Weather extends Component{

	constructor(props){
		super(props);

		this.state = {
			//current weather info
			currentTemp: '',
			location: '',
			lastUpdated: '',
			condition: '',
			conditionIcon: '',
			localTimeEpoch: 0,

			//todays hourly info
			hourly: null,

			//forecast info 7 days
			forecast: null,

			//hourly/forecast data
			hourlyData: null,
			forecastData: null,

		}

		this.getDate = this.getDate.bind(this);		
		this.getTime = this.getTime.bind(this);
		this.getHourlyData = this.getHourlyData.bind(this);
		this.getForecastData = this.getForecastData.bind(this);
	}

	componentDidMount(){
		axios.get('https://api.apixu.com/v1/forecast.json?key=f7ceca9d7c314abbaf681318171112&q='+this.props.lat+','+this.props.lon+'&days=7')
		.then(res => {		
			let forecast = res.data.forecast.forecastday.map(obj => obj);
			let hourly = res.data.forecast.forecastday[0].hour.map(obj => obj);			

			this.setState({
				currentTemp: res.data.current.temp_f,
				location: res.data.location.name,
				lastUpdated: res.data.current.last_updated,
				condition: res.data.current.condition.text,
				conditionIcon: res.data.current.condition.icon,
				localTimeEpoch: res.data.current.last_updated_epoch,
				hourly: hourly,
				forecast: forecast,
			})

			this.setState({
				hourlyData: this.getHourlyData(),
				forecastData: this.getForecastData(),
			})
		});
		// axios.get('http://api.openweathermap.org/data/2.5/forecast?lat='+this.props.lat+'&lon='+this.props.lon+"&appid=dfacdd77f3311653e15c359849792e9a")
		// .then(res=> {
		// 	console.log(res.data.city);
		// 	let weather = res.data.list.map(obj => obj);			
		// 	let updateWeather = [];
		// 	let days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
		// 	for(let i = this.getDate(weather[0].dt),j=0;;i++){

		// 		let lowTemp = weather[j].main.temp;
		// 		let highTemp = weather[j].main.temp;
		// 		let type = weather[j].weather[0].main;

		// 		while(j < res.data.list.length && this.getDate(weather[j].dt_txt) === i){
		// 			highTemp = Math.max(weather[j].main.temp, highTemp);
		// 			lowTemp = Math.min(weather[j].main.temp, lowTemp);
		// 			j++;
		// 		}		

		// 		updateWeather.push({
		// 			lowTemp: Math.round((this.convertToF(lowTemp)*100)/100),
		// 			highTemp: Math.round((this.convertToF(highTemp)*100)/100),
		// 			type: type,
		// 			day: days[i],
		// 		});

		// 		if(j >= res.data.list.length) break;
		// 		if(i===6) i = -1;

		// 	}

		// 	this.setState({
		// 		weather: updateWeather,
		// 	})
		// });	
	}

	getDate(dt){
		let drrt = new Date(dt);

		return drrt.getDay();
	}

	getTime(t){
		var time = t.split(":");
		var hour = parseInt(time[0]);

		if(hour === 0) return "12 AM";
		else if(hour > 12){
			return hour-12 + " PM";
		} else
			return hour + " AM";
	}

	getHourlyData(){
		if(!this.state.hourly) return;
		let hourly = this.state.hourly;
		let nextDayHourly = this.state.forecast[1].hour;
		
		let data = [
					  {
					  	"id": "hourly",
					  	"color": "hsl(0, 100%, 100%)",
					  	"data": [
					  	],
					  }
					];		

		var i = 0;

		while(this.state.localTimeEpoch > hourly[i].time_epoch){
			i++;
		}
	
		var hourCount = 0;
		while(i < hourly.length && hourCount < 5){			
			data[0].data.push(
				{
					"color": "hsl(0, 100%, 100%)",
					"x": this.getTime(nextDayHourly[i].time.split(" ")[1]),
					"y": hourly[i].temp_f,
				}
			)
			hourCount++;
			i+=3;
		}
		i = 0;
		if(hourCount < 5){
			while(hourCount < 5){
				data[0].data.push(
					{
						"color": "hsl(0, 100%, 100%)",
						"x": this.getTime(nextDayHourly[i].time.split(" ")[1]),
						"y": nextDayHourly[i].temp_f,
					}
				)
				hourCount++;
				i+=3;
			}
		}
		return data;
	}

	getForecastData(){
		if(!this.state.forecast) return;
		let forecast = this.state.forecast;
		let days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

		let data = [];
		let dataA = {
					  	"id": "highs",
					  	"color": "hsl(199, 100%, 80%)",
					  	"data": [
					  	],
					 };

		let dataB = {
					  	"id": "lows",
					  	"color": "hsl(199, 100%, 80%)",
					  	"data": [
					  	],
					 };

		var day = this.getDate(forecast[0].date_epoch);
		day === 6 ? day = 1 : day++;
		for(var i = 0; i < 7; i++){						
			dataA.data.push(
				{
						"color": "hsl(199, 100%, 80%)",
						"x": i===0? "Today" : days[day],
						"y": forecast[i].day.maxtemp_f,
				}
			)

			dataB.data.push(
				{
						"color": "hsl(199, 100%, 80%)",
						"x": i===0? "Today" : days[day],
						"y": forecast[i].day.mintemp_f,
				}
			)

			day === 6 ? day = 1 : day++;
		}

		data.push(dataA);
		data.push(dataB);
		return data;
	}

	render(){
		return(							
			<div className="weatherBar">					
				<div className="currentDiv">
					<div className="head">
					<div className="leftHead">
						<h1>{this.state.location}</h1>
						<h3>{this.state.lastUpdated}</h3>
						<h4>{this.state.condition}</h4>	
					</div>
					<div className="rightHead">
						<div className="tempImg">
							<img className="icon" src={this.state.conditionIcon} alt="error"/> 
							<h1 className="currTemp">{this.state.currentTemp}&#176; F</h1>
						</div>							
					</div>													
					</div>
				</div>
				<div className="hourlyDiv">	
					<div className="Title">Hourly</div>				
					<ResponsiveLine
						data={!this.state.hourlyData ? [{"id": "hourly", "color": "hsl(49,70%,50%)","data":[{"color": "hsl(186, 70%, 50%)", "x": "x", "y": 0 }]}] :
							this.state.hourlyData
						}				        
				        margin={{
				            "top": 50,
				            "right": 60,
				            "bottom": 50,
				            "left": 60
				        }}
				        minY="auto"
				        curve="monotoneX"
				        enableGridY={false}
				        lineWidth={3}
				        dotSize={9}
				        dotColor="inherit"
				        dotBorderWidth={1}
				        dotBorderColor="inherit:brighter(1.2)"
				        enableDotLabel={true}
				        dotLabel="y"
				        dotLabelYOffset={-14}
				        animate={true}
				        motionStiffness={90}
				        motionDamping={15}
				    />
				</div>
				<div className="forecastDiv">
					<div className="Title">Forecast</div>
					<ResponsiveLine
        				data={ !this.state.forecastData ? [{"id": "hourly", "color": "hsl(49,70%,50%)","data":[{"color": "hsl(186, 70%, 50%)", "x": "x", "y": 0 }]}] :
							this.state.forecastData 
						}
				        margin={{
				            "top": 50,
				            "right": 60,
				            "bottom": 50,
				            "left": 60
				        }}
				        minY="auto"
				        curve="monotoneX"
				        enableGridY={false}
				        lineWidth={3}
				        dotSize={9}
				        dotColor="inherit"
				        dotBorderWidth={1}
				        dotBorderColor="inherit:brighter(1.2)"
				        enableDotLabel={true}
				        dotLabel="y"
				        dotLabelYOffset={-12}
				        animate={true}
				        motionStiffness={90}
				        motionDamping={15}
				    />				    
				</div>	
													
			</div>						
		);
	}
}

// Weather.PropTypes = {
// 	lat: PropTypes.string.isRequired,
// 	lon: PropTypes.string.isRequired,
// }

class Location extends Component{		
	render(){
		return(
			!this.props.isGeolocationAvailable
			? <div>Your browser does not support Geolocation</div>
			: !this.props.isGeolocationEnabled
			  ? <div>Geolocation is not enabled</div>
			  : this.props.coords
				  ? <Weather lat={this.props.coords.latitude} lon={this.props.coords.longitude}/>
				  : <div>Getting the location data&hellip; </div>	
		);
	}
}


export default geolocated({
  positionOptions: {
    enableHighAccuracy: false,
  },
  userDecisionTimeout: 5000,
})(Location);
