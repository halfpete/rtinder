var port = process.env.PORT || 8080;

var express = require('express'); // Adding the express library 
var mustacheExpress = require('mustache-express'); // Adding mustache templating system and connecting it to 
var request = require('request')  // Adding the request library (to make HTTP reqeusts from the server)

var app = express(); // initializing applicaiton
app.engine('html', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');
app.use('/static', express.static(__dirname + '/static'));

var Yelp = require('yelp');


var yelp = new Yelp({
  consumer_key: 'UOyIgUpA0cpFndSy1Skf0Q',
  consumer_secret: 'L5DK1vHmbwyfVUEnJIyMjEsvic4',
  token: 'Ji44jVES5LEqQL27iBmx9sKbo6bankbp',
  token_secret: 'CuBKrlpmrhdgO_nwbGAknDXFztY',
});

// Parser to gain access to request body
var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }));

// Global variables:
// location holds user location
// results holds restaurant query from yelp API
var location = "";
var results = {};
var offset = 0;

// Routes
app.get('/', function (req, res, next) {
  res.render('index.html');
});

app.get('/about', function (req, res, next) {
  res.render('about.html');
});

app.get('/team', function (req, res, next) {
	res.render('team.html')
});

app.post('/', function(req, res, next) {
  offset = 0;
  checkedLoc = true;
  location = req.body.location
  yelp.search({
    term: 'food',
    location: req.body.location
  })
  .then(function (data) {
    results = data;
    res.json({
      'businesses': data['businesses']
    });
  })
  .catch(function (err) {
    console.error(err);
  });
});

app.post('/next', function(req, res, next){
  offset += 1;
  if (offset % results['businesses'].length != 0) {
    res.json({
      'business': results['businesses'][offset % results['businesses'].length]
    });
  }
  else {
    yelp.search({
      term: 'food',
      location: location,
      offset: offset
    })
    .then(function (data) {
      results = data;
      res.json({
        'business': data['businesses'][0]
      });
    })
    .catch(function (err) {
      console.error(err);
    });
  }
});
app.post('/prev', function(req, res, next){
  offset -= 1;
  if (offset % results['businesses'].length != results['businesses'].length - 1) {
    res.json({
      'business': results['businesses'][offset % results['businesses'].length],
      'offset': offset
    });
  }
  else {
    yelp.search({
      term: 'food',
      location: location,
      offset: offset
    })
    .then(function (data) {
      results = data;
      res.json({
        'business': data['businesses'][results['businesses'].length - 1],
        'offset': offset
      });
    })
    .catch(function (err) {
      console.error(err);
    });
  }
});

var server = app.listen(port, function () {
  console.log('Our app is running on http://localhost:' + port);
});