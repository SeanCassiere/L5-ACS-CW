// Read Resort Position for locations.json file from URL Bar
var queryString = decodeURIComponent(window.location.search);
queryString = queryString.substring(1);
var queries = queryString.split("&");
var newVar= [];
newVar = queries[0].split("=");
userPosition=newVar[1];

// Click to update Gallery Image
function thisGalleryImage(image){
  var newImage = image.src;
  $("#BigBannerImage").attr("src", newImage);
}

$(document).ready( function() {
  var resortGalleryImages = "";
  var activitiesOnOffer = "";
  var accommodationsDisplay = "";
  $.getJSON('/json/locations.json', function(data){
    window.document.title = data.resorts[userPosition].name + " | Resorts";// Write Resort name to page/tab Title
    $("#headerTitle").text(data.resorts[userPosition].name); // Write Resort name to Title
    
    $("#resort_TitleHeading").text(data.resorts[userPosition].name); // Write Resort Name
    
    $("#BigBannerImage").attr("src", data.resorts[userPosition].picture); // Write Big Gallery Banner Image

    // Read Gallery Images
    resortGalleryImages += "<img src='"+data.resorts[userPosition].picture+"' class='smallBannerClick' onclick='thisGalleryImage(this)'>";
    for (var i in data.resorts[userPosition].gallery) {
      resortGalleryImages += "<img src='"+data.resorts[userPosition].gallery[i]+"' class='smallBannerClick' onclick='thisGalleryImage(this)'>";
    }
    $("#SmallGalleryImages").html(resortGalleryImages); // Write Gallery Images
    $(".smallBannerClick").on("click", thisGalleryImage(this)); // Gallery Image 'CLICK' event listener

    $("#resort_ShortDescription").text(data.resorts[userPosition].short_description); // Write to Brief Description

    // Read Activities
    for (var u in data.resorts[userPosition].activities) {
      activitiesOnOffer += data.resorts[userPosition].activities[u]+", ";
    }
    activitiesOnOffer = activitiesOnOffer.substring(0, activitiesOnOffer.length - 2);
    $("#resort_ActivitiesOffered").text(activitiesOnOffer); // Write to Activities
    
    for (var x in data.resorts[userPosition].accommodations) {
      accommodationsDisplay += "<section class='accommodations_item'>";
      accommodationsDisplay += "<h4>"+data.resorts[userPosition].accommodations[x][0]+"</h4>";
      accommodationsDisplay += "<div class='accommodations_item_img'><img src='"+data.resorts[userPosition].accommodations[x][1]+"'></div>";
      accommodationsDisplay += "<p class='accommodations_item_capacity'>Capacity: "+data.resorts[userPosition].accommodations[x][2]+"</p>";
      accommodationsDisplay += "</section>";
    }


    $("#resort_Destination").text(data.resorts[userPosition].destination);

    $("#resort_Location").text("Location: "+data.resorts[userPosition].location); // Write to Location

    $("#resort_Price").text("Current Rate: $"+data.resorts[userPosition].price+"*"); //Write to Current Rate

    $("#resort_Tabs").tabs( {collapsible: true} ); // Make Tabs jQueryUI
    $("#resort_LongDescription").html(data.resorts[userPosition].long_description); // Write to Tab
    $("#resort_Accommodations").html(accommodationsDisplay);
    $("#resort_GoogleMaps").attr("src", data.resorts[userPosition].google_map); // Write to Tab
  });
});