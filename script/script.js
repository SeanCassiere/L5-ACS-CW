$("document").ready(function(){
  //Navbar Toggling of Hide/Show Classes
  $(".menu").click(function() {
    $(".menu").toggleClass("active");
    $(".navbar-menu").toggleClass("active");
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
    $.getJSON('../json/locations.json', function(data) {
      var activitiesDisplay = ""; //Activities Display
      var destinationDisplay = "<label for='search-destinations'>Destinations</label><br>"; //Destinations Display
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
      destinationDisplay += "</select>"; // Close Destination Display
      document.getElementById("search-destinations-select").innerHTML=destinationDisplay; // Destination Printing
      document.getElementById("search-activities-box").innerHTML+=activitiesDisplay; // Activities Printing
    });
  }

  // Search Button Launch Searcher //
  $("#search-destinations-btn").click(function() {
    searchFunction(document.forms["search-form"]);
  });

  // Searcher
  function searchFunction(masterForm) {
    var searchParameters = ["none","none",[],"none"]; //Destination, Comfort Levels
    var searchVerifiedLocations = []; //Verified by algorithm
    var searchedLocationsDisplay = ""; // Locations Write to Page

    for (var m in masterForm.searchActivities) {
      if (masterForm.searchActivities[m].checked) {
        searchParameters[2].push(masterForm.searchActivities[m].value); //Set Chosen Activities
      }
    }

    searchParameters[0] = masterForm["search-destinations"].value; //Set Destination
    searchParameters[1] = masterForm["search-comfort-level"].value; // Set Comfort Level

    $.getJSON('../json/locations.json', function(data) {
      // Checking Algorithm and add to searchVerifiedLocations
      for (var i in data.resorts) {
        if ((searchParameters[0] == data.resorts[i].destination) && (searchParameters[1] === data.resorts[i].comfortLevel)) {
          for (var n in searchParameters[2]) {
            if (data.resorts[i].activities.indexOf(searchParameters[2][n]) > -1 == true) {
              PushToListWithoutDuplicate(searchVerifiedLocations, i);
              break;
            }
          }
          PushToListWithoutDuplicate(searchVerifiedLocations, i);
          continue;
        }
        else if ((searchParameters[0] == "none") || (searchParameters[1] == "none") || searchParameters[2] == null) {
          for (var n in searchParameters[2]) {
            if (data.resorts[i].activities.indexOf(searchParameters[2][n]) > -1 == true) {
              PushToListWithoutDuplicate(searchVerifiedLocations, i);
            }
          }
          if (searchParameters[0] == data.resorts[i].destination) {
            PushToListWithoutDuplicate(searchVerifiedLocations, i);
          }
          else if (searchParameters[1] == data.resorts[i].comfortLevel) {
            PushToListWithoutDuplicate(searchVerifiedLocations, i);
          }
        }
      }
      console.log(searchVerifiedLocations);
      
      // Printing to Page
      for (var y in searchVerifiedLocations) {
        searchedLocationsDisplay += "<div style='border: 1px solid black; padding: 1rem;'>";
        searchedLocationsDisplay += "<p> Resort ID: "+data.resorts[searchVerifiedLocations[y]].id+"</p>";
        searchedLocationsDisplay += "<p> Destination: "+data.resorts[searchVerifiedLocations[y]].name+"</p>";
        searchedLocationsDisplay += "<p> Destination: "+data.resorts[searchVerifiedLocations[y]].destination+"</p>";
        searchedLocationsDisplay += "<p> Price: "+data.resorts[searchVerifiedLocations[y]].price+"</p>";
        searchedLocationsDisplay += "<p> Comfort Level: "+data.resorts[searchVerifiedLocations[y]].comfortLevel+"</p>";
        searchedLocationsDisplay += "<p> Activities Offered: "+data.resorts[searchVerifiedLocations[y]].activities+"</p>";
        searchedLocationsDisplay += "</div>";
      }
      document.getElementById("search-results").innerHTML = searchedLocationsDisplay;
    });
  }
});