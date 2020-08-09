const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { connect } = require('http2');
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
    const { project, topic, content } = body;
    createNote(project, topic, content)
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
    const { project, topic, content } = body;
    getAllProjects(project, topic, content)
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

  if (req.url === '/projects/note' && req.method === 'GET') {
    const body = await extractBody(req);
    const { project, topic } = body;
    getATopic(project, topic)
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

  if (req.url === '/project' && req.method === 'GET') {
    const body = await extractBody(req);
    const { project, topic, content } = body;
    getAProject(project, topic, content)
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

  if (req.url === '/projects/project' && req.method === 'GET') {
    const body = await extractBody(req);
    const { project } = body;
    const projects = [];
    const absolutePath = path.join(__dirname, 'projects', '/', project);
    fs.readdir(absolutePath, async (err, files) => {
      for( let i = 0; i < files.length; i++){
        const topic = files[i].split('.')[0];
        const content = await getATopic(project, topic);
        projects.push({topic, content});
      }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({ success: true, projects }));
        res.end();
    })  
  }

  if (req.url === '/project' && req.method === 'PATCH') {
    const body = await extractBody(req);
    const { project, topic, content } = body;
    const projectPath = path.join(__dirname, 'projects', project);
    // console.log(projectPath);
    const topicPath = path.join(projectPath, topic + '.txt');
    fs.readdirSync(projectPath)
        if (project) {
          fs.renameSync(project, projectPath);
        }
        if (topic) {
          fs.renameSync(topic, topicPath);
        }
        if (content) {
          fs.writeFileSync(topicPath, content);
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({ success: true, projects }));
        res.end();  
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

const createNote = (project, topic, content) => {
  return new Promise ((resolve, reject) => {
    const absolutePath = path.join(__dirname, 'projects', project);
    if (!fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, {}, (error) => {
        if (error) reject('There was an error creating project');
        });
    }
    const absoluteFilePath = path.join(absolutePath, topic + '.txt');
    fs.appendFile(absoluteFilePath, content, (error) => {
      if (error) reject('Failure creating note');
      else resolve('Note created successfully');
    });
  });
}

const getAllProjects = () => {
  return new Promise ((resolve, reject) => {
    const absolutePath = path.join(__dirname, 'projects');
    fs.readdir(absolutePath, (error, projects) => {
      if (error) reject('Projects not found');
      else resolve (projects);
    });
  });
}

const getATopic = (project, topic) => {
    return new Promise ((resolve, reject) => {
      const absolutePath = path.join(`${__dirname}/projects/${project}/${topic}.txt`);
      fs.readFile(absolutePath, {encoding: 'utf-8'}, (err, data) => {
        if (!err) {
            resolve(data)
        } else {
            reject('File not read')
        }
    });
  });
}


// const updateAProject = (project, topic, content) => {
//   return new Promise ((resolve, reject) => {
//     const projectPath = path.join(`${__dirname}/projects/${project}`);
//       if (fs.existsSync(projectPath)) {
//         reject('Project does not exist')
//       } else {
//         topic = path.join(projectPath, topic + '.txt');
//         if (!topic) {
//           reject('Topic does not exist')
//         } else {
//           fs.writeFile(topic, content, (err) => {
//             if (err) reject('Update failed');
//             else resolve('Project updated successfully');
//           });
//         }
//       }
//   });
// }
