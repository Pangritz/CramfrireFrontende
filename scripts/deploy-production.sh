npm run build-production
cd ./dist
tar -zcvf cf.tar.gz .
scp cf.tar.gz ssh-w00b7c4b@cramfire.com:/www/htdocs/w00b7c4b/app.cramfire.com/www/frontend
md5sum cf.tar.gz