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
    $.getJSON('./json/locations.json', function(data) {
      var activitiesDisplay = "<select name='search-activities[]' id='search-activities' multiple>"; //Activities Display
      var destinationDisplay = "<select name='search-destinations[]' id='search-destinations' multiple>"; //Destinations Display
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
            activitiesDisplay += "<option value='"+data.resorts[i].activities[x]+"'>"+data.resorts[i].activities[x]+"</option>";
            jsonActivities.push(data.resorts[i].activities[x]);
          }
        }
      }
      
      destinationDisplay += "</select>";  // Close Destination Display
      activitiesDisplay += "</select>"; // Close Activities Display
      document.getElementById("search-destinations-select").innerHTML += destinationDisplay; $('#search-destinations').multiselect({ columns: 1, placeholder: "Select Destinations", search: true, selectAll: true }); // Destination Printing
      document.getElementById("search-activities-box").innerHTML += activitiesDisplay; $('#search-activities').multiselect({ columns: 1, placeholder: "Select Activities", search: true, selectAll: true }); // Activities Printing
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
    
    var searchParameters = [ [] , "none" , [] , "none" , "none" ]; //Destination, Comfort Levels, Activities, ArrivalDate/From, DepartureDate/To
    var searchVerifiedLocations = []; //Verified by algorithm
    var searchedLocationsDisplay = "<h3>Results:</h3>"; // Locations Write to Page
    
    //Set Destination(s)
    $("#search-destinations > option:selected").each( function() {
      searchParameters[0].push( $(this).val() );
    } );
    //Set Destination(s)
    $("#search-activities > option:selected").each( function() {
      searchParameters[2].push( $(this).val() );
    } );

    searchParameters[1] = masterForm["search-comfort-level"].value; // Set Comfort Level
    searchParameters[3] = masterForm["search-date-from"].value; // Set From Date
    searchParameters[4] = masterForm["search-date-to"].value; // Set To Date

    $.getJSON('./json/locations.json', function(data) {
      //FUNCTION Date Validation and Adding to searchVerifiedLocations Array
      function dateValidationAndSearchResult() {
        if ( (Date.parse(searchParameters[3]) >= Date.parse(data.resorts[i].startDate)) && (Date.parse(searchParameters[4]) <= Date.parse(data.resorts[i].endDate)) ) {
          //console.log("FUNCTION: Date Start + End Passed");
          PushToListWithoutDuplicate(searchVerifiedLocations, i); return true;
        } else if ( (Date.parse(searchParameters[3]) >= Date.parse(data.resorts[i].startDate)) && (Date.parse(searchParameters[3]) <= Date.parse(data.resorts[i].endDate)) ) {
          //console.log("FUNCTION: Date Start Passed");
          PushToListWithoutDuplicate(searchVerifiedLocations, i); return true;
        } else if ( (Date.parse(data.resorts[i].startDate) <= Date.parse(searchParameters[4])) && (Date.parse(data.resorts[i].endDate) >= Date.parse(searchParameters[4])) ) {
          //console.log("FUNCTION: Date End Passed");
          PushToListWithoutDuplicate(searchVerifiedLocations, i); return true;
        } else if ((searchParameters[3] == "") && (searchParameters[4] == "")) {
          //console.log("FUNCTION: Entered No Dates Searching");
          PushToListWithoutDuplicate(searchVerifiedLocations, i); return true;
        }
      }
      for (var i in data.resorts) {
        if ((searchParameters[0].includes( data.resorts[i].destination )) && (searchParameters[1] != "none") && (searchParameters[2].length != 0)) {
          //console.log('ENTERED IF: Destination + Comfort + Activities');
          if ((arrayItemComparer(searchParameters[2], data.resorts[i].activities) == true) && (searchParameters[2].length !== 0) && (searchParameters[0].includes( data.resorts[i].destination )) && (searchParameters[1] === data.resorts[i].comfortLevel) && (data.resorts[i].price > searchPriceRange[0]) && (data.resorts[i].price < searchPriceRange[1])) {
            //console.log('PASSED: ENTERED IF: Destination + Comfort + Activities');
            dateValidationAndSearchResult(); continue;
          }
        }
        else if ((searchParameters[0].includes( data.resorts[i].destination )) && (searchParameters[2].length != 0)) {
          if ((arrayItemComparer(searchParameters[2], data.resorts[i].activities) == true) && (searchParameters[2].length !== 0) && (searchParameters[0].includes( data.resorts[i].destination )) && (data.resorts[i].price > searchPriceRange[0]) && (data.resorts[i].price < searchPriceRange[1])) {
            //console.log('ENTERED IF: Destination + Activities : PASS');
            dateValidationAndSearchResult(); continue;
          }
        }
        
        else if ((searchParameters[1] != "none") && (searchParameters[0].includes( data.resorts[i].destination ))) {
          if ((searchParameters[0].includes( data.resorts[i].destination )) && (searchParameters[1] == data.resorts[i].comfortLevel) && (data.resorts[i].price > searchPriceRange[0]) && (data.resorts[i].price < searchPriceRange[1])) {
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
          // console.log('Entered IF: Price Changed');
          if ((searchParameters[0].includes( data.resorts[i].destination )) && (data.resorts[i].price >= searchPriceRange[0]) && (data.resorts[i].price <= searchPriceRange[1])) {
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
          } else if ((searchParameters[0].length == 0 ) && (searchParameters[1] == "none") && (searchParameters[2].length == 0) && (searchParameters[3] == "") && (searchParameters[4] == "")) {
            //console.log('Entered Price Price');
            if ((data.resorts[i].price >= searchPriceRange[0]) && (data.resorts[i].price <= searchPriceRange[1])) {
              //console.log('Price: searched Prices');
              dateValidationAndSearchResult(); continue;
            }
          } else {
            continue;
          }
        }
        else { // IF Only a single search criteria has been used
          // console.log('ENTERED IF: Single Search Criteria');
          if ((searchParameters[0].includes( data.resorts[i].destination )) && (searchParameters[0] == data.resorts[i].destination)) {
            //console.log('Only searched Destination');
            dateValidationAndSearchResult(); continue;
          } else if ((searchParameters[1] != "none") && (searchParameters[1] == data.resorts[i].comfortLevel)) {
            //console.log('Only searched Comfort Level');
            dateValidationAndSearchResult(); continue;
          } else if ((arrayItemComparer(searchParameters[2], data.resorts[i].activities) == true) & (searchParameters[2].length != 0)) {
            //console.log('Only searched Activities');
            dateValidationAndSearchResult(); continue;
          } else if ((searchParameters[3].length != 0) || (searchParameters[4].length != 0)) {
            if ((data.resorts[i].price >= searchPriceRange[0]) && (data.resorts[i].price <= searchPriceRange[1])) {
              // console.log('Only searched Dates');
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
          searchedLocationsDisplay += "<a href='./resort.html?id="+searchVerifiedLocations[y]+"&name="+data.resorts[searchVerifiedLocations[y]].name+"'>";
          searchedLocationsDisplay += "<img src='"+data.resorts[searchVerifiedLocations[y]].picture+"'>";
          searchedLocationsDisplay += "<div class='search-result-item-content'>";
          searchedLocationsDisplay += "<p class='important big-txt'>"+data.resorts[searchVerifiedLocations[y]].name+"</p>";
          searchedLocationsDisplay += "<p>"+data.resorts[searchVerifiedLocations[y]].short_description+"</p>";
          searchedLocationsDisplay += "<p class='important'>Price: $"+data.resorts[searchVerifiedLocations[y]].price+"</p>";
          searchedLocationsDisplay += "</a>";
          searchedLocationsDisplay += "</div>";
          searchedLocationsDisplay += "<div class='search-result-item-fav-box'><button type='button' onclick='addToFavoritesList(this);'>Add to Favorites</button></div>";
          searchedLocationsDisplay += "</div>";
        }
        $("#search-results").html(searchedLocationsDisplay);
        $(".search-result-item-fav-box button[type='button']").button();
      } else {
        $("#search-results").html("<h3>Problem! No Results.</h3>");
      }
    });
  }
});