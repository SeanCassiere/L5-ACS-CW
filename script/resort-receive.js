var queryString = decodeURIComponent(window.location.search);
queryString = queryString.substring(1);
var queries = queryString.split("&");
var newVar= [];
newVar = queries[0].split("=");

userPosition=newVar[1];

$(document).ready( function() {
  console.log(userPosition);
  $.getJSON('/json/locations.json', function(data){
    window.document.title = "Resort: "+ data.resorts[userPosition].name;
    document.getElementById("headerTitle").innerHTML = data.resorts[userPosition].name;
  });
});