const restify = require('restify');


const server = restify.createServer({
  name: 'testserver'
})

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(
  function crossOrigin(req,res,next){
    if (req.method === 'OPTIONS') {
      res.header("Access-Control-Allow-Origin", req.header('Origin'));
      res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
      res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With, Authorization");
      res.header("Access-Control-Expose-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
    } else {
      res.header("Access-Control-Allow-Origin", req.header('Origin'));
      res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
      res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With, Authorization");
      res.header("Access-Control-Expose-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
    }

    return next();
  }
);

/*
server.use(restify.CORS({
  origins: ['*'],   // defaults to ['*']
  credentials: true,                 // defaults to false
  headers: ['Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With, Authorization'],                 // sets expose-headers
  methods: ['GET','PUT','DELETE','POST', 'OPTIONS']
}));*/
server.use(restify.fullResponse());

server.get('/route', (req, res, next) => {
  res.send(200, {param: 'OK'});
  return next();
});

server.post('/route', (req, res, next) => {
  res.send(200, req.body);
  return next();
});

server.put('/route', (req, res, next) => {
  res.send(200, req.body);
  return next();
});

server.del('/route', (req, res, next) => {
  res.send(200);
  return next();
});

server.opts('/route', (req, res, next) => {
  res.send(200);
  return next();
});

server.listen(4202);
