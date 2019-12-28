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
    console.log(resortGalleryImages);
    $("#resort_ShortDescription").text(data.resorts[userPosition].short_description);
  });
});