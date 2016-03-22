Questions = new Mongo.Collection("questions");

if (Meteor.isClient) {
  // BEGINNING OF CLIENT SIDE CODE +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//these are data objects passed to the body to be rendered    
  Template.body.helpers({
     questions: function(){
         var filter = Session.get("filter");
       
         if(filter && filter != "ALL"){
           console.log("muahahahahaha!")
           return Questions.find({subject: filter}, {sort: {createdAt: -1}})
         }else{
         return Questions.find({}, {sort: {createdAt: -1}});
         }
     }
  });

    
//events for html that is in the body++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  Template.body.events({
    "submit .new-question": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get value from form element
      var subject = event.target.subject.value;
      var qBody = event.target.question.value;
      var currentUser = Meteor.user();
      var ownerName = currentUser.username;
 
      // Insert a task into the collection
      Questions.insert({
        subject: subject,
        qBody: qBody,
        owner: Meteor.userId(),
        ownerName: ownerName,
        createdAt: new Date(), // current time
        comments: []
      });
 
      // Clear form
      event.target.question.value = "";
    },
    "change .filter-list": function(event){
      Session.set("filter", event.target.value);
    }
  });

// events specifically for the rendered questions collection  ++++++++++++++++++++++++++++++++++++++++++++
  Template.question.events({
      "click .delete": function () {
      if (confirm("Do you really want to delete this Question?") == true){
         Questions.remove(this._id); 
      }
      return; 
    },
     "submit .submit-comment": function(event){
      // Prevent default browser form submit
      event.preventDefault();
          
      var content = event.target.comment.value;
      var currentUser = Meteor.user()
      var userName = currentUser.username;
      var qId = this._id;
          
     Questions.update(this._id,{
          $push: {comments: {
              content: content,
              owner: Meteor.userId(),
              ownerName: userName,
              qId : qId,
              createdAt: new Date(),
              likeCount: 0,
              usersWhoLiked: []
          }}
      });
    var content = event.target.comment.value = '';
      },
     "click .glyphicon-thumbs-up": function(){
        var data = this;
         Meteor.call("likeComment", data);
     }
  });
   
//functions for the questions template++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  Template.question.helpers({
      ifUser : function(){
        var user = Meteor.user();
          if('admin' === user.username || user._id === this.owner){
              return true;
          } else {
              return false;
          }
      }
  });

    
    //has the login UI use usernames
Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
    
    




// END OF CLIENT SIDE CODE +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    console.log("BLLLUUUUUURRRRRRRTTTT IS ALIVE!")
  });
    
Meteor.methods({
likeComment : function(data) 
    {
        var user = Meteor.userId();
        var likes = data.likeCount;
        likes++;
        
        /* Make sure the user is logged in before likeing a comment
        &&
        See if user has already liked */ 
        for (var i =0;i<data.usersWhoLiked.length; i++){
            if (user == data.usersWhoLiked[i] || !user) {
               console.log("failed user authentication");
               return 
            }
        }
        
        Questions.update({ "_id": data.qId, "comments.createdAt": data.createdAt},
         {
             "$set" : 
             {
                 'comments.$.likeCount' : likes
             },
             "$push" :
             {
              'comments.$.usersWhoLiked' : user 
             }
         });  
    }
});
}
