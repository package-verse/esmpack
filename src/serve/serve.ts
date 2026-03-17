import app from "./WebServer.js";
import portfinder from "portfinder";
import os from "os";
import colors from "colors";
import http from "http";
import https from "https";
import url from 'url';
import { WebSocketServer } from "ws";
import fs from "fs";
import forge from "node-forge";

var netFaces = os.networkInterfaces();

function createCert() {

    var certPath = "./generated-cert-1";

    if(fs.existsSync(certPath)) {
        return JSON.parse(fs.readFileSync(certPath, { encoding: "utf8", flag: "r" }));
    }

    var pki = forge.pki;

    // generate a key pair or use one you have already
    var keys = pki.rsa.generateKeyPair(2048);

    // create a new certificate
    var cert = pki.createCertificate();

    // fill the required fields
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 20);    

    const altNames = [{ type: 7, ip: "127.0.0.1"}];

    for(let i=1;i<255;i++) {
        altNames.push({ type: 7, ip: `192.168.0.${i}`});
        altNames.push({ type: 7, ip: `192.168.1.${i}`});
    }

    // use your own attributes here, or supply a csr (check the docs)
    var attrs = [{
    name: 'commonName',
    value: 'dev.web-atoms.in'
    },
    {
    name: 'countryName',
    value: 'IN'
    }, {
    shortName: 'ST',
    value: 'Maharashtra'
    }, {
    name: 'localityName',
    value: 'Navi Mumbai'
    }, {
    name: 'organizationName',
    value: 'NeuroSpeech Technologies Pvt Ltd'
    }, {
    shortName: 'OU',
    value: 'Test'
    }];

    // here we set subject and issuer as the same one
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.setExtensions([{
        name: "subjectAltName",
        altNames
    }]);

    // the actual certificate signing
    cert.sign(keys.privateKey);

    // now convert the Forge certificate to PEM format
    var pem = pki.certificateToPem(cert);
    var pkey = pki.privateKeyToPem(keys.privateKey)
    var c = { key: pkey, cert: pem };

    fs.writeFileSync( certPath, JSON.stringify(c), "utf8");
    return c;
}

function listen(port, ssl?) {

    var server = ssl ? https.createServer(createCert(), app) : http.createServer(app);

    var wss = new WebSocketServer({ noServer: true });

    const dss = new WebSocketServer({ noServer: true });

    server.on("error", (error) => {
        console.error(error);
    })

    server.on("upgrade", function upgrade(request, socket, head) {
        const pathname = url.parse(request.url).pathname;

        if (pathname === "/__debug" || pathname.startsWith('/__debug/')) {
            dss.handleUpgrade(request, socket, head, function done(ws) {
                dss.emit('connection', ws, request);
            });
        } else if (pathname === '/__listen') {
            wss.handleUpgrade(request, socket, head, function done(ws) {
                wss.emit('connection', ws, request);
            });
        } else {
            console.error("Forwarding further.. " + pathname);
            // socket.destroy();
            socket.on("error", (error) => console.error(error));
        }
    });

    server.listen(port,() => {
        Object.keys(netFaces).forEach(function (dev) {
            netFaces[dev].forEach(function (details) {
              if (details.family === 'IPv4') {
                  if (ssl) {
                    console.log(('  https://' + details.address + ':' + colors.cyan(port.toString())));
                  } else {
                    console.log(('  http://' + details.address + ':' + colors.cyan(port.toString())));
                  }
              }
            });
          });
        
        
        return console.log(colors.green("Server has started "));
    });
}

portfinder.basePort = 8080;
portfinder.getPort(function (err, port) {
    if (err) { 
        throw err; 
    }
    listen(port);
});
portfinder.getPort(function (err, port) {
    if (err) { 
        throw err; 
    }
    listen(port, true);
});

