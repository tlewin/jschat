/**
 * JsChat: Handles the common jsChat functionalities
 *
 */
var JsChat = function($, settings) {
	
	var Settings = {
		user: 					null, 
		room: 					'#jschat',
		elemMessages: 	$('#jschat-messages'), /* UL elements that handles the messages */
		postMessages: 	$('#jschat-post'),
		displayVideos: 	true, /* read urls and display videos thumbnails */
		displayImages: 	true, /* read urls and replace for img tags */
		displayEmotes: 	true, /* replace :emotes for emotes pictures */
		displayLinks: 	true, /* replace urls for <a> elements */
		enableCommands: [] /* Commands that are enabled */
	}
	
	/* Copy settings */
	for( var i in settings || {} ) {
		Settings[i] = settings[i];
	}	

	/* Handle the message display */
	var Display = {

		scrolled: true,
		
		add_message: function(text, className, time) {
	    var time_html = '<span class="time">'+TextHelper.dateText(time)+'</span>';
	    $(Settings.elemMessages).append('<li class="' + className + '">' + time_html + ' ' + text + '</li>');
	    $(Settings.elemMessages).animate({ scrollTop: $(Settings.elemMessages).height() }, "fast");
		},

		scrollMessagesToBottom: function() {
	    if (!this.scrolled) {
	      $(Settings.elemMessages).scrollTop = $(Settings.elemMessages)[0].scrollHeight;
	    }
	  }
	};
	
	/* Handle all text issues, ex: parses, formattings, etc */
	var TextHelper = {
	  zeroPad: function(value, length) {
	    value = value.toString();
	    if (value.length >= length) {
	      return value;
	    } else {
	      return this.zeroPad('0' + value, length);
	    }
	  },

	  dateText: function(time) {
	    var d = new Date();
	    if (typeof time != 'undefined') {
	      d = new Date(Date.parse(time));
	    }
	    return this.zeroPad(d.getHours(), 2) + ':' + this.zeroPad(d.getMinutes(), 2); 
	  }
	};
	
	/* Controls the chat behavior */
	var ChatController = {
		timerID: null,
		
		initialize: function() {
			$(Settings.postMessages).submit(function() {
				/* Read message and clear the field */
				var message = $(Settings.postMessages).find('#jschat-message').val();
				$(Settings.postMessages).find('#jschat-message').val('');
				/* Display post message */
				Display.add_message(
					'<span class="user active">' + Settings.user + '</span> ' + '<span class="message">'+message+'</span>', 
					'message', 
					new Date());
				/* Send message to server */
				$.ajax({
					url: 'http://localhost:4567/widget/message?callback=?',
					type: 'get',
					dataType: 'json',
					data: {'to': Settings.room, 'message': message}
				});
				return false;
			});			

			this.timerID = setInterval(function() {
				$.ajax({
					url: 'http://localhost:4567/widget/messages?callback=?',
					type: 'get',
					dataType: 'json',
					data: {time: new Date().getTime(), room: Settings.room},
					success: function(data) {
						for(var i = 0; i < data.length; i++) {
							if(data[i].message) {
								Display.add_message(
									'<span class="user">' + data[i].message.user + '</span> ' + '<span class="message">'+data[i].message.message+'</span>', 
									'message', 
									data[i].time);
							}
						}
					},
					error: function() {
						Display.add_message('Server error.');
						ChatController.stopPolling();
					}
				});
			}, 1000);
		},
		
		stopPolling: function() {
			clearInterval(this.timerID);
		}
	};

	ChatController.initialize();
	
}
