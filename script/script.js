$("document").ready(function(){
  //Navbar Toggling of Hide/Show Classes
  $(".menu").click(function() {
    $(".menu").toggleClass("active");
    $(".navbar-menu").toggleClass("active");
  });

  
  // Writing Destinations to Search Bar
  var jsonDestinations = [];
  if ($("#search-destinations-select").length) {
    $.getJSON('../json/locations.json', function(data) {
      var outputSelect= "<label for='search-destinations'>Destinations</label><br>";
      outputSelect+= "<select name='search-destinations' id='search-destinations'>";
      outputSelect+= "<option value='none'>--None Selected--</option>";
      for (var i in data.resorts) {
        if (jsonDestinations.includes(data.resorts[i].destination) === false) {
          outputSelect+="<option value='"+data.resorts[i].destination+"'>"+data.resorts[i].destination+"</option>";
          jsonDestinations.push(data.resorts[i].destination);
        }
      }
      outputSelect += "</select>";
      document.getElementById("search-destinations-select").innerHTML=outputSelect;
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
    for (var i in jsonDestinations) {
      if (masterForm["search-destinations"].value == "none") {
        searchParameters[0]= "none";
      }
      else if (masterForm["search-destinations"].value === jsonDestinations[i]) {
        searchParameters[0] = masterForm["search-destinations"].value;
        searchParameters[2].push(masterForm["search-destinations"].value);
        searchParameters[2].push(masterForm["search-destinations"].value);
        searchParameters[2].push(masterForm["search-destinations"].value);
      }
    }
    
    searchParameters[0] = masterForm["search-destinations"].value; //Set Destination
    searchParameters[1] = masterForm["search-comfort-level"].value; // Set Comfort Level
    alert(searchParameters);
    

    $.getJSON('../json/locations.json', function(data) {
      for (var i in data.resorts) {
        if (searchParameters[0] == data.resorts[i].destination) {
          searchVerifiedLocations.push(data.resorts[i].id);
        }
      }
      document.getElementById("search-results").innerHTML += searchVerifiedLocations;
    });
    
  }
});