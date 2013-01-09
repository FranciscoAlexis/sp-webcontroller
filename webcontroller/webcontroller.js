var sp = getSpotifyApi(1);
var models = sp.require('sp://import/scripts/api/models');
var player = models.player;
var serverlocation = 'http://fco.bla.cl/webcontroller/index.php/';
var user_id = sp.core.getAnonymousUserId();
var bitly_user = 'o_3vnirmcdaj';
var bitly_key =  'R_e822cb4c7f78d558f2859b0472efb83b';

exports.init = init;

function get_short_url(long_url, login, api_key)
{
    $.getJSON("http://api.bitly.com/v3/shorten?callback=?", 
        { 
            "format": "json",
            "apiKey": api_key,
            "login": login,
            "longUrl": long_url
        },
        function(response)
        {
            var share = document.getElementById("sharetext");
			share.innerHTML = response.data.url;
			var link = document.getElementById("sharelink");
			link.href = response.data.url;
			console.log(response.data.url);
        }
    );
}


function init() 
{
	updatePageWithTrackDetails();

	get_short_url(serverlocation + 'user/session/' + user_id, bitly_user, bitly_key);
	
	player.observe(models.EVENT.CHANGE, function (e) 
	{
		updatePageWithTrackDetails();
		var url = serverlocation + 'server/set_now_playing/';
		
	    $.post(url, { "user_id": user_id , "name" : player.track.data.name, "album" : player.track.data.album.name,"artists" : player.track.data.album.artist.name},
		 function(data){
		   console.log(data);
		 }, "json");
		
	});

	setInterval(function(){
		//We need to do something like <?php echo json_encode(array("command"=>"next"); ?>
		var url = serverlocation + 'server/get_player_command/';
		
	    $.post(url, { "user_id": user_id },
		 function(data){
		 	if(data == null)
		 		return;
		 	if(data.command == 'prev')
		   		player.previous(true);
		   	if(data.command == 'playpause')
		   		player.playing = !(player.playing);
		   	if(data.command == 'next')
		   		player.next();
		 }, "json");
		 
	}, 1000);
		
}

function updatePageWithTrackDetails() 
{

	var header = document.getElementById("trackinfo");
	// This will be null if nothing is playing.
	var playerTrackInfo = player.track;

	if (playerTrackInfo == null) 
		header.innerText = "Nothing playing!"; 
	else 
	{
		var track = playerTrackInfo.data;
		var nowplaying = track.name + " from the album \""  + track.album.name + "\" by " + track.album.artist.name + ".";
		header.innerHTML = nowplaying;
	}
}