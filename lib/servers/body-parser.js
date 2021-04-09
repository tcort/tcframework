'use strict';

async function bodyParser(contentType, stream) {

    return await new Promise((resolve, reject) => {
        let body = '';

        stream.setEncoding('utf-8');
        stream.on('data', (chunk) => body += chunk.toString());
        stream.on('err', (err) => reject(err));
        stream.on('end', () => {
            switch (contentType) {
                case 'application/json':
                    body = JSON.parse(body);
                    break;
                default:
                    break;
            }
            resolve(body);
        });
    });
}

module.exports = bodyParser;
