(function(window, document, version, callback) {
	document.write('<div id="jschat-widget"><div class="jschat-placeholder"></div></div>'); /* writes the widget */
	var j, d;
	var loaded = false;
	if (!(j = window.jQuery) || version > j.fn.jquery || callback(j, loaded)) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js';
		script.onload = script.onreadystatechange = function() {
			if (!loaded && (!(d = this.readyState) || d == 'loaded' || d == 'complete')) {
				callback((j = window.jQuery).noConflict(1), loaded = true);
				j(script).remove();
			}
		};
		document.documentElement.childNodes[0].appendChild(script);
	}
})(window, document, '1.6', function($, jquery_loaded) {
	$(document).ready(function() {
		/* Load the CSS */
    var css_link = $('<link>', { 
        rel:  'stylesheet', 
        type: 'text/css', 
        href: 'http://localhost:4567/stylesheets/widget.css' 
    });
    css_link.appendTo('head');	

		/* create intro screen */
		var widget 			= $('#jschat-widget');
		$('.jschat-placeholder').remove();
		$(widget).append(['<div id="jschat-header"><h1>Super Chat</h1></div>',
											'<p>Please, enter your name and enjoy the room (ROOM NAME):</p>',
											'<form name="jschat-enter" action="#" method="post">',
											'<input name="name" type="text" value="" />',
											'<input type="submit" value="Enjoy!" />'].join(''));

		/* Handle the chat login */
		$(widget).find('form').submit(function() {
			var name = $(this).find('input[name=name]').val();
			var room = '#jschat';
			$.getJSON(
				'http://localhost:4567/widget/identify?callback=?', 
				{name: name, room: room},
				function(data) {
					if(data.status && data.status == 'ok') {
						/* Configure chat room */
						$(widget).empty();
						$(widget).append(['<h1>'+room+'</h1>',
															'<ul id="jschat-messages">',
															'</ul>',
															'<div id="jschat-input">',
															  '<form method="post" action="/message" id="jschat-post">',
															    '<input name="message" id="jschat-message" value="" type="text" autocomplete="off" />',
															    '<input name="submit" type="submit" id="send_button" value="Send" />',
															  '</form>',
															'</div>'].join(''));
						$('#jschat-message').width($(widget).width() - 60);
						$.ajax({
							url: 'http://localhost:4567/widget/join?callback=?',
							type: 'get',
							dataType: 'script',
							data: {name: name, room: room},
							success: function(data) {
								var script = document.createElement('script');
								script.type = 'text/javascript';
								script.src = 'http://localhost:4567/js/jschat.js';
								script.onload = script.onreadystatechange = function() {
									if ((!(d = this.readyState) || d == 'loaded' || d == 'complete')) {
										new JsChat($, {
											user: name,
											room: room,
											elemMessages: $('#jschat-messages')
										});
									}
								};
								document.documentElement.childNodes[0].appendChild(script);
							}
						})
					}
				});
			return false;
		});
	});
});