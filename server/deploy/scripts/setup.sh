#!/bin/bash

function is_installed {
  local return_=1

  type $1 >/dev/null 2>&1 || { local return_=0; }
  echo "$return_"
}

sudo yum update -y

# install curl if it doesn't exist
if [ $(is_installed curl) == 0 ]; then
  sudo yum install -y curl
fi

# install node if it doesn't exist
if [ $(is_installed node) == 0 ]; then
  curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
  sudo yum install -y nodejs
fi

# install git if it doesn't exist
if [ $(is_installed git) == 0 ]; then
  sudo yum install -y git
fi

# install docker if it doesn't exist
if [ $(is_installed docker) == 0 ]; then
  sudo amazon-linux-extras install -y docker
  sudo systemctl start docker
  sudo docker run --name gixtr-redis -p 6379:6379 --restart always --detach redis
fi

# install pm2 if it doesn't exist
if [ $(is_installed pm2) == 0 ]; then
  npm install -g pm2
fi

cd /home/ec2-user

git clone -b dev https://github.com/deekay-e/gixtr-back.git
cd gixtr-back
npm install
aws s3 sync s3://gixtr-env/dev .
unzip env-file.zip
cp .env.dev .env
npm run build
npm run start
