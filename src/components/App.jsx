import React, { Component } from 'react';
import axios from "axios"
import Paper from "@material-ui/core/Paper"
import Grow from "@material-ui/core/Grow"
import IconButton from "@material-ui/core/IconButton"
import Clear from "@material-ui/icons/Clear"
import SearchForm from "./SearchForm"
import GeocodeResult from "./GeocodeResult"
import Map from "./Map"
import {currentLocation} from "../domains/index"
import '../styles/App.scss';

const GEOCODE_ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json?&key=AIzaSyAOaeuXU_Hlf731vA_BdOoLKwdJ-udINAI'


class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      location: {
        lat: 35.6585805,
        lng: 139.7454329,
      },
      checked: false,
      quests: [
        {"key": 1, "location": {"lat": 35.6671141, "lng": 139.7401657}, "name": "ark hills" },
        {"key": 2, "location": {"lat": 35.7056396, "lng": 139.7518913}, "name": "tokyo dome" }
      ],
    }
    currentLocation()
  }
  currentLocation = () => {
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        position =>	{
          const data = position.coords
          console.log({lat: data.latitude, lng: data.longitude})
          this.setState({location: {lat: data.latitude, lng: data.longitude}})
        },
        error => {
          console.log(error)
        }
      )
    } else {
      console.error("Geolocation APIに非対応")
      return
    }
  }
  
  markerClick = e => {
    console.log(e)
    this.setState(state => ({ checked: !state.checked }));
  };

  setErrorMessage = message => {
    this.setState({
      address: message,
      location: {
        lat: 0,
        lng: 0,
      },
    })
  }
  
  handlePlaceSubmit = place => {
    axios.get(GEOCODE_ENDPOINT, { params: { address: place }})
    .then( results => {
      //success
      const data = results.data
      const result = data.results[0]
      switch(data.status){
        case 'OK': {
          this.setState({
            address: result.formatted_address,
            location : result.geometry.location,
          })
          break;
        }
        case 'ZERO_RESULTS':{
          this.setErrorMessage("Not founded.")
          break;
        }
        default: {
          this.setErrorMessage("Error!!")
          break;
        }
      }
    })
    .catch(() => {
      this.setErrorMessage("通信エラー")
    })
    
  }

  render() {
    
    return (
      <div className="App">
        <Map
          location={this.state.location}
          markerClick={this.markerClick}
          quests={this.state.quests}
        />
        <Grow
          in={this.state.checked}
          style={{ transformOrigin: '0 0 0' }}
          {...(this.state.checked ? { timeout: 1000 } : {})}
        >
          <Paper className="map-contain">
            <IconButton className="clear-button" onClick={this.markerClick}>
              <Clear className="icon-clear" />
            </IconButton>
            
            <h1>緯度経度検索</h1>
            <SearchForm onSubmit={place=>this.handlePlaceSubmit(place)}/>
            <GeocodeResult
              address={this.state.address}
              location={this.state.location}
            />
          </Paper>  
        </Grow>
      </div>
    );
  }
}

export default App;
