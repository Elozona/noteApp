const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const PORT = 8080;

//create a server object
http.createServer (async(req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type': 'text/html'}); // http header
    res.write('Welcome to Notely!'); //write a response
    res.end(); //end the response
  }
  if (req.url === '*' && req.method === 'GET') {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.write('Oops! Path not found!');
    res.end();
  }
  
  if (req.url === '/note' && req.method === 'POST') {
    const body = await extractBody(req);
    const { project, fileName, content} = body;
    createNote(project, fileName, content)
      .then(response => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({ success: true, response }));
        res.end();
      })
      .catch(error => {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({ success: false, error }));
        res.end();
      });
    }
  
  if (req.url === '/projects' && req.method === 'GET') {
    const body = await extractBody(req);
    const { project, fileName, content} = body;
    getAllProjects(project, fileName, content)
      .then(response => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({ success: true, response }));
        res.end();
      })
      .catch(error => {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({ success: false, error }));
        res.end();
      });
  }

  if (req.url === '/projects/notes' && req.method === 'GET') {
    const body = await extractBody(req);
    const { project, fileName, content} = body;
    getAllNotes(project, fileName, content)
      .then(response => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({ success: true, response }));
        res.end();
      })
      .catch(error => {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({ success: false, error }));
        res.end();
      });
  }
}).listen(PORT, () => {
    console.log(`Server listening at port ${PORT}...`); //the server object listens on port 
});

const extractBody = async(req) => {
  return new Promise ((resolve, reject) => {
    let body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      resolve(JSON.parse(body));
      // req.body = body;
    });
  });
}

const createNote = (project, fileName, content) => {
  return new Promise ((resolve, reject) => {
    const absolutePath = path.join(__dirname, 'projects', project);
    if (!fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, {}, (error) => {
        if (error) reject('There was an error creating project');
        });
    }
    const absoluteFilePath = path.join(absolutePath, fileName + '.txt');
    fs.appendFile(absoluteFilePath, content, (error) => {
      if (error) reject('Failure creating note');
      else resolve('Note created successfully');
    });
  });
}

const getAllProjects = (projects) => {
  return new Promise ((resolve, reject) => {
    const absolutePath = path.join(__dirname, 'projects');
    fs.readdir(absolutePath, (error, projects) => {
      if (error) reject('Projects not found');
      else resolve (projects);
    });
  });
}

const getAllNotes = (project) => {
  return new Promise ((resolve, reject) => {
    const absolutePath = path.join(__dirname, 'projects');
    const projects = fs.readdirSync(absolutePath);
  });
}