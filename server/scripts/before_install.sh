#!/bin/bash

DIR="/home/ec2-user/gixtr-back"
if [ -d "$DIR" ]; then
  cd /home/ec2-user
  sudo rm -rf gixtr-back
else
  echo "Directory does not exist"
fi
