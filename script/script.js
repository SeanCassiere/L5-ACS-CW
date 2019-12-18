$("document").ready(function(){
  //Navbar Toggling of Hide/Show Classes
  $(".menu").click(function() {
    $(".menu").toggleClass("active");
    $(".navbar-menu").toggleClass("active");
  });

  $( function() {
    $('#search-comfort-level').selectmenu(); // Comfort Level Select Menu
    $('#search-destinations-btn').button(); // Search Button
    // http://jsfiddle.net/gaby/WArtA/
    $("#search-date-to").datepicker({ dateFormat: 'yy-mm-dd' }); // Search To Date
    $("#search-date-from").datepicker({ dateFormat: 'yy-mm-dd' }).bind("change", function(){ var minValue = $(this).val(); minValue = $.datepicker.parseDate("yy-mm-dd", minValue); minValue.setDate(minValue.getDate()+1); $("#search-date-to").datepicker( "option", "minDate", minValue ); }); // Search From Date
    
    $( "#slider-range" ).slider({ range: true, min: 300, max: 3000, values: [ 500, 2500 ], slide: function( event, ui ) { $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] ); } });

  });


  //Write to an Array without duplicating Elements
  function PushToListWithoutDuplicate(array, item) {
    if (array.includes(item) === false) {
      array.push(item);
    }
  }

  // Writing to Search Bar
  var jsonDestinations = []; // Destinations Array
  var jsonActivities = []; // Activities Array
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
            activitiesDisplay += "<label><input type='checkbox' name='searchActivities' value='"+data.resorts[i].activities[x]+"'>"+data.resorts[i].activities[x]+"</label><br>";
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

  //Function to compare array1 against array2 to find if ALL the elements of array1 exist in array2
  function arrayItemComparer(arr, arrDb){
    var checkStone = 0;
    for (var i in arr) {
      for (var x in arrDb) {
        if (arr[i] == arrDb[x]) {checkStone += 1;}
      }
    }
    if (checkStone == arr.length) {return true;} else {return false;}
  } 
  // Searcher
  function searchFunction(masterForm) {
    var searchPriceRange = $('#slider-range').slider("values");
    console.log(searchPriceRange);
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
    console.log(searchParameters[3], searchParameters[4]);

    $.getJSON('/json/locations.json', function(data) {
      // Checking Algorithm and add to searchVerifiedLocations
      function dateValidationAndSearchResult() {
        if ( (Date.parse(searchParameters[3]) >= Date.parse(data.resorts[i].startDate)) && (Date.parse(searchParameters[4]) <= Date.parse(data.resorts[i].endDate)) ) {
          console.log("Date Start + End Passed");
          PushToListWithoutDuplicate(searchVerifiedLocations, i); return true;
        } else if ( (Date.parse(searchParameters[3]) >= Date.parse(data.resorts[i].startDate)) && (Date.parse(searchParameters[3]) <= Date.parse(data.resorts[i].endDate)) ) {
          console.log("Date Start Passed");
          PushToListWithoutDuplicate(searchVerifiedLocations, i); return true;
        } else if ( (Date.parse(data.resorts[i].startDate) <= Date.parse(searchParameters[4])) && (Date.parse(data.resorts[i].endDate) >= Date.parse(searchParameters[4])) ) {
          console.log("Date End Passed");
          PushToListWithoutDuplicate(searchVerifiedLocations, i); return true;
        } else if ((searchParameters[3] == "") && (searchParameters[4] == "")) {
          console.log('No Dates Entered');
          PushToListWithoutDuplicate(searchVerifiedLocations, i); return true;
        }
      }
      for (var i in data.resorts) {
        if ((searchParameters[0] != "none") && (searchParameters[1] != "none") && (searchParameters[2].length != 0)) {
          console.log('Destination + Comfort + Activities');
          if ((arrayItemComparer(searchParameters[2], data.resorts[i].activities) == true) && (searchParameters[2].length !== 0) && (searchParameters[0] == data.resorts[i].destination) && (searchParameters[1] === data.resorts[i].comfortLevel) && (data.resorts[i].price > searchPriceRange[0]) && (data.resorts[i].price < searchPriceRange[1])) {
            console.log('Entered Destination + Comfort + Activities Act-Check');
            dateValidationAndSearchResult(); continue;
          }
        }
        else if ((searchParameters[0] != "none") && (searchParameters[2].length != 0)) {
          if ((arrayItemComparer(searchParameters[2], data.resorts[i].activities) == true) && (searchParameters[2].length !== 0) && (searchParameters[0] == data.resorts[i].destination) && (data.resorts[i].price > searchPriceRange[0]) && (data.resorts[i].price < searchPriceRange[1])) {
            console.log('Destination + Activities');
            dateValidationAndSearchResult(); continue;
          }
        }
        else if ((searchParameters[1] != "none") && (searchParameters[0] != "none")) {
          if ((searchParameters[0] == data.resorts[i].destination) && (searchParameters[1] == data.resorts[i].comfortLevel) && (data.resorts[i].price > searchPriceRange[0]) && (data.resorts[i].price < searchPriceRange[1])) {
            console.log('Destination + Comfort Level');
            PushToListWithoutDuplicate(searchVerifiedLocations, i); continue;
          }
        }
        else if ((searchParameters[1] != "none") && (searchParameters[2].length != 0)) {
          if ((arrayItemComparer(searchParameters[2], data.resorts[i].activities) == true) && (searchParameters[1] == data.resorts[i].comfortLevel) && (searchParameters[2].length !== 0) && (data.resorts[i].price > searchPriceRange[0]) && (data.resorts[i].price < searchPriceRange[1])) {
            console.log('Comfort Level + Activities');
            PushToListWithoutDuplicate(searchVerifiedLocations, i); continue;
          }
        }
        /*else if ((searchParameters[0] == "none") || (searchParameters[1] == "none") || searchParameters[2] == null) {
          
          if ((arrayItemComparer(searchParameters[2], data.resorts[i].activities) == true) && (searchParameters[2].length != 0)) {
            console.log('Outer Activities Check');
            PushToListWithoutDuplicate(searchVerifiedLocations, i);
          }
          else if (searchParameters[0] == data.resorts[i].destination) {
            console.log('Outer Destinations Check');
            PushToListWithoutDuplicate(searchVerifiedLocations, i);
          }
          else if (searchParameters[1] == data.resorts[i].comfortLevel) {
            console.log('Outer Comfort Level Check');
            PushToListWithoutDuplicate(searchVerifiedLocations, i);
          }
        }*/
      }

      console.log(searchVerifiedLocations);
      
      // Printing to Page
      for (var y in searchVerifiedLocations) {
        searchedLocationsDisplay += "<div class='search-result-item'>";
        searchedLocationsDisplay += "<p> Resort ID: "+data.resorts[searchVerifiedLocations[y]].id+"</p>";
        searchedLocationsDisplay += "<p> Name: "+data.resorts[searchVerifiedLocations[y]].name+"</p>";
        searchedLocationsDisplay += "<p> Destination: "+data.resorts[searchVerifiedLocations[y]].destination+"</p>";
        searchedLocationsDisplay += "<p> Price: "+data.resorts[searchVerifiedLocations[y]].price+"</p>";
        searchedLocationsDisplay += "<p> Start Date: "+data.resorts[searchVerifiedLocations[y]].startDate+" End Date: "+data.resorts[searchVerifiedLocations[y]].endDate+"</p>";
        searchedLocationsDisplay += "<p> Comfort Level: "+data.resorts[searchVerifiedLocations[y]].comfortLevel+"</p>";
        searchedLocationsDisplay += "<p> Activities Offered: "+data.resorts[searchVerifiedLocations[y]].activities+"</p>";
        searchedLocationsDisplay += "</div>";
      }
      document.getElementById("search-results").innerHTML = searchedLocationsDisplay;
    });
  }
});