# Bluefield

## Setup
```bash
# clone project
sudo apt install -y git
git clone git@github.com:mikedelcastillo/bluefield.git
cd bluefield

# install nodejs
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
sudo apt install -y nodejs
sudo npm install -g yarn pm2

# setup project
yarn
pm2 start "yarn start-ts" --name "agent-viewer"
sudo pm2 startup
pm2 save
```