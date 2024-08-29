#!/bin/bash

cd /home/ec2-user/gixtr-back
sudo rm -rf env-file.zip
sudo rm -rf .env
sudo rm -rf .env.dev
aws s3 sync s3://gixtr-env/back/dev .
unzip env-file.zip
sudo cp .env.dev .env
sudo pm2 delete all
sudo npm install
