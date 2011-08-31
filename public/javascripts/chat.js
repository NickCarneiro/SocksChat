//The client side state and settings of the app are in this eponymous global
var sockschat = {};
sockschat.settings = {

}

//The object format is just the output of couchdb
//An example object is shown below.
sockschat.state = {

	username: ""
	
};




function renderMessage(username, message){

		$("#chat_messages").append("<span class=\"username\">" + 
			username
			+ ": </span><span class=\"message\">"+ 
			message
			+"</span><br />");
		//scroll to newest messages
		$("#chat_box").prop('scrollTop',$("#chat_box").prop('scrollHeight'));	

}

//wipe out all usernames and replace with new list from server
//not efficient, but will be okay for this demo.
function renderUsers(usernames){
	
	//sort usernames in alpha order
	usernames.sort(compareUsers);
	$("#user_list").empty();
	//print out usernames, bold if it belongs to current user
	for(var i = 0; i < usernames.length; i++){
		if(usernames[i] == sockschat.state.username){
			$("#user_list").append("<li class=\"you\">" + usernames[i] + "</li>");
		} else {
			$("#user_list").append("<li>" + usernames[i] + "</li>");
		}
		
	}
	
}

//Must specify function to sort objects on one property
//http://www.webdotdev.com/nvd/content/view/878/
function compareUsers(a, b) {
	var nameA = a.toLowerCase( );
	var nameB = b.toLowerCase( );
	if (nameA < nameB) {return -1}
	if (nameA > nameB) {return 1}
	return 0;
}

function sendMessage(){
	if($("#chat_input").val() == ""){
		return;
	}

	var message = $("#chat_input").val();
	//console.log(message);
	$("#chat_input").val("");
	


	sockschat.socket.emit('clientmessage', 
		{ username: sockschat.state.username, message: message, });

}

function showChat(){
	//verify that username is valid
	
	if($("#chat_username").val().length < 3 || $("#chat_username").val() > 20){
		$("#name_error").text("Choose a username between 3 and 20 characters.");
		return;
	}
	var alphanumeric = /^[0-9a-zA-Z_]+$/;
	if(!$("#chat_username").val().match(alphanumeric)){
		$("#name_error").text("Choose a username with only letters, numbers, and the underscore.")
		return;
	}

	
	sockschat.state.username = $("#chat_username").val();
	sockschat.socket.emit('enterchat', {username: sockschat.state.username});
	
	
	$("#chat_username_prompt").hide();
	$("#chat_container").show();
	$("#chat_input").focus();
	sockschat.state.poll = true;
}


$(function(){
	$("#chat_container").hide();
	$("#chat_username").focus();
	
	 sockschat.socket = io.connect('http://trillworks.com:3000');
	 
	 sockschat.socket.on('servermessage', function (data) {
	 	renderMessage(data.username, data.message);
	 });
	 
	 sockschat.socket.on('userlist', function (data) {
	 	renderUsers(JSON.parse(data)); 
	 });
	 
	 sockschat.socket.on('greeting', function (data) {
	 	console.log(data.greeting);
	 });
	 
	 
	 
	$("#chat_submit_username").click(function(){
		showChat();
	});
	
	$("#chat_username").keypress(function(e){
		if(e.which == 13){
			showChat();
		}
	});
	$("#chat_input").keypress(function(e){
		if(e.which == 13){	
			sendMessage() ;
		}
	});
	
	$("#chat_submit").click(function(){
		sendMessage();
	});
});
