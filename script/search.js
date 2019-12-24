$(document).ready( function() {
  //Variables
  var defaultPriceValues = [500, 2000];

  //jQueryUI Elements
  $( function() {
    $('#search-comfort-level').selectmenu(); // Comfort Level Select Menu
    $('#search-destinations-btn').button(); // Search Button
    // http://jsfiddle.net/gaby/WArtA/
    $("#search-date-to").datepicker({ dateFormat: 'yy-mm-dd' }); // Search To Date
    $("#search-date-from").datepicker({ dateFormat: 'yy-mm-dd' }).bind("change", function(){ var minValue = $(this).val(); minValue = $.datepicker.parseDate("yy-mm-dd", minValue); minValue.setDate(minValue.getDate()+1); $("#search-date-to").datepicker( "option", "minDate", minValue ); }); // Search From Date
    
    $( "#slider-range" ).slider({ range: true, min: 300, max: 3000, step: 10 , values: [ defaultPriceValues[0], defaultPriceValues[1] ], slide: function( event, ui ) { $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] ); } });
  });

  // Writing to Search Bar
  var jsonDestinations = []; // Destinations Array
  var jsonActivities = []; // Activities Array
  var countingActivities = 0; // Counting the Activities
  if ($("#search-destinations-select").length) {
    $.getJSON('/json/locations.json', function(data) {
      var activitiesDisplay = ""; //Activities Display
      var destinationDisplay = ""; //Destinations Display
      destinationDisplay += "<select name='search-destinations' id='search-destinations'>";
      destinationDisplay += "<option value='none'>--None Selected--</option>";
      //Destinations
      for (var i in data.resorts) {
        if (jsonDestinations.includes(data.resorts[i].destination) === false) {
          destinationDisplay+="<option value='"+data.resorts[i].destination+"'>"+data.resorts[i].destination+"</option>";
          jsonDestinations.push(data.resorts[i].destination);
        }
        //Activities
        for (var x in data.resorts[i].activities) {
          if (jsonActivities.includes(data.resorts[i].activities[x]) === false) {
            countingActivities += 1;
            activitiesDisplay += "<label class='checkbox-set' for='search-checkbox-"+countingActivities+"'><input type='checkbox' id='search-checkbox-"+countingActivities+"' name='searchActivities' value='"+data.resorts[i].activities[x]+"'>"+data.resorts[i].activities[x]+"</label>";
            jsonActivities.push(data.resorts[i].activities[x]);
          }
        }
      }
      destinationDisplay += "</select>";  // Close Destination Display
      document.getElementById("search-destinations-select").innerHTML+=destinationDisplay; $('#search-destinations').selectmenu(); // Destination Printing
      document.getElementById("search-activities-box").innerHTML+=activitiesDisplay; $('input[name="searchActivities"]').checkboxradio(); // Activities Printing
    });
  }

  // Search Button Launch Searcher
  $("#search-destinations-btn").click(function() {
    searchFunction(document.forms["search-form"]);
  });

  //FUNCTION to compare array1 against array2 to find if ALL the elements of array1 exist in array2
  function arrayItemComparer(arr, arrDb){
    var checkStone = 0;
    for (var i in arr) {
      for (var x in arrDb) {
        if (arr[i] == arrDb[x]) {checkStone += 1;}
      }
    }
    if (checkStone == arr.length) {return true;} else {return false;}
  } 

  //FUNCTION Searcher
  function searchFunction(masterForm) {
    var searchPriceRange = $('#slider-range').slider("values");
    console.log('SearchPriceRange:',searchPriceRange);
    console.log('Default Price Range:',defaultPriceValues);
    var searchParameters = ["none","none",[],"none","none"]; //Destination, Comfort Levels, Activities
    var searchVerifiedLocations = []; //Verified by algorithm
    var searchedLocationsDisplay = "<h3>Results:</h3>"; // Locations Write to Page

    //Adding the User selected Activities into SearchParameters[2]
    for (var m in masterForm.searchActivities) {
      if (masterForm.searchActivities[m].checked) {
        searchParameters[2].push(masterForm.searchActivities[m].value); //Set Chosen Activities
      }
    }
    //Adding to custom Search Parameters
    searchParameters[0] = masterForm["search-destinations"].value; //Set Destination
    searchParameters[1] = masterForm["search-comfort-level"].value; // Set Comfort Level
    searchParameters[3] = masterForm["search-date-from"].value; // Set From Date
    searchParameters[4] = masterForm["search-date-to"].value; // Set To Date
    //console.log(searchParameters[3], searchParameters[4]);

    $.getJSON('/json/locations.json', function(data) {
      // Checking Algorithm and add to searchVerifiedLocations
      console.log(searchParameters);
      //FUNCTION Date Validation and Adding to searchVerifiedLocations Array
      function dateValidationAndSearchResult() {
        if ( (Date.parse(searchParameters[3]) >= Date.parse(data.resorts[i].startDate)) && (Date.parse(searchParameters[4]) <= Date.parse(data.resorts[i].endDate)) ) {
          console.log("FUNCTION: Date Start + End Passed");
          PushToListWithoutDuplicate(searchVerifiedLocations, i); return true;
        } else if ( (Date.parse(searchParameters[3]) >= Date.parse(data.resorts[i].startDate)) && (Date.parse(searchParameters[3]) <= Date.parse(data.resorts[i].endDate)) ) {
          console.log("FUNCTION: Date Start Passed");
          PushToListWithoutDuplicate(searchVerifiedLocations, i); return true;
        } else if ( (Date.parse(data.resorts[i].startDate) <= Date.parse(searchParameters[4])) && (Date.parse(data.resorts[i].endDate) >= Date.parse(searchParameters[4])) ) {
          console.log("FUNCTION: Date End Passed");
          PushToListWithoutDuplicate(searchVerifiedLocations, i); return true;
        } else if ((searchParameters[3] == "") && (searchParameters[4] == "")) {
          console.log("FUNCTION: Entered No Dates Searching");
          PushToListWithoutDuplicate(searchVerifiedLocations, i); return true;
        }
      }
      for (var i in data.resorts) {
        if ((searchParameters[0] != "none") && (searchParameters[1] != "none") && (searchParameters[2].length != 0)) {
          console.log('ENTERED IF: Destination + Comfort + Activities');
          if ((arrayItemComparer(searchParameters[2], data.resorts[i].activities) == true) && (searchParameters[2].length !== 0) && (searchParameters[0] == data.resorts[i].destination) && (searchParameters[1] === data.resorts[i].comfortLevel) && (data.resorts[i].price > searchPriceRange[0]) && (data.resorts[i].price < searchPriceRange[1])) {
            //console.log('ENTERED IF: Destination + Comfort + Activities : PASS');
            dateValidationAndSearchResult(); continue;
          }
        }
        else if ((searchParameters[0] != "none") && (searchParameters[2].length != 0)) {
          if ((arrayItemComparer(searchParameters[2], data.resorts[i].activities) == true) && (searchParameters[2].length !== 0) && (searchParameters[0] == data.resorts[i].destination) && (data.resorts[i].price > searchPriceRange[0]) && (data.resorts[i].price < searchPriceRange[1])) {
            //console.log('ENTERED IF: Destination + Activities : PASS');
            dateValidationAndSearchResult(); continue;
          }
        }
        else if ((searchParameters[1] != "none") && (searchParameters[0] != "none")) {
          if ((searchParameters[0] == data.resorts[i].destination) && (searchParameters[1] == data.resorts[i].comfortLevel) && (data.resorts[i].price > searchPriceRange[0]) && (data.resorts[i].price < searchPriceRange[1])) {
            //console.log('Destination + Comfort Level');
            dateValidationAndSearchResult(); continue;
          }
        }
        else if ((searchParameters[1] != "none") && (searchParameters[2].length != 0)) {
          if ((arrayItemComparer(searchParameters[2], data.resorts[i].activities) == true) && (searchParameters[1] == data.resorts[i].comfortLevel) && (searchParameters[2].length !== 0) && (data.resorts[i].price > searchPriceRange[0]) && (data.resorts[i].price < searchPriceRange[1])) {
            //console.log('Comfort Level + Activities');
            dateValidationAndSearchResult(); continue;
          }
        }
        else if ((searchPriceRange[0] != defaultPriceValues[0]) || (searchPriceRange[1] != defaultPriceValues[1])) { // IF the Price values have been changed but not from the previous combinations
          console.log('Entered IF: Price Changed');
          if ((searchParameters[0] != "none") && (searchParameters[0] == data.resorts[i].destination) && (data.resorts[i].price >= searchPriceRange[0]) && (data.resorts[i].price <= searchPriceRange[1])) {
            //console.log('Price: searched Destination');
            dateValidationAndSearchResult(); continue;
          } else if ((searchParameters[1] != "none") && (searchParameters[1] == data.resorts[i].comfortLevel) && (data.resorts[i].price >= searchPriceRange[0]) && (data.resorts[i].price <= searchPriceRange[1])) {
            //console.log('Price: searched Comfort Level');
            dateValidationAndSearchResult(); continue;
          } else if ((arrayItemComparer(searchParameters[2], data.resorts[i].activities) == true) & (searchParameters[2].length != 0) && (data.resorts[i].price >= searchPriceRange[0]) && (data.resorts[i].price <= searchPriceRange[1])) {
            //console.log('Price: searched Activities');
            dateValidationAndSearchResult(); continue;
          } else if ((searchParameters[3].length != 0) || (searchParameters[4].length != 0)) {
            if ((data.resorts[i].price >= searchPriceRange[0]) && (data.resorts[i].price <= searchPriceRange[1])) {
              //console.log('Price: searched Dates');
              dateValidationAndSearchResult(); continue;
            }           
          } else if ((searchParameters[0] == "none") && (searchParameters[1] == "none") && (searchParameters[2].length == 0) && (searchParameters[3] == "") && (searchParameters[4] == "")) {
            //console.log('Entered Price Price');
            if ((data.resorts[i].price >= searchPriceRange[0]) && (data.resorts[i].price <= searchPriceRange[1])) {
              //console.log('Price: searched Prices');
              dateValidationAndSearchResult(); continue;
            }
          } else {continue;}
        }
        else { // IF Only a single search criteria has been used
          console.log('ENTERED IF: Single Search Criteria');
          if ((searchParameters[0] != "none") && (searchParameters[0] == data.resorts[i].destination)) {
            //console.log('Only searched Destination');
            dateValidationAndSearchResult(); continue;
          } else if ((searchParameters[1] != "none") && (searchParameters[1] == data.resorts[i].comfortLevel)) {
            console.log('Only searched Comfort Level');
            //PushToListWithoutDuplicate(searchVerifiedLocations, i); continue;
            dateValidationAndSearchResult(); continue;
          } else if ((arrayItemComparer(searchParameters[2], data.resorts[i].activities) == true) & (searchParameters[2].length != 0)) {
            //console.log('Only searched Activities');
            dateValidationAndSearchResult(); continue;
          } else if ((searchParameters[3].length != 0) || (searchParameters[4].length != 0)) {
            if ((data.resorts[i].price >= searchPriceRange[0]) && (data.resorts[i].price <= searchPriceRange[1])) {
              //console.log('Only searched Dates');
              dateValidationAndSearchResult(); continue;
            }           
          }
        }
      }
      //console.log(searchVerifiedLocations.length);
      // Printing to Page
      if (searchVerifiedLocations.length != 0) {
        for (var y in searchVerifiedLocations) {
          var locationAccess = searchVerifiedLocations[y];
          searchedLocationsDisplay += "<div class='search-result-item ui-widget-content' data-search-location-id='"+searchVerifiedLocations[y]+"'>";
          searchedLocationsDisplay += "<a href='/resort.html?id="+searchVerifiedLocations[y]+"&name="+data.resorts[searchVerifiedLocations[y]].name+"'>";
          searchedLocationsDisplay += "<img src='"+data.resorts[searchVerifiedLocations[y]].picture+"'>";
          searchedLocationsDisplay += "<div class='search-result-item-content'>";
          searchedLocationsDisplay += "<p> Name : "+data.resorts[searchVerifiedLocations[y]].name+"<br>";
          searchedLocationsDisplay += "Short Desc: "+data.resorts[searchVerifiedLocations[y]].short_description+"<br>";
          searchedLocationsDisplay += "Price: "+data.resorts[searchVerifiedLocations[y]].price+"</p>";
          /*
          searchedLocationsDisplay += "<p> Resort ID: "+data.resorts[searchVerifiedLocations[y]].id+"</p>";
          searchedLocationsDisplay += "<p> Name: "+data.resorts[searchVerifiedLocations[y]].name+"</p>";
          searchedLocationsDisplay += "<p> Destination: "+data.resorts[searchVerifiedLocations[y]].destination+"</p>";
          searchedLocationsDisplay += "<p> Start Date: "+data.resorts[searchVerifiedLocations[y]].startDate+" End Date: "+data.resorts[searchVerifiedLocations[y]].endDate+"</p>";
          searchedLocationsDisplay += "<p> Comfort Level: "+data.resorts[searchVerifiedLocations[y]].comfortLevel+"</p>";
          searchedLocationsDisplay += "<p> Activities Offered: "+data.resorts[searchVerifiedLocations[y]].activities+"</p>";
          */
          searchedLocationsDisplay += "</a>";
          searchedLocationsDisplay += "</div>";
          searchedLocationsDisplay += "<p><button onclick='addToFavoritesList(this);'>Fav</button></p>";
          searchedLocationsDisplay += "</div>";
        }
        // data-search-location-id='"+searchVerifiedLocations[y]+"'
        document.getElementById("search-results").innerHTML = searchedLocationsDisplay;
      } else {
        document.getElementById("search-results").innerHTML = "<h3>Problem! No Results.</h3>";
      }
    });
  }
});