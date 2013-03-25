$(document).ready(function(){ //the script below will be run when the whole DOM is ready and loaded

	/*--- Vars & stuff ---*/
			play = $('#play');
			pause = $('#pause');
			prev = $('#prev');
			next = $('#next');
			vol = $('#vol');
			mute = $('#mute');
			repeat = $('#repeat');
			cover = $('.artwork');
			var data;
			var id=0;
			var currentSong = $("#song-list ul li");
			var shuffle=false;
			var maxSongs=0;
			var paused = true;

	/*--- JSON init and loading data ---*/
	$.getJSON("playah/music/album.js",function(album){ // JSON file is loaded and then, the following happen
		data = album; // all the JSON data are stored inthe global variable "data"
		$.each(album.songs, function(i,song) { // for each object in the JSON file we'll...
			var dataMarkup =
			"<li data-song='"+i+"'><span class='track-title'>"+song.title+"</span><span class='track-artist'>"+song.artist+"</span></li>";
			$(dataMarkup).appendTo("#song-list ul");//...apend in the unorderded list, each list item containing the objecy properties
			maxSongs++; //global counter to store the songs number on the JSON file
		});
		song = new Audio(data.songs[id].src); // first song is loaded by creating the Audio object
		metaData(id); // metadata are loaded to the specified divs by the metaData(song_id) function
	});

	$("#message").hide();

	$(function() { //jQuery UI function for the volume slider to be loaded
		$( "#slider-vertical" ).slider({
			orientation: "vertical", //Properties of our slider
			range: "min",
			step: 0.05,
			min: 0,
			max: 1,
			value: 1,
			animate: true,
			slide: function( event, ui ) { //Function for the slider's value to change dynamically 
				song.volume = ui.value;
				showMessage("volume "+song.volume*100+"%");
			}
		});
	});


	/*--- Button listeners ---*/
	play.live('click', function(e) {
	    e.preventDefault();
	    songPlay();
	});
	pause.live('click', function(e) {
	    e.preventDefault();
	    songPause();
	});
	prev.live('click', function(e) {
		song.currentTime = 0;
	});
	prev.dblclick(function () { 
	    if (song != null){ //if a song is playing, we have to pause before starting the next, otherwise they will play simultaneously
		  	song.pause();
		}
		id--; //descreasing the current id by one, to go to the previous track
		if(shuffle) { //if the shuffle is enabled (true)
	  		id = Math.abs(randomFromTo(0, maxSongs)-id); //then a random number between 0 and the songs number is generated
	  	}
	    newSong(data.songs[id].src); //new song is created with the given id from the global var, data
	    songPlay(); //and it plays!
	    showMessage("previous song");		 
    });

	next.live('click', function(e) { //same as above
	    e.preventDefault();
	    if (song != undefined){
		  	song.pause();
		}
		id++; //although the id now goes to the next song, obviously
		if(shuffle) {
	  		id = Math.abs(randomFromTo(0, maxSongs)-id);
	  	}
	    newSong(data.songs[id].src);
	    songPlay();
	    showMessage("next song");
	});
	$('#song-list ul li').live('click', function(e) { //This will play the song you click from the list
	    e.preventDefault();
	    if (song != undefined){ //if a song is playing, we have to pause before starting the next, otherwise they will play simultaneously
		  	song.pause();
		}
	    id = $(this).data('song'); //we retrieve the id from the data element in the list item
	    song = new Audio(data.songs[id].src); //new song is created with the given id from the global var, data
	    songPlay(); //and it plays!
		$("#play span").attr("data-icon", '"'); //changes the icon of the play button, by changing the data-icon element which controls the icon font 
		play.attr("id", "pause"); //changes the id of the play button to pause, as now it represents the pause button
	});
		    
	$("#vol span").live('click', function(e) { //this will mute the volume
	    e.preventDefault();
	    song.muted = true; //with this simple statement the song is muted
	    $("#vol span").attr("data-icon", '0'); //changes the icon of the mute button, by changing the data-icon element which controls the icon font
	    $("#vol").attr("id", "mute"); //changes the id to mute
	    showMessage("mute");
		$("#vol-slider input").attr("value", 0); //change the volume slide value to 0, to represent the accurate sound volume
	});

	vol.hover( //this is the hover on and off the volume slider
		function() { $("#vol-container").show(); },
		function() { $("#vol-container").hide(); }
	);

	$("#playlist ul").hover( //this is for the on hover display of overflow bars in the playlist
		function() { $("#song-list ul").addClass("overflow"); },
		function() { $("#song-list ul").removeClass("overflow"); }
	);

	mute.live('click', function(e) { //this will unmute the volume
	    e.preventDefault();
	    song.muted = false;//with this simple statement the song is unmuted
	  	$("#mute span").attr("data-icon", '2');//changes the icon of the mute button, by changing the data-icon element which controls the icon font
	   	$("#mute").attr("id", "vol"); //changes the id to normal
	   	$("#vol-slider input").attr("value", song.volume); //change the volume slide value to the song.volume value, to represent the accurate sound volume
		showMessage("unmute");
	});

	repeat.live('click', function(e) { //this will toggle the repeat function on/off
	    e.preventDefault();
	    if (song.loop){	//if repeat is on then 
	      	song.loop = false; // it's turned off
	      	showMessage("repeat is off");
	      	repeat.removeClass("on"); //it will remove the class "on" to update the visuals
	    } else {
	      	song.loop = true; //it's turned on
	      	showMessage("repeat is on");
	       	repeat.addClass("on"); //and we're adding the class "on"
	    }
	});

	$('#shuffle').live('click', function(e) { //this will toggle the repeat function on/off
	    e.preventDefault();
	    if (shuffle){ //we use custom var for shuffle function
	      	shuffle = false; //then it's turned off
	      	showMessage("shuffle is off");
	      	$('#shuffle').removeClass("on"); //it will remove the class "on" to update the visuals
	    } else {
	      	shuffle = true; //it's turned on
	      	showMessage("shuffle is on");
	       	$('#shuffle').addClass("on"); //and we're adding the class "on"
	    }
	});

	$("#seek input").bind("change", function() { //bind function on change of slider's value
	    song.currentTime = $(this).val(); //then the current time of the song is updated
	});
	setInterval(function() { //checks if the song has ended
	  	if (song.currentTime === song.duration ) { //by comparing the current time with the total duration of the song
	  		currentSong.removeClass("currently-playing");
	  		id++; //then it goes to the next song
	  		if(shuffle) { //except if the shuffle is ON
	  			id = Math.abs(randomFromTo(0, maxSongs-1)-id); //then a random ID is generated
	  		}
	  		newSong(data.songs[id].src); //and the new song object is created
	    	songPlay(); //and it plays!
	  	}
	}, 1000); //...it checks every freaking secong. This is not efficient, but it's ok for now. I will update it


	/*--- JS Functions ---*/

	function newSong(url) { //created new ocject from the specified url
	   	song = new Audio(url);
	}
    function songPlay() { //start playing the song
	   	song.play(); //with this function
	    $('#seek input').attr('max',song.duration); //updates the duration of the song in the seek bar
        getCurrentTime(); //call the getCurrentTime function, see below
        metaData(id); //updates the metadata, see below
        paused = false; //update the paused flag, it will be used in another function
        currentSong.removeClass("currently-playing");
        currentSong = $("ul").find("[data-song='" + id + "']");
        currentSong.addClass("currently-playing");
        $("#play span").attr("data-icon", '"'); //updates the data-icon to change the icon of the button
        play.attr("id", "pause"); //and finally it changes the id to pause
        showMessage("play");
    }

    function songPause() { //this will pause the song
    	song.pause();
    	paused = true; // updates the paused flag
        $("#pause span").attr("data-icon", '!'); //updates the data-icon to change the icon of the button
        $("#pause").attr("id", "play"); //and finally it changes the id to pause
        currentSong.removeClass("currently-playing");
        showMessage("pause");
    }
   	function metaData(id) {
	   	$("#metadata #title").text(data.songs[id].title); //update all the metadata info from the loaded data
	    $("#metadata #artist").text(data.songs[id].artist); 
	    $("#metadata #album").text(data.songs[id].album);
	    $("#controls img").attr("src", data.songs[id].artwork);
	    var album = "<h3>artist</h3><h2>"+ data.songs[id].artist +"</h2><h3>album</h3><h2>"+ data.songs[id].album +"</h2>";
		$("#album-info").html(album); //updates album info content
	}

	function getCurrentTime() { //it updates the current time in the specified div
	  	setInterval(function() { //every second it updates the #duration text
	  		$("#controls #duration").text(calcDuration(song.currentTime)); //it calls the calcDuration to make the convert from milliseconds to seconds
		}, 1000); //...it checks every freaking secong. This is not efficient, but it's ok for now. I will update it
	}
		    
	function calcDuration(duration) { //it converts the milliseconds to seconds
		var mins = Math.floor(duration/60); //by doing these convertions
		var secs = Math.floor(duration%60);
		//then we'll form the time on the format we want, mm:ss... e.g. 05.23
		if (mins<10){ //this will check if the minutes or seconds are under 10, in order to fill in a zero in the front
			mins = "0" + mins;
		}
		if (secs<10){
			secs = "0" + secs;
		}
		var res = mins + ":" + secs; //finalize the wanted format
		return res; //it returns the result
	}
	function randomFromTo(from, to){ //it generates random number from the given range
       return Math.floor(Math.random() * (to - from + 1) + from);
    }
    function showMessage(message){ //it generates random number from the given range
       $("#message h3").text(message);
       $("#message").show().fadeOut(1500);
    }
    /*--- Keyboard Shortcuts ---*/
    Mousetrap.bind('space', function() { if (paused) {songPlay();} else {songPause();} }, 'keyup');
    Mousetrap.bind('n', function() { $('#next').trigger('click'); }, 'keyup');
    Mousetrap.bind('b', function() { $('#prev').trigger('dblclick'); }, 'keyup');
    Mousetrap.bind('r', function() { $('#repeat').trigger('click'); }, 'keyup');
    Mousetrap.bind('s', function() { $('#shuffle').trigger('click'); }, 'keyup');
    Mousetrap.bind('m', function() { if(song.muted) { song.muted= false;showMessage("unmute");} else { song.muted = true; showMessage("mute");} }, 'keyup');

    $('#about-this').live('click', function(e) { //shows the Twitter bootstrap modal for the info
	    $('#about').modal({
	    	keyboard: true
	    });
	});
	$('#keyboard').live('click', function(e) { //shows the Twitter bootstrap modal for the keyboard shortcuts
	    $('#shortcuts').modal({
	    	keyboard: true
	    });
	});
});
