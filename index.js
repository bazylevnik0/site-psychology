const express  = require('express')
let   ejs      = require('ejs')
const path     = require('path')
const mongoose = require('mongoose')
      mongoose.connect('mongodb+srv://admin:blyadskiiparol@cluster0.me8cl.mongodb.net/site-psychology?retryWrites=true&w=majority');
const mailchimp = require("@mailchimp/mailchimp_marketing");

//db articles
const articleSchema = new mongoose.Schema({
  	title: String,
  	body : String
})
const Article  = mongoose.model('Article', articleSchema);          	     

//db subscribes
mailchimp.setConfig({
  apiKey: 'e391008f6269e8b3eec996863ee26db5-us5',
  server: 'us5',
});

//server
const PORT = process.env.PORT || 5000
var   out = [];   
express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => {
  	Article.find({}, function (err, docs) {
      	if (err) {
      	       console.log(err)
      	} else {
	       out = [];
      	       docs.forEach( el => {
      	       	   out.push( {
      	       	   	title : el.title,
      	       	   	body  : el.body
      	       	   })
      	       })
      	       res.render('pages/index' , { inp : JSON.stringify(out) , subscribed : false})
       	}
        });
   })
   .get('/subscribe/:mail' , (req , res) => {
	async function callPing() {
	  let ping = await mailchimp.ping.get();
	  if (ping.health_status == "Everything's Chimpy!") {
	  	const subscribe = await mailchimp.lists.addListMember("b976364d5f", {
	    	 	email_address: req.params.mail,
	   		status: "subscribed",
	  		});
	  	if (subscribe.status == "subscribed") res.render('pages/index' , { inp : JSON.stringify(out) , subscribed : true })
    	  }else console.log(ping);
	}
	callPing();
   })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
