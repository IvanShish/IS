#!/bin/bash
rcssserver & node app.js < files/file.txt & rcssmonitor & node app.js < files/file1.txt