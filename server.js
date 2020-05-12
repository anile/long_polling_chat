let http = require('http');
let fs = require('fs');
let chat = require('./chat.js');

http.createServer(function(req, res) {

    switch (req.url) {
        case '/':
            sendFile('index.html', res);
            break;
        case '/subscribe':
            chat.subscribe(req, res);
            break;
        case '/publish':
            let body = '';

            req
                .on('readable', function() {
 
                    let text = req.read() || '';
                    body += text;

                    if (body.length > 1e4) {
                        res.statusCode = 413;
                        res.end("Can't send message. Message is too big.");
                    }
                })
                .on('end', function() {
                    try {
                        body = JSON.parse(body);
                    } catch(e) {
                        res.statusCode = 400;
                        res.end("Bad request");
                        return;
                    }

                    chat.publish(body.message);
                    res.end('ok');
                });
            break;

        default:
            res.statusCode = 400;
            res.end('Not found');
    }

}).listen(1224);


function sendFile(fileName, res) {
    let fileStream = fs.createReadStream(fileName);

    fileStream
        .on('error', function() {
            res.statusCode = 500;
            res.end("Server error");
        })
        .pipe(res);

    res.on('close', function() {
        fileStream.destroy();
    })
}