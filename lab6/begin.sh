#!/bin/bash
rcssserver server::coach=1 & rcssmonitor & node app.js < files/p1.txt & node app.js < files/p2.txt & node app.js < files/p3.txt & node app.js < files/p4.txt & node app.js < files/p5.txt