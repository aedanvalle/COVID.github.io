import React, { useEffect, useState } from 'react'
import {Card, CardContent} from "@material-ui/core"
import InfoBox from "./components/InfoBox.comp"
import Map from "./components/Map.comp"
import Table from "./components/Table.comp"
import {sortData, prettyPrintStat} from "./components/utility/util"
import './App.css'
import LineGraph from "./components/LineGraph.comp"
import Vaccine from "./components/Vaccine.comp"
import "leaflet/dist/leaflet.css"
import {fetchData} from './API'  //we dont have to specify index file name if your file name is index
import {fetchDailyData} from './API' //we dont have to specify index file name if your file name is index
import {Charts} from './components'

function App() {

  const[countries, setCountries] = useState([]);          //to store data of different countries
  const[country,setCountry] = useState("worldwide");      //to display currently selected country from drop-down
  const [countryInfo, setCountryInfo] = useState({});     //get covid-info for the selected country
  const [tableData, setTableData] = useState([]);         //data to display live cases based on country 
  const [mapCenter, setMapCenter] = useState({lat: 39.80746, lng:0.4796});  //center the map based on country
  const [mapZoom, setMapZoom] = useState(2);               //set zoom for map
  const [mapCountries, setMapCountries] = useState([]);   //country on map
  const [casesType, setCasesType] = useState("cases");    //Live corona cases
  const [vaccine, setVaccine] = useState([]);             //Covid-19 vaccine trial data

  {/*here is where I declare the state for the  */}
  const [data, setData] = useState([]);

  {/*SUCCESSFULLY RETRIEVE DATA USING AXIOS but just the  */}
  useEffect(()=> {
    //something
    const invokation = async()=>{
      setData(fetchData())
    };
    invokation();    
    const temp = fetchDailyData()
    setData(temp)
  }, [])

  //gets all country info
  useEffect(()=>{
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response=>response.json())
    .then(data=>{
      setCountryInfo(data);
    })
  },[])

  
  //gets,extracts, and assigns covid-19 vaccine trial data to vaccine state
  useEffect(()=>{
    const getVaccineData = async ()=>{
      await fetch("https://disease.sh/v3/covid-19/vaccine")
      .then((response)=>response.json())
      .then((info)=>{
        const vaccine = info.data.map((vac)=>(
          {
            candidate: vac.candidate,
            mechanism: vac.mechanism,
            trialPhase: vac.trialPhase,
            institutions: vac.institutions,
          }));
          setVaccine(vaccine);
      });
    };
    getVaccineData();
  },[])

  //gets all country data, sorts it and assigns to tableData,mapCountries (unsorted),and countries(unsorted) state
  useEffect(()=>{
    const getCountriesData = async ()=>{
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response)=>response.json())
      .then((data)=>{
        const countries = data.map((country)=>(
          {
            name:country.country,
            value:country.countryInfo.iso2,
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
      });
    };
    getCountriesData();
  },[])



  return (
    <div className="app">
      <div className="app_top">
      
      <div className="app_left">
        <div className="app_header">
          <h1>Team 4 COVID tracker</h1>          
        </div>

          {/** Infobox to display cases, recovered, deaths in currently selected country */}
        <div className="app_stats"  >
          <InfoBox
            isRed
            onClick={(e) => setCasesType("cases")} 
            active = {casesType ==="cases"}
            title="Corona Cases Today:" 
            cases = {prettyPrintStat(countryInfo.todayCases)} 
            total={prettyPrintStat(countryInfo.cases)}/>
          <InfoBox 
            onClick={(e) => setCasesType("recovered")} 
            active = {casesType ==="recovered"}
            title="Recovered Today:" 
            cases = {prettyPrintStat(countryInfo.todayRecovered)} 
            total={prettyPrintStat(countryInfo.recovered)}/>
          <InfoBox 
            isRed
            onClick={(e) => setCasesType("deaths")}
            active = {casesType ==="deaths"}
            title="Deaths Today:" 
            cases = {prettyPrintStat(countryInfo.todayDeaths)} 
            total = {prettyPrintStat(countryInfo.deaths)}/>
        </div>
        {/** Adds map with circles and popup */}
        <Map casesType={casesType} countries={mapCountries} center = {mapCenter} zoom={mapZoom}/>
      </div>



      {/** Material UI card with cardcontent to display table of live cases and a line graph */}
      <Card >
          <CardContent>         
            <h2 >
              WELCOME
            </h2>   
            <br></br>
            <h3 >
              The button pane on the left controls the graph data underneath this paragraph.  It
              gives a timeline either the corona cases today, recovered today, or deaths from today.  
            </h3> 
            <h3 className="app_right_line_head">
              Worldwide new {casesType}
            </h3>
            <br></br>
            <LineGraph className="app_graph" casesType={casesType}/>
            <br></br>
            <h2 className="app_right_line_head">
              Infection rates vs. Deaths
            </h2>
            <Charts data={data} country={null}/>
          </CardContent>
      </Card>
      </div>
      {/** container to display vaccine and therapeutic trials */}
      <div  className="app_bottom">
      

        <div className="app_vaccine">  
          <Vaccine vaccine={vaccine}/>
        </div>
        
        {/*THIS IS WHERE THE NEW CHART IS SUPPOSED TO GO!!! */}

        {/*-------------------------------------------------------------------------------*/}
        {/* THIS IS WHERE THE CHART WILL BE*/}
        
        <h3>
              Live Cases by Country
              <Table countries={tableData}/>
            </h3>
        {/*-------------------------------------------------------------------------------*/}
      </div>
    </div>
  );
}

export default App;
