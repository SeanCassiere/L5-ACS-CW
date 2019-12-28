var queryString = decodeURIComponent(window.location.search);
queryString = queryString.substring(1);
var queries = queryString.split("&");
var newVar= [];
newVar = queries[0].split("=");
userPosition=newVar[1];

function thisGalleryImage(image){
  var newImage = image.src;
  $("#BigBannerImage").attr("src", newImage);
}

$(document).ready( function() {
  var resortGalleryImages = "";
  var activitiesOnOffer = "";
  $.getJSON('/json/locations.json', function(data){
    window.document.title = data.resorts[userPosition].name + " | Resorts";
    $("#headerTitle").text(data.resorts[userPosition].name);
    
    $("#resort_TitleHeading").text(data.resorts[userPosition].name);
    
    $("#BigBannerImage").attr("src", data.resorts[userPosition].picture);
    resortGalleryImages += "<img src='"+data.resorts[userPosition].picture+"' class='smallBannerClick' onclick='thisGalleryImage(this)'>";
    for (var i in data.resorts[userPosition].gallery) {
      resortGalleryImages += "<img src='"+data.resorts[userPosition].gallery[i]+"' class='smallBannerClick' onclick='thisGalleryImage(this)'>";
    }
    $("#SmallGalleryImages").html(resortGalleryImages);
    $(".smallBannerClick").on("click", thisGalleryImage(this));

    $("#resort_ShortDescription").text(data.resorts[userPosition].short_description);

    for (var u in data.resorts[userPosition].activities) {
      activitiesOnOffer += data.resorts[userPosition].activities[u]+", ";
    }
    activitiesOnOffer = activitiesOnOffer.substring(0, activitiesOnOffer.length - 2);
    $("#resort_ActivitiesOffered").text(activitiesOnOffer);
    
    $("#resort_Destination").text("Location: "+data.resorts[userPosition].location);

    $("#resort_Price").text("Current Rate: $"+data.resorts[userPosition].price+"*");

    $("#resort_Tabs").tabs( {collapsible: true} );
    $("#resort_LongDescription").html(data.resorts[userPosition].long_description);
    $("#resort_GoogleMaps").attr("src", data.resorts[userPosition].google_map);
  });
});