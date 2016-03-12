sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu precise/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo apt-get update
sudo apt-get purge -y nodejs npm
sudo apt-get -y install curl
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get -y install nodejs
sudo npm install -g npm@3.5.3
sudo apt-get install -y mongodb-org
sudo cp /mongo_data/mongod.conf /etc/mongod.conf
sudo service mongod stop
sudo service mongod start
