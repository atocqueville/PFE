#!/bin/bash
sleep 8
cd /home/pi/yourServerFilesFolder
forever start server.js >>/home/pi/output.log 2>>/home/pi/error.log