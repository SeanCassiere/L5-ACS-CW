// Creating FavoriteLocations Var
if (localStorage.hasOwnProperty("favLocations")) {
  var getListFromLocalStorage = localStorage.getItem("favLocations");
  var favoriteLocations = getListFromLocalStorage ? getListFromLocalStorage.split(",").map(function(item){return parseInt(item, 10);}) : [];
} else {
  var favoriteLocations = [];
}

// FUNCTION Write to an Array without duplicating Elements
function PushToListWithoutDuplicate(array, item) {
  if (array.includes(item) === false) {
    array.push(item);
  }
}

// FUNCTION Delete This Item from This Array
function arrayRemove(arr, value) {
  return arr.filter(function(ele){
      return ele != value;
  });
}

// FUNCTION Update Favorites List Display
function updateFavoritesListDisplay() {
  var getListFromLocalStorage = localStorage.getItem("favLocations");
  favoriteLocations = getListFromLocalStorage ? getListFromLocalStorage.split(",").map(function(item){return parseInt(item, 10);}) : [];
  if (favoriteLocations.length != 0) {
    //document.getElementById("favorites-list").innerHTML = favoriteLocations;
    var favoriteDisplayContent = "";
    $.getJSON('/json/locations.json', function(data) {
      for (var i in favoriteLocations) {
        favoriteDisplayContent += "<div class='favorite-item' data-search-location-id='"+favoriteLocations[i]+"'>";
        favoriteDisplayContent += "<a href='/resort.html?id="+favoriteLocations[i]+"&name="+data.resorts[favoriteLocations[i]].name+"'>";
        favoriteDisplayContent += "<img src='"+data.resorts[favoriteLocations[i]].picture+"'>";
        favoriteDisplayContent += "<p>"+data.resorts[favoriteLocations[i]].name+"</p></a>";
        favoriteDisplayContent += "<p class='right'><button onclick='removeFromFavoritesList(this)'>X</button></p>";
        favoriteDisplayContent += "</div>";
      }
      $("#favorites-list").html(favoriteDisplayContent);
    });
  }
  else {
    $("#favorites-list").html("<p>No Favorite Locations have been saved.</p>");
  }
}

// FUNCTION Local Storage Update
function localStorageFavoritesUpdateWithItem() {
  try {
    localStorage.setItem("favLocations", favoriteLocations);
    var getListFromLocalStorage = localStorage.getItem("favLocations");
    favoriteLocations = getListFromLocalStorage ? getListFromLocalStorage.split(",").map(function(item){return parseInt(item, 10);}) : [];
  }
  catch (e) {
    if (e == QUOTA_EXCEEDED_ERR) {
      console.log("Error: Local Storage Limit exceeded.");
    }
    else {
      console.log("Error: Saving to Local Storage.");
    }
  }
}

// FUNCTION Add Item to Favorites List
function addToFavoritesList(elem) {
  var favoriteThisLocation = parseInt($(elem).closest("[data-search-location-id]").data("search-location-id"));
  PushToListWithoutDuplicate(favoriteLocations, favoriteThisLocation);
  localStorageFavoritesUpdateWithItem();
  $(elem).attr("onclick", "removeFromFavoritesList(this);").text("Remove from Favorites");
  console.log("favoriteLocations: ", favoriteLocations, "Added +");
  updateFavoritesListDisplay();
}

//FUNCTION Remove from Favorites List
function removeFromFavoritesList(elem) {
  var favoriteThisLocation = parseInt($(elem).closest("[data-search-location-id]").data("search-location-id"));
  favoriteLocations = arrayRemove(favoriteLocations, favoriteThisLocation);
  localStorageFavoritesUpdateWithItem();
  $(elem).attr("onclick", "addToFavoritesList(this);").text("Add to Favorites");
  console.log("favoriteLocations:", favoriteLocations, "Removed -");
  updateFavoritesListDisplay();
}

// RUN AFTER the Page has Loaded
$("document").ready(function(){
  console.log("favoriteLocations at-start: ", favoriteLocations); // Console Log the loaded Favorite Locations
  updateFavoritesListDisplay();// setInterval(function() { updateFavoritesListDisplay(); }, 2000); // Calls and Continues to keep Updating the Favorites
  //Navbar Toggling of Hide/Show Classes
  $(".menu").click(function() {
    $(".menu").toggleClass("active");
    $(".navbar-menu").toggleClass("active");
  });


  //Checks and Activates Menu Bar Based on Screen Size / Media Query
  var isBigScreen = window.getComputedStyle(document.querySelector('#nav_Reveal'), ':after').getPropertyValue('content');

  if(isBigScreen === '"true"') {
    $(".menu").addClass("active");
    $(".navbar-menu").addClass("active");
    console.log('Media Query Check Engaged');
  } else {
    $(".menu").removeClass("active");
    $(".navbar-menu").removeClass("active");
  }
});