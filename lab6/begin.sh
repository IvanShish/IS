#!/bin/bash
rcssserver server::coach=1 & rcssmonitor & node app.js < files/file.txt & node app.js < files/file1.txt